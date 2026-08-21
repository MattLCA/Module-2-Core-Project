import db from "../config/db.js";

class IssuesModel {
  /**
   * Fetches active notifications from the system.
   */
  static async findAll(status = null) {
    let query = `
      SELECT 
        n.notification_id AS reportId,
        n.title AS subject,
        n.notification_type AS category,
        n.message,
        n.status AS reportStatus,
        n.created_at AS reportDate,
        n.employee_id AS employeeId,
        e.name AS employeeFullName
      FROM notifications n
      JOIN employees e ON n.employee_id = e.employee_id
    `;
    const params = [];
    if (status) {
      query += ` WHERE n.status = ?`;
      params.push(status);
    }
    query += ` ORDER BY n.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Appends an audit message log entry instance.
   */
  static async create(data) {
    const { employeeId, type, title, message } = data;
    const query = `
      INSERT INTO notifications (employee_id, notification_type, title, message, status, is_read)
      VALUES (?, ?, ?, ?, 'New', 0)
    `;
    const [result] = await db.execute(query, [
      employeeId,
      type || "general",
      title,
      message,
    ]);
    return result;
  }
}

export default IssuesModel;
