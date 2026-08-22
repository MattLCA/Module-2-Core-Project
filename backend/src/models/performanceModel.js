/**
 * Performance review data-access layer. All queries are parameterized.
 *
 * Updated for the normalized (3NF) schema: `employees` no longer has
 * inline `position`/`department` columns, so those are pulled in via
 * joins to `positions`/`departments`.
 *
 * One row per employee in `performance_reviews` — submitting a review
 * overwrites the existing one (upsert), matching the frontend's
 * "Start review" / "Edit review" behavior. Employees with no review yet
 * simply have no row, and findAll() LEFT JOINs so they still show up
 * (with null rating/notes) so the UI can offer "Start review" for them.
 */
import pool from '../config/db.js';

const EMPLOYEE_JOIN = `
  JOIN departments d ON d.department_id = e.department_id
  JOIN positions pos ON pos.position_id = e.position_id
`;

// Returns every active employee with their review data if one exists.
async function findAll() {
  const [rows] = await pool.query(
    `SELECT e.employee_id, e.name, pos.position_name AS position, d.department_name AS department,
            pr.rating, pr.goal_progress, pr.notes, pr.review_date
     FROM employees e
     ${EMPLOYEE_JOIN}
     LEFT JOIN performance_reviews pr ON pr.employee_id = e.employee_id
     WHERE e.is_active = 1
     ORDER BY e.name`
  );
  return rows;
}

async function findByEmployee(employeeId) {
  const [rows] = await pool.query(
    `SELECT e.employee_id, e.name, pos.position_name AS position, d.department_name AS department,
            pr.rating, pr.goal_progress, pr.notes, pr.review_date
     FROM employees e
     ${EMPLOYEE_JOIN}
     LEFT JOIN performance_reviews pr ON pr.employee_id = e.employee_id
     WHERE e.employee_id = ?`,
    [employeeId]
  );
  return rows[0] || null;
}

// Creates or overwrites the employee's review (one row per employee).
async function upsert(employeeId, { rating, notes = null, goalProgress = null, reviewedBy = null }) {
  await pool.query(
    `INSERT INTO performance_reviews (employee_id, rating, goal_progress, notes, review_date, reviewed_by)
     VALUES (?, ?, ?, ?, CURDATE(), ?)
     ON DUPLICATE KEY UPDATE
       rating = VALUES(rating),
       goal_progress = VALUES(goal_progress),
       notes = VALUES(notes),
       review_date = VALUES(review_date),
       reviewed_by = VALUES(reviewed_by)`,
    [employeeId, rating, goalProgress, notes, reviewedBy]
  );
  return findByEmployee(employeeId);
}

// Aggregate stats for the stat cards. "Overdue" here means rating < 3.0,
// matching the existing frontend's status-pill logic (not literally an
// overdue/late review).
async function getSummary() {
  const employees = await findAll();
  const reviewed = employees.filter((e) => e.rating !== null);

  const avgRating = reviewed.length
    ? Math.round((reviewed.reduce((sum, e) => sum + Number(e.rating), 0) / reviewed.length) * 10) / 10
    : null;

  const overdueCount = reviewed.filter((e) => Number(e.rating) < 3.0).length;

  return {
    avgRating,
    reviewsCompleted: reviewed.length,
    reviewsTotal: employees.length,
    overdueCount,
  };
}

export { findAll, findByEmployee, upsert, getSummary };