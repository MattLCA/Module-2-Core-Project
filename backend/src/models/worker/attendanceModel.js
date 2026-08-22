import pool from '../../config/db.js';


// ============================================================
// GET TODAY'S ACTIVE ATTENDANCE
// ============================================================
// Returns today's attendance record only when the worker has
// clocked in and has not yet clocked out.
//
// Database remains the source of truth.
//
// Rules:
// - One attendance record per employee per day.
// - Clock-in once per day.
// - Once clocked out, no active record remains.
// ============================================================

export const getActiveAttendance = async (employeeId) => {

    const [rows] = await pool.query(
        `
        SELECT
            attendance_id AS attendanceId,
            employee_id AS employeeId,
            attendance_date AS attendanceDate,
            clock_in AS clockIn,
            clock_out AS clockOut,
            attendance_status AS attendanceStatus,
            notes,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM attendance
        WHERE employee_id = ?
          AND attendance_date = CURRENT_DATE()
          AND clock_in IS NOT NULL
          AND clock_out IS NULL
        ORDER BY attendance_id DESC
        LIMIT 1
        `,
        [employeeId]
    );

    return rows[0] || null;
};


// ============================================================
// GET TODAY'S ATTENDANCE RECORD
// ============================================================
// Used to determine whether the worker has already clocked in
// or clocked out today.
//
// This is separate from getActiveAttendance() because once the
// worker clocks out, the record is no longer "active", but it
// still exists for today's attendance state.
// ============================================================

export const getTodayAttendance = async (employeeId) => {

    const [rows] = await pool.query(
        `
        SELECT
            attendance_id AS attendanceId,
            employee_id AS employeeId,
            attendance_date AS attendanceDate,
            clock_in AS clockIn,
            clock_out AS clockOut,
            attendance_status AS attendanceStatus,
            notes,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM attendance
        WHERE employee_id = ?
          AND attendance_date = CURRENT_DATE()
        ORDER BY attendance_id DESC
        LIMIT 1
        `,
        [employeeId]
    );

    return rows[0] || null;
};


// ============================================================
// CREATE CLOCK-IN ENTRY
// ============================================================
// Creates today's attendance record.
//
// The database unique constraint:
//
//     UNIQUE (employee_id, attendance_date)
//
// prevents a second attendance row for the same employee/day.
// ============================================================

export const createClockIn = async (employeeId) => {

    const [result] = await pool.query(
        `
        INSERT INTO attendance
        (
            employee_id,
            attendance_date,
            clock_in,
            clock_out,
            attendance_status
        )
        VALUES
        (
            ?,
            CURRENT_DATE(),
            NOW(),
            NULL,
            'Present'
        )
        `,
        [employeeId]
    );

    return result;
};


// ============================================================
// CLOCK OUT
// ============================================================
// Closes today's open attendance record.
//
// Break columns are intentionally not used anymore.
// ============================================================

export const updateClockOut = async (attendanceId) => {

    const [result] = await pool.query(
        `
        UPDATE attendance
        SET
            clock_out = NOW(),
            attendance_status = 'Present'
        WHERE attendance_id = ?
          AND clock_out IS NULL
        `,
        [attendanceId]
    );

    return result;
};


// ============================================================
// GET PERSONAL ATTENDANCE HISTORY
// ============================================================
// Returns database-backed attendance history.
//
// Each attendance record contains:
// - clockIn
// - clockOut
//
// Break information is intentionally excluded from the worker
// API because Break/Return functionality has been removed.
// ============================================================

export const getHistoryByEmployeeId = async (employeeId) => {

    const [rows] = await pool.query(
        `
        SELECT
            attendance_id AS attendanceId,
            employee_id AS employeeId,
            attendance_date AS attendanceDate,
            clock_in AS clockIn,
            clock_out AS clockOut,
            attendance_status AS attendanceStatus
        FROM attendance
        WHERE employee_id = ?
        ORDER BY
            attendance_date DESC,
            attendance_id DESC
        LIMIT 30
        `,
        [employeeId]
    );

    return rows;
};