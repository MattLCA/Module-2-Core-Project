import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import reviewCycleRoutes from './routes/reviewCycleRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
const allowedOrigins = [
    'http://127.0.0.1:5503',
    'http://localhost:5503'
];

app.use(cors({
    origin: allowedOrigins
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/review-cycle', reviewCycleRoutes);
// Mount attendanceRoutes / leaveRoutes here as your teammates build out
// their controllers, following the same pattern.

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Must be registered LAST.
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));

export default app;
