import express from 'express';

import profileRoutes from './profileRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import payslipRoutes from './payslipRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();


// ============================================================
// WORKER PROFILE
// ============================================================

router.use('/profile', profileRoutes);


// ============================================================
// WORKER ATTENDANCE
// ============================================================

router.use('/attendance', attendanceRoutes);


// ============================================================
// WORKER LEAVE
// ============================================================

router.use('/leave', leaveRoutes);


// ============================================================
// WORKER PAYSLIPS
// ============================================================

router.use('/payslips', payslipRoutes);


// ============================================================
// WORKER NOTIFICATIONS
// ============================================================

router.use('/notifications', notificationRoutes);


export default router;