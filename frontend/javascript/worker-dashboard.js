// ============================================================
// ModernTech Worker Dashboard
// ============================================================

console.log("Worker Dashboard JS connected.");

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
  // Dashboard button
  // --------------------------------------------------------

  initializeDashboardButtons();

  // --------------------------------------------------------
  // Load dashboard from database
  // --------------------------------------------------------

  await initializeWorkerDashboard();
});

// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeWorkerDashboard() {
  console.log("Loading worker dashboard...");

  await loadDashboardData();

  await loadDashboardAttendanceHistory();

  console.log("Worker Dashboard loaded successfully.");
}

// ============================================================
// LOAD DASHBOARD DATA
// ============================================================
// Uses:
//
// GET /api/worker/dashboard
//
// The backend already returns:
//
// - employee
// - attendance
// - leaveBalances
// - recentLeaveRequests
// - latestPayslip
// - unreadNotifications
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

  // Save profile information only.
  // Attendance state is NOT stored here.

  if (typeof saveLoggedInWorker === "function") {
    saveLoggedInWorker(profile);
  }
}

// ============================================================
// TODAY'S ATTENDANCE
// ============================================================

function renderTodayAttendance(attendance) {
  // --------------------------------------------------------
  // No attendance record for today
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
  // After Clock In:
  //
  // [ Clock Out ]
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
  // Before Clock In or after Clock Out:
  //
  // [ Clock In ]
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
  // Unknown / loading state
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

    // --------------------------------------------------------
    // Always check MySQL-backed status first.
    // --------------------------------------------------------

    const currentStatus = await getWorkerClockStatus();

    console.log("Current attendance status:", currentStatus);

    const state = currentStatus?.state;

    // --------------------------------------------------------
    // CLOCKED OUT → CLOCK IN
    // --------------------------------------------------------

    if (state === "CLOCKED_OUT") {
      const response = await workerClockIn();

      showToast(response?.message || "Clocked in successfully.");
    }

    // --------------------------------------------------------
    // WORKING → CLOCK OUT
    // --------------------------------------------------------
    else if (state === "WORKING") {
      const response = await workerClockOut();

      showToast(response?.message || "Clocked out successfully.");
    }

    // --------------------------------------------------------
    // Unknown state
    // --------------------------------------------------------
    else {
      throw new Error("Unable to determine your attendance status.");
    }

    // --------------------------------------------------------
    // Reload dashboard data from database
    // --------------------------------------------------------

    await loadDashboardData();

    await loadDashboardAttendanceHistory();
  } catch (error) {
    console.error("Quick clock error:", error);

    showToast(error.message || "Attendance action failed.");
  } finally {
    // --------------------------------------------------------
    // Get the final state from the database.
    //
    // This is what determines whether the button says
    // Clock In or Clock Out.
    // --------------------------------------------------------

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
// ATTENDANCE HISTORY
// ============================================================

async function loadDashboardAttendanceHistory() {
  try {
    if (typeof getWorkerAttendanceHistory !== "function") {
      return;
    }

    const response = await getWorkerAttendanceHistory();

    const attendance = extractArray(response);

    renderAttendanceActivity(attendance);
  } catch (error) {
    console.error("Could not load attendance history:", error);

    const tbody = document.getElementById("dashboardActivity");

    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="3">
                        Unable to load activity.
                    </td>
                </tr>
                `;
    }
  }
}

// ============================================================
// ATTENDANCE ACTIVITY
// ============================================================

function renderAttendanceActivity(attendance) {
  const tbody = document.getElementById("dashboardActivity");

  if (!tbody) {
    return;
  }

  if (!Array.isArray(attendance) || attendance.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    No attendance activity yet.
                </td>
            </tr>
            `;

    return;
  }

  const activities = [];

  attendance.forEach((record) => {
    const date = record.attendanceDate ?? record.attendance_date ?? record.date;

    const clockIn = record.clockIn ?? record.clock_in;

    const clockOut = record.clockOut ?? record.clock_out;

    if (clockIn) {
      activities.push({
        date: date,

        time: clockIn,

        activity: "Clock In",

        status: "Present",
      });
    }

    if (clockOut) {
      activities.push({
        date: date,

        time: clockOut,

        activity: "Clock Out",

        status: "Present",
      });
    }
  });

  activities.sort((a, b) => {
    const first = parseActivityDateTime(a.date, a.time);

    const second = parseActivityDateTime(b.date, b.time);

    return second - first;
  });

  const recentActivities = activities.slice(0, 5);

  if (recentActivities.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    No attendance activity yet.
                </td>
            </tr>
            `;

    return;
  }

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

function setText(elementId, value) {
  const element = document.getElementById(elementId);

  if (element) {
    element.textContent = value ?? "";
  }
}

function setTextIfExists(elementId, value) {
  const element = document.getElementById(elementId);

  if (element && value !== undefined && value !== null) {
    element.textContent = value;
  }
}

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

function parseActivityDateTime(date, time) {
  if (!date) {
    return 0;
  }

  const timestamp = new Date(`${date} ${time || ""}`).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

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
