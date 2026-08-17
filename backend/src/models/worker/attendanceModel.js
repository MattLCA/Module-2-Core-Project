import pool from '../../config/db.js';

// 1.Get today's active session( where clockOut is NULL)
export const getActiveAttendance = async (employeeId) => {
    const [rows] = await pool.query(
        `SELECT * FROM attendance
        WHERE employeeId = ? AND attendanceDate = CURRENT_DATE() AND clockout IS NULL
        ORDER BY attendanceId DESC LIMIT 1`,
        [employeeId]
    );
    return rows[0] || null;
};


// 2.Insert a clock-in entry
export const createClockIn = async (employeeId) => {
    const [result] = await pool.query(
        `INSERT INTO attendance (employeeId, attendanceDate, clockIn, attendanceStatus)
        VALUES (?, CURRENT_DATE(), NOW(), 'Present')`,
        [employeeId]
    );
    return result;
};


// 3.Update active session with clock-out time
export const updateClockOut = async (attendanceId) => {
    const [result] = await pool.query(
        `UPDATE attendance
        SET clockOut = NOW()
        WHERE attendanceId = ?`,
        [attendanceId]
    );
    return result;
};


// 4.FETCH personal history
export const getHistoryByEmployeeId = async (employeeeId) => {
    const [rows] = await pool.query(
        `SELECT attendanceDate, clockIn, clockOut, attendanceStatus
        FROM attendance
        WHERE employeeId = ?
        ORDER BY attendanceDate DESC LIMIT 30`,
        [employeeId]
    );
    return rows;
}; 