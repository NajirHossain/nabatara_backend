-- migration_v13: category image + featured flag; new site_settings keys seeded

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url   TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN NOT NULL DEFAULT FALSE;

-- Pre-mark the 4 default featured categories
UPDATE categories SET is_featured = TRUE
WHERE name IN ('Temple & Consecrated', 'Rudraksha', 'Health & Immunity', 'Natural Foods');

-- Seed default values for new site_settings keys
INSERT INTO site_settings (key, value) VALUES
  ('spotlight_slides', $json$[
    {"id":1,"image_url":null,"alt":"Featured product"},
    {"id":2,"image_url":null,"alt":""},
    {"id":3,"image_url":null,"alt":""}
  ]$json$),
  ('product_showcase', $json$[
    {"id":1,"title":"Dhyanalinga Prasadam","label":"Energized","image_url":null,"href":"/products?category=Temple+%26+Consecrated","size":"large"},
    {"id":2,"title":"Gold Sarpa Sutra","label":"","image_url":null,"href":"/products?category=Rudraksha","size":"small"},
    {"id":3,"title":"Glow in the Dark T-Shirts","label":"","image_url":null,"href":"/products?category=Clothing","size":"small"}
  ]$json$),
  ('store_info', $json${
    "address": "Nabatara Headquarters, Kolkata - 700055",
    "phone": "+91 844 844 7788",
    "email": "support@nabataralife.com"
  }$json$)
ON CONFLICT DO NOTHING;
