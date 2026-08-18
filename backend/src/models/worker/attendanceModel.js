import pool from '../../config/db.js';


// 1. GET today's active attendance session
export const getActiveAttendance = async (employeeId) => {
    const [rows] = await pool.query(
        `SELECT *
        FROM attendance
        WHERE employeeId = ?
        AND attendanceDate = CURRENT_DATE()
        AND clockOut IS NULL
        ORDER BY attendanceId DESC
        LIMIT 1`,
        [employeeId]
    );
    return rows[0] || null;
};


// 2. CREATE a clock-in entry
export const createClockIn = async (employeeId) => {
    const [result] = await pool.query(
        `INSERT INTO attendance
            (employeeId, attendanceDate, clockIn, attendanceStatus)
        VALUES (?, CURRENT_DATE(), NOW(), 'Present')`,
        [employeeId]
    );
    return result;
};


// 3. UPDATE break start
export const updateBreakStart = async (attendanceId) => {
    const [result] = await pool.query(
        `UPDATE attendance
        SET breakStart = NOW(),
            attendanceStatus = 'On Break'
        WHERE attendanceId = ?`,
        [attendanceId]
    );
    return result;
};


// 4. UPDATE break end
export const updateBreakEnd = async (attendanceId) => {
    const [result] = await pool.query(
        `UPDATE attendance
        SET breakEnd = NOW(),
            attendanceStatus = 'Present'
        WHERE attendanceId = ?`,
        [attendanceId]
    );
    return result;
};


// 5. UPDATE clock-out time
export const updateClockOut = async (attendanceId) => {
    const [result] = await pool.query(
        `UPDATE attendance
        SET clockOut = NOW()
        WHERE attendanceId = ?`,
        [attendanceId]
    );
    return result;
};


// 6. GET personal attendance history
export const getHistoryByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `SELECT attendanceDate, clockIn, breakStart, breakEnd, clockOut, attendanceStatus
        FROM attendance
        WHERE employeeId = ?
        ORDER BY attendanceDate DESC
        LIMIT 30`,
        [employeeId]
    );
    return rows;
};