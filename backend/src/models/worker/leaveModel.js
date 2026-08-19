import pool from '../../config/db.js';


// ============================================================
// 1. GET LEAVE TYPES
// ============================================================
//
// Returns all active leave types that a worker can request.
//
// Database table:
//     leave_types
//
// ============================================================

export const getLeaveTypes = async () => {
    const [rows] = await pool.query(
        `
        SELECT
            leave_type_id AS leaveTypeId,
            leave_type_name AS leaveTypeName,
            description,
            is_active AS isActive

        FROM leave_types

        WHERE is_active = 1

        ORDER BY leave_type_name
        `
    );

    return rows;
};


// ============================================================
// 2. GET WORKER LEAVE BALANCES
// ============================================================
//
// Returns the logged-in worker's leave balances.
//
// Database table:
//     leave_balances
//
// ============================================================

export const getLeaveBalances = async (employeeId) => {
    const [rows] = await pool.query(
        `
        SELECT
            lb.balance_id AS balanceId,

            lb.employee_id AS employeeId,

            lb.leave_type_id AS leaveTypeId,

            lt.leave_type_name AS leaveTypeName,

            lb.balance_year AS balanceYear,

            lb.allocated_days AS allocatedDays,

            lb.used_days AS usedDays,

            (lb.allocated_days - lb.used_days) AS remainingDays,

            lb.updated_at AS updatedAt

        FROM leave_balances lb

        INNER JOIN leave_types lt
            ON lb.leave_type_id = lt.leave_type_id

        WHERE lb.employee_id = ?

        ORDER BY lt.leave_type_name
        `,
        [employeeId]
    );

    return rows;
};


// ============================================================
// 3. GET WORKER LEAVE REQUESTS
// ============================================================
//
// Returns ONLY requests belonging to the logged-in worker.
//
// Database table:
//     leave_requests
//
// ============================================================

export const getLeaveRequests = async (employeeId) => {
    const [rows] = await pool.query(
        `
        SELECT
            lr.leave_request_id AS leaveRequestId,

            lr.employee_id AS employeeId,

            lr.leave_type_id AS leaveTypeId,

            lt.leave_type_name AS leaveTypeName,

            lr.start_date AS startDate,

            lr.end_date AS endDate,

            lr.total_days AS totalDays,

            lr.reason,

            lr.status,

            lr.submitted_date AS submittedDate,

            lr.reviewed_by AS reviewedBy,

            reviewer.name AS reviewerName,

            lr.created_at AS createdAt,

            lr.updated_at AS updatedAt

        FROM leave_requests lr

        INNER JOIN leave_types lt
            ON lr.leave_type_id = lt.leave_type_id

        LEFT JOIN employees reviewer
            ON lr.reviewed_by = reviewer.employee_id

        WHERE lr.employee_id = ?

        ORDER BY lr.created_at DESC
        `,
        [employeeId]
    );

    return rows;
};


// ============================================================
// 4. GET ONE LEAVE REQUEST
// ============================================================
//
// Used internally when checking a specific request.
//
// ============================================================

export const getLeaveRequestById = async (
    leaveRequestId,
    employeeId
) => {
    const [rows] = await pool.query(
        `
        SELECT
            lr.leave_request_id AS leaveRequestId,
            lr.employee_id AS employeeId,
            lr.leave_type_id AS leaveTypeId,

            lt.leave_type_name AS leaveTypeName,

            lr.start_date AS startDate,
            lr.end_date AS endDate,
            lr.total_days AS totalDays,

            lr.reason,
            lr.status,

            lr.submitted_date AS submittedDate,

            lr.reviewed_by AS reviewedBy,

            reviewer.name AS reviewerName,

            lr.created_at AS createdAt,
            lr.updated_at AS updatedAt

        FROM leave_requests lr

        INNER JOIN leave_types lt
            ON lr.leave_type_id = lt.leave_type_id

        LEFT JOIN employees reviewer
            ON lr.reviewed_by = reviewer.employee_id

        WHERE lr.leave_request_id = ?
        AND lr.employee_id = ?

        LIMIT 1
        `,
        [
            leaveRequestId,
            employeeId
        ]
    );

    return rows[0] || null;
};


// ============================================================
// 5. CHECK LEAVE TYPE EXISTS
// ============================================================

export const getLeaveTypeById = async (leaveTypeId) => {
    const [rows] = await pool.query(
        `
        SELECT
            leave_type_id AS leaveTypeId,
            leave_type_name AS leaveTypeName

        FROM leave_types

        WHERE leave_type_id = ?
        AND is_active = 1

        LIMIT 1
        `,
        [leaveTypeId]
    );

    return rows[0] || null;
};


// ============================================================
// 6. CREATE LEAVE REQUEST
// ============================================================

export const createLeaveRequest = async ({
    employeeId,
    leaveTypeId,
    startDate,
    endDate,
    totalDays,
    reason
}) => {
    const [result] = await pool.query(
        `
        INSERT INTO leave_requests
        (
            employee_id,
            leave_type_id,
            start_date,
            end_date,
            total_days,
            reason,
            status,
            submitted_date
        )

        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'Pending',
            CURRENT_DATE
        )
        `,
        [
            employeeId,
            leaveTypeId,
            startDate,
            endDate,
            totalDays,
            reason || null
        ]
    );

    return result;
};


// ============================================================
// 7. CHECK FOR OVERLAPPING LEAVE
// ============================================================
//
// Prevents a worker from submitting overlapping leave requests.
//
// ============================================================

export const hasOverlappingLeave = async ({
    employeeId,
    startDate,
    endDate
}) => {
    const [rows] = await pool.query(
        `
        SELECT
            leave_request_id

        FROM leave_requests

        WHERE employee_id = ?

        AND status IN ('Pending', 'Approved')

        AND start_date <= ?

        AND end_date >= ?

        LIMIT 1
        `,
        [
            employeeId,
            endDate,
            startDate
        ]
    );

    return rows.length > 0;
};