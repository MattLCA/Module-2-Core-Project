// ============================================================
// ModernTech Worker Attendance
// ============================================================

console.log("Worker Attendance JS connected.");

let attendanceHistory = [];

// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof requireWorkerLogin === "function" && !requireWorkerLogin()) {
    return;
  }

  if (typeof initializeStoredEmployee === "function") {
    initializeStoredEmployee();
  }

  initializeAttendanceButtons();

  await loadAttendance();
});

// ============================================================
// LOAD ATTENDANCE
// ============================================================

async function loadAttendance() {
  try {
    const [statusResponse, historyResponse] = await Promise.all([
      getWorkerClockStatus(),

      getWorkerAttendanceHistory(),
    ]);

    console.log("Clock status:", statusResponse);

    console.log("Attendance history:", historyResponse);

    renderClockStatus(statusResponse);

    attendanceHistory = historyResponse?.data || [];

    renderAttendanceHistory(attendanceHistory);
  } catch (error) {
    console.error("Attendance error:", error);

    showToast(error.message || "Could not load attendance.");
  }
}

// ============================================================
// BUTTONS
// ============================================================

function initializeAttendanceButtons() {
  document.querySelectorAll("[data-attendance]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.attendance;

      await handleAttendanceAction(action);
    });
  });
}

// ============================================================
// HANDLE ACTION
// ============================================================

async function handleAttendanceAction(action) {
  try {
    let response;

    switch (action) {
      case "Clock In":
        response = await workerClockIn();

        break;

      case "Clock Out":
        response = await workerClockOut();

        break;

      default:
        return;
    }

    showToast(response?.message || `${action} successful.`);

    // Reload attendance directly from the database.

    await loadAttendance();
  } catch (error) {
    console.error(`${action} error:`, error);

    showToast(error.message || `${action} failed.`);
  }
}

// ============================================================
// CLOCK STATUS
// ============================================================

function renderClockStatus(response) {
  const statusElement = document.getElementById("attendanceStatus");

  const lastActionElement = document.getElementById("lastAttendanceAction");

  if (!response) {
    return;
  }

  const state = response.state;

  // --------------------------------------------------------
  // CURRENT STATUS
  // --------------------------------------------------------

  let status = "Not clocked in";

  if (state === "WORKING") {
    status = "Working";
  } else if (state === "CLOCKED_OUT") {
    status = "Clocked Out";
  }

  if (statusElement) {
    statusElement.textContent = status;
  }

  // --------------------------------------------------------
  // LAST ACTION
  // --------------------------------------------------------
  //
  // Use today's database record.
  //
  // If clocked out:
  //     Clock Out 17:02
  //
  // If still working:
  //     Clock In 08:05
  //
  // --------------------------------------------------------

  const record = response.activeRecord || response.todayAttendance;

  if (record && lastActionElement) {
    const clockIn = record.clockIn ?? record.clock_in ?? null;

    const clockOut = record.clockOut ?? record.clock_out ?? null;

    if (clockOut) {
      lastActionElement.textContent = `Clock Out ${formatTime(clockOut)}`;
    } else if (clockIn) {
      lastActionElement.textContent = `Clock In ${formatTime(clockIn)}`;
    } else {
      lastActionElement.textContent = "None";
    }
  }
}

// ============================================================
// HISTORY
// ============================================================

function renderAttendanceHistory(records) {
  const table = document.getElementById("attendanceTable");

  const count = document.getElementById("attendanceCount");

  if (!table) {
    return;
  }

  if (!Array.isArray(records)) {
    records = [];
  }

  // --------------------------------------------------------
  // COUNT
  // --------------------------------------------------------
  //
  // This counts attendance records, not individual actions.
  //
  // Example:
  // One day with Clock In + Clock Out = 1 log.
  //
  // --------------------------------------------------------

  if (count) {
    count.textContent = `${records.length} logs`;
  }

  // --------------------------------------------------------
  // NO RECORDS
  // --------------------------------------------------------

  if (!records.length) {
    table.innerHTML = `
            <tr>
                <td colspan="4">
                    No attendance records found.
                </td>
            </tr>
        `;

    return;
  }

  const rows = [];

  // --------------------------------------------------------
  // BUILD HISTORY
  // --------------------------------------------------------

  records.forEach((record) => {
    const date = formatDate(record.attendanceDate ?? record.attendance_date);

    const clockIn = record.clockIn ?? record.clock_in ?? null;

    const clockOut = record.clockOut ?? record.clock_out ?? null;

    // ------------------------------------------------
    // CLOCK IN
    // ------------------------------------------------

    addAttendanceRow(rows, date, clockIn, "Clock In");

    // ------------------------------------------------
    // CLOCK OUT
    // ------------------------------------------------

    addAttendanceRow(rows, date, clockOut, "Clock Out");
  });

  // --------------------------------------------------------
  // NO ACTIONS FOUND
  // --------------------------------------------------------

  if (!rows.length) {
    table.innerHTML = `
            <tr>
                <td colspan="4">
                    No attendance actions found.
                </td>
            </tr>
        `;

    return;
  }

  table.innerHTML = rows.join("");
}

// ============================================================
// ADD ATTENDANCE ROW
// ============================================================

function addAttendanceRow(rows, date, timestamp, action) {
  // Do not display a Clock Out row if the worker
  // has not clocked out yet.

  if (!timestamp) {
    return;
  }

  const timeText = formatTime(timestamp);

  rows.push(`
        <tr>

            <td>
                ${escapeHTML(date)}
            </td>

            <td>
                ${escapeHTML(timeText)}
            </td>

            <td>
                ${escapeHTML(action)}
            </td>

            <td>
                <span class="status approved">
                    Present
                </span>
            </td>

        </tr>
    `);
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {
  if (!value) {
    return "--";
  }

  const dateString = String(value).substring(0, 10);

  const date = new Date(`${dateString}T00:00:00`);

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
// FORMAT TIME
// ============================================================
//
// The timestamp comes from MySQL through the API.
//
// Example:
//     2026-08-22T08:05:00.000Z
//
// Display:
//     10:05
//
// Uses the browser's local timezone, which is appropriate for
// the worker's local display.
// ============================================================

function formatTime(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",

    minute: "2-digit",
  });
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
