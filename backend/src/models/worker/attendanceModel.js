// src/models/worker/attendanceModel.js
const pool = require('../../config.db');

// 1. Query MySQL to see if an open clock-in exists today.
exports.findActiveClockIn = async (employeeId) => {
    const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE employeeId = ? AND attendanceDate = CURRENT_DATE() AND clockOut IS NULL',
        [employeeId]
    );
    return rows[0] || null;  //Returns the active session object or null
};


// 2. Insert a new clock-in record into MySQL
exports.createClockIn = async (employeeId) => {
    const [result] = await pool.query(
        'INSERT INTO attendance (employeeId, attendanceDate, clockIn, attendanceStatus) VALUES (?CURRENT_DATE(), NOW(), "Present")',
        [employeeId]
    );
    return result.insertId;
};