-- v3: add refresh_token to users; drop cart_items FK on product_id (products are hardcoded)

ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT;

ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
