// ---------- Real employee dataset ----------


document.addEventListener("DOMContentLoaded", () => {

    /*=====================================================
      ELEMENTS
    =====================================================*/

    const searchInput = document.getElementById("payrollSearch");
    const processBatchBtn = document.getElementById("processBatchBtn");
    const recalcBtn = document.getElementById("recalcBtn");

    const emptyState = document.getElementById("emptyState");
    const tableEl = document.querySelector("table");  
    const tableBody = document.getElementById("payrollItemsTable");

    const slipModal = document.getElementById("slipModal");
    const closeModalBtn = document.getElementById("closeModalBtn");

    const confirmModal = document.getElementById("confirmModal");
    const confirmBody = document.getElementById("confirmBody");
    const cancelConfirmBtn = document.getElementById("cancelConfirmBtn");
    const confirmDisburseBtn = document.getElementById("confirmDisburseBtn");

    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");

    let lastFocusedEl = null;

    /*=====================================================
      HELPERS
    =====================================================*/

    const currency = value =>
        Number(value || 0).toLocaleString("en-ZA", {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2
        });

    const initials = name =>
        (name || "")
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();

    /*=====================================================
      BUILD SHARED EMPLOYEE DATA
      Every page in the HR system will use this.
    =====================================================*/

    function normalizeEmployee(emp){

        return {

            employeeId:
                emp.employeeId ||
                emp.localId,

            name:
                emp.name || "",

            email:
                emp.contact ||
                emp.email ||
                "",

            department:
                emp.department ||
                emp.dept ||
                "General",

            position:
                emp.position ||
                emp.role ||
                "Employee",

            baseSalary:
                Number(
                    emp.baseSalary ||
                    emp.salary ||
                    (emp.payroll ? emp.payroll.finalSalary : 25000)
                ),

            payroll:
                emp.payroll || {

                    hoursWorked:160,

                    leaveDeductions:0,

                    finalSalary:
                        Number(
                            emp.baseSalary ||
                            emp.salary ||
                            25000
                        )

                },

            attendance:
                emp.attendance || [],

            leaveRequests:
                emp.leaveRequests || []

        };

    }

    const employees =
        typeof HRStorage !== "undefined"
            ? HRStorage.buildEmployees(
                employeeData.employees,
                normalizeEmployee
            )
            : employeeData.employees.map(normalizeEmployee);

    /*=====================================================
      PAYROLL RECORDS
    =====================================================*/

    function buildEmployeeRecords() {

    function withPayrollDefaults(emp){

        // If employee came from the Employees page "Add employee" form
        // (or is otherwise missing payroll data), create sensible
        // defaults so payroll never crashes on a missing field.
        if (!emp.payroll) {
            emp.payroll = {
                hoursWorked: 160,
                leaveDeductions: 0,
                finalSalary: emp.salary || emp.baseSalary || 0
            };
        }

        return emp;

    }

    const rawEmployees =
        (typeof HRStorage !== "undefined")
            ? HRStorage.buildEmployees(employeeData.employees, withPayrollDefaults)
            : employeeData.employees;

    // Belt-and-braces: whatever HRStorage.buildEmployees() did internally,
    // guarantee every employee has payroll data before we read from it.
    // This covers employees merged in from localStorage that may bypass
    // the normalize callback above.
    const employees = rawEmployees.map(withPayrollDefaults);

    return employees.map(function(emp){

        const payroll = emp.payroll;

        const hoursWorked = payroll.hoursWorked || 160;
        const leaveDeductions = payroll.leaveDeductions || 0;
        const finalSalary = payroll.finalSalary || emp.baseSalary || emp.salary || 0;

        const payableHours = hoursWorked - leaveDeductions;

        const hourlyRate =
            payableHours > 0
                ? finalSalary / payableHours
                : 0;

        const deductionAmount =
            (emp.baseSalary || finalSalary) - finalSalary;

        const initials = emp.name
            .split(" ")
            .map(function(n){ return n[0]; })
            .join("")
            .toUpperCase();

        return {
            id: emp.employeeId || emp.localId,
            name: emp.name,
            role: emp.position || emp.role,
            initials: initials,
            baseSalary: emp.baseSalary || emp.salary || finalSalary,
            hourlyRate: hourlyRate,
            deductionAmount: deductionAmount,
            netPay: finalSalary,
            hoursWorked: hoursWorked,
            leaveDeductions: leaveDeductions,
            payableHours: payableHours
        };

    });

}

    /*=====================================================
      LIVE DATE
    =====================================================*/

    function updateLiveDate(){

        const now = new Date();

        const topbarDate =
            document.getElementById("topbarDate");

        if(topbarDate){

            topbarDate.textContent =
                `${now.toLocaleDateString("en-ZA",{

                    weekday:"long",

                    day:"numeric",

                    month:"long",

                    year:"numeric"

                })} · Review and run current monthly disbursals`;

        }

        const runCycle =
            document.getElementById("runCycleLabel");

        if(runCycle){

            runCycle.textContent =
                `Cycle locks soon · ${now.toLocaleDateString("en-ZA",{

                    month:"long",

                    year:"numeric"

                })} Run`;

        }

        const payPeriod =
            document.getElementById("slipTargetPayPeriod");

        if(payPeriod){

            payPeriod.textContent =
                now.toLocaleDateString("en-ZA",{

                    month:"long",

                    year:"numeric"

                });

        }

    }
  function renderRows(records) {
    tableBody.innerHTML = '';
    records.forEach(rec => {
      const tr = document.createElement('tr');
      tr.className = 'payroll-row';
      tr.innerHTML = `
        <td>
          <div class="emp-cell">
            <div class="emp-avatar">${rec.initials}</div>
            <div>
              <div class="emp-name">${rec.name}</div>
              <div class="emp-role">${rec.role}</div>
            </div>
          </div>
        </td>
        <td class="base-val" data-val="${rec.baseSalary}">${currency(rec.baseSalary)}</td>
        <td class="rate-val rate-color" data-val="${rec.hourlyRate}">${currency(rec.hourlyRate)}/hr</td>
        <td class="deduct-val deduct-color" data-val="${rec.deductionAmount}">-${currency(rec.deductionAmount)}</td>
        <td class="net-val" data-val="${rec.netPay}"><strong>${currency(rec.netPay)}</strong></td>
        <td><span class="status-pill calc">Calculated</span></td>
        <td>
          <div class="action-cell-group">
            <button class="pay-action-btn verify-btn">Verify Pay</button>
            <button class="slip-btn" title="Generate Payslip" aria-label="Generate payslip for ${rec.name}"><i class="ti ti-file-text"></i></button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Compute and refresh summary strip totals from current DOM state
  function updatePayrollCalculations() {
    const rows = document.querySelectorAll('.payroll-row');
    let grossTotal = 0;
    let deductTotal = 0;
    let netTotal = 0;

    rows.forEach(row => {
      const base = parseFloat(row.querySelector('.base-val').getAttribute('data-val')) || 0;
      const deduct = parseFloat(row.querySelector('.deduct-val').getAttribute('data-val')) || 0;
      const net = base - deduct;

      row.querySelector('.net-val strong').textContent = currency(net);
      row.querySelector('.net-val').setAttribute('data-val', net);

      grossTotal += base;
      deductTotal += deduct;
      netTotal += net;
    });

    document.getElementById('grossPool').textContent = currency(grossTotal);
    document.getElementById('deductPool').textContent = `-${currency(deductTotal)}`;
    document.getElementById('netPool').textContent = currency(netTotal);
  }

  function attachRowHandlers() {
    document.querySelectorAll('.payroll-row').forEach(row => {
      const actionBtn = row.querySelector('.verify-btn');
      const statusPill = row.querySelector('.status-pill');
      const slipBtn = row.querySelector('.slip-btn');

      actionBtn.addEventListener('click', () => {
        const name = row.querySelector('.emp-name').textContent;
        statusPill.className = 'status-pill verified';
        statusPill.textContent = 'Verified';
        actionBtn.textContent = 'Locked';
        actionBtn.classList.add('disabled');
        actionBtn.disabled = true;
        showToast(`Calculations successfully locked for ${name}.`);
      });

      slipBtn.addEventListener('click', () => {
        const name = row.querySelector('.emp-name').textContent;
        const role = row.querySelector('.emp-role').textContent;
        const status = statusPill.textContent;

        const base = parseFloat(row.querySelector('.base-val').getAttribute('data-val')) || 0;
        const rate = parseFloat(row.querySelector('.rate-val').getAttribute('data-val')) || 0;
        const deduct = parseFloat(row.querySelector('.deduct-val').getAttribute('data-val')) || 0;
        const net = base - deduct;

        document.getElementById('slipTargetName').textContent = name;
        document.getElementById('slipTargetRole').textContent = role;
        document.getElementById('slipTargetStatus').textContent = status;
        document.getElementById('slipTargetBase').textContent = currency(base);
        document.getElementById('slipTargetRate').textContent = `${currency(rate)}/hr`;
        document.getElementById('slipTargetDeduct').textContent = `-${currency(deduct)}`;
        document.getElementById('slipTargetNet').textContent = currency(net);

        openModal(slipModal, closeModalBtn, slipBtn);
      });
    });
  }

  // ---------- Modal open/close helpers ----------
  function openModal(modalEl, focusTarget, triggerEl) {
    lastFocusedEl = triggerEl || document.activeElement;
    modalEl.classList.add('active');
    (focusTarget || modalEl).focus();
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('active');
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function getActiveModal() {
    return document.querySelector('.modal-overlay.active');
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', () => closeModal(slipModal));

  window.addEventListener('click', (e) => {
    if (e.target === slipModal) closeModal(slipModal);
    if (e.target === confirmModal) closeModal(confirmModal);
  });

  // ---------- Sidebar (mobile) ----------
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

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const active = getActiveModal();
      if (active) {
        closeModal(active);
        return;
      }
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        sidebarToggle.setAttribute('aria-expanded', 'false');
        sidebarToggle.focus();
      }
    }
  });

  // ---------- Global disbursal (with confirmation + verification gate) ----------
  if (processBatchBtn) {
    processBatchBtn.addEventListener('click', () => {
      const rows = Array.from(document.querySelectorAll('.payroll-row'));
      const eligibleRows = rows.filter(row => row.querySelector('.verify-btn').textContent === 'Locked');
      const unverifiedCount = rows.filter(row => row.querySelector('.verify-btn').textContent === 'Verify Pay').length;

      if (eligibleRows.length === 0) {
        showToast(unverifiedCount > 0
          ? 'No rows are verified yet. Verify pay before processing payouts.'
          : 'All rows are already processed.');
        return;
      }

      confirmBody.textContent = unverifiedCount > 0
        ? `You're about to release payment to ${eligibleRows.length} verified employee(s). ${unverifiedCount} unverified row(s) will be skipped. This cannot be undone.`
        : `You're about to release payment to ${eligibleRows.length} employee(s). This cannot be undone.`;

      openModal(confirmModal, cancelConfirmBtn, processBatchBtn);

      const doDisburse = () => {
        let paidCount = 0;
        eligibleRows.forEach(row => {
          const actionBtn = row.querySelector('.verify-btn');
          const statusPill = row.querySelector('.status-pill');
          statusPill.className = 'status-pill disbursed';
          statusPill.textContent = 'Paid';
          actionBtn.textContent = 'Released';
          actionBtn.classList.add('disabled');
          actionBtn.disabled = true;
          paidCount++;
        });

        closeModal(confirmModal);

        const stillUnprocessed = Array.from(document.querySelectorAll('.payroll-row')).some(row => {
          const b = row.querySelector('.verify-btn');
          return b.textContent === 'Verify Pay' || b.textContent === 'Locked';
        });
        if (!stillUnprocessed) {
          processBatchBtn.style.background = '#1c8a4c';
          processBatchBtn.innerHTML = '<i class="ti ti-check"></i> Batch Disbursed';
          processBatchBtn.disabled = true;
        }

        showToast(`Success! Funds released for ${paidCount} employee(s).`);
        cleanup();
      };

      const doCancel = () => {
        closeModal(confirmModal);
        cleanup();
      };

      function cleanup() {
        confirmDisburseBtn.removeEventListener('click', doDisburse);
        cancelConfirmBtn.removeEventListener('click', doCancel);
      }

      confirmDisburseBtn.addEventListener('click', doDisburse);
      cancelConfirmBtn.addEventListener('click', doCancel);
    });
  }

  if (recalcBtn) {
    recalcBtn.addEventListener('click', () => {
      updateLiveDate();
      updatePayrollCalculations();
      showToast('Calculations updated from active base structures.');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const criteria = e.target.value.toLowerCase().trim();
      let visibleCount = 0;

      document.querySelectorAll('.payroll-row').forEach(row => {
        const empName = row.querySelector('.emp-name').textContent.toLowerCase();
        const empRole = row.querySelector('.emp-role').textContent.toLowerCase();
        const matches = empName.includes(criteria) || empRole.includes(criteria);
        row.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });

      const noMatches = visibleCount === 0;
      if (emptyState) emptyState.hidden = !noMatches;
      if (tableEl) tableEl.style.display = noMatches ? 'none' : '';
    });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = '#27187e';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.fontSize = '13.5px';
    toast.style.fontWeight = '500';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s ease';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

// ---------- Boot ----------

function initialisePayroll() {

    updateLiveDate();

    const records = buildEmployeeRecords();

    renderRows(records);

    attachRowHandlers();

    updatePayrollCalculations();

}

initialisePayroll();
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