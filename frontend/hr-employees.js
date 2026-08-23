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

  // Maps a raw employee record from GET /api/employees into the shape
  // this page renders. Note: the list endpoint doesn't currently include
  // leave status, so every fetched employee shows as "Active" here —
  // "onboarding"/"leave" badges would need either a richer endpoint or a
  // second call to leave data, which isn't wired up yet.
  function mapEmployee(e){
    var yearMatch = (e.employment_history || '').match(/\d{4}/);

    return {
      employeeId: e.employee_id,
      employeeCode: e.employee_code,
      name: e.name,
      email: e.email || e.contact || '',
      dept: e.department,
      role: e.position,
      start: yearMatch ? yearMatch[0] + '-01-01' : '2020-01-01',
      status: 'active',
      salary: e.base_salary
    };
  }

  var employees = [];

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

  // ================= Load real data from the backend =================

  function loadEmployees(){
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Loading employees\u2026</td></tr>';

    apiFetch('/employees')
      .then(function(result){
        employees = (result.data || []).map(mapEmployee);
        render();
      })
      .catch(function(err){
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Couldn\u2019t load employees: ' + err.message + '</td></tr>';
        showToast('Failed to load employees from the server');
      });
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
      if (action === 'view'){
        openViewModal(employee.employeeId);
      }
      if (action === 'edit'){
        openEditModal(employee.employeeId);
      }
      if (action === 'remove'){
        if (!confirm('Remove ' + employee.name + ' from the directory? This can be undone by an admin later (soft delete).')) return;

        apiFetch('/employees/' + employee.employeeId, { method: 'DELETE' })
          .then(function(){
            var realIdx = employees.indexOf(employee);
            if (realIdx > -1) employees.splice(realIdx, 1);
            showToast(employee.name + ' removed from directory');
            render();
          })
          .catch(function(err){
            showToast('Failed to remove ' + employee.name + ': ' + err.message);
          });
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
    var position = document.getElementById('fieldRole').value.trim();
    var salary = Number(document.getElementById('fieldSalary').value);
    var password = document.getElementById('fieldPassword').value;
    if (!name || !email || !position || !password) return;

    var submitBtn = addEmployeeForm.querySelector('.primary-btn');
    submitBtn.disabled = true;

    apiFetch('/employees', {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        email: email,
        department: dept,
        position: position,
        baseSalary: salary,
        password: password
      })
    })
      .then(function(){
        closeModal();
        showToast(name + ' added');
        loadEmployees();
      })
      .catch(function(err){
        showToast('Failed to add ' + name + ': ' + err.message);
      })
      .finally(function(){
        submitBtn.disabled = false;
      });
  });

  /* ================= View employee (profile modal) ================= */

  var viewModalOverlay = document.getElementById('viewModalOverlay');
  var viewModalBody = document.getElementById('viewModalBody');

  function closeViewModal(){
    viewModalOverlay.classList.remove('open');
  }

  function escapeHtml(str){
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function openViewModal(employeeId){
    viewModalBody.innerHTML = '<p>Loading…</p>';
    viewModalOverlay.classList.add('open');

    apiFetch('/employees/' + employeeId)
      .then(function(result){
        var e = result.data;
        viewModalBody.innerHTML =
          '<div class="profile-row"><span class="profile-label">Name</span><span>' + escapeHtml(e.name) + '</span></div>' +
          '<div class="profile-row"><span class="profile-label">Email</span><span>' + escapeHtml(e.email || '—') + '</span></div>' +
          '<div class="profile-row"><span class="profile-label">Employee code</span><span>' + escapeHtml(e.employee_code) + '</span></div>' +
          '<div class="profile-row"><span class="profile-label">Department</span><span>' + escapeHtml(e.department) + '</span></div>' +
          '<div class="profile-row"><span class="profile-label">Role</span><span>' + escapeHtml(e.position) + '</span></div>' +
          '<div class="profile-row"><span class="profile-label">Base salary</span><span>R ' + Number(e.base_salary).toLocaleString('en-ZA') + '</span></div>' +
          '<div class="profile-row"><span class="profile-label">Contact</span><span>' + escapeHtml(e.contact || '—') + '</span></div>' +
          '<div class="profile-row"><span class="profile-label">Status</span><span>' + (e.is_active ? 'Active' : 'Inactive') + '</span></div>';
      })
      .catch(function(err){
        viewModalBody.innerHTML = '<p>Couldn\u2019t load profile: ' + escapeHtml(err.message) + '</p>';
      });
  }

  document.getElementById('viewModalClose').addEventListener('click', closeViewModal);
  document.getElementById('viewModalCloseBtn').addEventListener('click', closeViewModal);
  viewModalOverlay.addEventListener('click', function(e){
    if (e.target === viewModalOverlay) closeViewModal();
  });

  /* ================= Edit employee ================= */

  var editModalOverlay = document.getElementById('editModalOverlay');
  var editEmployeeForm = document.getElementById('editEmployeeForm');
  var editingEmployeeId = null;

  function closeEditModal(){
    editModalOverlay.classList.remove('open');
    editEmployeeForm.reset();
    editingEmployeeId = null;
  }

  function openEditModal(employeeId){
    apiFetch('/employees/' + employeeId)
      .then(function(result){
        var e = result.data;
        editingEmployeeId = employeeId;
        document.getElementById('fieldEditName').value = e.name || '';
        document.getElementById('fieldEditEmail').value = e.email || '';
        document.getElementById('fieldEditDept').value = e.department || '';
        document.getElementById('fieldEditRole').value = e.position || '';
        document.getElementById('fieldEditSalary').value = e.base_salary || 0;
        editModalOverlay.classList.add('open');
      })
      .catch(function(err){
        showToast('Couldn\u2019t load employee: ' + err.message);
      });
  }

  document.getElementById('editModalClose').addEventListener('click', closeEditModal);
  document.getElementById('editModalCancel').addEventListener('click', closeEditModal);
  editModalOverlay.addEventListener('click', function(e){
    if (e.target === editModalOverlay) closeEditModal();
  });

  editEmployeeForm.addEventListener('submit', function(e){
    e.preventDefault();
    if (!editingEmployeeId) return;

    var name = document.getElementById('fieldEditName').value.trim();
    var email = document.getElementById('fieldEditEmail').value.trim();
    var dept = document.getElementById('fieldEditDept').value;
    var position = document.getElementById('fieldEditRole').value.trim();
    var salary = Number(document.getElementById('fieldEditSalary').value);
    if (!name || !email || !position) return;

    var submitBtn = editEmployeeForm.querySelector('.primary-btn');
    submitBtn.disabled = true;

    apiFetch('/employees/' + editingEmployeeId, {
      method: 'PATCH',
      body: JSON.stringify({
        name: name,
        email: email,
        department: dept,
        position: position,
        base_salary: salary
      })
    })
      .then(function(){
        closeEditModal();
        showToast(name + ' updated');
        loadEmployees();
      })
      .catch(function(err){
        showToast('Failed to update ' + name + ': ' + err.message);
      })
      .finally(function(){
        submitBtn.disabled = false;
      });
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

  /* Mark-all-read is now handled by notifications.js (real API) */

  /* ================= Global Escape handling (notif panel + modal + sidebar) ================= */

  window.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;

    if (notifPanel && !notifPanel.hidden) {
      closeNotifPanel();
      notifBtn.focus();
      return;
    }
    if (viewModalOverlay && viewModalOverlay.classList.contains('open')) {
      closeViewModal();
      return;
    }
    if (editModalOverlay && editModalOverlay.classList.contains('open')) {
      closeEditModal();
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

  loadEmployees();
})();

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