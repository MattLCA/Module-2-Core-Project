import pool from '../../config/db.js';


// ============================================================
// GET ALL PAYSLIPS FOR LOGGED-IN WORKER
// ============================================================
//
// The employee ID comes from the authenticated JWT.
//
// This means a worker can only receive their own payslips.
//
// ============================================================

export const getPayslipsByEmployeeId = async (
    employeeId
) => {

    const [rows] = await pool.query(
        `
        SELECT

            p.payroll_id AS payrollId,

            p.employee_id AS employeeId,


            -- Employee information

            e.employee_code AS employeeCode,

            e.name AS employeeName,

            e.email AS employeeEmail,


            -- Employee organisation information

            pos.position_name AS positionName,

            d.department_name AS departmentName,


            -- Salary information

            e.base_salary AS baseSalary,


            -- Payroll information

            p.pay_period AS payPeriod,

            p.hours_worked AS hoursWorked,


            -- Earnings

            p.overtime_pay AS overtimePay,

            p.transport_allowance AS transportAllowance,

            p.bonus AS bonus,


            -- Deductions

            p.paye_tax AS payeTax,

            p.uif AS uif,

            p.pension AS pension,

            p.medical_aid AS medicalAid,

            p.leave_deductions AS leaveDeductions,


            -- ====================================================
            -- TOTAL EARNINGS
            -- ====================================================

            (
                e.base_salary
                + p.overtime_pay
                + p.transport_allowance
                + p.bonus
            ) AS totalEarnings,


            -- ====================================================
            -- TOTAL DEDUCTIONS
            -- ====================================================

            (
                p.paye_tax
                + p.uif
                + p.pension
                + p.medical_aid
                + p.leave_deductions
            ) AS totalDeductions,


            -- ====================================================
            -- FINAL / NET SALARY
            -- ====================================================

            (
                e.base_salary
                + p.overtime_pay
                + p.transport_allowance
                + p.bonus
                - p.paye_tax
                - p.uif
                - p.pension
                - p.medical_aid
                - p.leave_deductions
            ) AS finalSalary,


            p.created_at AS createdAt


        FROM payroll p


        INNER JOIN employees e

            ON p.employee_id =
               e.employee_id


        INNER JOIN positions pos

            ON e.position_id =
               pos.position_id


        INNER JOIN departments d

            ON e.department_id =
               d.department_id


        WHERE p.employee_id = ?


        ORDER BY
            p.pay_period DESC,
            p.payroll_id DESC
        `,
        [
            employeeId
        ]
    );


    console.log(
        `[Payslip Model] Returned ${rows.length} payslip(s) for employee ${employeeId}`
    );


    console.table(
        rows
    );


    return rows;

};


// ============================================================
// GET ONE PAYSLIP
// ============================================================
//
// Both payroll ID AND employee ID are checked.
//
// This prevents a worker from accessing another employee's
// payslip by changing the payroll ID in the URL.
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


            -- Employee information

            e.employee_code AS employeeCode,

            e.name AS employeeName,

            e.email AS employeeEmail,


            -- Role

            r.role_name AS roleName,


            -- Organisation information

            pos.position_name AS positionName,

            d.department_name AS departmentName,


            -- Salary

            e.base_salary AS baseSalary,


            -- Payroll

            p.pay_period AS payPeriod,

            p.hours_worked AS hoursWorked,


            -- Earnings

            p.overtime_pay AS overtimePay,

            p.transport_allowance AS transportAllowance,

            p.bonus AS bonus,


            -- Deductions

            p.paye_tax AS payeTax,

            p.uif AS uif,

            p.pension AS pension,

            p.medical_aid AS medicalAid,

            p.leave_deductions AS leaveDeductions,


            -- ====================================================
            -- TOTAL EARNINGS
            -- ====================================================

            (
                e.base_salary
                + p.overtime_pay
                + p.transport_allowance
                + p.bonus
            ) AS totalEarnings,


            -- ====================================================
            -- TOTAL DEDUCTIONS
            -- ====================================================

            (
                p.paye_tax
                + p.uif
                + p.pension
                + p.medical_aid
                + p.leave_deductions
            ) AS totalDeductions,


            -- ====================================================
            -- FINAL / NET SALARY
            -- ====================================================

            (
                e.base_salary
                + p.overtime_pay
                + p.transport_allowance
                + p.bonus
                - p.paye_tax
                - p.uif
                - p.pension
                - p.medical_aid
                - p.leave_deductions
            ) AS finalSalary,


            p.created_at AS createdAt


        FROM payroll p


        INNER JOIN employees e

            ON p.employee_id =
               e.employee_id


        INNER JOIN roles r

            ON e.role_id =
               r.role_id


        INNER JOIN positions pos

            ON e.position_id =
               pos.position_id


        INNER JOIN departments d

            ON e.department_id =
               d.department_id


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