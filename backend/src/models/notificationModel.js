/**
 * Notification data-access layer. Notifications are per-employee and
 * role-agnostic — HR and worker accounts are both rows in `employees`,
 * so the same table/queries serve both. req.user.employeeId (set by
 * the auth middleware from the JWT) scopes every query.
 */
import pool from '../config/db.js';

async function findAllForEmployee(employeeId) {
  const [rows] = await pool.query(
    `SELECT notification_id, notification_type, title, message, status, is_read, created_at, read_at
     FROM notifications
     WHERE employee_id = ?
     ORDER BY created_at DESC`,
    [employeeId]
  );
  return rows;
}

async function getUnreadCount(employeeId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE employee_id = ? AND is_read = 0`,
    [employeeId]
  );
  return rows[0].count;
}

async function markAsRead(notificationId, employeeId) {
  const [result] = await pool.query(
    `UPDATE notifications
     SET is_read = 1, status = 'Read', read_at = NOW()
     WHERE notification_id = ? AND employee_id = ?`,
    [notificationId, employeeId]
  );
  return result.affectedRows > 0;
}

async function markAllAsRead(employeeId) {
  await pool.query(
    `UPDATE notifications
     SET is_read = 1, status = 'Read', read_at = NOW()
     WHERE employee_id = ? AND is_read = 0`,
    [employeeId]
  );
}

// Used when a worker submits a leave request — inserts one notification
// per HR employee so it shows up in their notification list/badge.
async function notifyAllHr({ notificationType, title, message }) {
  const [hrEmployees] = await pool.query(
    `SELECT e.employee_id
     FROM employees e
     JOIN roles r ON r.role_id = e.role_id
     WHERE r.role_name = 'hr' AND e.is_active = 1`
  );

  if (!hrEmployees.length) return;

  const values = hrEmployees.map((e) => [e.employee_id, notificationType, title, message]);
  await pool.query(
    `INSERT INTO notifications (employee_id, notification_type, title, message)
     VALUES ?`,
    [values]
  );
}

export { findAllForEmployee, getUnreadCount, markAsRead, markAllAsRead, notifyAllHr };
