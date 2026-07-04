-- migration_v11: admin invites table + per-product SEO columns

-- Feature 1: admin invite tokens
CREATE TABLE IF NOT EXISTS admin_invites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL,
  token        TEXT        NOT NULL UNIQUE,
  invited_by   TEXT        NOT NULL REFERENCES users(public_id) ON DELETE CASCADE,
  expires_at   TIMESTAMPTZ NOT NULL,
  accepted     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_invites_token ON admin_invites(token);
CREATE INDEX IF NOT EXISTS idx_admin_invites_email  ON admin_invites(email);

-- Feature 4: per-product SEO metadata
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title       TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_title         TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_description   TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_image         TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS keywords         TEXT;
