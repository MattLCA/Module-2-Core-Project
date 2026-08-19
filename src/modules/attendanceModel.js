import db from "../config/db.js";

class AttendanceModel {
  /**
   * Fetches all daily attendance records joined with core employee information.
   * @returns {Promise<Array>} List of attendance rows.
   */
  static async findAllWithEmployeeDetails() {
    const query = `
      SELECT 
        a.attendanceId,
        a.employeeId,
        e.employeeFullName,
        e.departmentName,
        a.clockIn,
        a.clockOut,
        a.Hours,
        a.attendanceStatus,
        a.attendanceDate
      FROM attendance a
      JOIN employee_info e ON a.employeeId = e.employeeId
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  /**
   * Locates a single attendance log entry row by primary ID.
   * @param {number} id - Attendance record ID.
   * @returns {Promise<Object|null>} Found record object or null.
   */
  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM attendance WHERE attendanceId = ?",
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Updates an attendance record status and handles timestamps using safety COALESCE evaluations.
   * @param {number} id - Attendance record ID.
   * @param {string} status - New attendance status.
   * @param {string|null} clockIn - Updated clock-in time stamp.
   * @param {string|null} clockOut - Updated clock-out time stamp.
   * @returns {Promise<Object>} Execution result flags.
   */
  static async updateVerification(id, status, clockIn, clockOut) {
    const query = `
      UPDATE attendance 
      SET 
        attendanceStatus = ?, 
        clockIn = COALESCE(?, clockIn), 
        clockOut = COALESCE(?, clockOut)
      WHERE attendanceId = ?
    `;
    const [result] = await db.execute(query, [
      status,
      clockIn || null,
      clockOut || null,
      id,
    ]);
    return result;
  }
}

export default AttendanceModel;
