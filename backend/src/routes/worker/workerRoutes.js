import express from 'express';

import {
    getClockStatus,
    clockIn,
    startBreak,
    endBreak,
    clockOut,
    getAttendanceHistory
} from '../../controllers/worker/attendanceController.js';

import authenticateToken from '../../middleware/auth.js';

const router = express.Router();


// Apply authentication middleware to all worker attendance routes
router.use(authenticateToken);


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