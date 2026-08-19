import pool from '../../config/db.js';


// ============================================================
// GET ALL PAYSLIPS FOR LOGGED-IN WORKER
// ============================================================
//
// Uses the final database:
//
// payroll
// employees
//
// Workers can ONLY retrieve their own records.
//
// ============================================================

export const getPayslipsByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `
        SELECT
            p.payroll_id AS payrollId,

            p.employee_id AS employeeId,

            e.employee_code AS employeeCode,
            e.name AS employeeName,
            e.email AS employeeEmail,

            p.pay_period AS payPeriod,

            p.hours_worked AS hoursWorked,

            p.leave_deductions AS leaveDeductions,

            p.final_salary AS finalSalary,

            p.created_at AS createdAt

        FROM payroll p

        INNER JOIN employees e
            ON p.employee_id = e.employee_id

        WHERE p.employee_id = ?

        ORDER BY p.pay_period DESC, p.payroll_id DESC
        `,
        [employeeId]
    );

    return rows;
};


// ============================================================
// GET ONE PAYSLIP
// ============================================================
//
// The employee ID is included in the WHERE clause so a worker
// cannot retrieve another employee's payslip.
//
// ============================================================

export const getPayslipById = async (
    payrollId,
    employeeId
) => {
    const [rows] = await pool.query(
        `
        SELECT
            p.payroll_id AS payrollId,

            p.employee_id AS employeeId,

            e.employee_code AS employeeCode,
            e.name AS employeeName,
            e.email AS employeeEmail,

            r.role_name AS roleName,

            pos.position_name AS positionName,

            d.department_name AS departmentName,

            e.base_salary AS baseSalary,

            p.pay_period AS payPeriod,

            p.hours_worked AS hoursWorked,

            p.leave_deductions AS leaveDeductions,

            p.final_salary AS finalSalary,

            p.created_at AS createdAt

        FROM payroll p

        INNER JOIN employees e
            ON p.employee_id = e.employee_id

        INNER JOIN roles r
            ON e.role_id = r.role_id

        INNER JOIN positions pos
            ON e.position_id = pos.position_id

        INNER JOIN departments d
            ON e.department_id = d.department_id

        WHERE p.payroll_id = ?
        AND p.employee_id = ?

        LIMIT 1
        `,
        [
            payrollId,
            employeeId
        ]
    );

    return rows[0] || null;
};