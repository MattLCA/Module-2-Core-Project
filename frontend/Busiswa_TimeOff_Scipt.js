document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "http://localhost:4000/api";

  const timeoffSearch = document.getElementById("timeoffSearch");
  const timeoffDepartment = document.getElementById("timeoffDepartment");
  const timeoffType = document.getElementById("timeoffType");
  const employeeRows = document.getElementById("employeeRows");

  // --------------------------------------------------------
  // AUTHENTICATED REQUEST (same pattern as Busiswa_Leave_Script.js)
  // --------------------------------------------------------

  function getToken() {
    return localStorage.getItem("hrToken");
  }

  async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
      window.location.href = "index.html";
      return null;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get("content-type");
    let result = null;

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    }

    if (response.status === 401) {
      localStorage.removeItem("hrToken");
      localStorage.removeItem("hrEmployee");
      localStorage.removeItem("hrRole");
      window.location.href = "index.html";
      return null;
    }

    if (!response.ok) {
      throw new Error(
        (result && (result.message || result.error)) || "Request failed"
      );
    }

    return result;
  }

  // --------------------------------------------------------
  // LOAD APPROVED LEAVE (real "currently/previously away" list)
  // --------------------------------------------------------

  let timeoffData = [];

  async function loadTimeoff() {
    employeeRows.innerHTML = `<div class="empty-inline"><p>Loading\u2026</p></div>`;

    try {
      const response = await apiRequest("/leave?status=Approved");

      if (!response) {
        return;
      }

      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
        ? response.data
        : [];

      timeoffData = rows.map((r) => ({
        id: r.employeeCode,
        name: r.employeeFullName,
        department: r.department,
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        duration: r.duration,
      }));
    } catch (error) {
      console.error("[Time Off] Failed to load approved leave:", error);
      employeeRows.innerHTML = `<div class="empty-inline"><p>Couldn\u2019t load time off: ${error.message}</p></div>`;
      return;
    }

    populateFilterOptions();
    updateSummaryCards();
    renderRows();
  }

  function getInitials(name) {
    return (name || "")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function leaveTypeClass(type) {
    return (type || "").replace(/\s+/g, "-").toLowerCase();
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  }

  function daysAwayLabel(startDate, endDate) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today > end) {
      return "Returned";
    }
    if (today < start) {
      const daysUntil = Math.round((start - today) / msPerDay);
      return `Starts in ${daysUntil}d`;
    }
    const daysLeft = Math.max(1, Math.round((end - today) / msPerDay) + 1);
    return `${daysLeft}d left`;
  }

  function populateFilterOptions() {
    // Departments/types are derived from who's actually on the approved
    // leave list (rather than every department in the company), so the
    // dropdowns only ever show options that can return results.
    timeoffDepartment.innerHTML = `<option>All Departments</option>`;
    timeoffType.innerHTML = `<option>All Types</option>`;

    const departments = [...new Set(timeoffData.map((t) => t.department))].sort();
    const types = [...new Set(timeoffData.map((t) => t.leaveType))].sort();

    departments.forEach((dept) => {
      const opt = document.createElement("option");
      opt.value = dept;
      opt.textContent = dept;
      timeoffDepartment.appendChild(opt);
    });

    types.forEach((type) => {
      const opt = document.createElement("option");
      opt.value = type;
      opt.textContent = type;
      timeoffType.appendChild(opt);
    });
  }

  function computeCardStats(typeKey) {
    const matches = timeoffData.filter((t) => t.leaveType === typeKey);
    const departments = new Set(matches.map((m) => m.department));
    let mostRecent = null;
    matches.forEach((m) => {
      if (!mostRecent || new Date(m.startDate) > new Date(mostRecent.startDate)) {
        mostRecent = m;
      }
    });
    return {
      count: matches.length,
      deptCount: departments.size,
      recentName: mostRecent ? mostRecent.name : "\u2014",
    };
  }

  function updateSummaryCards() {
    // Maps each summary card to the leave "type" value used in the data.
    const mapping = [
      { key: "Vacation", countId: "annualLeaveCount", awayId: "annualLeaveAway", deptsId: "annualLeaveDepts", recentId: "annualLeaveRecent" },
      { key: "Sick Leave", countId: "sickLeaveCount", awayId: "sickLeaveAway", deptsId: "sickLeaveDepts", recentId: "sickLeaveRecent" },
      { key: "Personal", countId: "casualLeaveCount", awayId: "casualLeaveAway", deptsId: "casualLeaveDepts", recentId: "casualLeaveRecent" },
      { key: "Family Responsibility", countId: "familyLeaveCount", awayId: "familyLeaveAway", deptsId: "familyLeaveDepts", recentId: "familyLeaveRecent" },
    ];

    mapping.forEach(({ key, countId, awayId, deptsId, recentId }) => {
      const stats = computeCardStats(key);
      const countEl = document.getElementById(countId);
      const awayEl = document.getElementById(awayId);
      const deptsEl = document.getElementById(deptsId);
      const recentEl = document.getElementById(recentId);
      if (countEl) countEl.textContent = stats.count;
      if (awayEl) awayEl.textContent = stats.count;
      if (deptsEl) deptsEl.textContent = stats.deptCount;
      if (recentEl) recentEl.textContent = stats.recentName;
    });
  }

  function renderRows() {
    const searchValue = timeoffSearch.value.toLowerCase();
    const departmentValue = timeoffDepartment.value;
    const typeValue = timeoffType.value;

    const filtered = timeoffData.filter((item) => {
      const matchesSearch =
        String(item.id).toLowerCase().includes(searchValue) ||
        item.name.toLowerCase().includes(searchValue) ||
        item.department.toLowerCase().includes(searchValue) ||
        item.leaveType.toLowerCase().includes(searchValue);

      const matchesDepartment =
        departmentValue === "All Departments" ||
        item.department === departmentValue;

      const matchesType =
        typeValue === "All Types" || item.leaveType === typeValue;

      return matchesSearch && matchesDepartment && matchesType;
    });

    employeeRows.innerHTML = "";

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-inline";
      empty.innerHTML = `<i class="ti ti-beach" aria-hidden="true"></i><p>No employees currently away match these filters.</p>`;
      employeeRows.appendChild(empty);
      return;
    }

    filtered.forEach((item) => {
      const row = document.createElement("div");
      row.className = "timeoff-row";
      row.innerHTML = `
        <span>${item.id}</span>
        <span class="emp-cell">
          <span class="emp-avatar">${getInitials(item.name)}</span>
          <span class="emp-name">${item.name}</span>
        </span>
        <span>${item.department}</span>
        <span><span class="status-pill ${leaveTypeClass(item.leaveType)}">${item.leaveType}</span></span>
        <span>${formatDate(item.startDate)}</span>
        <span>${formatDate(item.endDate)}</span>
        <span>${daysAwayLabel(item.startDate, item.endDate)}</span>
      `;
      employeeRows.appendChild(row);
    });
  }

  await loadTimeoff();

  timeoffSearch.addEventListener("input", renderRows);
  timeoffDepartment.addEventListener("change", renderRows);
  timeoffType.addEventListener("change", renderRows);
});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");

    if (confirmLogout) {
      localStorage.removeItem("hrToken");
      localStorage.removeItem("hrEmployee");
      localStorage.removeItem("hrRole");
      window.location.href = "index.html";
    }
  });
}