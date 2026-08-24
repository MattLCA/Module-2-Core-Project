import pool from "../../config/db.js";

// ============================================================
// GET WORKER DASHBOARD DATA
// ============================================================

export const getWorkerDashboard = async (employeeId) => {
  // --------------------------------------------------------
  // 1. EMPLOYEE SUMMARY
  // --------------------------------------------------------

  const [employeeRows] = await pool.query(
    `
        SELECT
            e.employee_id AS employeeId,
            e.employee_code AS employeeCode,
            e.name,
            e.email,
            r.role_name AS role,
            p.position_name AS position,
            d.department_name AS department,
            e.base_salary AS baseSalary,
            e.employment_history AS employmentHistory,
            e.contact,
            e.is_active AS isActive
        FROM employees e

        INNER JOIN roles r
            ON e.role_id = r.role_id

        INNER JOIN positions p
            ON e.position_id = p.position_id

        INNER JOIN departments d
            ON e.department_id = d.department_id

        WHERE e.employee_id = ?

        LIMIT 1
        `,
    [employeeId],
  );

  // --------------------------------------------------------
  // 2. TODAY'S ATTENDANCE
  // --------------------------------------------------------

  const [attendanceRows] = await pool.query(
    `
        SELECT
            attendance_id AS attendanceId,
            attendance_date AS attendanceDate,
            clock_in AS clockIn,
            break_start AS breakStart,
            break_end AS breakEnd,
            clock_out AS clockOut,
            attendance_status AS attendanceStatus
        FROM attendance
        WHERE employee_id = ?
          AND attendance_date = CURRENT_DATE()
        LIMIT 1
        `,
    [employeeId],
  );

  // --------------------------------------------------------
  // 3. LEAVE BALANCES
  // --------------------------------------------------------

  const [leaveBalanceRows] = await pool.query(
    `
        SELECT
            balance_id AS balanceId,
            leave_type_id AS leaveTypeId,
            leave_type_name AS leaveTypeName,
            balance_year AS balanceYear,
            allocated_days AS allocatedDays,
            used_days AS usedDays,
            remaining_days AS remainingDays
        FROM employee_leave_balances
        WHERE employee_id = ?
          AND balance_year = YEAR(CURDATE())
        ORDER BY leave_type_name
        `,
    [employeeId],
  );

  // --------------------------------------------------------
  // 4. RECENT LEAVE REQUESTS
  // --------------------------------------------------------

  const [leaveRequestRows] = await pool.query(
    `
        SELECT
            leave_request_id AS leaveRequestId,
            leave_type_id AS leaveTypeId,
            leave_type_name AS leaveTypeName,
            start_date AS startDate,
            end_date AS endDate,
            total_days AS totalDays,
            reason,
            status,
            submitted_date AS submittedDate
        FROM employee_leave_requests
        WHERE employee_id = ?
        ORDER BY submitted_date DESC, leave_request_id DESC
        LIMIT 5
        `,
    [employeeId],
  );

  // --------------------------------------------------------
  // 5. LATEST PAYSLIP
  // --------------------------------------------------------

  const [payrollRows] = await pool.query(
    `
        SELECT
            payroll_id AS payrollId,
            pay_period AS payPeriod,
            hours_worked AS hoursWorked,
            leave_deductions AS leaveDeductions,
            final_salary AS finalSalary,
            created_at AS createdAt
        FROM employee_payslips
        WHERE employee_id = ?
        ORDER BY pay_period DESC
        LIMIT 1
        `,
    [employeeId],
  );

  // --------------------------------------------------------
  // 6. UNREAD NOTIFICATION COUNT
  // --------------------------------------------------------

  const [notificationRows] = await pool.query(
    `
        SELECT COUNT(*) AS unreadNotifications
        FROM notifications
        WHERE employee_id = ?
          AND is_read = 0
        `,
    [employeeId],
  );

  // --------------------------------------------------------
  // RETURN DASHBOARD
  // --------------------------------------------------------

  return {
    employee: employeeRows[0] || null,

    attendance: attendanceRows[0] || null,

    leaveBalances: leaveBalanceRows,

    recentLeaveRequests: leaveRequestRows,

    latestPayslip: payrollRows[0] || null,

    unreadNotifications: Number(notificationRows[0]?.unreadNotifications || 0),
  };
};
