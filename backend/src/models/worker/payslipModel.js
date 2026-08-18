import pool from '../../config/db.js';


// 1. GET payslips for an employee
export const getPayslipsByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `SELECT payslipId, payPeriodStart, grossSalary, deductions, netSalary, pdfUrl, issuedDate
        FROM payslips
        WHERE employeeId = ?
        ORDER BY payPeriodEnd DESC`,
        [employeeId]
    );
    return rows;
};


// 2. GET a specific payslip
export const getPayslipById = async (payslipId, employeeId) => {
    const [rows] = await pool.query(
        `SELECT *
        FROM payslips
        WHERE payslipId = ?
        AND employeeId = ?`,
        [payslipId, employeeId]
    );
    return rows[0] || null;
};