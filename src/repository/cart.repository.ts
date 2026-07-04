import pool from "../config/dbconnect.js";
import { v4 as uuidv4 } from "uuid";

class CartRepository {
  private async getOrCreateCart(userId: string): Promise<string> {
    const existing = await pool.query(
      `SELECT cart_id FROM carts WHERE user_id = $1`,
      [userId],
    );
    if (existing.rows[0]) return existing.rows[0].cart_id as string;

    const cartId = uuidv4();
    await pool.query(
      `INSERT INTO carts (cart_id, user_id) VALUES ($1, $2)`,
      [cartId, userId],
    );
    return cartId;
  }

  async getCartItems(userId: string) {
    const cartId = await this.getOrCreateCart(userId);
    const res = await pool.query<{
      cart_item_id: string;
      product_id: string;
      quantity: number;
      size: string | null;
      name: string | null;
      price: string | null;
      image_url: string | null;
    }>(
      `SELECT ci.cart_item_id, ci.product_id, ci.quantity, ci.size,
              p.name, p.price,
              (SELECT pi.image_url FROM product_images pi
               WHERE pi.product_id = ci.product_id
               ORDER BY pi.is_primary DESC LIMIT 1) AS image_url
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = $1`,
      [cartId],
    );
    return res.rows.map((row) => ({
      cart_item_id: row.cart_item_id,
      product_id: row.product_id,
      quantity: row.quantity,
      size: row.size ?? null,
      name: row.name ?? "Unknown Product",
      price: row.price ?? "0",
      image_url: row.image_url ?? null,
    }));
  }

  async addOrUpdateItem(userId: string, productId: string, quantity: number, size?: string | null) {
    const cartId = await this.getOrCreateCart(userId);
    const existing = await pool.query(
      `SELECT cart_item_id, quantity FROM cart_items
       WHERE cart_id = $1 AND product_id = $2 AND size IS NOT DISTINCT FROM $3`,
      [cartId, productId, size ?? null],
    );

    if (existing.rows[0]) {
      const newQty = (existing.rows[0].quantity as number) + quantity;
      await pool.query(
        `UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE cart_item_id = $2`,
        [newQty, existing.rows[0].cart_item_id],
      );
    } else {
      await pool.query(
        `INSERT INTO cart_items (cart_item_id, cart_id, product_id, quantity, size) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), cartId, productId, quantity, size ?? null],
      );
    }
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number, size?: string | null) {
    const cartId = await this.getOrCreateCart(userId);
    if (quantity <= 0) {
      await pool.query(
        `DELETE FROM cart_items
         WHERE cart_id = $1 AND product_id = $2
           AND COALESCE(size, '') = COALESCE($3, '')`,
        [cartId, productId, size ?? null],
      );
    } else {
      await pool.query(
        `UPDATE cart_items SET quantity = $1, updated_at = NOW()
         WHERE cart_id = $2 AND product_id = $3
           AND COALESCE(size, '') = COALESCE($4, '')`,
        [quantity, cartId, productId, size ?? null],
      );
    }
  }

  async removeItem(userId: string, productId: string) {
    const cartId = await this.getOrCreateCart(userId);
    await pool.query(
      `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId],
    );
  }
}

export const cartRepository = new CartRepository();
