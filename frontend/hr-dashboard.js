const loggedInUser =
JSON.parse(localStorage.getItem("loggedInUser"));

if(!loggedInUser){

    window.location.href = "index.html";

}

document.addEventListener('DOMContentLoaded', () => {

  /* ================= Shared helpers ================= */

  function showToast(message) {
    const toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    Object.assign(toast.style, {
      position: 'fixed', bottom: '24px', right: '24px',
      background: '#27187e', color: '#ffffff',
      padding: '12px 20px', borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontSize: '13.5px', fontWeight: '500',
      zIndex: '9999', transition: 'opacity 0.3s ease'
    });
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function initials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() || '')
      .join('');
  }

  function formatDate(isoDate) {
    if (!isoDate) return '—';
    const d = new Date(isoDate + 'T00:00:00');
    if (isNaN(d)) return isoDate;
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* ================= Real date + greeting ================= */

  const greetingText = document.getElementById('greetingText');
  const dateText = document.getElementById('dateText');

  (function setDateAndGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const firstName = loggedInUser?.name ? loggedInUser.name.split(' ')[0] : 'there';
    if (greetingText) greetingText.textContent = `${greeting}, ${firstName}`;

    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (dateText) dateText.textContent = `${dateStr} · Here's how the team is doing today`;
  })();

  /* ================= Logged-in user chip ================= */

  (function setUserChip() {
    const nameEl = document.getElementById('userNameDisplay');
    const roleEl = document.getElementById('userRoleDisplay');
    const avatarEl = document.getElementById('userAvatarInitials');

    if (loggedInUser?.name) {
      if (nameEl) nameEl.textContent = loggedInUser.name;
      if (avatarEl) {
        avatarEl.textContent = loggedInUser.name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map(w => w[0]?.toUpperCase() || '')
          .join('');
      }
    }

    if (roleEl) {
      roleEl.textContent = loggedInUser?.role === 'hr' ? 'HR Manager' : 'Employee';
    }
  })();

  /* ================= Load real dashboard summary from the backend ================= */
  // GET /api/dashboard/summary returns everything this page needs in one
  // call: totalEmployees, onLeaveCount, pendingLeaveCount, attendance
  // {date, present, absent, percentPresent}, recentEmployees (top 5 by
  // start date), and leaveFeed (latest 8 leave requests). No more
  // building this from employeeData.js/HRStorage locally.

  let summary = null;

  function loadDashboard() {
    return apiFetch('/dashboard/summary')
      .then(function(result) {
        summary = result.data;
        refreshStats();
        renderRecentEmployees();
        renderLeaveFeed();
        renderAttendanceDonut();
      })
      .catch(function(err) {
        showToast('Failed to load dashboard data from the server');
        console.error(err);
      });
  }

  /* ================= Stat cards ================= */

  const totalEmployeesVal = document.getElementById('totalEmployeesVal');
  const newHiresVal = document.getElementById('newHiresVal');
  const onLeaveVal = document.getElementById('onLeaveVal');

  function refreshStats() {
    if (!summary) return;

    if (totalEmployeesVal) totalEmployeesVal.textContent = String(summary.totalEmployees);
    if (onLeaveVal) onLeaveVal.textContent = String(summary.onLeaveCount);

    // NOTE: the schema has no real "onboarding" status on an employee —
    // recentEmployees only distinguishes 'active' vs 'leave'. As a
    // best-effort stand-in, this counts employees whose start date
    // (inferred from employment_history) falls in the current calendar
    // month. It's an approximation, not a tracked status — replace this
    // if/when the schema gains a real onboarding flag.
    if (newHiresVal) {
      const now = new Date();
      const onboardingCount = (summary.recentEmployees || []).filter(e => {
        const d = new Date(e.startDate + 'T00:00:00');
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }).length;
      newHiresVal.textContent = String(onboardingCount);
    }

    // "Open positions" stat card stays as demo data — there's no
    // recruitment/vacancies table in the schema to source it from.
  }

  /* ================= Recently added employees table ================= */

  const recentEmployeesTbody = document.getElementById('recentEmployeesTbody');
  const recentEmpSub = document.getElementById('recentEmpSub');

  function renderRecentEmployees() {
    if (!recentEmployeesTbody || !summary) return;

    const top = summary.recentEmployees || [];

    if (!top.length) {
      recentEmployeesTbody.innerHTML = '<tr><td colspan="4">No employees found.</td></tr>';
      if (recentEmpSub) recentEmpSub.textContent = 'Showing 0 of 0 employees';
      return;
    }

    recentEmployeesTbody.innerHTML = top.map(e => {
      const statusCls = e.status === 'leave' ? 'leave' : 'active';
      const statusText = e.status === 'leave' ? 'On leave' : 'Active';
      return `
        <tr data-name="${e.name.toLowerCase()}" data-role="${e.position.toLowerCase()}" data-dept="${e.department.toLowerCase()}">
          <td><div class="emp-cell"><div class="emp-avatar">${initials(e.name)}</div><div><div class="emp-name">${e.name}</div><div class="emp-role">${e.position}</div></div></div></td>
          <td>${e.department}</td>
          <td>${formatDate(e.startDate)}</td>
          <td><span class="status-pill ${statusCls}">${statusText}</span></td>
        </tr>
      `;
    }).join('');

    if (recentEmpSub) recentEmpSub.textContent = `Showing ${top.length} of ${summary.totalEmployees} employees`;
  }

  /* ================= Leave requests panel ================= */

  const leaveListEl = document.getElementById('leaveList');
  const leaveRequestsSub = document.getElementById('leaveRequestsSub');
  const leavePendingTrendText = document.getElementById('leavePendingTrendText');
  const leaveNavBadge = document.getElementById('leaveNavBadge');

  function pendingCount() {
    if (!leaveListEl) return 0;
    return leaveListEl.querySelectorAll('.leave-item[data-status="pending"]').length;
  }

  function syncPendingCounters() {
    const n = pendingCount();
    if (leavePendingTrendText) leavePendingTrendText.textContent = `${n} pending`;
    if (leaveRequestsSub) leaveRequestsSub.textContent = `${n} waiting for approval`;
    if (leaveNavBadge) {
      if (n > 0) {
        leaveNavBadge.textContent = String(n);
        leaveNavBadge.style.display = '';
      } else {
        leaveNavBadge.style.display = 'none';
      }
    }
  }

  function renderLeaveFeed() {
    if (!leaveListEl || !summary) return;
    const feed = summary.leaveFeed || [];

    if (!feed.length) {
      leaveListEl.innerHTML = '<div class="leave-item-empty">No leave requests yet.</div>';
      syncPendingCounters();
      return;
    }

    leaveListEl.innerHTML = feed.map(item => {
      const statusLower = (item.status || '').toLowerCase(); // approved | pending | denied
      const showActions = statusLower === 'pending';
      return `
        <div class="leave-item" data-status="${statusLower}">
          <div class="leave-avatar">${initials(item.employee_name)}</div>
          <div class="leave-info">
            <div class="name">${item.employee_name}</div>
            <div class="meta"><i class="ti ti-beach leave-type-icon" aria-hidden="true"></i>${item.leave_type} · ${formatDate(item.start_date)}</div>
          </div>
          <span class="leave-tag ${statusLower}">${item.status}</span>
          ${showActions ? `
          <div class="leave-actions">
            <button class="leave-approve-btn" aria-label="Approve ${item.employee_name}'s leave request"><i class="ti ti-check" aria-hidden="true"></i></button>
            <button class="leave-deny-btn" aria-label="Deny ${item.employee_name}'s leave request"><i class="ti ti-x" aria-hidden="true"></i></button>
          </div>` : ''}
        </div>
      `;
    }).join('');

    syncPendingCounters();
  }

  // NOTE: there's no leave-management backend endpoint yet (no
  // leaveController/leaveModel/leaveRoutes exist) — approving or denying
  // here only updates this page's DOM and does not persist. It'll revert
  // on refresh until a real PATCH /api/leave-requests/:id endpoint (or
  // similar) is built.
  if (leaveListEl) {
    leaveListEl.addEventListener('click', (e) => {
      const approveBtn = e.target.closest('.leave-approve-btn');
      const denyBtn = e.target.closest('.leave-deny-btn');
      if (!approveBtn && !denyBtn) return;

      const item = e.target.closest('.leave-item');
      const name = item.querySelector('.name')?.textContent || 'This request';
      const tag = item.querySelector('.leave-tag');
      const actions = item.querySelector('.leave-actions');

      if (approveBtn) {
        tag.className = 'leave-tag approved';
        tag.textContent = 'Approved';
        item.dataset.status = 'approved';
        showToast(`${name}'s leave request approved (not yet saved \u2014 no backend endpoint for this exists yet).`);
      } else {
        tag.className = 'leave-tag denied';
        tag.textContent = 'Denied';
        item.dataset.status = 'denied';
        showToast(`${name}'s leave request denied (not yet saved \u2014 no backend endpoint for this exists yet).`);
      }

      if (actions) actions.remove();
      syncPendingCounters();
    });
  }

  /* ================= Attendance donut ================= */

  const donutPresent = document.getElementById('donutPresent');
  const donutAbsent = document.getElementById('donutAbsent');
  const donutPct = document.getElementById('donutPct');
  const legendPresentVal = document.getElementById('legendPresentVal');
  const legendAbsentVal = document.getElementById('legendAbsentVal');
  const attendanceDateSub = document.getElementById('attendanceDateSub');

  function renderAttendanceDonut() {
    if (!summary) return;
    const att = summary.attendance || {};

    if (!att.date) {
      if (attendanceDateSub) attendanceDateSub.textContent = 'No attendance data available';
      return;
    }

    const present = att.present || 0;
    const absent = att.absent || 0;
    const total = present + absent;
    const circumference = 364.4;
    const presentLen = total ? (present / total) * circumference : 0;
    const absentLen = total ? (absent / total) * circumference : 0;

    if (donutPresent) {
      donutPresent.setAttribute('stroke-dasharray', `${presentLen} ${circumference}`);
      donutPresent.setAttribute('stroke-dashoffset', '0');
    }
    if (donutAbsent) {
      donutAbsent.setAttribute('stroke-dasharray', `${absentLen} ${circumference}`);
      donutAbsent.setAttribute('stroke-dashoffset', `-${presentLen}`);
    }
    if (donutPct) donutPct.textContent = att.percentPresent !== null && att.percentPresent !== undefined ? `${att.percentPresent}%` : '\u2013';
    if (legendPresentVal) legendPresentVal.textContent = String(present);
    if (legendAbsentVal) legendAbsentVal.textContent = String(absent);
    if (attendanceDateSub) attendanceDateSub.textContent = `${total} employees \u00b7 ${formatDate(att.date)}`;
  }

  /* ================= Sidebar (mobile) ================= */

  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      sidebarToggle.setAttribute('aria-expanded', String(isOpen));
    });

    sidebar.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ================= User menu (placeholder dropdown) ================= */

  const userMenuBtn = document.getElementById('userMenuBtn');
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', () => {
      const isExpanded = userMenuBtn.getAttribute('aria-expanded') === 'true';
      userMenuBtn.setAttribute('aria-expanded', String(!isExpanded));
      // TODO: hook up a real profile/settings/sign-out dropdown when that menu exists.
    });
  }

  /* ================= Notifications dropdown ================= */

  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  const notifDot = document.getElementById('notifDot');
  const notifMarkAllBtn = document.getElementById('notifMarkAllBtn');

  function closeNotifPanel() {
    if (!notifPanel || notifPanel.hidden) return;
    notifPanel.hidden = true;
    notifBtn.setAttribute('aria-expanded', 'false');
  }

  function openNotifPanel() {
    notifPanel.hidden = false;
    notifBtn.setAttribute('aria-expanded', 'true');
  }

  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.hidden ? openNotifPanel() : closeNotifPanel();
    });

    document.addEventListener('click', (e) => {
      if (!notifPanel.hidden && !notifPanel.contains(e.target) && e.target !== notifBtn) {
        closeNotifPanel();
      }
    });
  }

  if (notifMarkAllBtn) {
    notifMarkAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.notif-item.unread').forEach(item => item.classList.remove('unread'));
      if (notifDot) notifDot.style.display = 'none';
      showToast('All notifications marked as read.');
    });
  }

  /* ================= Add employee button ================= */
  // Redirects to hr-employees.html instead of duplicating the create
  // flow here. That page's modal already calls the real POST
  // /api/employees endpoint (including the required password field) —
  // this dashboard's old modal didn't collect a password at all and
  // only wrote to localStorage, so keeping two separate/inconsistent
  // "add employee" implementations isn't worth it.
  const addEmployeeBtn = document.getElementById('addEmployeeBtn');
  if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener('click', () => {
      window.location.href = 'hr-employees.html';
    });
  }

  /* ================= Global Escape handling (notif panel + sidebar) ================= */

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    if (notifPanel && !notifPanel.hidden) {
      closeNotifPanel();
      notifBtn.focus();
      return;
    }
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      sidebarToggle.focus();
    }
  });

  /* ================= Live search (employee table + leave list) ================= */

  const searchInput = document.getElementById('dashboardSearch');
  const employeeEmptyState = document.getElementById('employeeEmptyState');
  const employeeTable = employeeEmptyState ? employeeEmptyState.previousElementSibling : null;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      let visibleEmployees = 0;

      document.querySelectorAll('#recentEmployeesTbody tr').forEach(row => {
        const name = row.dataset.name || '';
        const role = row.dataset.role || '';
        const dept = row.dataset.dept || '';
        const match = !q || name.includes(q) || role.includes(q) || dept.includes(q);
        row.style.display = match ? '' : 'none';
        if (match) visibleEmployees++;
      });

      if (employeeEmptyState) employeeEmptyState.hidden = visibleEmployees !== 0;
      if (employeeTable) employeeTable.style.display = visibleEmployees === 0 ? 'none' : '';

      document.querySelectorAll('#leaveList .leave-item').forEach(item => {
        const name = item.querySelector('.name')?.textContent.toLowerCase() || '';
        const meta = item.querySelector('.meta')?.textContent.toLowerCase() || '';
        const match = !q || name.includes(q) || meta.includes(q);
        item.style.display = match ? '' : 'none';
      });
    });
  }

  /* Initial load */
  loadDashboard();
});

const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn){

    logoutBtn.addEventListener("click", () => {

        const confirmLogout = confirm(
            "Are you sure you want to log out?"
        );

        if(confirmLogout){

            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("authToken");

            window.location.href = "index.html";

        }

    });

}