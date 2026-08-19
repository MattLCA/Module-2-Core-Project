import pool from '../../config/db.js';

// ============================================================
// GET ALL NOTIFICATIONS FOR THE LOGGED-IN WORKER
// ============================================================

export const getNotificationsByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `
        SELECT
            notification_id AS notificationId,
            employee_id AS employeeId,
            notification_type AS notificationType,
            title,
            message,
            status,
            is_read AS isRead,
            created_at AS createdAt,
            read_at AS readAt
        FROM notifications
        WHERE employee_id = ?
        ORDER BY created_at DESC
        `,
        [employeeId]
    );

    return rows;
};


// ============================================================
// GET UNREAD NOTIFICATIONS
// ============================================================

export const getUnreadNotificationsByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `
        SELECT
            notification_id AS notificationId,
            employee_id AS employeeId,
            notification_type AS notificationType,
            title,
            message,
            status,
            is_read AS isRead,
            created_at AS createdAt,
            read_at AS readAt
        FROM notifications
        WHERE employee_id = ?
          AND is_read = 0
        ORDER BY created_at DESC
        `,
        [employeeId]
    );

    return rows;
};


// ============================================================
// GET UNREAD COUNT
// ============================================================

export const getUnreadNotificationCount = async (employeeId) => {
    const [rows] = await pool.query(
        `
        SELECT COUNT(*) AS unreadCount
        FROM notifications
        WHERE employee_id = ?
          AND is_read = 0
        `,
        [employeeId]
    );

    return rows[0].unreadCount;
};


// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

export const markNotificationAsRead = async (
    notificationId,
    employeeId
) => {
    const [result] = await pool.query(
        `
        UPDATE notifications
        SET
            is_read = 1,
            read_at = NOW(),
            status = 'Read'
        WHERE notification_id = ?
          AND employee_id = ?
        `,
        [notificationId, employeeId]
    );

    return result;
};


// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

export const markAllNotificationsAsRead = async (employeeId) => {
    const [result] = await pool.query(
        `
        UPDATE notifications
        SET
            is_read = 1,
            read_at = NOW(),
            status = 'Read'
        WHERE employee_id = ?
          AND is_read = 0
        `,
        [employeeId]
    );

    return result;
};


// ============================================================
// GET ONE NOTIFICATION
// ============================================================

export const getNotificationById = async (
    notificationId,
    employeeId
) => {
    const [rows] = await pool.query(
        `
        SELECT
            notification_id AS notificationId,
            employee_id AS employeeId,
            notification_type AS notificationType,
            title,
            message,
            status,
            is_read AS isRead,
            created_at AS createdAt,
            read_at AS readAt
        FROM notifications
        WHERE notification_id = ?
          AND employee_id = ?
        LIMIT 1
        `,
        [notificationId, employeeId]
    );

    return rows[0] || null;
};