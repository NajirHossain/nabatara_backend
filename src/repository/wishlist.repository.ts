import pool from "../config/dbconnect.js";
import { v4 as uuidv4 } from "uuid";

class WishlistRepository {
  async getWishlist(userId: string) {
    const res = await pool.query<{
      product_id: string;
      name: string | null;
      price: string | null;
      stock_quantity: number | null;
      category: string | null;
      image_url: string | null;
    }>(
      `SELECT w.product_id, p.name, p.price, p.stock_quantity, p.category,
              (SELECT pi.image_url FROM product_images pi
               WHERE pi.product_id = w.product_id
               ORDER BY pi.is_primary DESC LIMIT 1) AS image_url
       FROM wishlists w
       LEFT JOIN products p ON w.product_id = p.product_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId],
    );
    return res.rows.map((row) => ({
      product_id: row.product_id,
      name: row.name ?? "Unknown Product",
      price: row.price ?? "0",
      stock_quantity: row.stock_quantity ?? 0,
      image_url: row.image_url ?? null,
      category: row.category ?? null,
    }));
  }

  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const res = await pool.query(
      `SELECT 1 FROM wishlists WHERE user_id = $1 AND product_id = $2`,
      [userId, productId],
    );
    return (res.rowCount ?? 0) > 0;
  }

  async addToWishlist(userId: string, productId: string): Promise<void> {
    await pool.query(
      `INSERT INTO wishlists (wishlist_id, user_id, product_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [uuidv4(), userId, productId],
    );
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await pool.query(
      `DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2`,
      [userId, productId],
    );
  }

  async getCount(userId: string): Promise<number> {
    const res = await pool.query(
      `SELECT COUNT(*) AS count FROM wishlists WHERE user_id = $1`,
      [userId],
    );
    return parseInt(res.rows[0].count as string, 10);
  }
}

export const wishlistRepository = new WishlistRepository();
