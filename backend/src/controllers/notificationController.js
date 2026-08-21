import * as notificationModel from '../models/notificationModel.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/notifications — all notifications for the logged-in user.
async function list(req, res, next) {
  try {
    const rows = await notificationModel.findAllForEmployee(req.user.employeeId);
    res.status(200).json({ data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/notifications/unread-count
async function unreadCount(req, res, next) {
  try {
    const count = await notificationModel.getUnreadCount(req.user.employeeId);
    res.status(200).json({ data: { count } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/:id/read
async function markOneRead(req, res, next) {
  try {
    const ok = await notificationModel.markAsRead(req.params.id, req.user.employeeId);
    if (!ok) throw new ApiError(404, 'Notification not found');
    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/read-all
async function markAllRead(req, res, next) {
  try {
    await notificationModel.markAllAsRead(req.user.employeeId);
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

export { list, unreadCount, markOneRead, markAllRead };
