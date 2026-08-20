document.addEventListener("DOMContentLoaded", () => {
  const leaveSearch = document.getElementById("leaveSearch");
  const leaveDepartment = document.getElementById("leaveDepartment");
  const leaveType = document.getElementById("leaveType");
  const leaveCount = document.getElementById("leaveCount");
  const leaveRows = document.getElementById("leaveRows");

  // Shared key so the Time Off page (and any other page) can read the same
  // approve/decline decisions made here.
  const OVERRIDES_KEY = "moderntech_leaveStatusOverrides";

  function loadLeaveOverrides() {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}");
    } catch (e) {
      saved = {};
    }
    employeeData.employees.forEach((employee) => {
      employee.leaveRequests.forEach((leave) => {
        const override = saved[leave.leaveId];
        if (override) {
          leave.status = override.status;
          if (override.reason !== undefined) {
            leave.reason = override.reason;
          }
        }
      });
    });
  }

  function saveLeaveOverride(leaveId, data) {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}");
    } catch (e) {
      saved = {};
    }
    saved[leaveId] = data;
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(saved));
  }

  // Apply any previously saved decisions before building the table, so a
  // refresh doesn't lose approvals/declines.
  loadLeaveOverrides();

  let leaveRequests = [];

  employeeData.employees.forEach((employee) => {
    employee.leaveRequests.forEach((leave) => {
      leaveRequests.push({
        leaveId: leave.leaveId,
        employee: employee.name,
        empId: employee.employeeId,
        department: employee.department,

        leaveType: leave.type,

        startDate: leave.startDate,
        endDate: leave.endDate,

        duration: leave.duration,

        reason: leave.reason,

        submitted: leave.submitted,

        manager: leave.manager,

        status: leave.status,
      });
    });
  });

  function formatBadgeType(type) {
    return type.replace(/\s+/g, "-").toLowerCase();
  }

  const modalOverlay = document.getElementById("leaveModalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");
  const modalRequestDetails = document.getElementById("modalRequestDetails");
  const modalTextareaLabel = document.getElementById("modalTextareaLabel");
  const modalReasonTextarea = document.getElementById("modalReasonTextarea");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");

  let activeLeaveRequestIndex = null;
  let activeAction = null;

  function openModal(index, action) {
    activeLeaveRequestIndex = index;
    activeAction = action;
    const request = leaveRequests[index];

    modalTitle.textContent =
      action === "approve" ? "Approve Leave Request" : "Decline Leave Request";
    modalSubtitle.textContent =
      action === "approve"
        ? "You are about to approve this leave request."
        : "Please provide a reason for declining this request.";

    modalRequestDetails.innerHTML = `
      <strong>${request.employee}</strong> (${request.empId})<br />
      ${request.department} • ${request.leaveType} • ${request.duration}<br />
      ${request.startDate} - ${request.endDate}<br />
      Submitted: ${request.submitted} • Manager:Busiswa Bala
    `;

    if (action === "approve") {
      modalTextareaLabel.style.display = "none";
      modalReasonTextarea.style.display = "none";
      modalReasonTextarea.value = "";
      modalConfirmBtn.textContent = "Approve";
    } else {
      modalTextareaLabel.style.display = "block";
      modalReasonTextarea.style.display = "block";
      modalReasonTextarea.value = "";
      modalConfirmBtn.textContent = "Decline";
      modalReasonTextarea.focus();
    }

    modalConfirmBtn.disabled = false;
    modalOverlay.classList.remove("hidden");
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
    activeLeaveRequestIndex = null;
    activeAction = null;
    modalReasonTextarea.value = "";
  }

  function handleModalConfirm() {
    if (activeLeaveRequestIndex === null) {
      return;
    }

    const request = leaveRequests[activeLeaveRequestIndex];

    if (activeAction === "approve") {
      request.status = "Approved";
      saveLeaveOverride(request.leaveId, {
        status: "Approved",
        reason: request.reason,
      });
      renderLeaveRows();
      closeModal();
      return;
    }

    const reason = modalReasonTextarea.value.trim();

    if (!reason) {
      modalReasonTextarea.focus();
      return;
    }

    request.status = "Declined";
    request.reason = reason;
    saveLeaveOverride(request.leaveId, {
      status: "Declined",
      reason: reason,
    });
    renderLeaveRows();
    closeModal();
  }

  function attachRowActions(row, request, index) {
    const approveBtn = row.querySelector(".approve");
    const declineBtn = row.querySelector(".decline");

    approveBtn.addEventListener("click", () => openModal(index, "approve"));
    declineBtn.addEventListener("click", () => openModal(index, "decline"));
  }

  function renderLeaveRows() {
    const filtered = leaveRequests.filter((request) => {
      const searchValue = leaveSearch.value.toLowerCase();
      const departmentValue = leaveDepartment.value;
      const typeValue = leaveType.value;

      const matchesSearch =
        request.employee.toLowerCase().includes(searchValue) ||
        String(request.empId).toLowerCase().includes(searchValue) ||
        request.department.toLowerCase().includes(searchValue);

      const matchesDepartment =
        departmentValue === "All Departments" ||
        request.department === departmentValue;

      const matchesType =
        typeValue === "All Types" || request.leaveType === typeValue;

      return matchesSearch && matchesDepartment && matchesType;
    });

    leaveCount.textContent = filtered.length;
    leaveRows.innerHTML = "";

    filtered.forEach((request) => {
      const index = leaveRequests.indexOf(request);
      const row = document.createElement("tr");
      const statusClass = request.status.toLowerCase().replace(/\s+/g, "");
      row.innerHTML = `
        <td>
          <div class="emp-cell">
            <div class="emp-avatar">${request.employee
              .split(" ")
              .map((n) => n[0])
              .join("")}</div>
            <div>
              <div class="emp-name">${request.employee}</div>
            </div>
          </div>
        </td>
        <td>${request.empId}</td>
        <td>${request.department}</td>
        <td><span class="status-pill ${formatBadgeType(request.leaveType)}">${request.leaveType}</span></td>
        <td>${request.startDate}</td>
        <td>${request.endDate}</td>
        <td>${request.duration}</td>
        <td>${request.reason}</td>
        <td>${request.submitted}</td>
        <td>Busiswa Bala</td>
        <td><span class="status-pill ${statusClass}">${request.status}</span></td>
        <td>
          <div class="action-cell-group">
            <button class="pay-action-btn approve">Approve</button>
            <button class="pay-action-btn decline">Decline</button>
          </div>
        </td>
      `;

      leaveRows.appendChild(row);
      attachRowActions(row, request, index);
    });
  }

  leaveSearch.addEventListener("input", renderLeaveRows);
  leaveDepartment.addEventListener("change", renderLeaveRows);
  leaveType.addEventListener("change", renderLeaveRows);

  modalCancelBtn.addEventListener("click", closeModal);
  modalCloseBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });
  modalConfirmBtn.addEventListener("click", handleModalConfirm);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
      closeModal();
    }
  });

  renderLeaveRows();
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