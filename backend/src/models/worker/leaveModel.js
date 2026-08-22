import pool from '../../config/db.js';


// ============================================================
// GET LEAVE TYPES
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

        ORDER BY leave_type_id
        `
    );


    console.log(
        "[Leave Model] Leave types returned:",
        rows
    );


    return rows;

};


// ============================================================
// GET WORKER LEAVE BALANCES
// ============================================================
//
// IMPORTANT:
// Only the logged-in employee's balances for the current year
// are returned.
//
// remainingDays = allocatedDays - usedDays
//
// ============================================================

export const getLeaveBalances = async (
    employeeId
) => {

    console.log(
        `[Leave Model] Getting current-year balances for employee ${employeeId}`
    );


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

            (
                lb.allocated_days -
                lb.used_days
            ) AS remainingDays,

            lb.updated_at AS updatedAt

        FROM leave_balances lb

        INNER JOIN leave_types lt
            ON lb.leave_type_id =
               lt.leave_type_id

        WHERE lb.employee_id = ?

          AND lb.balance_year =
              YEAR(CURDATE())

        ORDER BY lb.leave_type_id
        `,
        [
            employeeId
        ]
    );


    console.log(
        `[Leave Model] Database returned ${rows.length} balance row(s) for employee ${employeeId}:`
    );


    console.table(
        rows
    );


    return rows;

};


// ============================================================
// GET WORKER LEAVE REQUESTS
// ============================================================

export const getLeaveRequests = async (
    employeeId
) => {

    console.log(
        `[Leave Model] Getting requests for employee ${employeeId}`
    );


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
            ON lr.leave_type_id =
               lt.leave_type_id

        LEFT JOIN employees reviewer
            ON lr.reviewed_by =
               reviewer.employee_id

        WHERE lr.employee_id = ?

        ORDER BY lr.created_at DESC
        `,
        [
            employeeId
        ]
    );


    console.log(
        `[Leave Model] Database returned ${rows.length} request(s) for employee ${employeeId}:`
    );


    console.table(
        rows
    );


    return rows;

};


// ============================================================
// GET ONE LEAVE REQUEST
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
            ON lr.leave_type_id =
               lt.leave_type_id

        LEFT JOIN employees reviewer
            ON lr.reviewed_by =
               reviewer.employee_id

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
// GET LEAVE TYPE BY ID
// ============================================================

export const getLeaveTypeById = async (
    leaveTypeId
) => {

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
        [
            leaveTypeId
        ]
    );


    return rows[0] || null;

};


// ============================================================
// GET CURRENT-YEAR BALANCE FOR ONE LEAVE TYPE
// ============================================================

export const getLeaveBalanceByType = async (
    employeeId,
    leaveTypeId
) => {

    console.log(
        `[Leave Model] Checking leave type ${leaveTypeId} for employee ${employeeId}`
    );


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

            (
                lb.allocated_days -
                lb.used_days
            ) AS remainingDays

        FROM leave_balances lb

        INNER JOIN leave_types lt
            ON lb.leave_type_id =
               lt.leave_type_id

        WHERE lb.employee_id = ?

          AND lb.leave_type_id = ?

          AND lb.balance_year =
              YEAR(CURDATE())

        LIMIT 1
        `,
        [
            employeeId,
            leaveTypeId
        ]
    );


    console.log(
        "[Leave Model] Selected balance:",
        rows[0] || null
    );


    return rows[0] || null;

};


// ============================================================
// CHECK FOR OVERLAPPING LEAVE
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

          AND status IN (
              'Pending',
              'Approved'
          )

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


    return rows.length >
        0;

};


// ============================================================
// CREATE LEAVE REQUEST
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