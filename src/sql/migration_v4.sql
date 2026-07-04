-- Drop FK from order_items so hardcoded product IDs can be referenced
-- Same pattern as migration_v3 which dropped the cart_items → products FK
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
