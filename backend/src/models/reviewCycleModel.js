import pool from '../config/db.js';

async function getActiveCycle() {
  const [rows] = await pool.query(
    `SELECT review_cycle_id, cycle_name, start_date, end_date
     FROM review_cycles
     WHERE is_active = 1
     ORDER BY review_cycle_id DESC
     LIMIT 1`
  );
  return rows[0] || null;
}

// Percentage of employees in the cycle who've hit each of the four
// funnel stages. Powers the "Review cycle progress" bars on the
// Performance page — these used to be hardcoded 92/68/40/22.
async function getFunnel(reviewCycleId) {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(self_review_submitted) AS selfReviewCount,
       SUM(manager_review_submitted) AS managerReviewCount,
       SUM(calibration_complete) AS calibrationCount,
       SUM(finalized) AS finalizedCount
     FROM review_cycle_progress
     WHERE review_cycle_id = ?`,
    [reviewCycleId]
  );

  const r = rows[0];
  const total = r.total || 0;
  const pct = (n) => (total ? Math.round((Number(n) / total) * 100) : 0);

  return {
    total,
    selfReviewSubmittedPct: pct(r.selfReviewCount),
    managerReviewSubmittedPct: pct(r.managerReviewCount),
    calibrationCompletePct: pct(r.calibrationCount),
    finalizedPct: pct(r.finalizedCount),
  };
}

async function getProgressForEmployee(reviewCycleId, employeeId) {
  const [rows] = await pool.query(
    `SELECT self_review_submitted, manager_review_submitted, calibration_complete, finalized
     FROM review_cycle_progress
     WHERE review_cycle_id = ? AND employee_id = ?`,
    [reviewCycleId, employeeId]
  );
  return rows[0] || null;
}

const STAGE_COLUMNS = ['self_review_submitted', 'manager_review_submitted', 'calibration_complete', 'finalized'];

async function updateProgress(reviewCycleId, employeeId, flags) {
  const fields = [];
  const values = [];

  for (const key of STAGE_COLUMNS) {
    if (key in flags) {
      fields.push(`${key} = ?`);
      values.push(flags[key] ? 1 : 0);
    }
  }
  if (!fields.length) return;

  values.push(reviewCycleId, employeeId);
  await pool.query(
    `UPDATE review_cycle_progress SET ${fields.join(', ')}
     WHERE review_cycle_id = ? AND employee_id = ?`,
    values
  );
}

export { getActiveCycle, getFunnel, getProgressForEmployee, updateProgress };