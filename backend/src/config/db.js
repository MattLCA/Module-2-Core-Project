/**
 * MySQL connection pool for the ModernTech backend.
 * Shared by HR and Worker modules.
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
    dateStrings: true
});

// Test the database connection when the server starts.
pool.getConnection()
    .then((connection) => {
        console.log(`Connected to ${process.env.DB_NAME} successfully`);
        connection.release();
    })
    .catch((error) => {
        console.error('Database connection failed:', error.message);
    });

export default pool;