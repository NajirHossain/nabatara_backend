import pool from "../config/dbconnect.js";

export class UserRepository {
  async findUserByEmail(email: string) {
    const res = await pool.query(
      `SELECT public_id, name, contact_no, email, role, password_hash, refresh_token, email_verified FROM users WHERE email = $1`,
      [email]
    );
    return res.rows[0] ?? null;
  }

  async setEmailVerified(email: string) {
    await pool.query(`UPDATE users SET email_verified = true WHERE email = $1`, [email]);
  }

  async updatePassword(email: string, hash: string) {
    await pool.query(`UPDATE users SET password_hash = $1 WHERE email = $2`, [hash, email]);
  }

  async findUserByPhone(phone: string) {
    const res = await pool.query(`SELECT * FROM users WHERE contact_no = $1`, [phone]);
    return res.rows[0] ?? null;
  }

  async create(user: {
    public_id: string;
    name?: string | undefined;
    contact_no?: string | undefined;
    email: string;
    role: string;
    password_hash: string;
  }) {
    const res = await pool.query(
      `INSERT INTO users (public_id, name, contact_no, email, role, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING public_id, name, contact_no, email, role`,
      [
        user.public_id,
        user.name ?? null,
        user.contact_no ?? null,
        user.email,
        user.role,
        user.password_hash,
      ],
    );
    return res.rows[0];
  }

  async saveRefreshToken(userId: string, token: string) {
    await pool.query(
      `UPDATE users SET refresh_token = $1 WHERE public_id = $2`,
      [token, userId],
    );
  }

  async findByRefreshToken(token: string) {
    const res = await pool.query(
      `SELECT public_id, role FROM users WHERE refresh_token = $1`,
      [token],
    );
    return res.rows[0] ?? null;
  }

  async clearRefreshToken(userId: string) {
    await pool.query(
      `UPDATE users SET refresh_token = NULL WHERE public_id = $1`,
      [userId],
    );
  }

  async findById(userId: string) {
    const res = await pool.query(
      `SELECT public_id, name, contact_no, email, role FROM users WHERE public_id = $1`,
      [userId],
    );
    return res.rows[0] ?? null;
  }

  async updateProfile(userId: string, data: { name?: string | null; contact_no?: string | null }) {
    const res = await pool.query(
      `UPDATE users
       SET name = $1, contact_no = $2
       WHERE public_id = $3
       RETURNING public_id, name, contact_no, email, role`,
      [data.name ?? null, data.contact_no ?? null, userId],
    );
    return res.rows[0] ?? null;
  }
}
