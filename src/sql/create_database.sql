-- =============================================================================
-- NabataraLife — Complete Database DDL
-- Generated from queries.sql + migrations v2–v9
-- Run this on a fresh database to create the full schema from scratch.
-- =============================================================================

-- Drop all tables in reverse dependency order (safe re-run)
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


-- ─── Core tables ─────────────────────────────────────────────────────────────

CREATE TABLE users (
    public_id     TEXT        PRIMARY KEY,
    name          TEXT,
    contact_no    TEXT,
    email         TEXT        NOT NULL UNIQUE,
    role          TEXT        NOT NULL CHECK (role IN ('USER', 'ADMIN')),
    password_hash TEXT        NOT NULL,
    refresh_token TEXT,                          -- added v3
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id     TEXT           PRIMARY KEY,
    name           TEXT           NOT NULL,
    description    TEXT,
    category       TEXT,                         -- added v2
    price          NUMERIC(10,2)  NOT NULL CHECK (price >= 0),
    stock_quantity INT            NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active      BOOLEAN        NOT NULL DEFAULT TRUE,
    sizes          TEXT[],                       -- added v7
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    product_id    TEXT        NOT NULL,          -- no FK: products may not be in DB (v3)
    quantity      INT         NOT NULL CHECK (quantity > 0),
    size          TEXT,                          -- added v5
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE
    -- unique index on (cart_id, product_id, COALESCE(size,'')) created below (v5)
);

CREATE TABLE orders (
    order_id            TEXT           PRIMARY KEY,
    user_id             TEXT           NOT NULL,
    shipping_address_id TEXT,
    billing_address_id  TEXT,
    status              TEXT           NOT NULL CHECK (
                            status IN ('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')
                        ),
    total_amount        NUMERIC(10,2)  NOT NULL CHECK (total_amount >= 0),
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)             REFERENCES users(public_id)     ON DELETE CASCADE,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id) ON DELETE SET NULL,
    FOREIGN KEY (billing_address_id)  REFERENCES addresses(address_id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    order_item_id  TEXT           PRIMARY KEY,
    order_id       TEXT           NOT NULL,
    product_id     TEXT           NOT NULL,      -- no FK: products may not be in DB (v4)
    quantity       INT            NOT NULL CHECK (quantity > 0),
    unit_price     NUMERIC(10,2)  NOT NULL CHECK (unit_price >= 0),
    subtotal       NUMERIC(10,2)  NOT NULL CHECK (subtotal >= 0),
    size           TEXT,                         -- added v5
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


-- ─── Social / engagement tables (v6) ─────────────────────────────────────────

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


-- ─── CMS tables (v8) ─────────────────────────────────────────────────────────

CREATE TABLE categories (
    category_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    nav_label       TEXT        NOT NULL,
    is_nav_visible  BOOLEAN     NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
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


-- ─── Product content sections (v9) ───────────────────────────────────────────

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
-- Indexes
-- =============================================================================

-- products
CREATE INDEX idx_products_is_active   ON products(is_active);
CREATE INDEX idx_products_category    ON products(category);  -- v2

-- product_images
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- addresses
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- cart_items  (composite unique including NULL-safe size — v5)
CREATE UNIQUE INDEX cart_items_cart_product_size_idx
    ON cart_items (cart_id, product_id, COALESCE(size, ''));
CREATE INDEX idx_cart_items_cart_id    ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- orders
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- order_items
CREATE INDEX idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- payments
CREATE INDEX idx_payments_order_id ON payments(order_id);

-- wishlists
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- reviews
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- product_sections
CREATE INDEX idx_product_sections_product_id ON product_sections(product_id);
