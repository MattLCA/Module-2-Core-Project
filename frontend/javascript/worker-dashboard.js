// ============================================================
// ModernTech Worker Dashboard
// ============================================================
//
// Recent Activity now combines:
//
// 1. Clock In
// 2. Clock Out
// 3. Leave Requests
//
// Payslip downloads are intentionally NOT recorded here.
//
// All information comes from the backend/database.
// ============================================================

console.log("Worker Dashboard JS connected.");

// ============================================================
// VARIABLES
// ============================================================

// Leave requests returned by the dashboard API.
// We keep these here so they can be combined with attendance.
let dashboardLeaveRequests = [];

// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing Worker Dashboard...");

  // --------------------------------------------------------
  // Authentication
  // --------------------------------------------------------

  if (typeof requireWorkerLogin !== "function") {
    console.error("requireWorkerLogin() is not available.");

    return;
  }

  if (!requireWorkerLogin()) {
    return;
  }

  // --------------------------------------------------------
  // Sidebar
  // --------------------------------------------------------

  if (typeof initializeSidebar === "function") {
    initializeSidebar();
  }

  // --------------------------------------------------------
  // Dashboard buttons
  // --------------------------------------------------------

  initializeDashboardButtons();

  // --------------------------------------------------------
  // Load dashboard
  // --------------------------------------------------------

  await initializeWorkerDashboard();
});

// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeWorkerDashboard() {
  console.log("Loading worker dashboard...");

  // First load employee, leave, payslip and notification data.

  await loadDashboardData();

  // Then load attendance history.

  await loadDashboardAttendanceHistory();

  console.log("Worker Dashboard loaded successfully.");
}

// ============================================================
// LOAD DASHBOARD DATA
// ============================================================
//
// GET /api/worker/dashboard
//
// The backend returns:
//
// - employee
// - attendance
// - leaveBalances
// - recentLeaveRequests
// - latestPayslip
// - unreadNotifications
//
// ============================================================

async function loadDashboardData() {
  try {
    if (typeof getWorkerDashboard !== "function") {
      console.error("getWorkerDashboard() is not available.");

      return;
    }

    const response = await getWorkerDashboard();

    console.log("Dashboard API response:", response);

    const dashboard = extractDashboardData(response);

    if (!dashboard) {
      console.warn("No dashboard data returned.");

      return;
    }

    // --------------------------------------------------------
    // Employee
    // --------------------------------------------------------

    renderDashboardProfile(dashboard.employee);

    // --------------------------------------------------------
    // Today's attendance
    // --------------------------------------------------------

    renderTodayAttendance(dashboard.attendance);

    // --------------------------------------------------------
    // Leave balance
    // --------------------------------------------------------

    renderLeaveBalance(dashboard.leaveBalances);

    // --------------------------------------------------------
    // Latest payslip
    // --------------------------------------------------------

    renderLatestPayslip(dashboard.latestPayslip);

    // --------------------------------------------------------
    // Notification count
    // --------------------------------------------------------

    setTextIfExists("notificationCount", dashboard.unreadNotifications ?? 0);

    // --------------------------------------------------------
    // Recent leave requests
    // --------------------------------------------------------
    //
    // IMPORTANT:
    //
    // The backend is already returning these records.
    // We store them here and combine them with attendance
    // after attendance has been loaded.
    // --------------------------------------------------------

    dashboardLeaveRequests = Array.isArray(dashboard.recentLeaveRequests)
      ? dashboard.recentLeaveRequests
      : [];

    console.log("Dashboard leave requests:", dashboardLeaveRequests);
  } catch (error) {
    console.error("Could not load dashboard data:", error);

    setText("todayStatus", "Unable to load");

    setText("leaveBalanceDash", "Unavailable");

    setText("netPayDash", "Unavailable");
  }
}

// ============================================================
// EXTRACT DASHBOARD DATA
// ============================================================

