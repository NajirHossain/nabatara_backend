import { ordersRepository } from "../repository/orders.repository.js";
import pool from "../config/dbconnect.js";
import type { CreateOrderBody } from "../interfaces/order.interface.js";

const VALID_STATUSES = [
  "PENDING", "CONFIRMED", "SHIPPED",
  "OUT_FOR_DELIVERY", "DELIVERED",
  "REQUEST_FOR_CANCEL", "CANCELLED",
] as const;

class OrderService {
  async createOrder(userId: string, body: CreateOrderBody) {
    const { shipping_address_id, items } = body;
    if (!shipping_address_id) throw new Error("Shipping address is required");
    if (!items?.length) throw new Error("Order must have at least one item");

    const productIds = items.map((i) => i.product_id);
    const productsRes = await pool.query<{
      product_id: string;
      name: string;
      price: string;
      stock_quantity: number;
    }>(
      `SELECT product_id, name, price, stock_quantity FROM products WHERE product_id = ANY($1)`,
      [productIds],
    );
    const productMap = new Map(productsRes.rows.map((p) => [p.product_id, p]));

    let totalAmount = 0;
    const enrichedItems = items.map((item) => {
      const product = productMap.get(item.product_id);
      if (product) {
        if (product.stock_quantity === 0) {
          throw new Error(`"${product.name}" is out of stock`);
        }
        if (item.quantity > product.stock_quantity) {
          throw new Error(`Only ${product.stock_quantity} unit(s) of "${product.name}" available`);
        }
      }
      const unit_price = parseFloat(product?.price ?? String(item.unit_price ?? 0));
      totalAmount += unit_price * item.quantity;
      return { product_id: item.product_id, quantity: item.quantity, unit_price, size: item.size ?? null };
    });

    const orderId = await ordersRepository.createOrder(
      userId,
      shipping_address_id,
      enrichedItems,
      totalAmount,
    );

    return {
      success: true,
      data: { order_id: orderId, status: "PENDING", total_amount: totalAmount },
    };
  }

  async getOrders(userId: string) {
    const orders = await ordersRepository.getOrdersByUser(userId);
    return { success: true, data: orders };
  }

  async updateStatus(orderId: string, status: string): Promise<void> {
    if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      throw new Error(`Invalid status: ${status}`);
    }
    await ordersRepository.updateStatus(orderId, status);
  }

  async requestCancellation(userId: string, orderId: string): Promise<void> {
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.user_id !== userId) throw new Error("Unauthorized");
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      throw new Error("Order cannot be cancelled at this stage");
    }
    await ordersRepository.updateStatus(orderId, "REQUEST_FOR_CANCEL");
  }
}

export const orderService = new OrderService();
