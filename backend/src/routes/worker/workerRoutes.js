import express from 'express';
import {
    getClockStatus,
    clockIn,
    clockOut,
    getAttendanceHistory
} from '../../controllers/worker/attendanceController.js';
import authenticateToken from '../../middleware/authMiddleware.js';

const router = express.Router();


// Apply auth middleware to protect all worker routes below
router.use(authenticateToken);

router.get('/clock-status', getClockStatus);
router.post('/clock-in', clockIn);
router.put('/clock-out', clockOut);
router.get('/attendance/history', getAttendanceHistory);


export default router;