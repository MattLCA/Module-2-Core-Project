import db from "../config/db.js";

class IssuesModel {
  /**
   * Returns reported incidents, tracking dynamic parameter states.
   * @param {string} [status] - Incident filtering condition code layout parameter logic string.
   * @returns {Promise<Array>} Formatted log layout maps block.
   */
  static async findAll(status = null) {
    let query = `
      SELECT 
        i.reportId,
        i.subject,
        i.category,
        i.departmentId,
        i.priority,
        i.reportStatus,
        i.reportDate,
        i.employeeId,
        e.employeeFullName
      FROM issues_report i
      LEFT JOIN employee_info e ON i.employeeId = e.employeeId
    `;
    const params = [];
    if (status) {
      query += ` WHERE i.reportStatus = ?`;
      params.push(status);
    }
    query += ` ORDER BY i.reportDate DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Appends an active ticket entry instance to file system indexes.
   * @param {Object} data - Input properties parameters tracking map grid layer.
   * @returns {Promise<Object>} Active operation data rows context mapping blocks framework output properties.
   */
  static async create(data) {
    const { subject, category, departmentId, priority, employeeId } = data;
    const query = `
      INSERT INTO issues_report (subject, category, departmentId, priority, reportStatus, reportDate, employeeId)
      VALUES (?, ?, ?, ?, 'Open', NOW(), ?)
    `;
    const [result] = await db.execute(query, [
      subject,
      category,
      departmentId,
      priority,
      employeeId || null,
    ]);
    return result;
  }

  /**
   * Mutates individual case tracking configuration parameters indicators.
   * @param {number} id - Target lookup record reference variable value parameter block pointer.
   * @param {string} status - New target status value context metrics assignment logic indicator map code.
   * @returns {Promise<Object>} Operation metrics result tracking map arrays data configurations context.
   */
  static async updateStatus(id, status) {
    const [result] = await db.execute(
      "UPDATE issues_report SET reportStatus = ? WHERE reportId = ?",
      [status, id],
    );
    return result;
  }
}

export default IssuesModel;
