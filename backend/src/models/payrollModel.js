/**
 * Payroll data-access layer. All queries are parameterized (`?`) —
 * never string-concatenate user input into SQL.
 *
 * Matches the actual `payroll` table in moderntech_hr.sql:
 *   payroll_id, employee_id, pay_period, hours_worked,
 *   leave_deductions, final_salary, created_at
 * (no bonuses/status/paid_at columns — those were an earlier, incorrect
 * assumption before the real schema was available.)
 */
import pool from '../config/db.js';

// Standard full-time hours in a month, used as the default for
// generateForPeriod() and to derive an hourly rate from base_salary.
// ASSUMPTION: base_salary is monthly and this is the divisor for the
// hourly rate — adjust if your team's payroll spec says otherwise.
const STANDARD_MONTHLY_HOURS = 160;

function computeFinalSalary({ baseSalary, hoursWorked, leaveDeductions }) {
  const hourlyRate = Number(baseSalary) / STANDARD_MONTHLY_HOURS;
  const gross = hourlyRate * Number(hoursWorked);
  return Math.round((gross - Number(leaveDeductions)) * 100) / 100;
}

async function findAll({ payPeriod, employeeId } = {}) {
  const conditions = [];
  const params = [];

  if (payPeriod) {
    conditions.push('p.pay_period = ?');
    params.push(payPeriod);
  }
  if (employeeId) {
    conditions.push('p.employee_id = ?');
    params.push(employeeId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT p.*, e.name AS employee_name, e.department, e.position, e.base_salary
     FROM payroll p
     JOIN employees e ON e.employee_id = p.employee_id
     ${where}
     ORDER BY p.pay_period DESC, e.name`,
    params
  );
  return rows;
}

async function findById(payrollId) {
  const [rows] = await pool.query(
    `SELECT p.*, e.name AS employee_name, e.department, e.position, e.base_salary
     FROM payroll p
     JOIN employees e ON e.employee_id = p.employee_id
     WHERE p.payroll_id = ?`,
    [payrollId]
  );
  return rows[0] || null;
}

async function findByEmployeeAndPeriod(employeeId, payPeriod) {
  const [rows] = await pool.query(
    `SELECT * FROM payroll WHERE employee_id = ? AND pay_period = ?`,
    [employeeId, payPeriod]
  );
  return rows[0] || null;
}

// employeeId, payPeriod, hoursWorked, leaveDeductions are supplied by the
// caller; final_salary is derived from the employee's current base_salary.
async function create({ employeeId, payPeriod, hoursWorked, leaveDeductions = 0 }) {
  const [empRows] = await pool.query(
    `SELECT base_salary FROM employees WHERE employee_id = ?`,
    [employeeId]
  );
  if (!empRows[0]) return null;

  const finalSalary = computeFinalSalary({
    baseSalary: empRows[0].base_salary,
    hoursWorked,
    leaveDeductions,
  });

  const [result] = await pool.query(
    `INSERT INTO payroll (employee_id, pay_period, hours_worked, leave_deductions, final_salary)
     VALUES (?, ?, ?, ?, ?)`,
    [employeeId, payPeriod, hoursWorked, leaveDeductions, finalSalary]
  );
  return findById(result.insertId);
}

// Bulk-generates one payroll record per active employee for a pay period,
// using STANDARD_MONTHLY_HOURS and 0 leave_deductions as defaults. HR can
// PATCH individual records afterward to correct hours_worked/leave_deductions
// once attendance/leave data for the period is finalized.
async function generateForPeriod(payPeriod) {
  const [employees] = await pool.query(
    `SELECT employee_id FROM employees
     WHERE is_active = 1
       AND employee_id NOT IN (
         SELECT employee_id FROM payroll WHERE pay_period = ?
       )`,
    [payPeriod]
  );

  const created = [];
  for (const emp of employees) {
    // eslint-disable-next-line no-await-in-loop -- payroll runs are infrequent; sequential is fine and keeps it simple.
    const record = await create({
      employeeId: emp.employee_id,
      payPeriod,
      hoursWorked: STANDARD_MONTHLY_HOURS,
      leaveDeductions: 0,
    });
    created.push(record);
  }
  return created;
}

async function update(payrollId, fields) {
  const existing = await findById(payrollId);
  if (!existing) return null;

  const hoursWorked = fields.hoursWorked ?? existing.hours_worked;
  const leaveDeductions = fields.leaveDeductions ?? existing.leave_deductions;
  const finalSalary = computeFinalSalary({
    baseSalary: existing.base_salary,
    hoursWorked,
    leaveDeductions,
  });

  await pool.query(
    `UPDATE payroll SET hours_worked = ?, leave_deductions = ?, final_salary = ? WHERE payroll_id = ?`,
    [hoursWorked, leaveDeductions, finalSalary, payrollId]
  );
  return findById(payrollId);
}

async function remove(payrollId) {
  const [result] = await pool.query(
    `DELETE FROM payroll WHERE payroll_id = ?`,
    [payrollId]
  );
  return result.affectedRows > 0;
}

export {
  findAll,
  findById,
  findByEmployeeAndPeriod,
  create,
  generateForPeriod,
  update,
  remove,
  STANDARD_MONTHLY_HOURS,
};
