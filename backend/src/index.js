import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

import dashboardWorkerRoutes from './routes/worker/dashboardRoutes.js';
import workerRoutes from './routes/worker/workerRoutes.js';

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(helmet());

// app.use(
//     cors({
//         origin:
//             process.env.CORS_ORIGIN ||
//             'http://localhost:5500'
//     })
// );

// app.use(express.json());

app.use(
    cors({
        origin: [
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:5503',
            'http://127.0.0.1:5503'
        ]
    })
);

app.use(express.json());

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok'
    });
});

// ============================================================
// MAIN API ROUTES
// ============================================================

app.use('/api/auth', authRoutes);

app.use('/api/employees', employeeRoutes);

app.use('/api/payroll', payrollRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/performance', performanceRoutes);

// ============================================================
// WORKER API
// ============================================================

// Worker profile
// /api/worker/profile

// Worker attendance
// /api/worker/attendance

// Worker leave
// /api/worker/leave

// Worker payslips
// /api/worker/payslips

// Worker notifications
// /api/worker/notifications

app.use('/api/worker', workerRoutes);

// Worker dashboard
app.use('/api/worker/dashboard', dashboardWorkerRoutes);

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
    res.status(404).json({
        error: 'Not found'
    });
});

// ============================================================
// ERROR HANDLER
// Must be registered LAST.
// ============================================================

app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
});

export default app;