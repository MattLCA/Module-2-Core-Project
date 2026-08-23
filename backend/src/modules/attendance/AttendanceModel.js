import db from "../../config/db.js";

class AttendanceModel {
  /**
   * Fetches daily attendance rows for the current date.
   * Leverages explicit JOIN operators to map human-readable employee parameters.
   */
  static async findDailyLogs() {
    const query = `
      SELECT 
        a.attendance_id AS attendanceId,
        a.employee_id AS employeeId,
        e.name AS employeeFullName,
        a.attendance_date AS attendanceDate,
        a.clock_in AS clockIn,
        a.break_start AS breakStart,
        a.break_end AS breakEnd,
        a.clock_out AS clockOut,
        a.attendance_status AS attendanceStatus
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      ORDER BY a.attendance_date DESC;
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  /**
   * Identifies an active attendance row match using structural primary parameters lookup.
   */
  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM attendance WHERE attendance_id = ?",
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Modifies an existing clock log row matching the verified target primary index parameter.
   */
  static async updateLog(id, status, clockIn, clockOut) {
    const query = `
      UPDATE attendance 
      SET 
        attendance_status = ?, 
        clock_in = COALESCE(?, clock_in), 
        clock_out = COALESCE(?, clock_out)
      WHERE attendance_id = ?
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