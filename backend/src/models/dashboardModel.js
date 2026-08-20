/**
 * Dashboard aggregation queries. Pulls from employees, attendance, and
 * leave_requests to power the HR dashboard summary.
 *
 * NOTE on "start date": the employees table has no hire-date column, only
 * a free-text `employment_history` field (e.g. "Joined in 2015..."). We
 * extract the first 4-digit year from it, same as the existing frontend
 * (hr-dashboard.js `mapEmployee`), defaulting to 2020-01-01 if none found,
 * so the two stay consistent.
 *
 * NOTE on "on leave": matches the existing frontend's definition — an
 * employee counts as "on leave" if they have ANY leave request with
 * status 'Approved' (not scoped to whether that leave is happening right
 * now). Kept this way to match hr-dashboard.js exactly; worth revisiting
 * with your team if you want "currently on leave" instead.
 *
 * NOTE on schema: position and department are now normalized into their
 * own tables (positions, departments), referenced via position_id /
 * department_id — getRecentEmployees joins against them to recover the
 * readable names it needs.
 */
import pool from '../config/db.js';

function inferStartDate(employmentHistory) {
  const match = (employmentHistory || '').match(/\d{4}/);
  return match ? `${match[0]}-01-01` : '2020-01-01';
}

async function getTotalEmployees() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM employees WHERE is_active = 1`
  );
  return rows[0].count;
}

async function getApprovedLeaveEmployeeIds() {
  const [rows] = await pool.query(
    `SELECT DISTINCT employee_id FROM leave_requests WHERE status = 'Approved'`
  );
  return new Set(rows.map((r) => r.employee_id));
}

async function getPendingLeaveCount() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM leave_requests WHERE status = 'Pending'`
  );
  return rows[0].count;
}

async function getAttendanceSnapshot() {
  const [dateRows] = await pool.query(
    `SELECT MAX(date) AS latestDate FROM attendance`
  );
  const latestDate = dateRows[0].latestDate;
  if (!latestDate) {
    return { date: null, present: 0, absent: 0, percentPresent: null };
  }

  const [countRows] = await pool.query(
    `SELECT status, COUNT(*) AS count FROM attendance WHERE date = ? GROUP BY status`,
    [latestDate]
  );

  let present = 0;
  let absent = 0;
  countRows.forEach((row) => {
    if (row.status === 'Present') present = row.count;
    else if (row.status === 'Absent') absent = row.count;
  });

  const total = present + absent;
  const percentPresent = total ? Math.round((present / total) * 100) : null;

  return { date: latestDate, present, absent, percentPresent };
}

async function getRecentEmployees(limit = 5) {
  const [employees] = await pool.query(
    `SELECT e.employee_id, e.name,
            p.position_name AS position,
            d.department_name AS department,
            e.employment_history
     FROM employees e
     JOIN positions p ON e.position_id = p.position_id
     JOIN departments d ON e.department_id = d.department_id
     WHERE e.is_active = 1`
  );
  const approvedLeaveIds = await getApprovedLeaveEmployeeIds();

  return employees
    .map((e) => ({
      employeeId: e.employee_id,
      name: e.name,
      position: e.position,
      department: e.department,
      startDate: inferStartDate(e.employment_history),
      status: approvedLeaveIds.has(e.employee_id) ? 'leave' : 'active',
    }))
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, limit);
}

async function getLeaveFeed(limit = 8) {
  const [rows] = await pool.query(
    `SELECT lr.employee_id, e.name AS employee_name, lr.leave_type,
            lr.start_date, lr.reason, lr.status
     FROM leave_requests lr
     JOIN employees e ON e.employee_id = lr.employee_id
     ORDER BY lr.start_date DESC, lr.leave_id DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

async function getSummary() {
  const [
    totalEmployees,
    onLeaveEmployeeIds,
    pendingLeaveCount,
    attendance,
    recentEmployees,
    leaveFeed,
  ] = await Promise.all([
    getTotalEmployees(),
    getApprovedLeaveEmployeeIds(),
    getPendingLeaveCount(),
    getAttendanceSnapshot(),
    getRecentEmployees(),
    getLeaveFeed(),
  ]);

  return {
    totalEmployees,
    onLeaveCount: onLeaveEmployeeIds.size,
    pendingLeaveCount,
    attendance,
    recentEmployees,
    leaveFeed,
  };
}

export { getSummary }; 