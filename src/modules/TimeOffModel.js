import db from "../config/db.js";

class TimeOffModel {
  /**
   * Pulls structural ad-hoc instances explicitly bound to single-day limits.
   * @returns {Promise<Array>} Set rows of single-day requests.
   */
  static async findSingleDayRequests() {
    const query = `
      SELECT 
        l.requestId AS timeOffId,
        l.employeeId,
        e.employeeFullName,
        e.departmentName,
        l.leaveType,
        l.startDate,
        l.endDate,
        l.duration,
        l.leaveStatus
      FROM leave_request l
      JOIN employee_info e ON l.employeeId = e.employeeId
      WHERE l.startDate = l.endDate OR l.duration = 1
      ORDER BY l.startDate DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  /**
   * Updates state attributes only if structural layout row maps enforce the single-day logic match.
   * @param {number} id - Target identifier.
   * @param {string} status - Target evaluation status.
   * @returns {Promise<Object>} Mutated data array parameters summary layout maps context.
   */
  static async updateSingleDayStatus(id, status) {
    const query = `
      UPDATE leave_request 
      SET leaveStatus = ? 
      WHERE requestId = ? AND (startDate = endDate OR duration = 1)
    `;
    const [result] = await db.execute(query, [status, id]);
    return result;
  }
}

export default TimeOffModel;
