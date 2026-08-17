import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';
import workerRoutes from './routes/worker/workerRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/worker', workerRoutes);

app.get('/', (req, res) => {
    res.json({ message: "ModernTech Worker API is running"});
});

const PORT = process.env.PORT || 3000;

// Test DB connection and start server
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
