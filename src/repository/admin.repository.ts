import pool from "../config/dbconnect.js";

export async function listUsers() {
  const { rows } = await pool.query(
    `SELECT public_id, name, email, role, contact_no, created_at
     FROM users ORDER BY created_at DESC`
  );
  return rows;
}

export async function setUserRole(userId: string, role: "USER" | "ADMIN") {
  await pool.query(`UPDATE users SET role = $1 WHERE public_id = $2`, [role, userId]);
}

export async function createInvite(
  email: string,
  token: string,
  invitedBy: string,
  expiresAt: Date
) {
  // Replace any existing pending invite for the same email
  await pool.query(`DELETE FROM admin_invites WHERE email = $1 AND accepted = false`, [email]);
  await pool.query(
    `INSERT INTO admin_invites (email, token, invited_by, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [email, token, invitedBy, expiresAt]
  );
}

export async function findInviteByToken(token: string) {
  const { rows } = await pool.query<{
    id: string; email: string; invited_by: string;
    expires_at: Date; accepted: boolean; inviter_name: string | null;
  }>(
    `SELECT i.id, i.email, i.invited_by, i.expires_at, i.accepted,
            u.name AS inviter_name
     FROM admin_invites i
     LEFT JOIN users u ON u.public_id = i.invited_by
     WHERE i.token = $1`,
    [token]
  );
  return rows[0] ?? null;
}

export async function markInviteAccepted(token: string) {
  await pool.query(`UPDATE admin_invites SET accepted = true WHERE token = $1`, [token]);
}

export async function promoteUserByEmail(email: string) {
  await pool.query(`UPDATE users SET role = 'ADMIN' WHERE email = $1`, [email]);
}
