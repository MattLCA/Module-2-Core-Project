import express from 'express';
import { getLeaveRequests, submitLeaveRequest, processLeaveDecision } from '../controllers/leaveController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('HR', 'Admin'), getLeaveRequests);
router.post('/', authenticateToken, submitLeaveRequest);
router.put('/:id/decision', authenticateToken, authorizeRoles('HR', 'Admin'), processLeaveDecision);

export default router;
