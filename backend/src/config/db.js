/**
 * MySQL connection pool (mysql2/promise).
 * Import `pool` anywhere you need to run a query:
 *   const pool = require('../config/db');
 *   const [rows] = await pool.query('SELECT * FROM employees WHERE employee_id = ?', [id]);
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  namedPlaceholders: false,
  dateStrings: true, // return DATE/DATETIME columns as 'YYYY-MM-DD' strings, not JS Date objects
});

// Fail fast on boot if the DB is unreachable, instead of on the first request.
pool.getConnection()
  .then((conn) => {
    console.log('MySQL pool connected');
    conn.release();
  })
  .catch((err) => {
    console.error('MySQL pool failed to connect:', err.message);
  });

export default pool;