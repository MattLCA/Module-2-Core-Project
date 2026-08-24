import pool from "../config/db.js";

async function findAll() {
  const [rows] = await pool.query(
    `SELECT g.goal_id, g.employee_id, e.name AS owner_name, g.title, g.status,
            g.progress, g.due_date, g.created_at
     FROM goals g
     JOIN employees e ON e.employee_id = g.employee_id
     ORDER BY g.created_at DESC`,
  );
  return rows;
}

async function findById(goalId) {
  const [rows] = await pool.query(
    `SELECT g.goal_id, g.employee_id, e.name AS owner_name, g.title, g.status,
            g.progress, g.due_date, g.created_at
     FROM goals g
     JOIN employees e ON e.employee_id = g.employee_id
     WHERE g.goal_id = ?`,
    [goalId],
  );
  return rows[0] || null;
}

// "On track" for the stat card counts on_track + completed goals as
// healthy, at_risk/behind as not — matches the funnel styling used
// elsewhere (on-track/at-risk/behind pill classes).
async function getSummary() {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status IN ('on_track', 'completed') THEN 1 ELSE 0 END) AS onTrack
     FROM goals`,
  );
  const total = rows[0].total || 0;
  const onTrack = rows[0].onTrack || 0;
  const percentOnTrack = total ? Math.round((onTrack / total) * 100) : null;
  return { total, onTrack, percentOnTrack };
}

async function create({
  employeeId,
  title,
  status = "on_track",
  progress = 0,
  dueDate = null,
  createdBy = null,
}) {
  const [result] = await pool.query(
    `INSERT INTO goals (employee_id, title, status, progress, due_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [employeeId, title, status, progress, dueDate, createdBy],
  );
  return result.insertId;
}

async function update(goalId, { title, status, progress, dueDate }) {
  await pool.query(
    `UPDATE goals SET
       title = COALESCE(?, title),
       status = COALESCE(?, status),
       progress = COALESCE(?, progress),
       due_date = COALESCE(?, due_date)
     WHERE goal_id = ?`,
    [title ?? null, status ?? null, progress ?? null, dueDate ?? null, goalId],
  );
}

async function remove(goalId) {
  await pool.query(`DELETE FROM goals WHERE goal_id = ?`, [goalId]);
}

export { findAll, findById, getSummary, create, update, remove };
