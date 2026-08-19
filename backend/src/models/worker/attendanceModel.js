import pool from '../../config/db.js';


// ============================================================
// 1. GET TODAY'S ACTIVE ATTENDANCE SESSION
// ============================================================
export const getActiveAttendance = async (employeeId) => {
    const [rows] = await pool.query(
        `
        SELECT
            attendance_id AS attendanceId,
            employee_id AS employeeId,
            attendance_date AS attendanceDate,
            clock_in AS clockIn,
            break_start AS breakStart,
            break_end AS breakEnd,
            clock_out AS clockOut,
            attendance_status AS attendanceStatus,
            created_at AS createdAt
        FROM attendance
        WHERE employee_id = ?
          AND attendance_date = CURRENT_DATE()
          AND clock_out IS NULL
        ORDER BY attendance_id DESC
        LIMIT 1
        `,
        [employeeId]
    );

    return rows[0] || null;
};


// ============================================================
// 2. CREATE CLOCK-IN ENTRY
// ============================================================
export const createClockIn = async (employeeId) => {
    const [result] = await pool.query(
        `
        INSERT INTO attendance
            (
                employee_id,
                attendance_date,
                clock_in,
                attendance_status
            )
        VALUES
            (
                ?,
                CURRENT_DATE(),
                NOW(),
                'Present'
            )
        `,
        [employeeId]
    );

    return result;
};


// ============================================================
// 3. START BREAK
// ============================================================
export const updateBreakStart = async (attendanceId) => {
    const [result] = await pool.query(
        `
        UPDATE attendance
        SET
            break_start = NOW(),
            attendance_status = 'On Break'
        WHERE attendance_id = ?
        `,
        [attendanceId]
    );

    return result;
};


// ============================================================
// 4. END BREAK
// ============================================================
export const updateBreakEnd = async (attendanceId) => {
    const [result] = await pool.query(
        `
        UPDATE attendance
        SET
            break_end = NOW(),
            attendance_status = 'Present'
        WHERE attendance_id = ?
        `,
        [attendanceId]
    );

    return result;
};


// ============================================================
// 5. CLOCK OUT
// ============================================================
export const updateClockOut = async (attendanceId) => {
    const [result] = await pool.query(
        `
        UPDATE attendance
        SET
            clock_out = NOW(),
            attendance_status = 'Present'
        WHERE attendance_id = ?
        `,
        [attendanceId]
    );

    return result;
};


// ============================================================
// 6. GET PERSONAL ATTENDANCE HISTORY
// ============================================================
export const getHistoryByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `
        SELECT
            attendance_id AS attendanceId,
            employee_id AS employeeId,
            attendance_date AS attendanceDate,
            clock_in AS clockIn,
            break_start AS breakStart,
            break_end AS breakEnd,
            clock_out AS clockOut,
            attendance_status AS attendanceStatus
        FROM attendance
        WHERE employee_id = ?
        ORDER BY attendance_date DESC, attendance_id DESC
        LIMIT 30
        `,
        [employeeId]
    );

    return rows;
};