import { pool } from "../src/db/dbconnect";

const testdbconnection = async () => {
  const res = await pool.query("SELECT NOW()");
  console.log(res.rows[0]);
};

testdbconnection();
