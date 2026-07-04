-- Migration v7: add sizes column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT NULL;

-- Update the clothing product with available sizes
UPDATE products SET sizes = ARRAY['XS','S','M','L','XL','XXL']
WHERE product_id = 'clothing-001';
