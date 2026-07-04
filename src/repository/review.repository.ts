import pool from "../config/dbconnect.js";
import { v4 as uuidv4 } from "uuid";

export interface ReviewRow {
  review_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  reviewer_name: string | null;
  created_at: Date;
  updated_at: Date;
}

class ReviewRepository {
  async getReviewsByProduct(productId: string): Promise<ReviewRow[]> {
    const res = await pool.query<ReviewRow>(
      `SELECT r.review_id, r.product_id, r.user_id, r.rating, r.title, r.body,
              r.created_at, r.updated_at,
              u.name AS reviewer_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.public_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId],
    );
    return res.rows;
  }

  async getAverageRating(productId: string): Promise<{ average: number | null; count: number }> {
    const res = await pool.query<{ average: string | null; count: string }>(
      `SELECT ROUND(AVG(rating)::numeric, 1)::text AS average, COUNT(*) AS count
       FROM reviews WHERE product_id = $1`,
      [productId],
    );
    const row = res.rows[0];
    return {
      average: row?.average != null ? parseFloat(row.average) : null,
      count: row?.count != null ? parseInt(row.count, 10) : 0,
    };
  }

  async getUserReview(userId: string, productId: string): Promise<ReviewRow | null> {
    const res = await pool.query<ReviewRow>(
      `SELECT review_id, product_id, user_id, rating, title, body, created_at, updated_at
       FROM reviews WHERE user_id = $1 AND product_id = $2`,
      [userId, productId],
    );
    return res.rows[0] ?? null;
  }

  async upsertReview(
    userId: string,
    productId: string,
    rating: number,
    title: string | null,
    body: string | null,
  ): Promise<ReviewRow> {
    const res = await pool.query<ReviewRow>(
      `INSERT INTO reviews (review_id, product_id, user_id, rating, title, body)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, product_id) DO UPDATE
         SET rating = EXCLUDED.rating,
             title = EXCLUDED.title,
             body = EXCLUDED.body,
             updated_at = NOW()
       RETURNING review_id, product_id, user_id, rating, title, body, created_at, updated_at`,
      [uuidv4(), productId, userId, rating, title ?? null, body ?? null],
    );
    if (!res.rows[0]) throw new Error("Failed to save review");
    return res.rows[0];
  }

  async deleteReview(userId: string, productId: string): Promise<void> {
    await pool.query(
      `DELETE FROM reviews WHERE user_id = $1 AND product_id = $2`,
      [userId, productId],
    );
  }
}

export const reviewRepository = new ReviewRepository();
