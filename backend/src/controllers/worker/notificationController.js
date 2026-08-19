import {
    getNotificationsByEmployeeId,
    getUnreadNotificationsByEmployeeId,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getNotificationById
} from '../../models/worker/notificationModel.js';


// ============================================================
// GET ALL NOTIFICATIONS
// GET /api/worker/notifications
// ============================================================

export const getNotifications = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const notifications =
            await getNotificationsByEmployeeId(employeeId);

        res.status(200).json({
            data: notifications
        });

    } catch (error) {
        console.error('getNotifications error:', error);

        res.status(500).json({
            error: 'Failed to retrieve notifications.'
        });
    }
};


// ============================================================
// GET UNREAD NOTIFICATIONS
// GET /api/worker/notifications/unread
// ============================================================

export const getUnreadNotifications = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const notifications =
            await getUnreadNotificationsByEmployeeId(employeeId);

        res.status(200).json({
            data: notifications
        });

    } catch (error) {
        console.error('getUnreadNotifications error:', error);

        res.status(500).json({
            error: 'Failed to retrieve unread notifications.'
        });
    }
};


// ============================================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/worker/notifications/unread-count
// ============================================================

export const getUnreadCount = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const unreadCount =
            await getUnreadNotificationCount(employeeId);

        res.status(200).json({
            unreadCount
        });

    } catch (error) {
        console.error('getUnreadCount error:', error);

        res.status(500).json({
            error: 'Failed to retrieve notification count.'
        });
    }
};


// ============================================================
// GET ONE NOTIFICATION
// GET /api/worker/notifications/:id
// ============================================================

export const getNotification = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        const notificationId = req.params.id;

        const notification =
            await getNotificationById(
                notificationId,
                employeeId
            );

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found.'
            });
        }

        res.status(200).json({
            data: notification
        });

    } catch (error) {
        console.error('getNotification error:', error);

        res.status(500).json({
            error: 'Failed to retrieve notification.'
        });
    }
};


// ============================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/worker/notifications/:id/read
// ============================================================

export const markAsRead = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        const notificationId = req.params.id;

        const notification =
            await getNotificationById(
                notificationId,
                employeeId
            );

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found.'
            });
        }

        await markNotificationAsRead(
            notificationId,
            employeeId
        );

        res.status(200).json({
            message: 'Notification marked as read.'
        });

    } catch (error) {
        console.error('markAsRead error:', error);

        res.status(500).json({
            error: 'Failed to mark notification as read.'
        });
    }
};


// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/worker/notifications/read-all
// ============================================================

export const markAllAsRead = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        await markAllNotificationsAsRead(employeeId);

        res.status(200).json({
            message: 'All notifications marked as read.'
        });

    } catch (error) {
        console.error('markAllAsRead error:', error);

        res.status(500).json({
            error: 'Failed to mark notifications as read.'
        });
    }
};