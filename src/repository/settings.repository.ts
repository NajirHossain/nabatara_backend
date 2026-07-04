import pool from "../config/dbconnect.js";
import type { SeoSetting, StaticPageRow, UpsertSeoInput } from "../interfaces/settings.interface.js";

export const settingsRepository = {
  async getSetting(key: string): Promise<unknown | null> {
    const { rows } = await pool.query(
      `SELECT value FROM site_settings WHERE key = $1`,
      [key]
    );
    return rows[0]?.value ?? null;
  },

  async upsertSetting(key: string, value: unknown): Promise<void> {
    await pool.query(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
  },

  async getSeo(page: string): Promise<SeoSetting | null> {
    const { rows } = await pool.query<SeoSetting>(
      `SELECT * FROM seo_settings WHERE page = $1`,
      [page]
    );
    return rows[0] ?? null;
  },

  async upsertSeo(page: string, input: UpsertSeoInput): Promise<SeoSetting> {
    const { rows } = await pool.query<SeoSetting>(
      `INSERT INTO seo_settings (page, title, description, og_title, og_description, og_image, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (page) DO UPDATE SET
         title          = COALESCE(EXCLUDED.title, seo_settings.title),
         description    = COALESCE(EXCLUDED.description, seo_settings.description),
         og_title       = COALESCE(EXCLUDED.og_title, seo_settings.og_title),
         og_description = COALESCE(EXCLUDED.og_description, seo_settings.og_description),
         og_image       = COALESCE(EXCLUDED.og_image, seo_settings.og_image),
         updated_at     = NOW()
       RETURNING *`,
      [
        page,
        input.title ?? null,
        input.description ?? null,
        input.og_title ?? null,
        input.og_description ?? null,
        input.og_image ?? null,
      ]
    );
    return rows[0]!;
  },

  async getAllSeo(): Promise<SeoSetting[]> {
    const { rows } = await pool.query<SeoSetting>(
      `SELECT * FROM seo_settings ORDER BY page ASC`
    );
    return rows;
  },

  async getStaticPage(pageKey: string): Promise<StaticPageRow | null> {
    const { rows } = await pool.query<StaticPageRow>(
      `SELECT * FROM static_pages WHERE page_key = $1`,
      [pageKey]
    );
    return rows[0] ?? null;
  },

  async upsertStaticPage(pageKey: string, content: Record<string, unknown>): Promise<StaticPageRow> {
    const { rows } = await pool.query<StaticPageRow>(
      `INSERT INTO static_pages (page_key, content, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (page_key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
       RETURNING *`,
      [pageKey, JSON.stringify(content)]
    );
    return rows[0]!;
  },

  async getAllStaticPages(): Promise<StaticPageRow[]> {
    const { rows } = await pool.query<StaticPageRow>(
      `SELECT page_key, updated_at FROM static_pages ORDER BY page_key ASC`
    );
    return rows;
  },
};
