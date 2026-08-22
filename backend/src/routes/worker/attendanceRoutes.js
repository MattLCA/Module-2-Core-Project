import express from 'express';

import {
    getClockStatus,
    clockIn,
    clockOut,
    getAttendanceHistory
} from '../../controllers/worker/attendanceController.js';

import { authenticate } from '../../middleware/auth.js';

const router = express.Router();


// ============================================================
// AUTHENTICATION
// ============================================================

router.use(authenticate);


// ============================================================
// CURRENT CLOCK STATUS
// ============================================================

// GET /api/worker/attendance/clock-status
router.get(
    '/clock-status',
    getClockStatus
);


// ============================================================
// CLOCK IN
// ============================================================

// POST /api/worker/attendance/clock-in
router.post(
    '/clock-in',
    clockIn
);


// ============================================================
// CLOCK OUT
// ============================================================

// PUT /api/worker/attendance/clock-out
router.put(
    '/clock-out',
    clockOut
);


// ============================================================
// ATTENDANCE HISTORY
// ============================================================

// GET /api/worker/attendance/history
router.get(
    '/history',
    getAttendanceHistory
);


export default router;