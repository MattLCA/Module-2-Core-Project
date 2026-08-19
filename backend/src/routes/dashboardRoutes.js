import express from 'express';
import * as controller from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// The dashboard aggregates org-wide data (all employees' attendance/leave),
// so it's HR-only — same access level as the employee list.
router.get('/summary', authorize('hr'), controller.summary);

export default router;
