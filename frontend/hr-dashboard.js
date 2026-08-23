// ============================================================
// ModernTech HR Dashboard
// ============================================================

// ============================================================
// GET LOGGED-IN HR
// ============================================================

const loggedInUser = JSON.parse(localStorage.getItem("hrEmployee"));

// ============================================================
// PROTECT HR DASHBOARD
// ============================================================

const hrToken = localStorage.getItem("hrToken");

if (!hrToken || !loggedInUser || loggedInUser.role !== "hr") {
  window.location.href = "index.html";
}

// ============================================================
// DASHBOARD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // ======================================================
  // SHARED HELPERS
  // ======================================================

  function showToast(message) {
    const toast = document.createElement("div");

    toast.setAttribute("role", "status");

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      background: "#27187e",
      color: "#ffffff",
      padding: "12px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      fontSize: "13.5px",
      fontWeight: "500",
      zIndex: "9999",
      transition: "opacity 0.3s ease",
    });

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";

      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function initials(name) {
    if (!name) {
      return "";
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("");
  }

  function formatDate(isoDate) {
    if (!isoDate) {
      return "—";
    }

    const d = new Date(isoDate + "T00:00:00");

    if (Number.isNaN(d.getTime())) {
      return isoDate;
    }

    return d.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ======================================================
  // REAL DATE + GREETING
  // ======================================================

  const greetingText = document.getElementById("greetingText");

  const dateText = document.getElementById("dateText");

  (function setDateAndGreeting() {
    const now = new Date();

    const hour = now.getHours();

    const greeting =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";

    const firstName = loggedInUser?.name
      ? loggedInUser.name.split(" ")[0]
      : "there";

    if (greetingText) {
      greetingText.textContent = `${greeting}, ${firstName}`;
    }

    const dateStr = now.toLocaleDateString("en-ZA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (dateText) {
      dateText.textContent = `${dateStr} · Here's how the team is doing today`;
    }
  })();

  // ======================================================
  // LOGGED-IN HR USER CHIP
  // ======================================================

  (function setUserChip() {
    const nameEl = document.getElementById("userNameDisplay");

    const roleEl = document.getElementById("userRoleDisplay");

    const avatarEl = document.getElementById("userAvatarInitials");

    if (loggedInUser?.name) {
      if (nameEl) {
        nameEl.textContent = loggedInUser.name;
      }

      if (avatarEl) {
        avatarEl.textContent = initials(loggedInUser.name);
      }
    }

    if (roleEl) {
      roleEl.textContent = "HR Manager";
    }
  })();

  // ======================================================
  // DASHBOARD SUMMARY
  // ======================================================

  let summary = null;

  function loadDashboard() {
    return apiFetch("/dashboard/summary")
      .then(function (result) {
        if (!result) {
          return;
        }

        summary = result.data || result;

        refreshStats();

        renderRecentEmployees();

        renderLeaveFeed();

        renderAttendanceDonut();
      })

      .catch(function (error) {
        console.error("[HR Dashboard] Failed to load dashboard:", error);

        showToast("Failed to load dashboard data from the server.");
      });
  }

  // ======================================================
  // STAT CARDS
  // ======================================================

  const totalEmployeesVal = document.getElementById("totalEmployeesVal");

  const newHiresVal = document.getElementById("newHiresVal");

  const onLeaveVal = document.getElementById("onLeaveVal");

  function refreshStats() {
    if (!summary) {
      return;
    }

    if (totalEmployeesVal) {
      totalEmployeesVal.textContent = String(summary.totalEmployees ?? 0);
    }

    if (onLeaveVal) {
      onLeaveVal.textContent = String(summary.onLeaveCount ?? 0);
    }

    if (newHiresVal) {
      const now = new Date();

      const recentEmployees = summary.recentEmployees || [];

      const onboardingCount = recentEmployees.filter((employee) => {
        if (!employee.startDate) {
          return false;
        }

        const date = new Date(employee.startDate + "T00:00:00");

        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      }).length;

      newHiresVal.textContent = String(onboardingCount);
    }
  }

  // ======================================================
  // RECENT EMPLOYEES
  // ======================================================

  const recentEmployeesTbody = document.getElementById("recentEmployeesTbody");

  const recentEmpSub = document.getElementById("recentEmpSub");

  function renderRecentEmployees() {
    if (!recentEmployeesTbody || !summary) {
      return;
    }

    const top = summary.recentEmployees || [];

    if (!top.length) {
      recentEmployeesTbody.innerHTML = `
                        <tr>
                            <td colspan="4">
                                No employees found.
                            </td>
                        </tr>
                    `;

      if (recentEmpSub) {
        recentEmpSub.textContent = "Showing 0 of 0 employees";
      }

      return;
    }

    recentEmployeesTbody.innerHTML = top
      .map((employee) => {
        const statusCls = employee.status === "leave" ? "leave" : "active";

        const statusText = employee.status === "leave" ? "On leave" : "Active";

        return `
                            <tr
                                data-name="${String(employee.name || "").toLowerCase()}"
                                data-role="${String(employee.position || "").toLowerCase()}"
                                data-dept="${String(employee.department || "").toLowerCase()}"
                            >

                                <td>

                                    <div class="emp-cell">

                                        <div class="emp-avatar">

                                            ${initials(employee.name)}

                                        </div>

                                        <div>

                                            <div class="emp-name">

                                                ${employee.name || ""}

                                            </div>

                                            <div class="emp-role">

                                                ${employee.position || ""}

                                            </div>

                                        </div>

                                    </div>

                                </td>

                                <td>
                                    ${employee.department || ""}
                                </td>

                                <td>
                                    ${formatDate(employee.startDate)}
                                </td>

                                <td>

                                    <span
                                        class="status-pill ${statusCls}"
                                    >
                                        ${statusText}
                                    </span>

                                </td>

                            </tr>
                        `;
      })
      .join("");

    if (recentEmpSub) {
      recentEmpSub.textContent = `Showing ${top.length} of ${
        summary.totalEmployees ?? 0
      } employees`;
    }
  }

  // ======================================================
  // LEAVE REQUESTS
  // ======================================================

  const leaveListEl = document.getElementById("leaveList");

  const leaveRequestsSub = document.getElementById("leaveRequestsSub");

  const leavePendingTrendText = document.getElementById(
    "leavePendingTrendText",
  );

  const leaveNavBadge = document.getElementById("leaveNavBadge");

  function pendingCount() {
    if (!leaveListEl) {
      return 0;
    }

    return leaveListEl.querySelectorAll('.leave-item[data-status="pending"]')
      .length;
  }

  function syncPendingCounters() {
    const count = pendingCount();

    if (leavePendingTrendText) {
      leavePendingTrendText.textContent = `${count} pending`;
    }

    if (leaveRequestsSub) {
      leaveRequestsSub.textContent = `${count} waiting for approval`;
    }

    if (leaveNavBadge) {
      if (count > 0) {
        leaveNavBadge.textContent = String(count);

        leaveNavBadge.style.display = "";
      } else {
        leaveNavBadge.style.display = "none";
      }
    }
  }

  function renderLeaveFeed() {
    if (!leaveListEl || !summary) {
      return;
    }

    const feed = summary.leaveFeed || [];

    if (!feed.length) {
      leaveListEl.innerHTML = `
                        <div class="leave-item-empty">
                            No leave requests yet.
                        </div>
                    `;

      syncPendingCounters();

      return;
    }

    leaveListEl.innerHTML = feed
      .map((item) => {
        const statusLower = String(item.status || "").toLowerCase();

        const showActions = statusLower === "pending";

        const requestId = Number(item.leave_request_id);

        return `
                            <div
                                class="leave-item"
                                data-status="${statusLower}"
                                data-request-id="${requestId}"
                            >

                                <div class="leave-avatar">

                                    ${initials(item.employee_name)}

                                </div>


                                <div class="leave-info">

                                    <div class="name">

                                        ${item.employee_name || ""}

                                    </div>


                                    <div class="meta">

                                        <i
                                            class="ti ti-beach leave-type-icon"
                                            aria-hidden="true"
                                        ></i>

                                        ${item.leave_type || ""}

                                        ·

                                        ${formatDate(item.start_date)}

                                    </div>

                                </div>


                                <span
                                    class="leave-tag ${statusLower}"
                                >

                                    ${item.status || ""}

                                </span>


                                ${
                                  showActions
                                    ? `
                                            <div class="leave-actions">

                                                <button
                                                    class="leave-approve-btn"
                                                    type="button"
                                                    aria-label="Approve ${
                                                      item.employee_name
                                                    }'s leave request"
                                                >

                                                    <i
                                                        class="ti ti-check"
                                                        aria-hidden="true"
                                                    ></i>

                                                </button>


                                                <button
                                                    class="leave-deny-btn"
                                                    type="button"
                                                    aria-label="Deny ${
                                                      item.employee_name
                                                    }'s leave request"
                                                >

                                                    <i
                                                        class="ti ti-x"
                                                        aria-hidden="true"
                                                    ></i>

                                                </button>

                                            </div>
                                        `
                                    : ""
                                }

                            </div>
                        `;
      })
      .join("");

    syncPendingCounters();
  }

  // ======================================================
  // APPROVE / REJECT LEAVE
  // ======================================================

  if (leaveListEl) {
    leaveListEl.addEventListener("click", async (event) => {
      const approveButton = event.target.closest(".leave-approve-btn");

      const denyButton = event.target.closest(".leave-deny-btn");

      if (!approveButton && !denyButton) {
        return;
      }

      const item = event.target.closest(".leave-item");

      if (!item) {
        return;
      }

      const requestId = Number(item.dataset.requestId);

      if (!Number.isInteger(requestId) || requestId <= 0) {
        console.error(
          "[HR Dashboard] Invalid leave request ID:",
          item.dataset.requestId,
        );

        showToast("This leave request does not have a valid database ID.");

        return;
      }

      const employeeName =
        item.querySelector(".name")?.textContent?.trim() || "This employee";

      const status = approveButton ? "Approved" : "Rejected";

      const clickedButton = approveButton || denyButton;

      clickedButton.disabled = true;

      try {
        console.log("[HR Dashboard] Sending leave decision:", {
          requestId,
          status,
        });

        const response = await apiFetch(`/leave/${requestId}/decision`, {
          method: "PUT",

          body: JSON.stringify({
            status,

            reason:
              status === "Rejected" ? "Leave request rejected by HR." : "",
          }),
        });

        console.log("[HR Dashboard] Backend decision response:", response);

        if (!response) {
          return;
        }

        // ==================================================
        // ONLY UPDATE THE DOM AFTER BACKEND SUCCESS
        // ==================================================

        const tag = item.querySelector(".leave-tag");

        if (tag) {
          tag.className = `leave-tag ${
            status === "Approved" ? "approved" : "denied"
          }`;

          tag.textContent = status;
        }

        item.dataset.status = status.toLowerCase();

        const actions = item.querySelector(".leave-actions");

        if (actions) {
          actions.remove();
        }

        syncPendingCounters();

        // ==================================================
        // NOTIFICATION RESULT
        // ==================================================

        const notificationCreated = response?.data?.notificationCreated;

        if (notificationCreated === false) {
          showToast(
            `${employeeName}'s leave was ${status.toLowerCase()}, but the worker notification could not be created.`,
          );
        } else {
          showToast(
            `${employeeName}'s leave request was ${status.toLowerCase()} successfully.`,
          );
        }
      } catch (error) {
        console.error("[HR Dashboard] Leave decision failed:", error);

        showToast(error.message || "Could not update the leave request.");
      } finally {
        clickedButton.disabled = false;
      }
    });
  }

  // ======================================================
  // ATTENDANCE DONUT
  // ======================================================

  const donutPresent = document.getElementById("donutPresent");

  const donutAbsent = document.getElementById("donutAbsent");

  const donutPct = document.getElementById("donutPct");

  const legendPresentVal = document.getElementById("legendPresentVal");

  const legendAbsentVal = document.getElementById("legendAbsentVal");

  const attendanceDateSub = document.getElementById("attendanceDateSub");

  function renderAttendanceDonut() {
    if (!summary) {
      return;
    }

    const attendance = summary.attendance || {};

    if (!attendance.date) {
      if (attendanceDateSub) {
        attendanceDateSub.textContent = "No attendance data available";
      }

      return;
    }

    const present = Number(attendance.present || 0);

    const absent = Number(attendance.absent || 0);

    const total = present + absent;

    const circumference = 364.4;

    const presentLength = total ? (present / total) * circumference : 0;

    const absentLength = total ? (absent / total) * circumference : 0;

    if (donutPresent) {
      donutPresent.setAttribute(
        "stroke-dasharray",
        `${presentLength} ${circumference}`,
      );

      donutPresent.setAttribute("stroke-dashoffset", "0");
    }

    if (donutAbsent) {
      donutAbsent.setAttribute(
        "stroke-dasharray",
        `${absentLength} ${circumference}`,
      );

      donutAbsent.setAttribute("stroke-dashoffset", `-${presentLength}`);
    }

    if (donutPct) {
      donutPct.textContent =
        attendance.percentPresent !== null &&
        attendance.percentPresent !== undefined
          ? `${attendance.percentPresent}%`
          : "–";
    }

    if (legendPresentVal) {
      legendPresentVal.textContent = String(present);
    }

    if (legendAbsentVal) {
      legendAbsentVal.textContent = String(absent);
    }

    if (attendanceDateSub) {
      attendanceDateSub.textContent = `${total} employees · ${formatDate(
        attendance.date,
      )}`;
    }
  }

  // ======================================================
  // SIDEBAR
  // ======================================================

  const sidebar = document.getElementById("sidebar");

  const sidebarToggle = document.getElementById("sidebarToggle");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("open");

      sidebarToggle.setAttribute("aria-expanded", String(isOpen));
    });

    sidebar.querySelectorAll(".nav-item").forEach((link) => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("open");

        sidebarToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ======================================================
  // USER MENU
  // ======================================================

  const userMenuBtn = document.getElementById("userMenuBtn");

  if (userMenuBtn) {
    userMenuBtn.addEventListener("click", () => {
      const isExpanded = userMenuBtn.getAttribute("aria-expanded") === "true";

      userMenuBtn.setAttribute("aria-expanded", String(!isExpanded));
    });
  }

  // ======================================================
  // NOTIFICATIONS PANEL
  // ======================================================

  const notifBtn = document.getElementById("notifBtn");

  const notifPanel = document.getElementById("notifPanel");

  const notifDot = document.getElementById("notifDot");

  const notifMarkAllBtn = document.getElementById("notifMarkAllBtn");

  function closeNotifPanel() {
    if (!notifPanel || notifPanel.hidden) {
      return;
    }

    notifPanel.hidden = true;

    if (notifBtn) {
      notifBtn.setAttribute("aria-expanded", "false");
    }
  }

  function openNotifPanel() {
    if (!notifPanel) {
      return;
    }

    notifPanel.hidden = false;

    if (notifBtn) {
      notifBtn.setAttribute("aria-expanded", "true");
    }
  }

  if (notifBtn && notifPanel) {
    notifBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      if (notifPanel.hidden) {
        openNotifPanel();
      } else {
        closeNotifPanel();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !notifPanel.hidden &&
        !notifPanel.contains(event.target) &&
        event.target !== notifBtn
      ) {
        closeNotifPanel();
      }
    });
  }

  if (notifMarkAllBtn) {
    notifMarkAllBtn.addEventListener("click", () => {
      document
        .querySelectorAll(".notif-item.unread")
        .forEach((item) => item.classList.remove("unread"));

      if (notifDot) {
        notifDot.style.display = "none";
      }

      showToast("All notifications marked as read.");
    });
  }

  // ======================================================
  // ESCAPE HANDLING
  // ======================================================

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (notifPanel && !notifPanel.hidden) {
      closeNotifPanel();

      if (notifBtn) {
        notifBtn.focus();
      }

      return;
    }

    if (sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");

      if (sidebarToggle) {
        sidebarToggle.setAttribute("aria-expanded", "false");

        sidebarToggle.focus();
      }
    }
  });

  // ======================================================
  // SEARCH
  // ======================================================

  const searchInput = document.getElementById("dashboardSearch");

  const employeeEmptyState = document.getElementById("employeeEmptyState");

  const employeeTable = employeeEmptyState
    ? employeeEmptyState.previousElementSibling
    : null;

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.toLowerCase().trim();

      let visibleEmployees = 0;

      document.querySelectorAll("#recentEmployeesTbody tr").forEach((row) => {
        const name = row.dataset.name || "";

        const role = row.dataset.role || "";

        const department = row.dataset.dept || "";

        const matches =
          !query ||
          name.includes(query) ||
          role.includes(query) ||
          department.includes(query);

        row.style.display = matches ? "" : "none";

        if (matches) {
          visibleEmployees++;
        }
      });

      if (employeeEmptyState) {
        employeeEmptyState.hidden = visibleEmployees !== 0;
      }

      if (employeeTable) {
        employeeTable.style.display = visibleEmployees === 0 ? "none" : "";
      }

      document.querySelectorAll("#leaveList .leave-item").forEach((item) => {
        const name =
          item.querySelector(".name")?.textContent?.toLowerCase() || "";

        const meta =
          item.querySelector(".meta")?.textContent?.toLowerCase() || "";

        const matches = !query || name.includes(query) || meta.includes(query);

        item.style.display = matches ? "" : "none";
      });
    });
  }

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  loadDashboard();
});

// ============================================================
// HR LOGOUT
// ============================================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    const confirmed = confirm("Are you sure you want to log out?");

    if (!confirmed) {
      return;
    }

    // ONLY remove HR session
    // Do NOT remove worker session.

    localStorage.removeItem("hrToken");

    localStorage.removeItem("hrEmployee");

    localStorage.removeItem("hrRole");

    window.location.href = "index.html";
  });
}
