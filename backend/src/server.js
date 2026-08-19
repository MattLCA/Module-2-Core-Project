import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import pool from './config/db.js';
import workerRoutes from './routes/worker/workerRoutes.js';

const app = express();

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use('/api/worker', workerRoutes);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get('/', (req, res) => {
    res.json({
        message: 'ModernTech Worker API is running'
    });
});

// --------------------------------------------------
// 404 handler
// --------------------------------------------------

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// --------------------------------------------------
// Server
// --------------------------------------------------

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Test database connection before starting server
        const connection = await pool.getConnection();

        console.log('Connected to moderntech_db successfully');

        connection.release();

        app.listen(PORT, () => {
            console.log(`ModernTech Worker API running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

startServer();