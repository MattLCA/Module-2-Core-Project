/**
 * Employee data-access layer. All queries are parameterized (`?`) —
 * never string-concatenate user input into SQL.
 */
import pool from '../config/db.js';

const PUBLIC_COLUMNS = `
  employee_id, employee_code, name, email, role, position,
  department, base_salary, employment_history, contact,
  is_active, created_at, updated_at
`;

async function findAll({ department } = {}) {
  if (department) {
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} FROM employees WHERE department = ? AND is_active = 1 ORDER BY name`,
      [department]
    );
    return rows;
  }
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM employees WHERE is_active = 1 ORDER BY name`
  );
  return rows;
}

async function findById(employeeId) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM employees WHERE employee_id = ?`,
    [employeeId]
  );
  return rows[0] || null;
}

// Includes password_hash — only for internal auth use, never returned to a client.
async function findByLoginIdentifier({ email, employeeCode }) {
  const [rows] = await pool.query(
    `SELECT * FROM employees WHERE email = ? OR employee_code = ? LIMIT 1`,
    [email || null, employeeCode || null]
  );
  return rows[0] || null;
}

async function create({
  employeeCode, name, email, passwordHash, role,
  position, department, baseSalary, employmentHistory, contact,
}) {
  const [result] = await pool.query(
    `INSERT INTO employees
       (employee_code, name, email, password_hash, role, position, department, base_salary, employment_history, contact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [employeeCode || null, name, email || null, passwordHash, role,
      position, department, baseSalary, employmentHistory || null, contact || null]
  );
  return findById(result.insertId);
}

async function update(employeeId, fields) {
  const allowed = ['name', 'email', 'position', 'department', 'base_salary', 'employment_history', 'contact', 'is_active'];
  const keys = Object.keys(fields).filter((k) => allowed.includes(k));
  if (keys.length === 0) return findById(employeeId);

  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => fields[k]);

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

export { findAll, findById, findByLoginIdentifier, create, update, remove };
