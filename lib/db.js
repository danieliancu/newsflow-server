// lib/db.js 
import mysql from "mysql2/promise";


const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: process.env.MYSQL_ADDON_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 30000,
});

// Exportăm default o funcție
export default async function queryWithRetry(query, params = [], retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
