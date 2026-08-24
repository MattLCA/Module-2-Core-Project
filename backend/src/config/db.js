// ============================================================
// ModernTech MySQL Database Connection
// ============================================================

import "dotenv/config";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",

  // MySQL normally uses 3306.
  // If your .env contains DB_PORT, that value will be used.
  port: Number(process.env.DB_PORT) || 3306,

  user: process.env.DB_USER || "root",

  password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? "",

  database: process.env.DB_NAME || "moderntech_db",

  waitForConnections: true,

  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,

  queueLimit: 0,

  namedPlaceholders: false,

  // Return DATE/DATETIME values as strings.
  // This makes frontend date/time handling much easier.
  dateStrings: true,
});

// ============================================================
// TEST DATABASE CONNECTION
// ============================================================

pool
  .getConnection()
  .then((connection) => {
    console.log("MySQL pool connected");

    connection.release();
  })
  .catch((error) => {
    console.error("MySQL pool failed to connect:", error.message);
  });

export default pool;
