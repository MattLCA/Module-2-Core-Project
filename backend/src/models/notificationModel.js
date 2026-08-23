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
    [employeeId],
  );

  return rows;
}

// ============================================================
// GET UNREAD NOTIFICATIONS
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
    [employeeId],
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
    [employeeId],
  );

  return Number(rows[0]?.count || 0);
}

// ============================================================
// GET ONE NOTIFICATION
// ============================================================

async function findById(notificationId, employeeId) {
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
    [notificationId, employeeId],
  );

  return rows[0] || null;
}

// ============================================================
// MARK ONE AS READ
// ============================================================

async function markAsRead(notificationId, employeeId) {
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
    [notificationId, employeeId],
  );

  return result.affectedRows > 0;
}

// ============================================================
// MARK ALL AS READ
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
    [employeeId],
  );

  return result.affectedRows;
}

// ============================================================
// CREATE NOTIFICATION
// ============================================================

async function create({
  employeeId,
  notificationType = "general",
  title = null,
  message,
  status = "New",
}) {
  if (!employeeId || !message) {
    throw new Error("employeeId and message are required.");
  }

  console.log("[Notification Model] Creating notification:", {
    employeeId,
    notificationType,
    title,
    message,
    status,
  });

  const [result] = await pool.query(
    `
            INSERT INTO notifications
            (
                employee_id,
                notification_type,
                title,
                message,
                status,
                is_read
            )

            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                0
            )
            `,
    [employeeId, notificationType, title, message, status],
  );

  console.log("[Notification Model] Notification inserted:", result.insertId);

  return {
    notificationId: result.insertId,

    employeeId,

    notificationType,

    title,

    message,

    status,

    isRead: 0,
  };
}

// ============================================================
// CREATE NOTIFICATION FOR ROLE
// ============================================================

async function createForRole({
  roleName,
  notificationType = "general",
  title = null,
  message,
  status = "New",
}) {
  const [employees] = await pool.query(
    `
            SELECT
                e.employee_id AS employeeId

            FROM employees e

            INNER JOIN roles r
                ON e.role_id = r.role_id

            WHERE r.role_name = ?
              AND e.is_active = 1
            `,
    [roleName],
  );

  const notifications = [];

  for (const employee of employees) {
    const notification = await create({
      employeeId: employee.employeeId,

      notificationType,

      title,

      message,

      status,
    });

    notifications.push(notification);
  }

  return notifications;
}

export {
  findAllForEmployee,
  findUnreadForEmployee,
  getUnreadCount,
  findById,
  markAsRead,
  markAllAsRead,
  create,
  createForRole,
};
