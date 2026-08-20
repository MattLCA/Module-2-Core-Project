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

router.use(authenticate);

// GET /api/worker/attendance/clock-status
router.get('/clock-status', getClockStatus);

// POST /api/worker/attendance/clock-in
router.post('/clock-in', clockIn);

// PUT /api/worker/attendance/break/start
router.put('/break/start', startBreak);

// PUT /api/worker/attendance/break/end
router.put('/break/end', endBreak);

// PUT /api/worker/attendance/clock-out
router.put('/clock-out', clockOut);

// GET /api/worker/attendance/history
router.get('/history', getAttendanceHistory);

export default router;