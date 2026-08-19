import express from 'express';

import {
    getClockStatus,
    clockIn,
    startBreak,
    endBreak,
    clockOut,
    getAttendanceHistory
} from '../../controllers/worker/attendanceController.js';

import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// Apply JWT authentication to all worker attendance routes
router.use(authenticate);

// Get current clock status
router.get('/clock-status', getClockStatus);

// Clock in
router.post('/clock-in', clockIn);

// Start break
router.put('/break/start', startBreak);

// End break
router.put('/break/end', endBreak);

// Clock out
router.put('/clock-out', clockOut);

// Get attendance history
router.get('/attendance/history', getAttendanceHistory);

export default router;