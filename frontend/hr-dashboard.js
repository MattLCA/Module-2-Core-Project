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
    if (greetingText) greetingText.textContent = `${greeting}, Jordan`;

    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (dateText) dateText.textContent = `${dateStr} · Here's how the team is doing today`;
  })();

  /* ================= Build employees from real data (+ localStorage overrides) ================= */

  function mapEmployee(e) {
    const yearMatch = (e.employmentHistory || '').match(/\d{4}/);
    const leaveRequests = e.leaveRequests || [];
    const hasApprovedLeave = leaveRequests.some(lr => lr.status === 'Approved');

    return {
      employeeId: e.employeeId,
      name: e.name,
      email: e.contact,
      dept: e.department,
      role: e.position,
      start: yearMatch ? `${yearMatch[0]}-01-01` : '2020-01-01',
      status: hasApprovedLeave ? 'leave' : 'active',
      salary: e.payroll ? e.payroll.finalSalary : e.baseSalary,
      attendance: e.attendance || [],
      leaveRequests: leaveRequests
    };
  }

  const employees = (typeof HRStorage !== 'undefined')
    ? HRStorage.buildEmployees(typeof employeeData !== 'undefined' ? employeeData.employees : [], mapEmployee)
    : (typeof employeeData !== 'undefined' ? employeeData.employees : []).map(mapEmployee);

  /* ================= Stat cards ================= */

  const totalEmployeesVal = document.getElementById('totalEmployeesVal');
  const newHiresVal = document.getElementById('newHiresVal');
  const onLeaveVal = document.getElementById('onLeaveVal');
  const recentEmpSub = document.getElementById('recentEmpSub');

  function refreshStats() {
    if (totalEmployeesVal) totalEmployeesVal.textContent = String(employees.length);

    const onboardingCount = employees.filter(e => e.status === 'onboarding').length;
    if (newHiresVal) newHiresVal.textContent = String(onboardingCount);

    const onLeaveCount = employees.filter(e => e.status === 'leave').length;
    if (onLeaveVal) onLeaveVal.textContent = String(onLeaveCount);
  }

  /* ================= Recently added employees table ================= */

  const recentEmployeesTbody = document.getElementById('recentEmployeesTbody');

  function renderRecentEmployees() {
    if (!recentEmployeesTbody) return;

    const sorted = [...employees].sort((a, b) => new Date(b.start) - new Date(a.start));
    const top = sorted.slice(0, 5);

    recentEmployeesTbody.innerHTML = top.map(e => {
      const statusCls = e.status === 'onboarding' ? 'onboarding' : 'active';
      const statusText = e.status === 'onboarding' ? 'Onboarding' : e.status === 'leave' ? 'On leave' : 'Active';
      return `
        <tr data-name="${e.name.toLowerCase()}" data-role="${e.role.toLowerCase()}" data-dept="${e.dept.toLowerCase()}">
          <td><div class="emp-cell"><div class="emp-avatar">${initials(e.name)}</div><div><div class="emp-name">${e.name}</div><div class="emp-role">${e.role}</div></div></div></td>
          <td>${e.dept}</td>
          <td>${formatDate(e.start)}</td>
          <td><span class="status-pill ${statusCls}">${statusText}</span></td>
        </tr>
      `;
    }).join('');

    if (recentEmpSub) recentEmpSub.textContent = `Showing ${top.length} of ${employees.length} employees`;
  }

  /* ================= Leave requests panel (from real leaveRequests) ================= */

  const leaveListEl = document.getElementById('leaveList');
  const leaveRequestsSub = document.getElementById('leaveRequestsSub');
  const leavePendingTrendText = document.getElementById('leavePendingTrendText');
  const leaveNavBadge = document.getElementById('leaveNavBadge');

  function buildLeaveFeed() {
    const feed = [];
    employees.forEach(e => {
      (e.leaveRequests || []).forEach(lr => {
        feed.push({
          employeeName: e.name,
          date: lr.date,
          reason: lr.reason,
          status: lr.status // 'Approved' | 'Pending' | 'Denied'
        });
      });
    });
    feed.sort((a, b) => new Date(b.date) - new Date(a.date));
    return feed;
  }

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
    if (!leaveListEl) return;
    const feed = buildLeaveFeed().slice(0, 8);

    leaveListEl.innerHTML = feed.map(item => {
      const statusLower = item.status.toLowerCase(); // approved | pending | denied
      const showActions = statusLower === 'pending';
      return `
        <div class="leave-item" data-status="${statusLower}">
          <div class="leave-avatar">${initials(item.employeeName)}</div>
          <div class="leave-info">
            <div class="name">${item.employeeName}</div>
            <div class="meta"><i class="ti ti-beach leave-type-icon" aria-hidden="true"></i>${item.reason} · ${formatDate(item.date)}</div>
          </div>
          <span class="leave-tag ${statusLower}">${item.status}</span>
          ${showActions ? `
          <div class="leave-actions">
            <button class="leave-approve-btn" aria-label="Approve ${item.employeeName}'s leave request"><i class="ti ti-check" aria-hidden="true"></i></button>
            <button class="leave-deny-btn" aria-label="Deny ${item.employeeName}'s leave request"><i class="ti ti-x" aria-hidden="true"></i></button>
          </div>` : ''}
        </div>
      `;
    }).join('');

    syncPendingCounters();
  }

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
        showToast(`${name}'s leave request approved.`);
      } else {
        tag.className = 'leave-tag denied';
        tag.textContent = 'Denied';
        item.dataset.status = 'denied';
        showToast(`${name}'s leave request denied.`);
      }

      if (actions) actions.remove();
      syncPendingCounters();
    });
  }

  /* ================= Attendance donut (from real attendance records) ================= */

  const donutPresent = document.getElementById('donutPresent');
  const donutAbsent = document.getElementById('donutAbsent');
  const donutPct = document.getElementById('donutPct');
  const legendPresentVal = document.getElementById('legendPresentVal');
  const legendAbsentVal = document.getElementById('legendAbsentVal');
  const attendanceDateSub = document.getElementById('attendanceDateSub');

  function renderAttendanceDonut() {
    // Find the most recent date shared across employees' attendance records
    const allDates = new Set();
    employees.forEach(e => (e.attendance || []).forEach(a => allDates.add(a.date)));
    const sortedDates = [...allDates].sort((a, b) => new Date(b) - new Date(a));
    const latestDate = sortedDates[0];

    if (!latestDate) {
      if (attendanceDateSub) attendanceDateSub.textContent = 'No attendance data available';
      return;
    }

    let present = 0, absent = 0;
    employees.forEach(e => {
      const rec = (e.attendance || []).find(a => a.date === latestDate);
      if (rec) {
        if (rec.status === 'Present') present++;
        else if (rec.status === 'Absent') absent++;
      }
    });

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
    if (donutPct) donutPct.textContent = total ? `${Math.round((present / total) * 100)}%` : '–';
    if (legendPresentVal) legendPresentVal.textContent = String(present);
    if (legendAbsentVal) legendAbsentVal.textContent = String(absent);
    if (attendanceDateSub) attendanceDateSub.textContent = `${employees.length} employees · ${formatDate(latestDate)}`;
  }

  /* ================= Initial render from real data ================= */

  refreshStats();
  renderRecentEmployees();
  renderLeaveFeed();
  renderAttendanceDonut();

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

  /* ================= Add employee modal ================= */

  const addEmployeeBtn = document.getElementById('addEmployeeBtn');
  const addEmployeeModal = document.getElementById('addEmployeeModal');
  const closeAddEmployeeBtn = document.getElementById('closeAddEmployeeBtn');
  const cancelAddEmployeeBtn = document.getElementById('cancelAddEmployeeBtn');
  const addEmployeeForm = document.getElementById('addEmployeeForm');
  const addEmployeeError = document.getElementById('addEmployeeError');

  let lastFocusedBeforeModal = null;

  function openAddEmployeeModal() {
    lastFocusedBeforeModal = document.activeElement;
    addEmployeeModal.hidden = false;
    document.getElementById('empNameInput').focus();
  }

  function closeAddEmployeeModal() {
    addEmployeeModal.hidden = true;
    addEmployeeForm.reset();
    addEmployeeError.hidden = true;
    if (lastFocusedBeforeModal) lastFocusedBeforeModal.focus();
  }

  if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', openAddEmployeeModal);
  if (closeAddEmployeeBtn) closeAddEmployeeBtn.addEventListener('click', closeAddEmployeeModal);
  if (cancelAddEmployeeBtn) cancelAddEmployeeBtn.addEventListener('click', closeAddEmployeeModal);

  if (addEmployeeModal) {
    addEmployeeModal.addEventListener('click', (e) => {
      if (e.target === addEmployeeModal) closeAddEmployeeModal();
    });
  }

  if (addEmployeeForm) {
    addEmployeeForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('empNameInput').value.trim();
      const role = document.getElementById('empRoleInput').value.trim();
      const dept = document.getElementById('empDeptInput').value;
      const start = document.getElementById('empStartInput').value;

      const salaryInput = document.getElementById('empSalaryInput');
      const salaryRaw = salaryInput ? salaryInput.value.trim() : '';
      const salary = Number(salaryRaw);

      if (!name || !role || !dept || !start || !salaryRaw || isNaN(salary) || salary <= 0) {
        addEmployeeError.hidden = false;
        return;
      }
      addEmployeeError.hidden = true;

      const newEmployeeData = {
        name, email: '', dept, role, start,
        status: 'onboarding',
        salary: salary,
        baseSalary: salary,
        payroll: {
          hoursWorked: 160,
          leaveDeductions: 0,
          finalSalary: salary
        },
        attendance: [],
        leaveRequests: []
      };

      // Persist to localStorage so it survives a refresh and shows up on every page
      const newEmployee = (typeof HRStorage !== 'undefined')
        ? HRStorage.addEmployee(newEmployeeData)
        : newEmployeeData;

      // Add to the in-memory employees array so stats/table stay consistent
      employees.unshift(newEmployee);

      refreshStats();
      renderRecentEmployees();

      showToast(`${name} was added to the team.`);
      closeAddEmployeeModal();
    });
  }

  /* ================= Global Escape handling (notif panel + modal + sidebar) ================= */

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    if (notifPanel && !notifPanel.hidden) {
      closeNotifPanel();
      notifBtn.focus();
      return;
    }
    if (addEmployeeModal && !addEmployeeModal.hidden) {
      closeAddEmployeeModal();
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
});

const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn){

    logoutBtn.addEventListener("click", () => {

        const confirmLogout = confirm(
            "Are you sure you want to log out?"
        );

        if(confirmLogout){

            localStorage.removeItem("loggedInUser");

            window.location.href = "index.html";

        }

    });

}