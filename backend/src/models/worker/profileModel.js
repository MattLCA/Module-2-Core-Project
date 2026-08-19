import pool from '../../config/db.js';

// ============================================================
// GET LOGGED-IN WORKER PROFILE
// ============================================================

export const getProfileByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `
        SELECT
            e.employee_id AS employeeId,
            e.employee_code AS employeeCode,
            e.name,
            e.email,
            e.contact,

            r.role_name AS roleName,

            p.position_name AS positionName,

            d.department_name AS departmentName,

            e.base_salary AS baseSalary,
            e.employment_history AS employmentHistory,
            e.is_active AS isActive,
            e.created_at AS createdAt

        FROM employees e

        INNER JOIN roles r
            ON e.role_id = r.role_id

        INNER JOIN positions p
            ON e.position_id = p.position_id

        INNER JOIN departments d
            ON e.department_id = d.department_id

        WHERE e.employee_id = ?
        AND e.is_active = 1

        LIMIT 1
        `,
        [employeeId]
    );

    return rows[0] || null;
};