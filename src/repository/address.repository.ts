import pool from "../config/dbconnect.js";
import { v4 as uuidv4 } from "uuid";

interface AddressData {
  full_name: string;
  contact_no?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

class AddressRepository {
  async getAddresses(userId: string) {
    const res = await pool.query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return res.rows;
  }

  async createAddress(userId: string, data: AddressData) {
    const addressId = uuidv4();
    const res = await pool.query(
      `INSERT INTO addresses (address_id, user_id, full_name, contact_no, address_line_1, address_line_2, city, state, postal_code, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        addressId,
        userId,
        data.full_name,
        data.contact_no ?? null,
        data.address_line_1,
        data.address_line_2 ?? null,
        data.city,
        data.state ?? null,
        data.postal_code,
        data.country,
      ],
    );
    return res.rows[0];
  }

  async deleteAddress(addressId: string, userId: string) {
    await pool.query(
      `DELETE FROM addresses WHERE address_id = $1 AND user_id = $2`,
      [addressId, userId],
    );
  }
}

export const addressRepository = new AddressRepository();
