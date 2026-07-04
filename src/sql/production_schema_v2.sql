-- =============================================================================
-- NabataraLife — Production Schema v2
-- Consolidated from queries.sql + migrations v2–v14
-- FOR FRESH DATABASES ONLY — drops all tables and recreates from scratch.
-- DO NOT run on an existing database with data — use migration files instead.
-- Last updated: v14 (June 2026)
-- =============================================================================

-- Drop all tables in reverse dependency order (safe to re-run on empty DB)
DROP TABLE IF EXISTS admin_invites      CASCADE;
DROP TABLE IF EXISTS otp_tokens         CASCADE;
DROP TABLE IF EXISTS product_sections   CASCADE;
DROP TABLE IF EXISTS static_pages       CASCADE;
DROP TABLE IF EXISTS seo_settings       CASCADE;
DROP TABLE IF EXISTS site_settings      CASCADE;
DROP TABLE IF EXISTS categories         CASCADE;
DROP TABLE IF EXISTS reviews            CASCADE;
DROP TABLE IF EXISTS wishlists          CASCADE;
DROP TABLE IF EXISTS payments           CASCADE;
DROP TABLE IF EXISTS order_items        CASCADE;
DROP TABLE IF EXISTS orders             CASCADE;
DROP TABLE IF EXISTS cart_items         CASCADE;
DROP TABLE IF EXISTS carts              CASCADE;
DROP TABLE IF EXISTS addresses          CASCADE;
DROP TABLE IF EXISTS product_images     CASCADE;
DROP TABLE IF EXISTS products           CASCADE;
DROP TABLE IF EXISTS users              CASCADE;


-- =============================================================================
-- Core tables
-- =============================================================================

