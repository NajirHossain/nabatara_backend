-- migration_v10: email verification + OTP tokens

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- All existing users are considered already verified
UPDATE users SET email_verified = TRUE;

CREATE TABLE IF NOT EXISTS otp_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL,
  code        TEXT        NOT NULL,
  purpose     TEXT        NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')),
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_tokens_email_purpose ON otp_tokens(email, purpose);
