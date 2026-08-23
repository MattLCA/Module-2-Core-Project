// ============================================================
// ModernTech Notification Model
// ============================================================

import pool from "../config/db.js";


// ============================================================
// GET ALL NOTIFICATIONS FOR ONE EMPLOYEE
// ============================================================

async function findAllForEmployee(employeeId) {

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
}


// ============================================================
// GET ONLY UNREAD NOTIFICATIONS
// ============================================================

async function findUnreadForEmployee(employeeId) {

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
}


// ============================================================
// GET UNREAD COUNT
// ============================================================

async function getUnreadCount(employeeId) {

    const [rows] = await pool.query(
        `
        SELECT COUNT(*) AS count

        FROM notifications

        WHERE employee_id = ?

        AND is_read = 0
        `,
        [employeeId]
    );

    return Number(rows[0]?.count || 0);
}


// ============================================================
// GET ONE NOTIFICATION
// ============================================================

async function findById(
    notificationId,
    employeeId
) {

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
        [
            notificationId,
            employeeId
        ]
    );

    return rows[0] || null;
}


// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

async function markAsRead(
    notificationId,
    employeeId
) {

    const [result] = await pool.query(
        `
        UPDATE notifications

        SET
            is_read = 1,
            status = 'Read',
            read_at = NOW()

        WHERE notification_id = ?

        AND employee_id = ?

        AND is_read = 0
        `,
        [
            notificationId,
            employeeId
        ]
    );

    return result.affectedRows > 0;
}


// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

async function markAllAsRead(employeeId) {

    const [result] = await pool.query(
        `
        UPDATE notifications

        SET
            is_read = 1,
            status = 'Read',
            read_at = NOW()

        WHERE employee_id = ?

        AND is_read = 0
        `,
        [employeeId]
    );

    return result.affectedRows;
}


// ============================================================
// CREATE NOTIFICATION
// ============================================================
//
// This is the function HR/leave/payroll controllers can use
// when they need to notify a worker.
//
// Example:
//
// await create({
//     employeeId: 1,
//     notificationType: "leave",
//     title: "Leave Request Approved",
//     message: "Your annual leave request was approved.",
//     status: "New"
// });
//
// ============================================================

async function create({
    employeeId,
    notificationType = "general",
    title = null,
    message,
    status = "New"
}) {

    if (
        !employeeId ||
        !message
    ) {

        throw new Error(
            "employeeId and message are required to create a notification."
        );

    }


    const [result] = await pool.query(
        `
        INSERT INTO notifications (

            employee_id,

            notification_type,

            title,

            message,

            status,

            is_read

        )

        VALUES (?, ?, ?, ?, ?, 0)
        `,
        [
            employeeId,
            notificationType,
            title,
            message,
            status
        ]
    );


    return findById(
        result.insertId,
        employeeId
    );
}


// ============================================================
// EXPORTS
// ============================================================

export {
    findAllForEmployee,
    findUnreadForEmployee,
    getUnreadCount,
    findById,
    markAsRead,
    markAllAsRead,
    create
};