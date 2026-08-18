import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import pool from './config/db.js';
import workerRoutes from './routes/worker/workerRoutes.js';


const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Worker routes
app.use('/api/worker', workerRoutes);


// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'ModernTech Worker API is running'
    });
});


// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});


// Server port
const PORT = process.env.PORT || 3000;


// Test database connection and start server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    try {
        const connection = await pool.getConnection();

        console.log('Connected to moderntech_db successfully');

        connection.release();

    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
});