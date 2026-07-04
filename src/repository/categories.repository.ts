import pool from "../config/dbconnect.js";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../interfaces/category.interface.js";

export const categoriesRepository = {
  async getAll(): Promise<Category[]> {
    const { rows } = await pool.query<Category>(
      `SELECT * FROM categories ORDER BY sort_order ASC, created_at ASC`
    );
    return rows;
  },

  async getActive(): Promise<Category[]> {
    const { rows } = await pool.query<Category>(
      `SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC`
    );
    return rows;
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    const { rows } = await pool.query<Category>(
      `INSERT INTO categories (name, nav_label, is_nav_visible, is_active, is_featured, is_showcase, image_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        input.name,
        input.nav_label,
        input.is_nav_visible ?? true,
        input.is_active ?? true,
        input.is_featured ?? false,
        input.is_showcase ?? false,
        input.image_url ?? null,
        input.sort_order ?? 0,
      ]
    );
    return rows[0]!;
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.name !== undefined)           { fields.push(`name = $${idx++}`);           values.push(input.name); }
    if (input.nav_label !== undefined)      { fields.push(`nav_label = $${idx++}`);      values.push(input.nav_label); }
    if (input.is_nav_visible !== undefined) { fields.push(`is_nav_visible = $${idx++}`); values.push(input.is_nav_visible); }
    if (input.is_active !== undefined)      { fields.push(`is_active = $${idx++}`);      values.push(input.is_active); }
    if (input.is_featured !== undefined)    { fields.push(`is_featured = $${idx++}`);    values.push(input.is_featured); }
    if (input.is_showcase !== undefined)   { fields.push(`is_showcase = $${idx++}`);    values.push(input.is_showcase); }
    if (input.image_url !== undefined)     { fields.push(`image_url = $${idx++}`);      values.push(input.image_url); }
    if (input.sort_order !== undefined)     { fields.push(`sort_order = $${idx++}`);     values.push(input.sort_order); }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query<Category>(
      `UPDATE categories SET ${fields.join(", ")} WHERE category_id = $${idx} RETURNING *`,
      values
    );
    return rows[0] ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `DELETE FROM categories WHERE category_id = $1`,
      [id]
    );
    return (rowCount ?? 0) > 0;
  },

  async reorder(items: { category_id: string; sort_order: number }[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const { category_id, sort_order } of items) {
        await client.query(
          `UPDATE categories SET sort_order = $1, updated_at = NOW() WHERE category_id = $2`,
          [sort_order, category_id]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
