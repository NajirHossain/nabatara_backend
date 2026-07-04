-- migration_v9.sql: Dynamic product tab sections

CREATE TABLE IF NOT EXISTS product_sections (
  section_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  TEXT        NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  label       TEXT        NOT NULL,
  layout_type TEXT        NOT NULL DEFAULT 'alternating',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  items       JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_sections_product_id ON product_sections(product_id);
