import pool from "../config/dbconnect.js";
import { v4 as uuidv4 } from "uuid";

interface OrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  size?: string | null;
}

class OrdersRepository {
  async createOrder(
    userId: string,
    shippingAddressId: string,
    items: OrderItemInput[],
    totalAmount: number,
  ): Promise<string> {
    const orderId = uuidv4();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `INSERT INTO orders (order_id, user_id, shipping_address_id, status, total_amount)
         VALUES ($1, $2, $3, 'PENDING', $4)`,
        [orderId, userId, shippingAddressId, totalAmount],
      );

      for (const item of items) {
        const subtotal = item.unit_price * item.quantity;
        await client.query(
          `INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price, subtotal, size)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), orderId, item.product_id, item.quantity, item.unit_price, subtotal, item.size ?? null],
        );
      }

      // Atomically decrement stock — rolls back entire order if any item is now out of stock
      for (const item of items) {
        const stockResult = await client.query(
          `UPDATE products SET stock_quantity = stock_quantity - $1
           WHERE product_id = $2 AND stock_quantity >= $1`,
          [item.quantity, item.product_id],
        );
        if ((stockResult.rowCount ?? 0) === 0) {
          throw new Error(`Insufficient stock for product ${item.product_id}`);
        }
      }

      // Clear cart after order is placed
      await client.query(
        `DELETE FROM cart_items WHERE cart_id = (SELECT cart_id FROM carts WHERE user_id = $1)`,
        [userId],
      );

      // Auto-create COD payment record
      await client.query(
        `INSERT INTO payments (payment_id, order_id, payment_method, payment_status)
         VALUES ($1, $2, 'COD', 'PENDING')`,
        [uuidv4(), orderId],
      );

      await client.query("COMMIT");
      return orderId;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async getOrdersByUser(userId: string) {
    const res = await pool.query(
      `SELECT o.order_id, o.user_id, o.status, o.total_amount, o.created_at,
              a.full_name, a.address_line_1, a.city, a.state, a.postal_code, a.country
       FROM orders o
       LEFT JOIN addresses a ON o.shipping_address_id = a.address_id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId],
    );
    return res.rows;
  }

  async getAllOrders() {
    const res = await pool.query(
      `SELECT o.order_id, o.user_id, o.status, o.total_amount, o.created_at,
              u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.public_id
       ORDER BY o.created_at DESC`,
    );
    return res.rows;
  }

  async getOrderById(orderId: string) {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE order_id = $1`,
      [orderId],
    );
    return rows[0] ?? null;
  }

  async updateStatus(orderId: string, status: string): Promise<void> {
    await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2`,
      [status, orderId],
    );
  }
}

export const ordersRepository = new OrdersRepository();
