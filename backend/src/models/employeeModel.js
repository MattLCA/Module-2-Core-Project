/**
 * Employee data-access layer. All queries are parameterized (`?`) —
 * never string-concatenate user input into SQL.
 *
 * Schema note: role, position, and department are now normalized into
 * their own tables (roles, positions, departments), referenced from
 * employees via role_id / position_id / department_id. This file joins
 * against those tables and aliases the name columns back to `role`,
 * `position`, `department` — so everything else in the backend
 * (authController, employeeController, dashboardModel) keeps working
 * against the same flat shape as before, without needing to know about
 * the underlying foreign keys.
 */
import pool from '../config/db.js';

const EMPLOYEE_SELECT = `
  SELECT
    e.employee_id, e.employee_code, e.name, e.email,
    r.role_name AS role,
    p.position_name AS position,
    d.department_name AS department,
    e.department_id,
    e.base_salary, e.employment_history, e.contact,
    e.is_active, e.created_at, e.updated_at
  FROM employees e
  JOIN roles r ON e.role_id = r.role_id
  JOIN positions p ON e.position_id = p.position_id
  JOIN departments d ON e.department_id = d.department_id
`;

async function findAll({ department } = {}) {
  if (department) {
    const [rows] = await pool.query(
      `${EMPLOYEE_SELECT} WHERE d.department_name = ? AND e.is_active = 1 ORDER BY e.name`,
      [department]
    );
    return rows;
  }
  const [rows] = await pool.query(
    `${EMPLOYEE_SELECT} WHERE e.is_active = 1 ORDER BY e.name`
  );
  return rows;
}

async function findById(employeeId) {
  const [rows] = await pool.query(
    `${EMPLOYEE_SELECT} WHERE e.employee_id = ?`,
    [employeeId]
  );
  return rows[0] || null;
}

// Includes password_hash — only for internal auth use, never returned to a client.
async function findByLoginIdentifier({ email, employeeCode }) {
  const [rows] = await pool.query(
    `SELECT e.*,
            r.role_name AS role,
            p.position_name AS position,
            d.department_name AS department
     FROM employees e
     JOIN roles r ON e.role_id = r.role_id
     JOIN positions p ON e.position_id = p.position_id
     JOIN departments d ON e.department_id = d.department_id
     WHERE e.email = ? OR e.employee_code = ?
     LIMIT 1`,
    [email || null, employeeCode || null]
  );
  return rows[0] || null;
}

async function getRoleId(roleName) {
  const [rows] = await pool.query(
    `SELECT role_id FROM roles WHERE role_name = ?`,
    [roleName]
  );
  if (!rows[0]) throw new Error(`Unknown role: ${roleName}`);
  return rows[0].role_id;
}

// Positions are open-ended job titles typed by HR in the "Add employee"
// form, unlike departments (a fixed dropdown). Find-or-create rather than
// throwing on an unrecognized title.
async function getPositionId(positionName) {
  const [rows] = await pool.query(
    `SELECT position_id FROM positions WHERE position_name = ?`,
    [positionName]
  );
  if (rows[0]) return rows[0].position_id;

  const [result] = await pool.query(
    `INSERT INTO positions (position_name) VALUES (?)`,
    [positionName]
  );
  return result.insertId;
}

// Generates the next sequential employee_code (EMP001, EMP002, ...).
// employee_code is NOT NULL UNIQUE, so a code must exist before insert.
async function getNextEmployeeCode() {
  const [rows] = await pool.query(
    `SELECT employee_code FROM employees
     WHERE employee_code REGEXP '^EMP[0-9]+$'
     ORDER BY CAST(SUBSTRING(employee_code, 4) AS UNSIGNED) DESC
     LIMIT 1`
  );
  const lastNum = rows[0] ? parseInt(rows[0].employee_code.slice(3), 10) : 0;
  return 'EMP' + String(lastNum + 1).padStart(3, '0');
}

async function getDepartmentId(departmentName) {
  const [rows] = await pool.query(
    `SELECT department_id FROM departments WHERE department_name = ?`,
    [departmentName]
  );
  if (!rows[0]) throw new Error(`Unknown department: ${departmentName}`);
  return rows[0].department_id;
}

async function create({
  employeeCode, name, email, passwordHash, role,
  position, department, baseSalary, employmentHistory, contact,
}) {
  const [roleId, positionId, departmentId] = await Promise.all([
    getRoleId(role),
    getPositionId(position),
    getDepartmentId(department),
  ]);

  const [result] = await pool.query(
    `INSERT INTO employees
       (employee_code, name, email, password_hash, role_id, position_id, department_id, base_salary, employment_history, contact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [employeeCode || null, name, email || null, passwordHash, roleId,
      positionId, departmentId, baseSalary, employmentHistory || null, contact || null]
  );
  return findById(result.insertId);
}

async function update(employeeId, fields) {
  // Columns that map straight through with no lookup needed.
  const directColumns = ['name', 'email', 'base_salary', 'employment_history', 'contact', 'is_active'];
  const updates = {};

  for (const key of directColumns) {
    if (fields[key] !== undefined) updates[key] = fields[key];
  }

  // position/department still arrive as human-readable names from the
  // client — resolve them to their FK ids before writing.
  if (fields.position !== undefined) {
    updates.position_id = await getPositionId(fields.position);
  }
  if (fields.department !== undefined) {
    updates.department_id = await getDepartmentId(fields.department);
  }

  const keys = Object.keys(updates);
  if (keys.length === 0) return findById(employeeId);

  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => updates[k]);

  await pool.query(
    `UPDATE employees SET ${setClause} WHERE employee_id = ?`,
    [...values, employeeId]
  );
  return findById(employeeId);
}

async function remove(employeeId) {
  // Soft delete — keeps attendance/leave/payroll history intact.
  const [result] = await pool.query(
    `UPDATE employees SET is_active = 0 WHERE employee_id = ?`,
    [employeeId]
  );
  return result.affectedRows > 0;
}

export { findAll, findById, findByLoginIdentifier, create, update, remove, getNextEmployeeCode };