function extractDashboardData(response) {
  if (!response) {
    return null;
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (response.dashboard && typeof response.dashboard === "object") {
    return response.dashboard;
  }

  if (typeof response === "object") {
    return response;
  }

  return null;
}

// ============================================================
// PROFILE
// ============================================================

function renderDashboardProfile(profile) {
  if (!profile) {
    return;
  }

  const fullName = profile.name ?? "Worker";

  const employeeCode = profile.employeeCode ?? profile.employee_code ?? "--";

  const firstName = String(fullName).trim().split(/\s+/)[0] || "Worker";

  setText("welcomeName", firstName);

  setText("sidebarWorkerName", fullName);

  setText("sidebarEmployeeCode", employeeCode);

  const avatar = document.getElementById("sidebarAvatar");

  if (avatar) {
    avatar.textContent = getInitials(fullName);
  }

  // Save employee profile information only.

  if (typeof saveLoggedInWorker === "function") {
    saveLoggedInWorker(profile);
  }
}

// ============================================================
// TODAY'S ATTENDANCE
// ============================================================

function renderTodayAttendance(attendance) {
  // --------------------------------------------------------
  // No attendance record
  // --------------------------------------------------------

  if (!attendance) {
    setText("todayStatus", "Not clocked in");

    updateQuickClockButton({
      state: "CLOCKED_OUT",
    });

    return;
  }

  const clockIn = attendance.clockIn ?? attendance.clock_in ?? null;

  const clockOut = attendance.clockOut ?? attendance.clock_out ?? null;

  // --------------------------------------------------------
  // Already clocked out
  // --------------------------------------------------------

  if (clockOut) {
    setText("todayStatus", "Clocked out");

    updateQuickClockButton({
      state: "CLOCKED_OUT",
    });

    return;
  }

  // --------------------------------------------------------
  // Currently working
  // --------------------------------------------------------

  if (clockIn) {
    setText("todayStatus", "Clocked in");

    updateQuickClockButton({
      state: "WORKING",
    });

    return;
  }

  // --------------------------------------------------------
  // Fallback
  // --------------------------------------------------------

  setText("todayStatus", "Not clocked in");

  updateQuickClockButton({
    state: "CLOCKED_OUT",
  });
}

// ============================================================
// QUICK CLOCK BUTTON
// ============================================================

function updateQuickClockButton(status) {
  const button = document.getElementById("quickClockBtn");

  if (!button) {
    return;
  }

  const state = status?.state;

  // --------------------------------------------------------
  // WORKING
  // --------------------------------------------------------

  if (state === "WORKING") {
    button.disabled = false;

    button.innerHTML = `
            <i class="ti ti-logout-2"></i>
            Clock Out
        `;

    return;
  }

  // --------------------------------------------------------
  // CLOCKED OUT
  // --------------------------------------------------------

  if (state === "CLOCKED_OUT") {
    button.disabled = false;

    button.innerHTML = `
            <i class="ti ti-login-2"></i>
            Clock In
        `;

    return;
  }

  // --------------------------------------------------------
  // Loading / unknown
  // --------------------------------------------------------

  button.disabled = true;

  button.innerHTML = `
        <i class="ti ti-clock"></i>
        Loading...
    `;
}

// ============================================================
// DASHBOARD BUTTON
// ============================================================

function initializeDashboardButtons() {
  const quickClockButton = document.getElementById("quickClockBtn");

  if (!quickClockButton) {
    return;
  }

  quickClockButton.addEventListener("click", async () => {
    await handleQuickClock();
  });
}

// ============================================================
// HANDLE QUICK CLOCK
// ============================================================

async function handleQuickClock() {
  const button = document.getElementById("quickClockBtn");

  if (!button) {
    return;
  }

  try {
    button.disabled = true;

    // ----------------------------------------------------
    // Always check the database first.
    // ----------------------------------------------------

    const currentStatus = await getWorkerClockStatus();

    console.log("Current attendance status:", currentStatus);

    const state = currentStatus?.state;

    // ----------------------------------------------------
    // CLOCKED OUT → CLOCK IN
    // ----------------------------------------------------

    if (state === "CLOCKED_OUT") {
      const response = await workerClockIn();

      showToast(response?.message || "Clocked in successfully.");
    }

    // ----------------------------------------------------
    // WORKING → CLOCK OUT
    // ----------------------------------------------------
    else if (state === "WORKING") {
      const response = await workerClockOut();

      showToast(response?.message || "Clocked out successfully.");
    } else {
      throw new Error("Unable to determine your attendance status.");
    }

    // ----------------------------------------------------
    // Reload dashboard data.
    // ----------------------------------------------------

    await loadDashboardData();

    await loadDashboardAttendanceHistory();
  } catch (error) {
    console.error("Quick clock error:", error);

    showToast(error.message || "Attendance action failed.");
  } finally {
    try {
      const refreshedStatus = await getWorkerClockStatus();

      updateQuickClockButton(refreshedStatus);
    } catch (error) {
      console.error("Could not refresh clock button:", error);

      button.disabled = false;
    }
  }
}

// ============================================================
// LEAVE BALANCE
// ============================================================

function renderLeaveBalance(balances) {
  if (!Array.isArray(balances)) {
    setText("leaveBalanceDash", "0 days");

    return;
  }

  let totalRemaining = 0;

  balances.forEach((balance) => {
    const value = Number(balance.remainingDays ?? balance.remaining_days ?? 0);

    if (Number.isFinite(value)) {
      totalRemaining += value;
    }
  });

  const formatted = Number.isInteger(totalRemaining)
    ? totalRemaining
    : totalRemaining.toFixed(2);

  setText("leaveBalanceDash", `${formatted} days`);
}

// ============================================================
// LATEST PAYSLIP
// ============================================================

function renderLatestPayslip(payslip) {
  if (!payslip) {
    setText("netPayDash", "No payslip");

    return;
  }

  const finalSalary = payslip.finalSalary ?? payslip.final_salary ?? null;

  if (finalSalary === null || finalSalary === undefined) {
    setText("netPayDash", "Unavailable");

    return;
  }

  setText("netPayDash", formatCurrency(finalSalary));
}

// ============================================================
// LOAD ATTENDANCE HISTORY
// ============================================================
//
// We now use attendance AND the leave requests already loaded
// by loadDashboardData().
// ============================================================

async function loadDashboardAttendanceHistory() {
  try {
    if (typeof getWorkerAttendanceHistory !== "function") {
      console.error("getWorkerAttendanceHistory() is not available.");

      renderRecentActivity([], dashboardLeaveRequests);

      return;
    }

    const response = await getWorkerAttendanceHistory();

    const attendance = extractArray(response);

    console.log("Dashboard attendance history:", attendance);

    // ----------------------------------------------------
    // IMPORTANT:
    //
    // Do NOT render attendance by itself.
    //
    // Combine attendance + leave requests instead.
    // ----------------------------------------------------

    renderRecentActivity(attendance, dashboardLeaveRequests);
  } catch (error) {
    console.error("Could not load attendance history:", error);

    // Even if attendance fails, show leave activity.

    renderRecentActivity([], dashboardLeaveRequests);
  }
}

// ============================================================
// RECENT ACTIVITY
// ============================================================
//
// Combines:
//
// - Clock In
// - Clock Out
// - Leave Request
//
// Newest activities appear first.
// ============================================================

function renderRecentActivity(attendance, leaveRequests) {
  const tbody = document.getElementById("dashboardActivity");

  if (!tbody) {
    return;
  }

  const activities = [];

  // ========================================================
  // ATTENDANCE ACTIVITY
  // ========================================================

  if (Array.isArray(attendance)) {
    attendance.forEach((record) => {
      const date =
        record.attendanceDate ?? record.attendance_date ?? record.date;

      const clockIn = record.clockIn ?? record.clock_in;

      const clockOut = record.clockOut ?? record.clock_out;

      // ------------------------------------------------
      // Clock In
      // ------------------------------------------------

      if (clockIn) {
        activities.push({
          date: date,

          time: clockIn,

          activity: "Clock In",

          status: "Present",

          sortDate: parseActivityDateTime(date, clockIn),
        });
      }

      // ------------------------------------------------
      // Clock Out
      // ------------------------------------------------

      if (clockOut) {
        activities.push({
          date: date,

          time: clockOut,

          activity: "Clock Out",

          status: "Present",

          sortDate: parseActivityDateTime(date, clockOut),
        });
      }
    });
  }

  // ========================================================
  // LEAVE REQUEST ACTIVITY
  // ========================================================

  if (Array.isArray(leaveRequests)) {
    leaveRequests.forEach((request) => {
      const submittedDate =
        request.submittedDate ??
        request.submitted_date ??
        request.startDate ??
        request.start_date;

      const leaveType =
        request.leaveTypeName ?? request.leave_type_name ?? "Leave";

      const status = request.status ?? "Pending";

      activities.push({
        date: submittedDate,

        time: null,

        activity: `Leave Request - ${leaveType}`,

        status: status,

        sortDate: parseActivityDateTime(submittedDate, "23:59:59"),
      });
    });
  }

  // ========================================================
  // SORT NEWEST FIRST
  // ========================================================

  activities.sort((a, b) => b.sortDate - a.sortDate);

  // --------------------------------------------------------
  // Show the five most recent activities.
  // --------------------------------------------------------

  const recentActivities = activities.slice(0, 5);

  // ========================================================
  // NO ACTIVITY
  // ========================================================

  if (recentActivities.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    No recent activity yet.
                </td>
            </tr>
        `;

    return;
  }

  // ========================================================
  // RENDER
  // ========================================================

  tbody.innerHTML = recentActivities
    .map((activity) => {
      return `
                        <tr>

                            <td>
                                ${escapeHTML(formatActivityDate(activity.date))}
                            </td>

                            <td>
                                ${escapeHTML(activity.activity)}
                            </td>

                            <td>
                                ${escapeHTML(activity.status)}
                            </td>

                        </tr>
                    `;
    })
    .join("");
}

// ============================================================
// HELPERS
// ============================================================

function extractArray(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.rows)) {
    return response.data.rows;
  }

  if (Array.isArray(response?.rows)) {
    return response.rows;
  }

  return [];
}

// ============================================================
// SET TEXT
// ============================================================

function setText(elementId, value) {
  const element = document.getElementById(elementId);

  if (element) {
    element.textContent = value ?? "";
  }
}

// ============================================================
// SET TEXT IF EXISTS
// ============================================================

function setTextIfExists(elementId, value) {
  const element = document.getElementById(elementId);

  if (element && value !== undefined && value !== null) {
    element.textContent = value;
  }
}

// ============================================================
// GET INITIALS
// ============================================================

function getInitials(name) {
  if (!name) {
    return "--";
  }

  const parts = String(name).trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ============================================================
// PARSE DATE + TIME
// ============================================================

function parseActivityDateTime(date, time) {
  if (!date) {
    return 0;
  }

  const timestamp = new Date(`${date} ${time || ""}`).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// ============================================================
// FORMAT ACTIVITY DATE
// ============================================================

function formatActivityDate(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(`${String(value).substring(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });
}

// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",

    currency: "ZAR",

    maximumFractionDigits: 2,
  }).format(number);
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
