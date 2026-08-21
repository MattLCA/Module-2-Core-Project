document.addEventListener("DOMContentLoaded", () => {
  const clockTime = document.getElementById("clockTime");
  const clockDate = document.getElementById("clockDate");
  const clockLoc = document.getElementById("clockLoc");
  const clockBtn = document.getElementById("clockBtn");
  const statusText = document.getElementById("statusText");
  const statusDot = document.getElementById("statusDot");
  const activityRows = document.getElementById("activityRows");
  const statToday = document.getElementById("statToday");
  const statWeekly = document.getElementById("statWeekly");
  const statMonthly = document.getElementById("statMonthly");

  // Holds ad-hoc rows created when the user toggles Clock In / Clock Out.
  // Rendered above the employee rows built from employeeData.
  let activityData = [];

  // ================= Real clock-in/out session log =================
  // Every clock-in/out is recorded here as {in, out} timestamps so the
  // Today/Weekly/Monthly stat cards can be computed from real activity
  // instead of being hardcoded.
  const SESSIONS_KEY = "bs_time_sessions";

  function loadSessions() {
    try {
      return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveSessions() {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  let sessions = loadSessions();

  function pad(n) {
    return n < 10 ? "0" + n : n;
  }
  function formatTime(date) {
    let h = date.getHours();
    const m = pad(date.getMinutes());
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${pad(h)}:${m} ${ampm}`;
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function startOfWeek(d) {
    const date = startOfDay(d);
    const day = date.getDay(); // 0 = Sunday
    const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
    date.setDate(date.getDate() + diff);
    return date;
  }
  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }
  function overlapMs(aStart, aEnd, bStart, bEnd) {
    const start = Math.max(aStart, bStart);
    const end = Math.min(aEnd, bEnd);
    return Math.max(0, end - start);
  }
  function formatMs(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  }

  function computeWorkedStats() {
    const now = new Date();
    const nowTs = now.getTime();
    const todayStartTs = startOfDay(now).getTime();
    const weekStartTs = startOfWeek(now).getTime();
    const monthStartTs = startOfMonth(now).getTime();

    let todayMs = 0;
    let weekMs = 0;
    let monthMs = 0;

    sessions.forEach((s) => {
      const inTs = s.in;
      // An open session (still clocked in) counts up to right now.
      const outTs = s.out !== null && s.out !== undefined ? s.out : nowTs;
      if (outTs <= inTs) return;

      todayMs += overlapMs(inTs, outTs, todayStartTs, nowTs);
      weekMs += overlapMs(inTs, outTs, weekStartTs, nowTs);
      monthMs += overlapMs(inTs, outTs, monthStartTs, nowTs);
    });

    return { todayMs, weekMs, monthMs };
  }

  function updateStatsDisplay() {
    const { todayMs, weekMs, monthMs } = computeWorkedStats();
    if (statToday) statToday.textContent = formatMs(todayMs);
    if (statWeekly) statWeekly.textContent = formatMs(weekMs);
    if (statMonthly) statMonthly.textContent = formatMs(monthMs);
  }

  function updateClock() {
    const now = new Date();
    clockTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    clockDate.textContent = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    // Recomputed every tick so the Today card climbs in real time while
    // you're clocked in, the same way the clock itself does.
    updateStatsDisplay();
  }

  // initialize
  updateClock();
  setInterval(updateClock, 1000);

  // working state persisted
  let working = localStorage.getItem("bs_working");
  if (working === null) working = "true";
  working = working === "true";

  let lastClockIn = localStorage.getItem("bs_clockin_ts");
  if (lastClockIn) lastClockIn = parseInt(lastClockIn, 10);

  // Make sure the session log agrees with the persisted working state.
  // Covers the very first visit (no sessions yet) and any case where the
  // two got out of sync before this feature existed.
  (function reconcileSessions() {
    const last = sessions[sessions.length - 1];
    const hasOpenSession = last && (last.out === null || last.out === undefined);

    if (working && !hasOpenSession) {
      sessions.push({ in: lastClockIn || Date.now(), out: null });
      saveSessions();
    } else if (!working && hasOpenSession) {
      last.out = Date.now();
      saveSessions();
    }
  })();

  function applyState() {
    if (working) {
      clockBtn.textContent = "Clock Out";
      statusText.textContent = "Currently Working";
      statusDot.style.background = "#3ecf8e";
    } else {
      clockBtn.textContent = "Clock In";
      statusText.textContent = "Not Working";
      statusDot.style.background = "#e0e0e0";
    }
    localStorage.setItem("bs_working", working);
  }

  function minutesBetween(a, b) {
    return Math.round((b - a) / 60000);
  }

  function formatDuration(mins) {
    if (!mins || mins <= 0) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  function renderActivity() {
    activityRows.innerHTML = "";

    // Ad-hoc "You" rows created by the clock in/out toggle go first.
    activityData.forEach((entry) => {
      const statusClass = entry.status.toLowerCase();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div class="emp-cell">
            <div class="emp-avatar">${entry.badge}</div>
            <div>
              <div class="emp-name">${entry.name}</div>
            </div>
          </div>
        </td>
        <td>${entry.in}</td>
        <td>${entry.out}</td>
        <td>${entry.hours}</td>
        <td><span class="status-pill ${statusClass}">${entry.status}</span></td>
      `;
      activityRows.appendChild(row);
    });

    employeeData.employees.forEach((employee) => {
      const latestAttendance =
        employee.attendance[employee.attendance.length - 1];

      let clockIn = "09:00 AM";
      let clockOut = "05:00 PM";
      let hours = "8h";
      let statusClass = "present";

      if (latestAttendance.status === "Absent") {
        clockIn = "—";
        clockOut = "—";
        hours = "—";
        statusClass = "absent";
      } else if (latestAttendance.status === "Late") {
        statusClass = "late";
      }

      const initials = employee.name
        .split(" ")
        .map((word) => word[0])
        .join("");

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>
          <div class="emp-cell">
            <div class="emp-avatar">${initials}</div>
            <div>
              <div class="emp-name">${employee.name}</div>
              <div class="emp-role">${employee.position}</div>
            </div>
          </div>
        </td>
        <td>${clockIn}</td>
        <td>${clockOut}</td>
        <td>${hours}</td>
        <td><span class="status-pill ${statusClass}">${latestAttendance.status}</span></td>
      `;

      activityRows.appendChild(row);
    });
  }

  // Add or update a row for the current user when toggling, and keep the
  // real session log (used for the stat cards) in sync with it.
  function addActivityEntryForToggle(isWorking) {
    const now = new Date();
    if (isWorking) {
      // clocking in
      lastClockIn = Date.now();
      localStorage.setItem("bs_clockin_ts", String(lastClockIn));

      sessions.push({ in: lastClockIn, out: null });
      saveSessions();

      // add a provisional row with only clock in
      activityData.unshift({
        badge: "BB",
        name: "You",
        in: formatTime(now),
        out: "—",
        hours: "—",
        status: "Present",
      });
    } else {
      // clocking out
      const outTs = Date.now();

      const openSession = sessions.find(
        (s) => s.out === null || s.out === undefined,
      );
      if (openSession) {
        openSession.out = outTs;
      } else if (lastClockIn) {
        sessions.push({ in: lastClockIn, out: outTs });
      }
      saveSessions();

      if (lastClockIn) {
        const mins = minutesBetween(lastClockIn, outTs);
        const hours = formatDuration(mins);
        // replace the provisional row if it exists
        if (activityData[0] && activityData[0].name === "You") {
          activityData[0].out = formatTime(new Date(outTs));
          activityData[0].hours = hours;
          activityData[0].status = "Present";
        } else {
          activityData.unshift({
            badge: "BB",
            name: "You",
            in: formatTime(new Date(lastClockIn)),
            out: formatTime(new Date(outTs)),
            hours,
            status: "Present",
          });
        }
      } else {
        // no previous clock-in recorded — add a simple entry
        activityData.unshift({
          badge: "BB",
          name: "You",
          in: "—",
          out: formatTime(new Date(outTs)),
          hours: "—",
          status: "Present",
        });
      }
      localStorage.removeItem("bs_clockin_ts");
      lastClockIn = null;
    }
    renderActivity();
    updateStatsDisplay();
  }

  // wire button
  clockBtn.addEventListener("click", () => {
    working = !working;
    addActivityEntryForToggle(working);
    applyState();
  });

  // initial render
  applyState();
  renderActivity();
  updateStatsDisplay();
});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");

    if (confirmLogout) {
      localStorage.removeItem("loggedInUser");
      window.location.href = "index.html";
    }
  });
}