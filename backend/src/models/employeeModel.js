/**
 * Employee data-access layer.
 *
 * This model is written for the FINAL normalized moderntech_db schema.
 *
 * Database structure:
 *   employees
 *      -> roles
 *      -> positions
 *      -> departments
 *
 * All queries are parameterized.
 */

import pool from '../config/db.js';


// ============================================================
// EMPLOYEE SELECT
// ============================================================
//
// This JOIN gives the application the convenient fields:
//   role
//   position
//   department
//
// while keeping the actual database normalized.
//
// password_hash is NOT included here because these are public
// employee records.
// ============================================================

const PUBLIC_SELECT = `
    SELECT
        e.employee_id,
        e.employee_code,
        e.name,
        e.email,

        r.role_id,
        r.role_name AS role,

        p.position_id,
        p.position_name AS position,

        d.department_id,
        d.department_name AS department,

        e.base_salary,
        e.employment_history,
        e.contact,
        e.is_active,
        e.created_at,
        e.updated_at

    FROM employees e

    INNER JOIN roles r
        ON e.role_id = r.role_id

    INNER JOIN positions p
        ON e.position_id = p.position_id

    INNER JOIN departments d
        ON e.department_id = d.department_id
`;


// ============================================================
// FIND ALL EMPLOYEES
// ============================================================

async function findAll({ department } = {}) {

    if (department) {

        const [rows] = await pool.query(
            `
            ${PUBLIC_SELECT}
            WHERE d.department_name = ?
              AND e.is_active = 1
            ORDER BY e.name
            `,
            [department]
        );

        return rows;
    }


    const [rows] = await pool.query(
        `
        ${PUBLIC_SELECT}
        WHERE e.is_active = 1
        ORDER BY e.name
        `
    );

    return rows;
}


// ============================================================
// FIND EMPLOYEE BY ID
// ============================================================

async function findById(employeeId) {

    const [rows] = await pool.query(
        `
        ${PUBLIC_SELECT}
        WHERE e.employee_id = ?
        LIMIT 1
        `,
        [employeeId]
    );

    return rows[0] || null;
}


// ============================================================
// FIND EMPLOYEE FOR LOGIN
// ============================================================
//
// This function intentionally includes password_hash because
// authentication needs it.
//
// It also joins roles/positions/departments so the controller
// receives the complete normalized employee information.
//
// Supported identifiers:
//   email
//   employee_code
// ============================================================

async function findByLoginIdentifier({ email, employeeCode }) {

    let query = `
        SELECT
            e.employee_id,
            e.employee_code,
            e.name,
            e.email,
            e.password_hash,

            r.role_id,
            r.role_name AS role,

            p.position_id,
            p.position_name AS position,

            d.department_id,
            d.department_name AS department,

            e.base_salary,
            e.employment_history,
            e.contact,
            e.is_active,
            e.created_at,
            e.updated_at

        FROM employees e

        INNER JOIN roles r
            ON e.role_id = r.role_id

        INNER JOIN positions p
            ON e.position_id = p.position_id

        INNER JOIN departments d
            ON e.department_id = d.department_id

        WHERE e.is_active = 1
    `;


    // --------------------------------------------------------
    // Worker login
    // --------------------------------------------------------

    if (employeeCode) {

        query += `
            AND e.employee_code = ?
            LIMIT 1
        `;

        const [rows] = await pool.query(
            query,
            [employeeCode]
        );

        return rows[0] || null;
    }


    // --------------------------------------------------------
    // HR/email login
    // --------------------------------------------------------

    if (email) {

        query += `
            AND e.email = ?
            LIMIT 1
        `;

        const [rows] = await pool.query(
            query,
            [email]
        );

        return rows[0] || null;
    }


    return null;
}


// ============================================================
// CREATE EMPLOYEE
// ============================================================
//
// The normalized database requires:
//
//   role_id
//   position_id
//   department_id
//
// NOT:
//
//   role
//   position
//   department
//
// This function therefore expects the IDs.
// ============================================================

async function create({
    employeeCode,
    name,
    email,
    passwordHash,
    roleId,
    positionId,
    departmentId,
    baseSalary = 0,
    employmentHistory = null,
    contact = null
}) {

    const [result] = await pool.query(
        `
        INSERT INTO employees
        (
            employee_code,
            name,
            email,
            password_hash,
            role_id,
            position_id,
            department_id,
            base_salary,
            employment_history,
            contact
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            employeeCode,
            name,
            email,
            passwordHash,
            roleId,
            positionId,
            departmentId,
            baseSalary,
            employmentHistory,
            contact
        ]
    );


    return findById(result.insertId);
}


// ============================================================
// UPDATE EMPLOYEE
// ============================================================
//
// Supports both normal employee fields and the normalized
// foreign-key fields.
//
// Allowed:
//   name
//   email
//   role_id
//   position_id
//   department_id
//   base_salary
//   employment_history
//   contact
//   is_active
// ============================================================

async function update(employeeId, fields) {

    const allowed = [
        'name',
        'email',
        'role_id',
        'position_id',
        'department_id',
        'base_salary',
        'employment_history',
        'contact',
        'is_active'
    ];


    const keys = Object.keys(fields)
        .filter(key => allowed.includes(key));


    if (keys.length === 0) {
        return findById(employeeId);
    }


    const setClause = keys
        .map(key => `${key} = ?`)
        .join(', ');


    const values = keys.map(
        key => fields[key]
    );


    await pool.query(
        `
        UPDATE employees
        SET ${setClause}
        WHERE employee_id = ?
        `,
        [
            ...values,
            employeeId
        ]
    );


    return findById(employeeId);
}


// ============================================================
// REMOVE EMPLOYEE
// ============================================================
//
// Soft delete.
// This keeps historical attendance, leave and payroll records.
// ============================================================

async function remove(employeeId) {

    const [result] = await pool.query(
        `
        UPDATE employees
        SET is_active = 0
        WHERE employee_id = ?
        `,
        [employeeId]
    );


    return result.affectedRows > 0;
}


// ============================================================
// EXPORTS
// ============================================================

export {
    findAll,
    findById,
    findByLoginIdentifier,
    create,
    update,
    remove
};