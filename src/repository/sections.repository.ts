import pool from "../config/dbconnect.js";
import type { ProductSection, CreateSectionInput, UpdateSectionInput } from "../interfaces/section.interface.js";

export const sectionsRepository = {
  async getByProduct(productId: string): Promise<ProductSection[]> {
    const { rows } = await pool.query<ProductSection>(
      `SELECT * FROM product_sections WHERE product_id = $1 ORDER BY sort_order ASC, created_at ASC`,
      [productId]
    );
    return rows;
  },

  async create(input: CreateSectionInput): Promise<ProductSection> {
    const { rows } = await pool.query<ProductSection>(
      `INSERT INTO product_sections (product_id, label, layout_type, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [input.product_id, input.label, input.layout_type, input.sort_order ?? 0]
    );
    return rows[0]!;
  },

  async update(sectionId: string, input: UpdateSectionInput): Promise<ProductSection | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (input.label !== undefined)       { fields.push(`label = $${idx++}`);       values.push(input.label); }
    if (input.layout_type !== undefined) { fields.push(`layout_type = $${idx++}`); values.push(input.layout_type); }
    if (input.sort_order !== undefined)  { fields.push(`sort_order = $${idx++}`);  values.push(input.sort_order); }
    if (fields.length === 0) return null;
    values.push(sectionId);
    const { rows } = await pool.query<ProductSection>(
      `UPDATE product_sections SET ${fields.join(", ")} WHERE section_id = $${idx} RETURNING *`,
      values
    );
    return rows[0] ?? null;
  },

  async upsertItems(sectionId: string, items: Record<string, unknown>[]): Promise<ProductSection | null> {
    const { rows } = await pool.query<ProductSection>(
      `UPDATE product_sections SET items = $1::jsonb WHERE section_id = $2 RETURNING *`,
      [JSON.stringify(items), sectionId]
    );
    return rows[0] ?? null;
  },

  async delete(sectionId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `DELETE FROM product_sections WHERE section_id = $1`,
      [sectionId]
    );
    return (rowCount ?? 0) > 0;
  },

  async reorder(items: { section_id: string; sort_order: number }[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const { section_id, sort_order } of items) {
        await client.query(
          `UPDATE product_sections SET sort_order = $1 WHERE section_id = $2`,
          [sort_order, section_id]
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