CREATE TABLE users (
    public_id      TEXT        PRIMARY KEY,
    name           TEXT,
    contact_no     TEXT,
    email          TEXT        NOT NULL UNIQUE,
    role           TEXT        NOT NULL CHECK (role IN ('USER', 'ADMIN')),
    password_hash  TEXT        NOT NULL,
    refresh_token  TEXT,
    email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id       TEXT           PRIMARY KEY,
    name             TEXT           NOT NULL,
    description      TEXT,
    category         TEXT,
    price            NUMERIC(10,2)  NOT NULL CHECK (price >= 0),
    stock_quantity   INT            NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active        BOOLEAN        NOT NULL DEFAULT TRUE,
    sizes            TEXT[],
    meta_title       TEXT,
    meta_description TEXT,
    og_title         TEXT,
    og_description   TEXT,
    og_image         TEXT,
    keywords         TEXT,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
    image_id    TEXT        PRIMARY KEY,
    product_id  TEXT        NOT NULL,
    image_url   TEXT        NOT NULL,
    is_primary  BOOLEAN     DEFAULT FALSE,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE addresses (
    address_id      TEXT        PRIMARY KEY,
    user_id         TEXT        NOT NULL,
    full_name       TEXT        NOT NULL,
    contact_no      TEXT,
    address_line_1  TEXT        NOT NULL,
    address_line_2  TEXT,
    city            TEXT        NOT NULL,
    state           TEXT,
    postal_code     TEXT        NOT NULL,
    country         TEXT        NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(public_id) ON DELETE CASCADE
);

CREATE TABLE carts (
    cart_id     TEXT        PRIMARY KEY,
    user_id     TEXT        NOT NULL UNIQUE,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(public_id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id  TEXT        PRIMARY KEY,
    cart_id       TEXT        NOT NULL,
    product_id    TEXT        NOT NULL,
    quantity      INT         NOT NULL CHECK (quantity > 0),
    size          TEXT,
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE
);

CREATE TABLE orders (
    order_id            TEXT           PRIMARY KEY,
    user_id             TEXT           NOT NULL,
    shipping_address_id TEXT,
    billing_address_id  TEXT,
    status              TEXT           NOT NULL CHECK (
                            status IN ('PENDING','CONFIRMED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','REQUEST_FOR_CANCEL','CANCELLED')
                        ),
    total_amount        NUMERIC(10,2)  NOT NULL CHECK (total_amount >= 0),
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)             REFERENCES users(public_id)      ON DELETE CASCADE,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id) ON DELETE SET NULL,
    FOREIGN KEY (billing_address_id)  REFERENCES addresses(address_id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    order_item_id  TEXT           PRIMARY KEY,
    order_id       TEXT           NOT NULL,
    product_id     TEXT           NOT NULL,
    quantity       INT            NOT NULL CHECK (quantity > 0),
    unit_price     NUMERIC(10,2)  NOT NULL CHECK (unit_price >= 0),
    subtotal       NUMERIC(10,2)  NOT NULL CHECK (subtotal >= 0),
    size           TEXT,
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE TABLE payments (
    payment_id      TEXT        PRIMARY KEY,
    order_id        TEXT        NOT NULL UNIQUE,
    payment_method  TEXT        NOT NULL CHECK (
                        payment_method IN ('COD','CARD','UPI','NETBANKING','WALLET')
                    ),
    payment_status  TEXT        NOT NULL CHECK (
                        payment_status IN ('PENDING','SUCCESS','FAILED','REFUNDED')
                    ),
    transaction_ref TEXT        UNIQUE,
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);


-- =============================================================================
-- Social / engagement
-- =============================================================================

CREATE TABLE wishlists (
    wishlist_id  TEXT        PRIMARY KEY,
    user_id      TEXT        NOT NULL,
    product_id   TEXT        NOT NULL,
    created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(public_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    review_id   TEXT        PRIMARY KEY,
    product_id  TEXT        NOT NULL,
    user_id     TEXT        NOT NULL,
    rating      INT         NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title       TEXT,
    body        TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id)
);


-- =============================================================================
-- CMS
-- =============================================================================

CREATE TABLE categories (
    category_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    nav_label       TEXT        NOT NULL,
    is_nav_visible  BOOLEAN     NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    is_featured     BOOLEAN     NOT NULL DEFAULT FALSE,
    is_showcase     BOOLEAN     NOT NULL DEFAULT FALSE,
    image_url       TEXT,
    sort_order      INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE site_settings (
    key         TEXT        PRIMARY KEY,
    value       JSONB       NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seo_settings (
    page            TEXT        PRIMARY KEY,
    title           TEXT,
    description     TEXT,
    og_title        TEXT,
    og_description  TEXT,
    og_image        TEXT,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE static_pages (
    page_key    TEXT        PRIMARY KEY,
    content     JSONB       NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_sections (
    section_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id   TEXT        NOT NULL,
    label        TEXT        NOT NULL,
    layout_type  TEXT        NOT NULL DEFAULT 'alternating',
    sort_order   INTEGER     NOT NULL DEFAULT 0,
    items        JSONB       NOT NULL DEFAULT '[]',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);


-- =============================================================================
-- Auth / security
-- =============================================================================

CREATE TABLE otp_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT        NOT NULL,
    code        TEXT        NOT NULL,
    purpose     TEXT        NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')),
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_invites (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email        TEXT        NOT NULL,
    token        TEXT        NOT NULL UNIQUE,
    invited_by   TEXT        NOT NULL REFERENCES users(public_id) ON DELETE CASCADE,
    expires_at   TIMESTAMPTZ NOT NULL,
    accepted     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX idx_products_is_active          ON products(is_active);
CREATE INDEX idx_products_category           ON products(category);
CREATE INDEX idx_product_images_product_id   ON product_images(product_id);
CREATE INDEX idx_addresses_user_id           ON addresses(user_id);

CREATE UNIQUE INDEX cart_items_cart_product_size_idx
    ON cart_items (cart_id, product_id, COALESCE(size, ''));
CREATE INDEX idx_cart_items_cart_id          ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id       ON cart_items(product_id);

CREATE INDEX idx_orders_user_id              ON orders(user_id);
CREATE INDEX idx_order_items_order_id        ON order_items(order_id);
CREATE INDEX idx_order_items_product_id      ON order_items(product_id);
CREATE INDEX idx_payments_order_id           ON payments(order_id);
CREATE INDEX idx_wishlists_user_id           ON wishlists(user_id);
CREATE INDEX idx_reviews_product_id          ON reviews(product_id);
CREATE INDEX idx_product_sections_product_id ON product_sections(product_id);
CREATE INDEX idx_otp_tokens_email_purpose    ON otp_tokens(email, purpose);
CREATE INDEX idx_admin_invites_token         ON admin_invites(token);
CREATE INDEX idx_admin_invites_email         ON admin_invites(email);


-- =============================================================================
-- Seed data — default categories, settings, SEO, static pages
-- =============================================================================

INSERT INTO categories (name, nav_label, is_nav_visible, is_active, is_featured, is_showcase, sort_order) VALUES
  ('Rudraksha',            'RUDRAKSHA',            TRUE,  TRUE,  TRUE,  FALSE, 1),
  ('Temple & Consecrated', 'TEMPLE & CONSECRATED', TRUE,  TRUE,  TRUE,  FALSE, 2),
  ('Yoga Store',           'YOGA STORE',           TRUE,  TRUE,  FALSE, FALSE, 3),
  ('Natural Foods',        'NATURAL FOOD',         TRUE,  TRUE,  TRUE,  FALSE, 4),
  ('Health & Immunity',    'HEALTH & IMMUNITY',    TRUE,  TRUE,  TRUE,  FALSE, 5),
  ('Clothing',             'CLOTHING',             TRUE,  TRUE,  FALSE, FALSE, 6),
  ('Body Care',            'BODY CARE',            TRUE,  TRUE,  FALSE, FALSE, 7),
  ('Home Decor',           'HOME DECOR',           TRUE,  TRUE,  FALSE, FALSE, 8),
  ('Books',                'BOOKS',                TRUE,  TRUE,  FALSE, FALSE, 9),
  ('Jewellery',            'JEWELLERY',            FALSE, TRUE,  FALSE, FALSE, 10)
ON CONFLICT DO NOTHING;

INSERT INTO site_settings (key, value) VALUES
  ('announcement', '"Pay On Delivery Available Now"'),
  ('hero_slides', $json$[
    {"id":1,"title":"Linga Bhairavi Gudi","subtitle":"Bring Devi''s Grace into your life","cta":"Shop Now","href":"/products?category=Temple+%26+Consecrated","image_url":null},
    {"id":2,"title":"Sacred Rudraksha","subtitle":"Embrace divine energy and protection","cta":"Explore Collection","href":"/products?category=Rudraksha","image_url":null},
    {"id":3,"title":"Yogic Wellness","subtitle":"Transform your body and mind","cta":"Discover More","href":"/products?category=Yoga+Store","image_url":null}
  ]$json$),
  ('promo_grid', $json$[
    {"id":1,"title":"Gifts Of Transformation","subtitle":"Devi Gudi","cta":"EXPLORE NOW","href":"/products","image_url":null,"gradient":"from-purple-900 to-purple-800","size":"large"},
    {"id":2,"title":"Jeeva Legium","subtitle":"Chyawanprash","cta":"Explore Now","href":"/products?category=Health+%26+Immunity","image_url":"https://images.unsplash.com/photo-1627394376504-24507bf9f7eb?w=800&q=80","gradient":"from-amber-900 to-amber-800","size":"small"},
    {"id":3,"title":"Winter","subtitle":"Wellness","subtitle2":"OFFERINGS","cta":"Shop Now","href":"/products","image_url":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80","gradient":"from-slate-900 to-slate-800","size":"small"},
    {"id":4,"title":"Adiyogi Hoodie","subtitle":"","cta":"Shop Now","href":"/products?category=Clothing","image_url":"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80","gradient":"from-slate-600 to-slate-700","size":"medium"}
  ]$json$),
  ('featured_categories', $json$[
    {"id":1,"title":"Consecrated Offerings","image_url":"https://images.unsplash.com/photo-1764416995436-e5f9ebef52f7?w=800&q=80","category_name":"Temple & Consecrated"},
    {"id":2,"title":"Rudraksha","image_url":"https://images.unsplash.com/photo-1527999230720-768828d2d0a3?w=800&q=80","category_name":"Rudraksha"},
    {"id":3,"title":"Health & Immunity","image_url":"https://images.unsplash.com/photo-1627394376504-24507bf9f7eb?w=800&q=80","category_name":"Health & Immunity"},
    {"id":4,"title":"Natural Foods","image_url":"https://images.unsplash.com/photo-1692797178143-659c48c34135?w=800&q=80","category_name":"Natural Foods"}
  ]$json$),
  ('philosophy_quote', $json${"quote":"The most fundamental aspect of life is to live consciously.","attribution":"Sadhguru","subtitle":"Every product at NabataraLife is sourced with intention — to support your journey towards conscious, joyful living."}$json$),
  ('homepage_layout', $json${"hero":true,"categories":true,"promo":true,"product_rows":true,"philosophy":true,"showcase":true}$json$),
  ('product_rows', $json$[
    {"id":"row1","enabled":false,"title":"New Arrivals","product_ids":[]},
    {"id":"row2","enabled":false,"title":"Best Sellers","product_ids":[]},
    {"id":"row3","enabled":false,"title":"Staff Picks","product_ids":[]}
  ]$json$),
  ('spotlight_slides', $json$[
    {"id":1,"image_url":null,"alt":""},
    {"id":2,"image_url":null,"alt":""},
    {"id":3,"image_url":null,"alt":""}
  ]$json$),
  ('product_showcase', $json$[
    {"id":1,"title":"Dhyanalinga Prasadam","label":"Energized","image_url":null,"href":"/products?category=Temple+%26+Consecrated","size":"large"},
    {"id":2,"title":"Gold Sarpa Sutra","label":"","image_url":null,"href":"/products?category=Rudraksha","size":"small"},
    {"id":3,"title":"Glow in the Dark T-Shirts","label":"","image_url":null,"href":"/products?category=Clothing","size":"small"}
  ]$json$),
  ('store_info', $json${"address":"Nabatara Headquarters, Kolkata - 700055","phone":"+91 844 844 7788","email":"support@nabataralife.com"}$json$)
ON CONFLICT DO NOTHING;

INSERT INTO seo_settings (page, title, description, og_title, og_description) VALUES
  ('home',     'Nabatara Life | Sacred & Wellness Products',  'Shop consecrated offerings, Rudraksha, natural foods, and wellness products at Nabatara Life.',  'Nabatara Life | Sacred & Wellness Products',  'Authentic sacred products for conscious living.'),
  ('products', 'All Products | Nabatara Life',                'Browse our full collection of sacred and wellness products.',                                     'All Products | Nabatara Life',                'Explore the Nabatara Life collection.'),
  ('about',    'About Us | Nabatara Life',                    'Learn about the Nabatara Life mission and story.',                                                'About Us | Nabatara Life',                    'Our story, mission, and values.'),
  ('contact',  'Contact Us | Nabatara Life',                  'Get in touch with the Nabatara Life team.',                                                      'Contact Us | Nabatara Life',                  'We are here to help.'),
  ('faq',      'FAQ | Nabatara Life',                         'Frequently asked questions about orders, shipping, and products.',                                'FAQ | Nabatara Life',                         'Find answers to common questions.'),
  ('shipping', 'Shipping Policy | Nabatara Life',             'Shipping and delivery information for Nabatara Life orders.',                                     'Shipping Policy | Nabatara Life',             'Free shipping on orders above Rs. 999.'),
  ('returns',  'Returns & Exchanges | Nabatara Life',         '7-day hassle-free return policy for all eligible products.',                                      'Returns & Exchanges | Nabatara Life',         'Shop with confidence — easy returns.'),
  ('privacy',  'Privacy Policy | Nabatara Life',              'How Nabatara Life handles your personal data.',                                                   'Privacy Policy | Nabatara Life',              'Your trust is our most valued possession.'),
  ('terms',    'Terms of Service | Nabatara Life',            'Terms and conditions for using the Nabatara Life platform.',                                      'Terms of Service | Nabatara Life',            'Transparency and integrity in every transaction.'),
  ('cookies',  'Cookie Policy | Nabatara Life',               'How Nabatara Life uses cookies to improve your experience.',                                      'Cookie Policy | Nabatara Life',               'A better experience, built on honesty.')
ON CONFLICT DO NOTHING;

INSERT INTO static_pages (page_key, content) VALUES

('about', $json${
  "title": "About Us",
  "heroImage": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1600&q=85",
  "intro": "Envisioned as a space for cultural exuberance, NabataraLife draws you into the enchanting world of Indian tradition.",
  "sections": [
    {"heading": "Our Story", "body": "NabataraLife was born from a deep reverence for India's timeless spiritual traditions. Founded with the vision of making authentic sacred products accessible to every home, we source and curate items that carry genuine energetic intention."},
    {"heading": "Our Mission", "body": "Our mission is simple: to serve as a trusted bridge between seekers and the sacred. We work directly with artisans, temples, and trusted suppliers to ensure that what you receive carries the energy and quality it promises."},
    {"heading": "Our Values", "body": "Authenticity — every product is genuine.\nSustainability — we prefer natural, organic, and handcrafted.\nIntegrity — transparent sourcing, honest pricing.\nService — your wellbeing is our purpose."}
  ]
}$json$),

('contact', $json${
  "title": "Contact Us",
  "heroImage": "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=1600&q=85",
  "intro": "Whether you have a question about an order, need guidance choosing the right product, or simply want to connect — our team is always happy to help.",
  "type": "contact",
  "contactInfo": {
    "address": "Nabatara Headquarters\nKolkata — 700055\nWest Bengal, India",
    "phone": "+91 844 844 7788",
    "phoneHours": "Mon – Sat, 10 AM – 6 PM IST",
    "email": "support@nabataralife.com",
    "emailNote": "We reply within 1 business day"
  }
}$json$),

('faq', $json${
  "title": "Frequently Asked Questions",
  "heroImage": "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1600&q=85",
  "intro": "Here are answers to the questions we hear most often.",
  "type": "faq",
  "items": [
    {"q": "Are the Rudraksha beads authentic?", "a": "Yes. All Rudraksha beads are sourced directly from certified suppliers in Nepal and India."},
    {"q": "Do you offer Cash on Delivery (COD)?", "a": "Yes, Pay on Delivery is available across India for all orders."},
    {"q": "How long does delivery take?", "a": "Standard delivery takes 5–7 business days."},
    {"q": "What is your free shipping threshold?", "a": "Orders above Rs. 999 qualify for free shipping."},
    {"q": "Can I return a product?", "a": "Yes. We offer a 7-day hassle-free return window from the date of delivery."}
  ]
}$json$),

('shipping', $json${
  "title": "Shipping Policy",
  "heroImage": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=85",
  "intro": "We ship across India with free delivery on orders above Rs. 999.",
  "sections": [
    {"heading": "Free Shipping", "body": "Orders totalling Rs. 999 or above qualify for free standard shipping anywhere in India."},
    {"heading": "Delivery Timelines", "body": "Standard Delivery: 5–7 business days.\nExpress Delivery: 3–4 business days (select pin codes).\nRemote/Hill Areas: 7–10 business days."},
    {"heading": "Cash on Delivery", "body": "COD is available across India with no extra charge."},
    {"heading": "Order Tracking", "body": "Once dispatched, you will receive a tracking number via SMS and email."}
  ]
}$json$),

('returns', $json${
  "title": "Returns & Exchanges",
  "heroImage": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=85",
  "intro": "We want you to be completely satisfied with every purchase. Our 7-day return policy is designed to give you peace of mind.",
  "sections": [
    {"heading": "Return Window", "body": "You may return most products within 7 days of delivery."},
    {"heading": "Eligible Items", "body": "Rudraksha beads and malas (if defective), clothing and accessories (unused, tags intact), yoga accessories, books (unopened)."},
    {"heading": "Non-Returnable Items", "body": "Natural foods, honey, oils (once opened), personalised items, used or altered products."},
    {"heading": "How to Initiate a Return", "body": "Email support@nabataralife.com with your Order ID and reason for return."}
  ]
}$json$),

('privacy', $json${
  "title": "Privacy Policy",
  "heroImage": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&q=85",
  "intro": "We take your privacy seriously. Last updated: May 2026.",
  "sections": [
    {"heading": "Information We Collect", "body": "Name, email address, phone number, delivery address, and order history. We do not store payment card details."},
    {"heading": "How We Use Your Information", "body": "To process and fulfil orders, send updates, respond to queries, and improve our services."},
    {"heading": "Data Sharing", "body": "We do not sell your data. We share only with logistics partners, payment processors, and legal authorities when required."},
    {"heading": "Your Rights", "body": "You may request access, correction, or deletion of your data by emailing support@nabataralife.com."}
  ]
}$json$),

('terms', $json${
  "title": "Terms of Service",
  "heroImage": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=85",
  "intro": "By using NabataraLife, you agree to the following terms. Last updated: May 2026.",
  "sections": [
    {"heading": "Acceptance of Terms", "body": "By accessing NabataraLife, you agree to be bound by these Terms of Service."},
    {"heading": "Use of the Platform", "body": "You agree to use NabataraLife only for lawful purposes."},
    {"heading": "Orders & Payment", "body": "All orders are subject to acceptance and availability."},
    {"heading": "Governing Law", "body": "These terms are governed by the laws of India. Disputes are subject to the courts of Kolkata, West Bengal."}
  ]
}$json$),

('cookies', $json${
  "title": "Cookie Policy",
  "heroImage": "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1600&q=85",
  "intro": "We use cookies to keep the site working smoothly. Last updated: May 2026.",
  "sections": [
    {"heading": "What Are Cookies?", "body": "Cookies are small text files stored on your device to help websites remember your preferences."},
    {"heading": "Cookies We Use", "body": "Essential Cookies — required for login and cart. Analytics Cookies — anonymous usage data. Preference Cookies — remember your settings."},
    {"heading": "Managing Cookies", "body": "You can control cookies through your browser settings. Disabling essential cookies will affect site functionality."}
  ]
}$json$)

ON CONFLICT DO NOTHING;
