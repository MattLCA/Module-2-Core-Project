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
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  }

  function todayFormatted() {
    return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function ratingTier(rating) {
    if (rating >= 4.0) return 'good';
    if (rating >= 3.0) return 'mid';
    return 'low';
  }

  /* ================= Real date + quarter label ================= */

  const dateText = document.getElementById('dateText');
  const reviewCycleSub = document.getElementById('reviewCycleSub');

  (function setDateAndCycle() {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (dateText) dateText.textContent = `${dateStr} · Q${quarter} ${now.getFullYear()} review cycle`;
    // reviewCycleSub already flags this panel as demo data in the HTML; leave as-is.
  })();

  /* ================= Build team performance table from real employee data ================= */

  const employees = (typeof employeeData !== 'undefined'
    ? employeeData.employees
    : []
  ).map((e, index) => {

    const reviews = [
      {
        rating: 4.8,
        lastReview: "09 Jul 2026",
        notes: "Consistently exceeds expectations. Demonstrates excellent leadership, mentors junior staff, and delivers projects ahead of schedule.",
        goalProgress: 96
      },
      {
        rating: 4.5,
        lastReview: "05 Jul 2026",
        notes: "Strong team player with excellent communication skills. Produces high-quality work and adapts quickly to new responsibilities.",
        goalProgress: 90
      },
      {
        rating: 3.9,
        lastReview: "28 Jun 2026",
        notes: "Reliable and dependable. Meets deadlines consistently but could take more initiative during team projects.",
        goalProgress: 75
      },
      {
        rating: 4.7,
        lastReview: "01 Jul 2026",
        notes: "Outstanding attention to detail and problem-solving abilities. Frequently contributes innovative ideas that improve workflows.",
        goalProgress: 94
      },
      {
        rating: 3.4,
        lastReview: "25 Jun 2026",
        notes: "Meets most performance expectations. Should focus on improving time management and responding more promptly to client requests.",
        goalProgress: 68
      },
      {
        rating: 4.2,
        lastReview: "03 Jul 2026",
        notes: "Delivers quality work and collaborates well with colleagues. Could improve confidence when presenting ideas during meetings.",
        goalProgress: 82
      },
      {
        rating: 2.8,
        lastReview: "20 Jun 2026",
        notes: "Performance has declined over the past quarter. Improvement needed in attendance, communication, and meeting deadlines. Coaching recommended.",
        goalProgress: 45
      },
      {
        rating: 4.9,
        lastReview: "08 Jul 2026",
        notes: "Exceptional performer. Takes ownership of projects, supports teammates, and consistently exceeds business objectives.",
        goalProgress: 98
      },
      {
        rating: 3.6,
        lastReview: "29 Jun 2026",
        notes: "Solid contributor who completes assigned tasks well. Should work on developing leadership and decision-making skills.",
        goalProgress: 71
      },
      {
        rating: 4.3,
        lastReview: "06 Jul 2026",
        notes: "Excellent customer service and strong collaboration across departments. Demonstrates a positive attitude and willingness to learn.",
        goalProgress: 88
      },
      {
        rating: 3.1,
        lastReview: "18 Jun 2026",
        notes: "Shows potential but requires additional support in technical skills and task prioritization. Progress should be reviewed next cycle.",
        goalProgress: 56
      },
      {
        rating: 4.6,
        lastReview: "07 Jul 2026",
        notes: "Highly dependable and proactive. Regularly volunteers for new initiatives and maintains excellent quality standards.",
        goalProgress: 93
      }
    ];

    const review = reviews[index % reviews.length];

    return {
      employeeId: e.employeeId,
      name: e.name,
      role: e.position,
      dept: e.department,
      rating: review.rating,
      notes: review.notes,
      lastReview: review.lastReview,
      goalProgress: review.goalProgress
    };
  });

  // Load saved performance reviews
  const savedPerformance = localStorage.getItem("performanceData");

  if (savedPerformance) {
      const savedEmployees = JSON.parse(savedPerformance);

      savedEmployees.forEach(savedEmp => {
          const employee = employees.find(emp => emp.employeeId === savedEmp.employeeId);

          if (employee) {
              employee.rating = savedEmp.rating;
              employee.notes = savedEmp.notes;
              employee.lastReview = savedEmp.lastReview;
          }
      });
  }

  const performanceTbody = document.getElementById('performanceTbody');
  const teamPerformanceSub = document.getElementById('teamPerformanceSub');
  const reviewsTotalVal = document.getElementById('reviewsTotalVal');

  function renderPerformanceTable() {
    if (!performanceTbody) return;

    performanceTbody.innerHTML = employees.map(e => {
      const hasRating = e.rating !== null && e.rating !== undefined && e.rating !== '';
      const ratingBadgeCls = hasRating ? ratingTier(parseFloat(e.rating)) : 'none';
      const ratingText = hasRating ? parseFloat(e.rating).toFixed(1) : '—';
      let statusCls = "active";
      let statusText = "Meets Expectations";

      if (e.rating >= 4.5) {
          statusText = "Outstanding";
      } else if (e.rating >= 4.0) {
          statusText = "Exceeds Expectations";
      } else if (e.rating >= 3.0) {
          statusText = "Meets Expectations";
      } else {
          statusText = "Needs Improvement";
          statusCls = "overdue";
      }
      const actionLabel = hasRating ? 'View review' : 'Start review';
      const actionCls = hasRating ? 'view-review-btn' : 'start-review-btn';

      return `
        <tr data-name="${e.name.toLowerCase()}" data-role="${e.role.toLowerCase()}" data-dept="${e.dept.toLowerCase()}" data-rating="${hasRating ? e.rating : ''}" data-notes="${e.notes || ''}">
          <td><div class="emp-cell"><div class="emp-avatar">${initials(e.name)}</div><div><div class="emp-name">${e.name}</div><div class="emp-role">${e.role}</div></div></div></td>
          <td><span class="rating-badge ${ratingBadgeCls}">${ratingText}</span></td>
          <td>
            <td>
              <div class="goal-progress">
                <div class="goal-progress-track">
                  <div class="goal-progress-fill" style="width:${e.goalProgress}%;"></div>
                </div>
                <span class="goal-progress-label">${e.goalProgress}%</span>
              </div>
            </td>
          </td>
          <td class="last-review-cell">${e.lastReview ? e.lastReview : '—'}</td>
          <td><span class="status-pill ${statusCls}">${statusText}</span></td>
          <td><button class="pay-action-btn ${actionCls}" type="button">${actionLabel}</button></td>
        </tr>
      `;
    }).join('');

    if (teamPerformanceSub) teamPerformanceSub.textContent = `${employees.length} team members · no prior ratings in uploaded data`;
    if (reviewsTotalVal) reviewsTotalVal.textContent = String(employees.length);
  }

  renderPerformanceTable();

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

  /* ================= User menu ================= */

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

  /* ================= Live search (team performance table) ================= */

  const searchInput = document.getElementById('performanceSearch');
  const performanceEmptyState = document.getElementById('performanceEmptyState');
  const performanceTable = performanceEmptyState ? performanceEmptyState.previousElementSibling : null;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      let visible = 0;
      document.querySelectorAll('#performanceTbody tr').forEach(row => {
        const name = row.dataset.name || '';
        const role = row.dataset.role || '';
        const dept = row.dataset.dept || '';
        const match = !q || name.includes(q) || role.includes(q) || dept.includes(q);
        row.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (performanceEmptyState) performanceEmptyState.hidden = visible !== 0;
      if (performanceTable) performanceTable.style.display = visible === 0 ? 'none' : '';
    });
  }

  /* ================= Stat recalculation ================= */

  const avgRatingVal = document.getElementById('avgRatingVal');
  const reviewsCompletedVal = document.getElementById('reviewsCompletedVal');
  const overdueReviewsVal = document.getElementById('overdueReviewsVal');

  function recalcStats() {
    const rows = Array.from(document.querySelectorAll('#performanceTbody tr'));
    const ratedRows = rows.filter(r => r.dataset.rating);
    const overdueRows = rows.filter(r => r.querySelector('.status-pill')?.classList.contains('overdue'));

    if (avgRatingVal) {
      if (ratedRows.length) {
        const avg = ratedRows.reduce((sum, r) => sum + parseFloat(r.dataset.rating), 0) / ratedRows.length;
        avgRatingVal.textContent = avg.toFixed(1);
      } else {
        avgRatingVal.textContent = '—';
      }
    }
    if (reviewsCompletedVal) reviewsCompletedVal.textContent = String(ratedRows.length);
    if (overdueReviewsVal) overdueReviewsVal.textContent = String(overdueRows.length);
  }

  /* ================= Review modal (start / edit) ================= */

  const reviewModal = document.getElementById('reviewModal');
  const closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
  const cancelReviewBtn = document.getElementById('cancelReviewBtn');
  const reviewForm = document.getElementById('reviewForm');
  const reviewFormError = document.getElementById('reviewFormError');
  const reviewEmployeeName = document.getElementById('reviewEmployeeName');
  const reviewRatingInput = document.getElementById('reviewRatingInput');
  const reviewNotesInput = document.getElementById('reviewNotesInput');
  const reviewModalTitle = document.getElementById('reviewModalTitle');

  let activeReviewRow = null;
  let lastFocusedEl = null;

  function openReviewModal(row, { isEdit } = {}) {
    activeReviewRow = row;
    lastFocusedEl = document.activeElement;
    const name = row.querySelector('.emp-name').textContent;
    reviewEmployeeName.textContent = name;
    reviewModalTitle.textContent = isEdit ? 'Edit review' : 'Start review';
    reviewRatingInput.value = row.dataset.rating || '';
    reviewNotesInput.value = row.dataset.notes || '';
    reviewFormError.hidden = true;
    reviewModal.hidden = false;
    reviewRatingInput.focus();
  }

  function closeReviewModal() {
    reviewModal.hidden = true;
    reviewForm.reset();
    activeReviewRow = null;
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  if (closeReviewModalBtn) closeReviewModalBtn.addEventListener('click', closeReviewModal);
  if (cancelReviewBtn) cancelReviewBtn.addEventListener('click', closeReviewModal);
  reviewModal?.addEventListener('click', (e) => { if (e.target === reviewModal) closeReviewModal(); });

  reviewForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = reviewRatingInput.value;
    if (!rating || !activeReviewRow) {
      reviewFormError.hidden = false;
      return;
    }
    reviewFormError.hidden = true;

    const row = activeReviewRow;
    const name = row.querySelector('.emp-name').textContent;
    const wasOverdue = row.querySelector('.status-pill')?.classList.contains('overdue');

    row.dataset.rating = rating;
    row.dataset.notes = reviewNotesInput.value.trim();

    const ratingBadge = row.querySelector('.rating-badge');
    ratingBadge.textContent = parseFloat(rating).toFixed(1);
    ratingBadge.className = `rating-badge ${ratingTier(parseFloat(rating))}`;

    row.querySelector('.last-review-cell').textContent = todayFormatted();

    // Update employee object
    const employee = employees.find(emp => emp.name === name);

    if (employee) {
        employee.rating = parseFloat(rating);
        employee.notes = reviewNotesInput.value.trim();
        employee.lastReview = todayFormatted();
    }

    // Save to localStorage
    localStorage.setItem("performanceData", JSON.stringify(employees));

    const statusPill = row.querySelector('.status-pill');
    statusPill.className = 'status-pill active';
    statusPill.textContent = 'Reviewed';

    const actionBtn = row.querySelector('.pay-action-btn');
    actionBtn.textContent = 'View review';
    actionBtn.classList.remove('start-review-btn');
    actionBtn.classList.add('view-review-btn');

    recalcStats();
    showToast(wasOverdue ? `Review submitted for ${name}.` : `Review updated for ${name}.`);
    closeReviewModal();
  });

  /* ================= View review modal ================= */

  const viewReviewModal = document.getElementById('viewReviewModal');
  const closeViewReviewBtn = document.getElementById('closeViewReviewBtn');
  const closeViewReviewFooterBtn = document.getElementById('closeViewReviewFooterBtn');
  const editReviewBtn = document.getElementById('editReviewBtn');
  const viewReviewName = document.getElementById('viewReviewName');
  const viewReviewRating = document.getElementById('viewReviewRating');
  const viewReviewDate = document.getElementById('viewReviewDate');
  const viewReviewNotes = document.getElementById('viewReviewNotes');

  let viewedRow = null;

  function openViewReviewModal(row) {
    viewedRow = row;
    lastFocusedEl = document.activeElement;
    viewReviewName.textContent = row.querySelector('.emp-name').textContent;
    viewReviewRating.textContent = row.dataset.rating ? parseFloat(row.dataset.rating).toFixed(1) : '—';
    viewReviewDate.textContent = row.querySelector('.last-review-cell').textContent;
    viewReviewNotes.textContent = row.dataset.notes && row.dataset.notes.length
      ? row.dataset.notes
      : 'No notes recorded for this review yet.';
    viewReviewModal.hidden = false;
    closeViewReviewFooterBtn.focus();
  }

  function closeViewReviewModal() {
    viewReviewModal.hidden = true;
    viewedRow = null;
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  if (closeViewReviewBtn) closeViewReviewBtn.addEventListener('click', closeViewReviewModal);
  if (closeViewReviewFooterBtn) closeViewReviewFooterBtn.addEventListener('click', closeViewReviewModal);
  viewReviewModal?.addEventListener('click', (e) => { if (e.target === viewReviewModal) closeViewReviewModal(); });

  if (editReviewBtn) {
    editReviewBtn.addEventListener('click', () => {
      const row = viewedRow;
      closeViewReviewModal();
      if (row) openReviewModal(row, { isEdit: true });
    });
  }

  /* ================= Table action delegation (start / view review) ================= */

  document.getElementById('performanceTbody')?.addEventListener('click', (e) => {
    const startBtn = e.target.closest('.start-review-btn');
    const viewBtn = e.target.closest('.view-review-btn');
    if (!startBtn && !viewBtn) return;
    const row = e.target.closest('tr');
    if (startBtn) openReviewModal(row, { isEdit: false });
    if (viewBtn) openViewReviewModal(row);
  });

  /* ================= Schedule 1:1 modal ================= */

  const scheduleModal = document.getElementById('scheduleModal');
  const scheduleOneOnOneBtn = document.getElementById('scheduleOneOnOneBtn');
  const closeScheduleModalBtn = document.getElementById('closeScheduleModalBtn');
  const cancelScheduleBtn = document.getElementById('cancelScheduleBtn');
  const scheduleForm = document.getElementById('scheduleForm');
  const scheduleFormError = document.getElementById('scheduleFormError');
  const oneOnOneList = document.getElementById('oneOnOneList');
  const oneOnOneSub = document.getElementById('oneOnOneSub');
  const oneOnOneEmptyState = document.getElementById('oneOnOneEmptyState');

  function openScheduleModal() {
    lastFocusedEl = document.activeElement;
    scheduleModal.hidden = false;
    document.getElementById('scheduleNameInput').focus();
  }
  function closeScheduleModal() {
    scheduleModal.hidden = true;
    scheduleForm.reset();
    scheduleFormError.hidden = true;
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  if (scheduleOneOnOneBtn) scheduleOneOnOneBtn.addEventListener('click', openScheduleModal);
  if (closeScheduleModalBtn) closeScheduleModalBtn.addEventListener('click', closeScheduleModal);
  if (cancelScheduleBtn) cancelScheduleBtn.addEventListener('click', closeScheduleModal);
  scheduleModal?.addEventListener('click', (e) => { if (e.target === scheduleModal) closeScheduleModal(); });

  function updateOneOnOneSub() {
    const count = oneOnOneList.querySelectorAll('.leave-item').length;
    if (oneOnOneSub) oneOnOneSub.textContent = `${count} scheduled this week`;
    if (oneOnOneEmptyState) oneOnOneEmptyState.hidden = count !== 0;
    if (oneOnOneList) oneOnOneList.style.display = count === 0 ? 'none' : '';
  }

  scheduleForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('scheduleNameInput').value.trim();
    const date = document.getElementById('scheduleDateInput').value;
    const time = document.getElementById('scheduleTimeInput').value;

    if (!name || !date || !time) {
      scheduleFormError.hidden = false;
      return;
    }
    scheduleFormError.hidden = true;

    const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeLabel = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const item = document.createElement('div');
    item.className = 'leave-item';
    item.innerHTML = `
      <div class="leave-avatar">${initials(name)}</div>
      <div class="leave-info">
        <div class="name">${name}</div>
        <div class="meta"><i class="ti ti-clock leave-type-icon" aria-hidden="true"></i>${dateLabel} · ${timeLabel}</div>
      </div>
      <button class="one-on-one-done-btn" type="button" aria-label="Mark 1:1 with ${name} as done">
        <i class="ti ti-check" aria-hidden="true"></i>
      </button>
    `;
    oneOnOneList.appendChild(item);
    updateOneOnOneSub();
    showToast(`1:1 with ${name} scheduled for ${dateLabel}.`);
    closeScheduleModal();
  });

  oneOnOneList?.addEventListener('click', (e) => {
    const doneBtn = e.target.closest('.one-on-one-done-btn');
    if (!doneBtn) return;
    const item = e.target.closest('.leave-item');
    const name = item.querySelector('.name')?.textContent || 'This 1:1';
    item.remove();
    updateOneOnOneSub();
    showToast(`Marked 1:1 with ${name} as done.`);
  });

  /* ================= Global Escape handling ================= */

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (notifPanel && !notifPanel.hidden) { closeNotifPanel(); notifBtn.focus(); return; }
    if (reviewModal && !reviewModal.hidden) { closeReviewModal(); return; }
    if (viewReviewModal && !viewReviewModal.hidden) { closeViewReviewModal(); return; }
    if (scheduleModal && !scheduleModal.hidden) { closeScheduleModal(); return; }
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      sidebarToggle.focus();
    }
  });

  /* Initial sync */
  recalcStats();
  updateOneOnOneSub();
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