
import express from 'express';
import { getDailyAttendance, verifyAttendance } from '../controllers/attendanceController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/attendance
 * @desc    Fetch rows matched directly against live employee naming structures
 */
router.get('/', authenticateToken, authorizeRoles('HR', 'Admin'), getDailyAttendance);

/**
 * @route   PUT /api/attendance/:id/verify
 * @desc    Updates statuses and timestamps without hitting missing column flags
 */
router.put('/:id/verify', authenticateToken, authorizeRoles('HR', 'Admin'), verifyAttendance);

export default router;
