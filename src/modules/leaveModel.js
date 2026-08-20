import db from "../config/db.js";

class LeaveModel {
  /**
   * Pulls matching rows from the employee_leave_requests database view.
   */
  static async findAll(status = null) {
    let query = `
      SELECT 
        leave_request_id AS requestId,
        employee_id AS employeeId,
        name AS employeeFullName,
        leave_type_name AS leaveType,
        start_date AS startDate,
        end_date AS endDate,
        total_days AS duration,
        reason,
        status AS leaveStatus,
        submitted_date AS submittedDate
      FROM employee_leave_requests
    `;
    const params = [];
    if (status) {
      query += ` WHERE status = ?`;
      params.push(status);
    }
    query += ` ORDER BY submitted_date DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Confirms request record validation before passing data variables.
   */
  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM leave_requests WHERE leave_request_id = ?",
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Appends an employee time off request entry safely using a parameterized query.
   */
  static async create(data) {
    const { employeeId, leaveTypeId, startDate, endDate, totalDays, reason } =
      data;
    const query = `
      INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, submitted_date)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', CURRENT_DATE)
    `;
    const [result] = await db.execute(query, [
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      totalDays,
      reason || "",
    ]);
    return result;
  }

  /**
   * Updates an application status state matching an enum constraint configuration block.
   */
  static async updateStatus(id, status, reviewerId) {
    const query = `
      UPDATE leave_requests 
      SET status = ?, reviewed_by = ? 
      WHERE leave_request_id = ?
    `;
    const [result] = await db.execute(query, [status, reviewerId, id]);
    return result;
  }
}

export default LeaveModel;
