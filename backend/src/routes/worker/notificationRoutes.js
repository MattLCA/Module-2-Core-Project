import express from 'express';

import {
    getNotifications,
    getUnreadNotifications,
    getUnreadCount,
    getNotification,
    markAsRead,
    markAllAsRead
} from '../../controllers/worker/notificationController.js';

import { authenticate } from '../../middleware/auth.js';

const router = express.Router();


// ============================================================
// AUTHENTICATION
// ============================================================

router.use(authenticate);


// ============================================================
// NOTIFICATION ROUTES
// ============================================================

// Get all notifications
router.get('/', getNotifications);

// Get unread notifications
router.get('/unread', getUnreadNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Get one notification
router.get('/:id', getNotification);

// Mark one notification as read
router.patch('/:id/read', markAsRead);


export default router;