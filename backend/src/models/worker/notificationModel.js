import pool from '../../config/db.js';


// 1. GET notifications for an employee
export const getNotificationsByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `SELECT notificationId, message, isRead, createdAt
        FROM notifications
        WHERE employeeId = ?
        ORDER BY createdAt DESC
        LIMIT 20`,
        [employeeId]
    );
    return rows;
};


// 2. MARK a notification as read
export const markNotificationAsRead = async (notificationId, employeeId) => {
    const [result] = await pool.query(
        `UPDATE notifications
        SET isRead = TRUE
        WHERE notificationId = ? AND employeeId = ?`,
        [notificationId, employeeId]
    );
    return result;
};