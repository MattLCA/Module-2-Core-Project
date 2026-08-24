// ============================================================
// ModernTech Employee Model
// ============================================================

import pool from "../config/db.js";

// ============================================================
// COMMON SELECT
// ============================================================

const EMPLOYEE_SELECT = `
    SELECT

        e.employee_id,
        e.employee_code,
        e.name,
        e.email,

        r.role_name AS role,

        p.position_name AS position,

        d.department_name AS department,

        e.department_id,
        e.position_id,
        e.role_id,

        e.base_salary,

        e.employment_history,

        e.contact,

        e.is_active,

        e.created_at,
        e.updated_at,

        EXISTS (
            SELECT 1
            FROM leave_requests lr
            WHERE lr.employee_id = e.employee_id
              AND lr.status = 'Approved'
              AND CURDATE() BETWEEN lr.start_date AND lr.end_date
        ) AS on_leave_today

    FROM employees e

    INNER JOIN roles r
        ON e.role_id = r.role_id

    INNER JOIN positions p
        ON e.position_id = p.position_id

    INNER JOIN departments d
        ON e.department_id =
           d.department_id
`;

// ============================================================
// FIND ALL ACTIVE EMPLOYEES
// ============================================================

async function findAll({ department = null } = {}) {
  let sql = `${EMPLOYEE_SELECT}
         WHERE e.is_active = 1`;

  const params = [];

  if (department) {
    sql += " AND d.department_name = ?";

    params.push(department);
  }

  sql += " ORDER BY e.name";

  const [rows] = await pool.query(sql, params);

  return rows;
}

// ============================================================
// FIND ONE EMPLOYEE
// ============================================================

async function findById(employeeId) {
  const [rows] = await pool.query(
    `${EMPLOYEE_SELECT}
             WHERE e.employee_id = ?
             LIMIT 1`,

    [employeeId],
  );

  return rows[0] || null;
}

// ============================================================
// LOGIN LOOKUP
// ============================================================
//
// password_hash is included here because only the authentication
// controller uses this function.
// ============================================================

async function findByLoginIdentifier({ email = null, employeeCode = null }) {
  const [rows] = await pool.query(
    `
            SELECT

                e.*,

                r.role_name AS role,

                p.position_name AS position,

                d.department_name AS department

            FROM employees e

            INNER JOIN roles r
                ON e.role_id = r.role_id

            INNER JOIN positions p
                ON e.position_id =
                   p.position_id

            INNER JOIN departments d
                ON e.department_id =
                   d.department_id

            WHERE
                (
                    ? IS NOT NULL
                    AND e.email = ?
                )

                OR

                (
                    ? IS NOT NULL
                    AND e.employee_code = ?
                )

            LIMIT 1
            `,

    [email, email, employeeCode, employeeCode],
  );

  return rows[0] || null;
}

// ============================================================
// ROLE ID
// ============================================================

async function getRoleId(roleName) {
  const [rows] = await pool.query(
    `
            SELECT role_id
            FROM roles
            WHERE role_name = ?
            `,

    [roleName],
  );

  if (!rows[0]) {
    throw new Error(`Unknown role: ${roleName}`);
  }

  return rows[0].role_id;
}

// ============================================================
// POSITION ID
// ============================================================

async function getPositionId(positionName) {
  const [rows] = await pool.query(
    `
            SELECT position_id
            FROM positions
            WHERE position_name = ?
            `,

    [positionName],
  );

  if (rows[0]) {
    return rows[0].position_id;
  }

  const [result] = await pool.query(
    `
            INSERT INTO positions
                (position_name)
            VALUES (?)
            `,

    [positionName],
  );

  return result.insertId;
}

// ============================================================
// DEPARTMENT ID
// ============================================================

async function getDepartmentId(departmentName) {
  const [rows] = await pool.query(
    `
            SELECT department_id
            FROM departments
            WHERE department_name = ?
            `,

    [departmentName],
  );

  if (!rows[0]) {
    throw new Error(`Unknown department: ${departmentName}`);
  }

  return rows[0].department_id;
}

// ============================================================
// NEXT EMPLOYEE CODE
// ============================================================

async function getNextEmployeeCode() {
  const [rows] = await pool.query(
    `
            SELECT employee_code

            FROM employees

            WHERE employee_code
                  REGEXP '^EMP[0-9]+$'

            ORDER BY
                CAST(
                    SUBSTRING(
                        employee_code,
                        4
                    )
                    AS UNSIGNED
                ) DESC

            LIMIT 1
            `,
  );

  const lastNumber = rows[0] ? parseInt(rows[0].employee_code.slice(3), 10) : 0;

  return "EMP" + String(lastNumber + 1).padStart(3, "0");
}

// ============================================================
// CREATE EMPLOYEE
// ============================================================

async function create({
  employeeCode,
  name,
  email,
  passwordHash,
  role = "worker",
  position,
  department,
  baseSalary = 0,
  employmentHistory = null,
  contact = null,
}) {
  const roleId = await getRoleId(role);

  const positionId = await getPositionId(position);

  const departmentId = await getDepartmentId(department);

  const [result] = await pool.query(
    `
            INSERT INTO employees (

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

      contact,
    ],
  );

  return findById(result.insertId);
}

// ============================================================
// UPDATE EMPLOYEE
// ============================================================

async function update(employeeId, fields) {
  const updates = {};

  const directFields = [
    "name",
    "email",
    "base_salary",
    "employment_history",
    "contact",
    "is_active",
  ];

  for (const field of directFields) {
    if (fields[field] !== undefined) {
      updates[field] = fields[field];
    }
  }

  if (fields.position !== undefined) {
    updates.position_id = await getPositionId(fields.position);
  }

  if (fields.department !== undefined) {
    updates.department_id = await getDepartmentId(fields.department);
  }

  if (fields.role !== undefined) {
    updates.role_id = await getRoleId(fields.role);
  }

  const keys = Object.keys(updates);

  if (!keys.length) {
    return findById(employeeId);
  }

  const setClause = keys.map((key) => `${key} = ?`).join(", ");

  const values = keys.map((key) => updates[key]);

  await pool.query(
    `
        UPDATE employees

        SET ${setClause}

        WHERE employee_id = ?
        `,

    [...values, employeeId],
  );

  return findById(employeeId);
}

// ============================================================
// SOFT DELETE
// ============================================================

async function remove(employeeId) {
  const [result] = await pool.query(
    `
            UPDATE employees

            SET is_active = 0

            WHERE employee_id = ?
            `,

    [employeeId],
  );

  return result.affectedRows > 0;
}

export {
  findAll,
  findById,
  findByLoginIdentifier,
  create,
  update,
  remove,
  getNextEmployeeCode,
};