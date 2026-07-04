-- Add size to cart_items
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS size TEXT;

-- Drop old unique constraint and replace with one that treats NULL size as equivalent
-- (allows same product in different sizes, but only one of each size per cart)
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_cart_id_product_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_cart_product_size_idx
  ON cart_items (cart_id, product_id, COALESCE(size, ''));

-- Add size to order_items (records selected size at time of purchase)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size TEXT;
