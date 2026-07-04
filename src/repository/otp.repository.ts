import pool from "../config/dbconnect.js";

export async function createOTP(
  email: string,
  code: string,
  purpose: "email_verification" | "password_reset",
  expiresAt: Date
): Promise<void> {
  // Remove any previous unused OTP for the same email+purpose before inserting
  await pool.query(
    `DELETE FROM otp_tokens WHERE email = $1 AND purpose = $2 AND used = false`,
    [email, purpose]
  );
  await pool.query(
    `INSERT INTO otp_tokens (email, code, purpose, expires_at) VALUES ($1, $2, $3, $4)`,
    [email, code, purpose, expiresAt]
  );
}

export async function findValidOTP(
  email: string,
  code: string,
  purpose: "email_verification" | "password_reset"
): Promise<{ id: string } | null> {
  const { rows } = await pool.query<{ id: string }>(
    `SELECT id FROM otp_tokens
     WHERE email = $1 AND code = $2 AND purpose = $3
       AND used = false AND expires_at > NOW()
     LIMIT 1`,
    [email, code, purpose]
  );
  return rows[0] ?? null;
}

export async function markUsed(id: string): Promise<void> {
  await pool.query(`UPDATE otp_tokens SET used = true WHERE id = $1`, [id]);
}
