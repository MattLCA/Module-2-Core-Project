import * as notificationsModel from '../../models/worker/notificationModel.js';

export const getNotifications = async (req, res) => {
    try {
        const list = await notificationsModel.getNotificationsByEmployeeId(req.user.employeeId);
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
};



export const readNotification = async (req, res) => {
    try {
        await notificationsModel.markNotificationAsRead(req.params.id, req.user.employeeId);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
};
