import db from "../config/db.js";

class LeaveModel {
  /**
   * Retreives all matching leave requests, with optional status filter constraints.
   * @param {string} [status] - Optional leave status to filter by (Pending, Approved, Denied).
   * @returns {Promise<Array>} Map grid rows list.
   */
  static async findAll(status = null) {
    let query = `
      SELECT 
        l.requestId,
        l.employeeId,
        e.employeeFullName,
        e.departmentName,
        l.leaveType,
        l.startDate,
        l.endDate,
        l.duration,
        l.reason,
        l.leaveStatus,
        l.submittedDate
      FROM leave_request l
      JOIN employee_info e ON l.employeeId = e.employeeId
    `;
    const params = [];
    if (status) {
      query += ` WHERE l.leaveStatus = ?`;
      params.push(status);
    }
    query += ` ORDER BY l.submittedDate DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Checks for structural row verification existence.
   * @param {number} id - Leave entry request key ID.
   * @returns {Promise<Object|null>} Row contents or null.
   */
  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM leave_request WHERE requestId = ?",
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Creates a brand new pending leave entry ledger item.
   * @param {Object} data - Structured entry fields object payload.
   * @returns {Promise<Object>} Insert payload operation summary.
   */
  static async create(data) {
    const {
      employeeId,
      departmentId,
      managerId,
      leaveType,
      startDate,
      endDate,
      duration,
      reason,
    } = data;
    const query = `
      INSERT INTO leave_request (employeeId, departmentId, managerId, leaveType, startDate, endDate, duration, reason, submittedDate, leaveStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Pending')
    `;
    const [result] = await db.execute(query, [
      employeeId,
      departmentId,
      managerId,
      leaveType,
      startDate,
      endDate,
      duration,
      reason || "",
    ]);
    return result;
  }

  /**
   * Overwrites checking constraints validation states.
   * @param {number} id - Target request element key lookup identifier.
   * @param {string} status - Target operational parameter verification code configuration.
   * @returns {Promise<Object>} Update metrics properties execution grid mapping output.
   */
  static async updateStatus(id, status) {
    const [result] = await db.execute(
      "UPDATE leave_request SET leaveStatus = ? WHERE requestId = ?",
      [status, id],
    );
    return result;
  }
}

export default LeaveModel;
