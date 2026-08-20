(function(){

  var deptColors = {
    Development: '#27187e',
    Design: '#758bfd',
    Sales: '#ff8600',
    Marketing: '#8a87a8',
    HR: '#e63946',
    QA: '#2a9d8f',
    Finance: '#e9c46a',
    IT: '#264653',
    Support: '#f4a261'
  };

  // Build the working "employees" array from the real data loaded via hr-employee-data.js.
  // Maps field names (department -> dept, position -> role, contact -> email) and
  // derives fields the real data doesn't have (start date, status) from what's available.
  function mapEmployee(e){
    var yearMatch = (e.employmentHistory || '').match(/\d{4}/);
    var hasApprovedLeave = (e.leaveRequests || []).some(function(lr){
      return lr.status === 'Approved';
    });

    return {
      employeeId: e.employeeId,
      name: e.name,
      email: e.contact,
      dept: e.department,
      role: e.position,
      start: yearMatch ? yearMatch[0] + '-01-01' : '2020-01-01',
      status: hasApprovedLeave ? 'leave' : 'active',
      salary: e.payroll ? e.payroll.finalSalary : e.baseSalary,
      attendance: e.attendance || [],
      leaveRequests: e.leaveRequests || []
    };
  }

  // Overrides (added/removed/edited) persisted in localStorage via HRStorage
  var employees = (typeof HRStorage !== 'undefined')
    ? HRStorage.buildEmployees(employeeData.employees, mapEmployee)
    : employeeData.employees.map(mapEmployee);

  var state = { search:'', dept:'All', sortDir:'asc', page:1, pageSize:8 };

  var tbody = document.getElementById('employeeTableBody');
  var pager = document.getElementById('pager');
  var footerInfo = document.getElementById('footerInfo');
  var directoryCount = document.getElementById('directoryCount');
  var searchInput = document.getElementById('searchInput');
  var filterRow = document.getElementById('filterRow');
  var sortChip = document.getElementById('sortChip');

  function initials(name){
    var parts = name.trim().split(' ');
    return ((parts[0] || '')[0] + (parts[parts.length-1] || '')[0]).toUpperCase();
  }

  function formatDate(iso){
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  }

  function statusLabel(status){
    if (status === 'active') return { cls:'active', text:'Active' };
    if (status === 'onboarding') return { cls:'onboarding', text:'Onboarding' };
    return { cls:'leave', text:'On leave' };
  }

  function getFiltered(){
    var q = state.search.trim().toLowerCase();
    var rows = employees.filter(function(e){
      var matchesDept = state.dept === 'All' || e.dept === state.dept;
      var matchesSearch = !q || e.name.toLowerCase().indexOf(q) !== -1 || e.email.toLowerCase().indexOf(q) !== -1;
      return matchesDept && matchesSearch;
    });
    rows.sort(function(a, b){
      var cmp = a.name.localeCompare(b.name);
      return state.sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }

  function closeAllDropdowns(){
    var open = tbody.querySelectorAll('.row-dropdown.open');
    for (var i = 0; i < open.length; i++) open[i].classList.remove('open');
  }

  function renderRows(rows){
    if (!rows.length){
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No employees match your search or filter.</td></tr>';
      return;
    }
    var html = '';
    rows.forEach(function(e, idx){
      var st = statusLabel(e.status);
      var color = deptColors[e.dept] || '#8a87a8';
      html += ''
        + '<tr>'
        + '<td><div class="emp-cell"><div class="emp-avatar">' + initials(e.name) + '</div><div><div class="emp-name">' + e.name + '</div><div class="emp-email">' + e.email + '</div></div></div></td>'
        + '<td><span class="dept-tag"><span class="dept-dot" style="background:' + color + ';"></span>' + e.dept + '</span></td>'
        + '<td>' + e.role + '</td>'
        + '<td>' + formatDate(e.start) + '</td>'
        + '<td><span class="status-pill ' + st.cls + '">' + st.text + '</span></td>'
        + '<td><div class="row-menu-wrap">'
        + '<button class="row-menu" data-row="' + idx + '" aria-label="Row actions"><i class="ti ti-dots"></i></button>'
        + '<div class="row-dropdown" data-dropdown="' + idx + '">'
        + '<button type="button" data-action="view" data-row="' + idx + '"><i class="ti ti-eye"></i>View profile</button>'
        + '<button type="button" data-action="edit" data-row="' + idx + '"><i class="ti ti-edit"></i>Edit details</button>'
        + '<button type="button" class="danger" data-action="remove" data-row="' + idx + '"><i class="ti ti-trash"></i>Remove</button>'
        + '</div>'
        + '</div></td>'
        + '</tr>';
    });
    tbody.innerHTML = html;
  }

  function renderPager(totalPages){
    var html = '';
    html += '<button class="page-btn" id="pagerPrev" ' + (state.page === 1 ? 'disabled' : '') + '><i class="ti ti-chevron-left"></i></button>';
    for (var p = 1; p <= totalPages; p++){
      html += '<button class="page-btn' + (p === state.page ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
    }
    html += '<button class="page-btn" id="pagerNext" ' + (state.page === totalPages ? 'disabled' : '') + '><i class="ti ti-chevron-right"></i></button>';
    pager.innerHTML = html;
  }

  function render(){
    var filtered = getFiltered();
    var totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;

    var start = (state.page - 1) * state.pageSize;
    var pageRows = filtered.slice(start, start + state.pageSize);

    renderRows(pageRows);
    renderPager(totalPages);

    var from = filtered.length ? start + 1 : 0;
    var to = Math.min(start + state.pageSize, filtered.length);
    footerInfo.textContent = 'Showing ' + from + '\u2013' + to + ' of ' + filtered.length + ' employees';
    directoryCount.textContent = 'Showing ' + pageRows.length + ' of ' + filtered.length;

    updateSummary();
  }

  function updateSummary(){
    var depts = {};
    employees.forEach(function(e){ depts[e.dept] = true; });
    var deptCount = Object.keys(depts).length;

    document.getElementById('statTotal').textContent = employees.length;
    document.getElementById('statActive').textContent = employees.filter(function(e){ return e.status === 'active'; }).length;
    document.getElementById('statOnboarding').textContent = employees.filter(function(e){ return e.status === 'onboarding'; }).length;
    document.getElementById('statDepartments').textContent = deptCount;

    var subEl = document.getElementById('employeeSub');
    if (subEl){
      subEl.textContent = employees.length + ' people across ' + deptCount + ' departments';
    }
  }

  searchInput.addEventListener('input', function(){
    state.search = searchInput.value;
    state.page = 1;
    render();
  });

  filterRow.addEventListener('click', function(e){
    var chip = e.target.closest('.chip[data-dept]');
    if (!chip) return;
    var chips = filterRow.querySelectorAll('.chip[data-dept]');
    for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
    chip.classList.add('active');
    state.dept = chip.getAttribute('data-dept');
    state.page = 1;
    render();
  });

  sortChip.addEventListener('click', function(){
    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    sortChip.innerHTML = '<i class="ti ti-adjustments-horizontal"></i>Sort: name ' + (state.sortDir === 'asc' ? '\u2191' : '\u2193');
    render();
  });

  pager.addEventListener('click', function(e){
    var pageBtn = e.target.closest('[data-page]');
    if (pageBtn){
      state.page = parseInt(pageBtn.getAttribute('data-page'), 10);
      render();
      return;
    }
    if (e.target.closest('#pagerPrev') && state.page > 1){
      state.page -= 1;
      render();
    }
    if (e.target.closest('#pagerNext')){
      state.page += 1;
      render();
    }
  });

  tbody.addEventListener('click', function(e){
    var menuBtn = e.target.closest('.row-menu');
    if (menuBtn){
      var row = menuBtn.getAttribute('data-row');
      var dropdown = tbody.querySelector('[data-dropdown="' + row + '"]');
      var wasOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!wasOpen) dropdown.classList.add('open');
      return;
    }
    var actionBtn = e.target.closest('[data-action]');
    if (actionBtn){
      var action = actionBtn.getAttribute('data-action');
      var idx = parseInt(actionBtn.getAttribute('data-row'), 10);
      var visibleRows = getFiltered().slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
      var employee = visibleRows[idx];
      closeAllDropdowns();
      if (!employee) return;
      if (action === 'view') showToast('Viewing ' + employee.name + '\u2019s profile');
      if (action === 'edit') showToast('Editing ' + employee.name);
      if (action === 'remove'){
        // Persist the removal so it survives a refresh and applies on every page
        if (typeof HRStorage !== 'undefined') HRStorage.removeEmployee(HRStorage.idOf(employee));
        var realIdx = employees.indexOf(employee);
        if (realIdx > -1) employees.splice(realIdx, 1);
        showToast(employee.name + ' removed from directory');
        render();
      }
    }
  });

  document.addEventListener('click', function(e){
    if (!e.target.closest('.row-menu-wrap')) closeAllDropdowns();
  });

  var modalOverlay = document.getElementById('modalOverlay');
  var addEmployeeForm = document.getElementById('addEmployeeForm');

  function openModal(){
    modalOverlay.classList.add('open');
    document.getElementById('fieldName').focus();
  }
  function closeModal(){
    modalOverlay.classList.remove('open');
    addEmployeeForm.reset();
  }

  document.getElementById('addEmployeeBtn').addEventListener('click', openModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function(e){
    if (e.target === modalOverlay) closeModal();
  });

  addEmployeeForm.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('fieldName').value.trim();
    var email = document.getElementById('fieldEmail').value.trim();
    var dept = document.getElementById('fieldDept').value;
    var role = document.getElementById('fieldRole').value.trim();
    var salary = Number(document.getElementById('fieldSalary').value);
    if (!name || !email || !role) return;

    var today = new Date().toISOString().slice(0, 10);
    var newEmployeeData = {

        employeeId: "EMP" + Date.now(),

        name: name,

        contact: email,

        email: email,

        department: dept,

        dept: dept,

        position: role,

        role: role,

        start: today,

        status: "onboarding",

        baseSalary: salary,

        salary: salary,

        payroll: {
            hoursWorked: 160,
            leaveDeductions: 0,
            finalSalary: salary
        },

        attendance: [],

        leaveRequests: [],

        employmentHistory: today

    };

    // Persist to localStorage so it survives a refresh and shows up on every page
    var newEmployee = (typeof HRStorage !== 'undefined')
      ? HRStorage.addEmployee(newEmployeeData)
      : newEmployeeData;

    employees.unshift(newEmployee);

    closeModal();
    state.page = 1;
    render();
    showToast(name + ' added to the directory');
  });

  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(message){
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2600);
  }

  /* ================= Sidebar (mobile) ================= */

  var sidebar = document.getElementById('sidebar');
  var sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function(){
      var isOpen = sidebar.classList.toggle('open');
      sidebarToggle.setAttribute('aria-expanded', String(isOpen));
    });

    var navLinks = sidebar.querySelectorAll('.nav-item');
    for (var i = 0; i < navLinks.length; i++){
      navLinks[i].addEventListener('click', function(){
        sidebar.classList.remove('open');
        sidebarToggle.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* ================= User menu (placeholder dropdown) ================= */

  var userMenuBtn = document.getElementById('userMenuBtn');
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', function(){
      var isExpanded = userMenuBtn.getAttribute('aria-expanded') === 'true';
      userMenuBtn.setAttribute('aria-expanded', String(!isExpanded));
    });
  }

  /* ================= Notifications dropdown ================= */

  var notifBtn = document.getElementById('notifBtn');
  var notifPanel = document.getElementById('notifPanel');
  var notifDot = document.getElementById('notifDot');
  var notifMarkAllBtn = document.getElementById('notifMarkAllBtn');

  function closeNotifPanel(){
    if (!notifPanel || notifPanel.hidden) return;
    notifPanel.hidden = true;
    notifBtn.setAttribute('aria-expanded', 'false');
  }
  function openNotifPanel(){
    notifPanel.hidden = false;
    notifBtn.setAttribute('aria-expanded', 'true');
  }

  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', function(e){
      e.stopPropagation();
      notifPanel.hidden ? openNotifPanel() : closeNotifPanel();
    });

    document.addEventListener('click', function(e){
      if (!notifPanel.hidden && !notifPanel.contains(e.target) && e.target !== notifBtn) {
        closeNotifPanel();
      }
    });
  }

  if (notifMarkAllBtn) {
    notifMarkAllBtn.addEventListener('click', function(){
      var unread = document.querySelectorAll('.notif-item.unread');
      for (var i = 0; i < unread.length; i++) unread[i].classList.remove('unread');
      if (notifDot) notifDot.style.display = 'none';
      showToast('All notifications marked as read.');
    });
  }

  /* ================= Global Escape handling (notif panel + modal + sidebar) ================= */

  window.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;

    if (notifPanel && !notifPanel.hidden) {
      closeNotifPanel();
      notifBtn.focus();
      return;
    }
    if (modalOverlay && modalOverlay.classList.contains('open')) {
      closeModal();
      return;
    }
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      sidebarToggle.focus();
    }
  });

  render();
})();

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