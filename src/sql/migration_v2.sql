-- Run this once against your existing database
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
