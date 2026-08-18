import pool from '../../config/db.js';


// 1. GET employee profile
export const getProfileByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `SELECT employees.employeeId,
                employees.firstName,
                employees.lastName,
                employees.email,
                employees.hireDate,
                departments.departmentName,
                positions.positionTitle,
                positions.baseSalary
        FROM employees
        JOIN departments
            ON employees.departmentId = departments.departmentId
        JOIN positions
            ON employees.positionId = positions.positionId
        WHERE employees.employeeId = ?`,
        [employeeId]
    );
    return rows[0] || null;
};