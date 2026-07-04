import type {
    Product,
    CreateProductInput,
    UpdateProductInput,
} from "../interfaces/product.interface.js";
import pool from "../config/dbconnect.js";
import fs from "fs";
import path from "path";

class ProductRepository {
    async create(input: CreateProductInput): Promise<Product> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const productQuery = `
        INSERT INTO products (product_id, name, description, category, price, stock_quantity, is_active, sizes,
          meta_title, meta_description, og_title, og_description, og_image, keywords)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING product_id
      `;
            const productResult = await client.query<Product>(productQuery, [
                input.product_id,
                input.name,
                input.description ?? null,
                input.category ?? null,
                input.price,
                input.stock_quantity ?? 0,
                input.is_active ?? true,
                input.sizes ?? null,
                input.meta_title ?? null,
                input.meta_description ?? null,
                input.og_title ?? null,
                input.og_description ?? null,
                input.og_image ?? null,
                input.keywords ?? null,
            ]);
            const product = productResult.rows[0];
            if (!product) throw new Error("Failed to create product record");

            if (input.images && input.images.length > 0) {
                for (const img of input.images) {
                    const imgQuery = `
            INSERT INTO product_images (image_id, product_id, image_url, is_primary)
            VALUES (gen_random_uuid()::text, $1, $2, $3)
          `;
                    await client.query(imgQuery, [
                        product.product_id,
                        img.image_url,
                        img.is_primary ?? false,
                    ]);
                }
            }

            await client.query("COMMIT");
            return this.findById(product.product_id) as Promise<Product>;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    async findAll(category?: string, search?: string): Promise<Product[]> {
        const query = `
      SELECT
        p.product_id, p.name, p.description, p.category, p.price,
        p.stock_quantity, p.is_active, p.sizes, p.created_at, p.updated_at,
        p.meta_title, p.meta_description, p.og_title, p.og_description, p.og_image, p.keywords,
        COALESCE(
          json_agg(
            json_build_object(
              'image_id', pi.image_id,
              'product_id', pi.product_id,
              'image_url', pi.image_url,
              'is_primary', pi.is_primary,
              'created_at', pi.created_at
            ) ORDER BY pi.is_primary DESC
          ) FILTER (WHERE pi.image_id IS NOT NULL),
          '[]'::json
        ) AS images
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      WHERE p.is_active = TRUE
        AND ($1::text IS NULL OR p.category ILIKE $1)
        AND ($2::text IS NULL OR p.name ILIKE '%' || $2 || '%' OR p.description ILIKE '%' || $2 || '%')
      GROUP BY p.product_id
      ORDER BY p.created_at DESC
    `;
        const result = await pool.query<Product>(query, [category ?? null, search ?? null]);
        return result.rows;
    }

    async findById(productId: string): Promise<Product | null> {
        const query = `
      SELECT
        p.product_id, p.name, p.description, p.category, p.price,
        p.stock_quantity, p.is_active, p.sizes, p.created_at, p.updated_at,
        p.meta_title, p.meta_description, p.og_title, p.og_description, p.og_image, p.keywords,
        COALESCE(
          json_agg(
            json_build_object(
              'image_id', pi.image_id,
              'product_id', pi.product_id,
              'image_url', pi.image_url,
              'is_primary', pi.is_primary,
              'created_at', pi.created_at
            ) ORDER BY pi.is_primary DESC
          ) FILTER (WHERE pi.image_id IS NOT NULL),
          '[]'::json
        ) AS images
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      WHERE p.product_id = $1
      GROUP BY p.product_id
      LIMIT 1
    `;
        const result = await pool.query<Product>(query, [productId]);
        return result.rows[0] ?? null;
    }

    async exists(productId: string): Promise<boolean> {
        const query = `SELECT 1 FROM products WHERE product_id = $1 LIMIT 1`;
        const result = await pool.query(query, [productId]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async update(productId: string, input: UpdateProductInput): Promise<Product | null> {
        const fields: string[] = [];
        const values: Array<string | number | boolean | null> = [];
        let index = 1;

        if (input.name !== undefined) { fields.push(`name = $${index++}`); values.push(input.name); }
        if (input.description !== undefined) { fields.push(`description = $${index++}`); values.push(input.description); }
        if (input.category !== undefined) { fields.push(`category = $${index++}`); values.push(input.category); }
        if (input.price !== undefined) { fields.push(`price = $${index++}`); values.push(input.price); }
        if (input.stock_quantity !== undefined) { fields.push(`stock_quantity = $${index++}`); values.push(input.stock_quantity); }
        if (input.is_active !== undefined) { fields.push(`is_active = $${index++}`); values.push(input.is_active); }
        if (input.sizes !== undefined) { fields.push(`sizes = $${index++}`); values.push(input.sizes as unknown as string); }
        if (input.meta_title !== undefined) { fields.push(`meta_title = $${index++}`); values.push(input.meta_title); }
        if (input.meta_description !== undefined) { fields.push(`meta_description = $${index++}`); values.push(input.meta_description); }
        if (input.og_title !== undefined) { fields.push(`og_title = $${index++}`); values.push(input.og_title); }
        if (input.og_description !== undefined) { fields.push(`og_description = $${index++}`); values.push(input.og_description); }
        if (input.og_image !== undefined) { fields.push(`og_image = $${index++}`); values.push(input.og_image); }
        if (input.keywords !== undefined) { fields.push(`keywords = $${index++}`); values.push(input.keywords); }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        if (fields.length === 1) return this.findById(productId);

        const query = `
      UPDATE products SET ${fields.join(", ")}
      WHERE product_id = $${index}
      RETURNING product_id
    `;
        values.push(productId);
        const result = await pool.query(query, values);
        if (!result.rows[0]) return null;
        return this.findById(productId);
    }

    async delete(productId: string): Promise<Product | null> {
        const product = await this.findById(productId);
        if (!product) return null;
        await pool.query(`DELETE FROM products WHERE product_id = $1`, [productId]);
        for (const img of product.images ?? []) {
            if (img.image_url?.startsWith("/uploads/")) {
                const filename = path.basename(img.image_url);
                const filePath = path.join(process.cwd(), "src", "uploads", "Products", filename);
                try { fs.unlinkSync(filePath); } catch { /* file already gone */ }
            }
        }
        return product;
    }

    async countAll(): Promise<number> {
        const result = await pool.query<{ count: string }>(`SELECT COUNT(*) as count FROM products`);
        return parseInt(result.rows[0]?.count ?? "0", 10);
    }
}

export const productRepository = new ProductRepository();
