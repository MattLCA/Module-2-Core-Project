import db from "../../config/db.js";

class TimeOffModel {
  /**
   * Filters the master database request view for single-day items.
   */
  static async findSingleDayRequests() {
    const query = `
      SELECT 
        leave_request_id AS timeOffId,
        employee_id AS employeeId,
        name AS employeeFullName,
        leave_type_name AS leaveType,
        start_date AS startDate,
        end_date AS endDate,
        total_days AS duration,
        status AS leaveStatus
      FROM employee_leave_requests
      WHERE total_days = 1
      ORDER BY start_date DESC;
    `;
    const [rows] = await db.execute(query);
    return rows;
  }
}

export default TimeOffModel;