import express from 'express';
import * as controller from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Any logged-in employee (HR or worker) can read/manage their own
// notifications — no role restriction needed, req.user.employeeId scopes it.
router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/:id/read', controller.markOneRead);
router.patch('/read-all', controller.markAllRead);

export default router;
