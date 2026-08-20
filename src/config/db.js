import mysql from "mysql2/promise";

// Initialize a unified database connection pool utilizing your custom port configuration
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
// Ensure this specific line inside your db.js configuration object is set up safely:
password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',// Pulls your password safely from your hidden .env file
  database: process.env.DB_NAME || "moderntech_db",
  port: parseInt(process.env.DB_PORT) || 3307, // Preserves your specialized 3307 connection port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
