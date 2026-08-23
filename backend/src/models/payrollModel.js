// ============================================================
// ModernTech Payroll Model
// ============================================================

import pool from "../config/db.js";

// ============================================================
// COMMON PAYROLL SELECT
// ============================================================

const PAYROLL_SELECT = `

    SELECT

        p.payroll_id AS payrollId,

        p.employee_id AS employeeId,

        e.employee_code AS employeeCode,
        e.name AS employeeName,
        e.email AS employeeEmail,

        pos.position_name AS positionName,

        d.department_name AS departmentName,

        e.base_salary AS baseSalary,

        p.pay_period AS payPeriod,

        p.hours_worked AS hoursWorked,

        p.overtime_pay AS overtimePay,

        p.transport_allowance
            AS transportAllowance,

        p.bonus,

        p.paye_tax AS payeTax,

        p.uif,

        p.pension,

        p.medical_aid AS medicalAid,

        p.leave_deductions
            AS leaveDeductions,

        (
            e.base_salary
            + p.overtime_pay
            + p.transport_allowance
            + p.bonus
        )
            AS totalEarnings,

        (
            p.paye_tax
            + p.uif
            + p.pension
            + p.medical_aid
            + p.leave_deductions
        )
            AS totalDeductions,

        (
            e.base_salary
            + p.overtime_pay
            + p.transport_allowance
            + p.bonus
            -
            p.paye_tax
            - p.uif
            - p.pension
            - p.medical_aid
            - p.leave_deductions
        )
            AS calculatedFinalSalary,

        p.final_salary AS finalSalary,

        p.created_at AS createdAt

    FROM payroll p

    INNER JOIN employees e
        ON e.employee_id =
           p.employee_id

    INNER JOIN positions pos
        ON pos.position_id =
           e.position_id

    INNER JOIN departments d
        ON d.department_id =
           e.department_id

`;

// ============================================================
// FIND PAYROLL
// ============================================================

async function findAll({ payPeriod = null, employeeId = null } = {}) {
  const conditions = [];
  const params = [];

  if (payPeriod) {
    conditions.push("p.pay_period = ?");

    params.push(payPeriod);
  }

  if (employeeId) {
    conditions.push("p.employee_id = ?");

    params.push(employeeId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `
            ${PAYROLL_SELECT}

            ${where}

            ORDER BY
                p.pay_period DESC,
                e.name
            `,

    params,
  );

  return rows;
}

// ============================================================
// FIND ONE
// ============================================================

async function findById(payrollId) {
  const [rows] = await pool.query(
    `
            ${PAYROLL_SELECT}

            WHERE
                p.payroll_id = ?

            LIMIT 1
            `,

    [payrollId],
  );

  return rows[0] || null;
}

// ============================================================
// FIND EMPLOYEE + PERIOD
// ============================================================

async function findByEmployeeAndPeriod(employeeId, payPeriod) {
  const [rows] = await pool.query(
    `
            SELECT *
            FROM payroll

            WHERE employee_id = ?
            AND pay_period = ?

            LIMIT 1
            `,

    [employeeId, payPeriod],
  );

  return rows[0] || null;
}

// ============================================================
// CALCULATE FINAL SALARY
// ============================================================

function calculateFinalSalary({
  baseSalary,
  overtimePay = 0,
  transportAllowance = 0,
  bonus = 0,

  payeTax = 0,
  uif = 0,
  pension = 0,
  medicalAid = 0,
  leaveDeductions = 0,
}) {
  const earnings =
    Number(baseSalary) +
    Number(overtimePay) +
    Number(transportAllowance) +
    Number(bonus);

  const deductions =
    Number(payeTax) +
    Number(uif) +
    Number(pension) +
    Number(medicalAid) +
    Number(leaveDeductions);

  return Number((earnings - deductions).toFixed(2));
}

// ============================================================
// CREATE PAYROLL
// ============================================================

async function create(data) {
  const {
    employeeId,
    payPeriod,
    hoursWorked = 0,

    overtimePay = 0,
    transportAllowance = 0,
    bonus = 0,

    payeTax = 0,
    uif = 0,
    pension = 0,
    medicalAid = 0,

    leaveDeductions = 0,
  } = data;

  const [employeeRows] = await pool.query(
    `
            SELECT base_salary
            FROM employees

            WHERE employee_id = ?

            LIMIT 1
            `,

    [employeeId],
  );

  if (!employeeRows[0]) {
    return null;
  }

  const baseSalary = Number(employeeRows[0].base_salary);

  const finalSalary = calculateFinalSalary({
    baseSalary,

    overtimePay,
    transportAllowance,
    bonus,

    payeTax,
    uif,
    pension,
    medicalAid,

    leaveDeductions,
  });

  const [result] = await pool.query(
    `
            INSERT INTO payroll (

                employee_id,
                pay_period,
                hours_worked,

                overtime_pay,
                transport_allowance,
                bonus,

                paye_tax,
                uif,
                pension,
                medical_aid,

                leave_deductions,
                final_salary

            )

            VALUES (
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?
            )
            `,

    [
      employeeId,
      payPeriod,
      hoursWorked,

      overtimePay,
      transportAllowance,
      bonus,

      payeTax,
      uif,
      pension,
      medicalAid,

      leaveDeductions,
      finalSalary,
    ],
  );

  return findById(result.insertId);
}

// ============================================================
// UPDATE PAYROLL
// ============================================================

async function update(payrollId, fields) {
  const existing = await findById(payrollId);

  if (!existing) {
    return null;
  }

  const values = {
    hoursWorked: fields.hoursWorked ?? existing.hoursWorked,

    overtimePay: fields.overtimePay ?? existing.overtimePay,

    transportAllowance:
      fields.transportAllowance ?? existing.transportAllowance,

    bonus: fields.bonus ?? existing.bonus,

    payeTax: fields.payeTax ?? existing.payeTax,

    uif: fields.uif ?? existing.uif,

    pension: fields.pension ?? existing.pension,

    medicalAid: fields.medicalAid ?? existing.medicalAid,

    leaveDeductions: fields.leaveDeductions ?? existing.leaveDeductions,
  };

  const finalSalary = calculateFinalSalary({
    baseSalary: existing.baseSalary,

    ...values,
  });

  await pool.query(
    `
        UPDATE payroll

        SET

            hours_worked = ?,

            overtime_pay = ?,

            transport_allowance = ?,

            bonus = ?,

            paye_tax = ?,

            uif = ?,

            pension = ?,

            medical_aid = ?,

            leave_deductions = ?,

            final_salary = ?

        WHERE payroll_id = ?
        `,

    [
      values.hoursWorked,

      values.overtimePay,

      values.transportAllowance,

      values.bonus,

      values.payeTax,

      values.uif,

      values.pension,

      values.medicalAid,

      values.leaveDeductions,

      finalSalary,

      payrollId,
    ],
  );

  return findById(payrollId);
}

// ============================================================
// DELETE
// ============================================================

async function remove(payrollId) {
  const [result] = await pool.query(
    `
            DELETE FROM payroll
            WHERE payroll_id = ?
            `,

    [payrollId],
  );

  return result.affectedRows > 0;
}

export {
  findAll,
  findById,
  findByEmployeeAndPeriod,
  create,
  update,
  remove,
  calculateFinalSalary,
};
