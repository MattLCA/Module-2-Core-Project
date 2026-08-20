const accounts = {
  hr: { email: "hr@moderntech.com", password: "hr123", redirect: "hr-dashboard.html" },
  worker: { email: "worker@moderntech.com", password: "worker123", redirect: "worker-dashboard.html" }
};

const defaultProfile = {
  fullName: "Keshav Naidoo",
  jobTitle: "Sales Representative",
  emailAddress: "keshav@moderntech.com",
  phoneNumber: "+27 71 234 5678",
  department: "Sales",
  employeeId: "EMP-2048",
  emergencyContact: "A. Naidoo - +27 72 555 0199",
  bankName: "FNB",
  address: "Cape Town, South Africa"
};

const payslipData = {
  "June 2026": { basic: 18500, overtime: 1200, allowance: 400, bonus: 0, tax: 2200, uif: 185, pension: 1650, medical: 415 },
  "May 2026": { basic: 18500, overtime: 800, allowance: 400, bonus: 500, tax: 2250, uif: 185, pension: 1650, medical: 415 },
  "April 2026": { basic: 18500, overtime: 450, allowance: 400, bonus: 0, tax: 2100, uif: 185, pension: 1650, medical: 415 }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeLogin();
  initializeSidebar();
  highlightCurrentPage();
  loadSidebarProfile();
  updateLeaveBadge();
  initializeDashboard();
  initializeProfile();
  initializeAttendance();
  initializeLeave();
  initializePayslip();
  initializeSettings();
  initializeToastButtons();
});

function getProfile() {
  const saved = JSON.parse(localStorage.getItem("workerProfile") || "null");
  return saved || defaultProfile;
}

function saveProfile(profile) {
  localStorage.setItem("workerProfile", JSON.stringify(profile));
}

function initials(name) {
  return name.split(" ").filter(Boolean).map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

function money(value) {
  return "R" + Number(value).toLocaleString("en-ZA");
}

function todayLabel() {
  return new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function timeLabel() {
  return new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

function initializeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("sidebarToggle");
  if (!sidebar || !toggle) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    toggle.setAttribute("aria-expanded", sidebar.classList.contains("open"));
  });

  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => sidebar.classList.remove("open"));
  });
}

function initializeLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const buttons = document.querySelectorAll(".account-btn");
  const role = document.getElementById("selectedRole");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const error = document.getElementById("errorMessage");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      role.value = button.dataset.role;
      email.placeholder = accounts[role.value].email;
      error.textContent = "";
    });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const selected = role.value;
    if (email.value.trim() === accounts[selected].email && password.value.trim() === accounts[selected].password) {
      localStorage.setItem("loggedInUser", selected);
      location.href = accounts[selected].redirect;
    } else {
      error.textContent = "Incorrect email, password, or account type.";
    }
  });
}

function protectPage(requiredRole) {
  const user = localStorage.getItem("loggedInUser");
  if (!user) {
    location.href = "index.html";
    return;
  }
  if (requiredRole && user !== requiredRole) {
    location.href = user === "hr" ? "hr-dashboard.html" : "worker-dashboard.html";
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  location.href = "index.html";
}

function highlightCurrentPage() {
  const page = location.pathname.split("/").pop() || "worker-dashboard.html";
  document.querySelectorAll(".nav-item").forEach(link => {
    if (link.getAttribute("href") === page) link.classList.add("active");
  });
}

function loadSidebarProfile() {
  const profile = getProfile();
  const sidebarName = document.getElementById("sidebarName");
  const sidebarRole = document.getElementById("sidebarRole");
  const sidebarInitials = document.getElementById("sidebarInitials");
  if (sidebarName) sidebarName.textContent = profile.fullName;
  if (sidebarRole) sidebarRole.textContent = profile.jobTitle;
  if (sidebarInitials) sidebarInitials.textContent = initials(profile.fullName);
}

function initializeDashboard() {
  const welcomeName = document.getElementById("welcomeName");
  if (!welcomeName) return;

  const profile = getProfile();
  const logs = getAttendanceLogs();
  const requests = getLeaveRequests();
  const latest = logs[0];

  welcomeName.textContent = profile.fullName;
  document.getElementById("todayStatus").textContent = latest ? latest.action : "Not clocked in";
  document.getElementById("leaveBalanceDash").textContent = `${calculateLeaveBalance(requests)} days`;
  document.getElementById("netPayDash").textContent = calculatePayslip("June 2026").netFormatted;

  const quickClockBtn = document.getElementById("quickClockBtn");
  quickClockBtn.addEventListener("click", () => {
    addAttendanceLog("Clock In");
    showToast("Clock in saved successfully.");
    location.reload();
  });

  const activity = document.getElementById("dashboardActivity");
  const rows = [];
  logs.slice(0, 3).forEach(log => rows.push(`<tr><td>${log.date}</td><td>${log.action} at ${log.time}</td><td><span class="status approved">Saved</span></td></tr>`));
  requests.slice(0, 3).forEach(req => rows.push(`<tr><td>${req.created}</td><td>${req.type} request</td><td><span class="status pending">${req.status}</span></td></tr>`));
  activity.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="3">No activity yet. Start by clocking in or submitting leave.</td></tr>`;
}

function initializeProfile() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  const profile = getProfile();
  Object.keys(defaultProfile).forEach(key => {
    const input = document.getElementById(key);
    if (input) input.value = profile[key] || "";
  });

  const avatar = document.getElementById("profileAvatar");
  if (avatar) avatar.textContent = initials(profile.fullName);

  form.addEventListener("submit", event => {
    event.preventDefault();
    const updated = {};
    Object.keys(defaultProfile).forEach(key => {
      const input = document.getElementById(key);
      updated[key] = input ? input.value.trim() : defaultProfile[key];
    });
    saveProfile(updated);
    loadSidebarProfile();
    if (avatar) avatar.textContent = initials(updated.fullName);
    showToast("Profile changes saved successfully.");
  });

  document.getElementById("resetProfileBtn").addEventListener("click", () => {
    localStorage.removeItem("workerProfile");
    showToast("Profile reset to demo data.");
    setTimeout(() => location.reload(), 600);
  });
}

function getAttendanceLogs() {
  return JSON.parse(localStorage.getItem("attendanceLogs") || "[]");
}

function addAttendanceLog(action) {
  const logs = getAttendanceLogs();
  logs.unshift({ date: todayLabel(), time: timeLabel(), action, status: "Saved" });
  localStorage.setItem("attendanceLogs", JSON.stringify(logs));
}

function initializeAttendance() {
  const table = document.getElementById("attendanceTable");
  if (!table) return;

  document.querySelectorAll("[data-attendance]").forEach(button => {
    button.addEventListener("click", () => {
      addAttendanceLog(button.dataset.attendance);
      renderAttendance();
      showToast(`${button.dataset.attendance} saved.`);
    });
  });

  document.getElementById("clearAttendanceBtn").addEventListener("click", () => {
    localStorage.removeItem("attendanceLogs");
    renderAttendance();
    showToast("Attendance history cleared.");
  });

  renderAttendance();
}

function renderAttendance() {
  const logs = getAttendanceLogs();
  const table = document.getElementById("attendanceTable");
  const status = document.getElementById("attendanceStatus");
  const count = document.getElementById("attendanceCount");
  const last = document.getElementById("lastAttendanceAction");

  if (status) status.textContent = logs[0] ? logs[0].action : "Not clocked in";
  if (count) count.textContent = `${logs.length} logs`;
  if (last) last.textContent = logs[0] ? `${logs[0].action} ${logs[0].time}` : "None";

  table.innerHTML = logs.length
    ? logs.map(log => `<tr><td>${log.date}</td><td>${log.time}</td><td>${log.action}</td><td><span class="status approved">${log.status}</span></td></tr>`).join("")
    : `<tr><td colspan="4">No attendance records saved yet.</td></tr>`;
}

function getLeaveRequests() {
  return JSON.parse(localStorage.getItem("leaveRequests") || "[]");
}

function calculateLeaveBalance(requests) {
  const used = requests.reduce((total, req) => total + Number(req.days || 0), 0);
  return Math.max(0, 14 - used);
}

function updateLeaveBadge() {
  const badge = document.getElementById("leaveBadge");
  if (!badge) return;
  const pending = getLeaveRequests().filter(req => req.status === "Pending").length;
  badge.textContent = pending;
}

function initializeLeave() {
  // worker-leave.js fully owns the leave form/table/balance on this page.
  // Bail out here to avoid both scripts fighting over the same elements.
  if (document.body.classList.contains("page-leave")) return;

  const form = document.getElementById("leaveForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const requests = getLeaveRequests();
    requests.unshift({
      type: document.getElementById("leaveType").value,
      days: document.getElementById("leaveDays").value,
      start: document.getElementById("startDate").value,
      end: document.getElementById("endDate").value,
      reason: document.getElementById("leaveReason").value.trim(),
      status: "Pending",
      created: todayLabel()
    });
    localStorage.setItem("leaveRequests", JSON.stringify(requests));
    form.reset();
    document.getElementById("leaveDays").value = 1;
    renderLeave();
    updateLeaveBadge();
    showToast("Leave request submitted.");
  });

  document.getElementById("clearLeaveBtn").addEventListener("click", () => {
    localStorage.removeItem("leaveRequests");
    renderLeave();
    updateLeaveBadge();
    showToast("Leave requests cleared.");
  });

  renderLeave();
}

function renderLeave() {
  const requests = getLeaveRequests();
  const table = document.getElementById("leaveTable");
  const balance = document.getElementById("leaveBalanceText");
  if (balance) balance.textContent = `${calculateLeaveBalance(requests)} days available`;

  table.innerHTML = requests.length
    ? requests.map(req => `<tr><td>${req.type}</td><td>${req.start}</td><td>${req.end}</td><td>${req.days}</td><td><span class="status pending">${req.status}</span></td></tr>`).join("")
    : `<tr><td colspan="5">No leave requests submitted yet.</td></tr>`;
}

function calculatePayslip(month) {
  const data = payslipData[month];
  const earnings = data.basic + data.overtime + data.allowance + data.bonus;
  const deductions = data.tax + data.uif + data.pension + data.medical;
  const net = earnings - deductions;
  return {
    ...data,
    earnings,
    deductions,
    net,
    netFormatted: money(net)
  };
}

function initializePayslip() {
  const select = document.getElementById("payslipMonth");
  if (!select) return;

  select.addEventListener("change", () => renderPayslip(select.value));
  document.getElementById("downloadPayslipBtn").addEventListener("click", downloadPayslip);
  renderPayslip(select.value);
}

function renderPayslip(month) {
  const profile = getProfile();
  const data = calculatePayslip(month);

  document.getElementById("basicSalary").textContent = money(data.basic);
  document.getElementById("totalEarnings").textContent = money(data.earnings);
  document.getElementById("totalDeductions").textContent = money(data.deductions);
  document.getElementById("netSalary").textContent = money(data.net);
  document.getElementById("payPeriodLabel").textContent = `Pay Period: ${month}`;
  document.getElementById("payEmployeeName").textContent = profile.fullName;
  document.getElementById("payEmployeeId").textContent = profile.employeeId;
  document.getElementById("payDepartment").textContent = profile.department;
  document.getElementById("payPosition").textContent = profile.jobTitle;

  const rows = [
    ["Basic Salary", "Earning", data.basic],
    ["Overtime", "Earning", data.overtime],
    ["Transport Allowance", "Earning", data.allowance],
    ["Bonus", "Earning", data.bonus],
    ["PAYE Tax", "Deduction", data.tax],
    ["UIF", "Deduction", data.uif],
    ["Pension", "Deduction", data.pension],
    ["Medical Aid", "Deduction", data.medical],
    ["Net Salary", "Final Pay", data.net]
  ];

  document.getElementById("payslipRows").innerHTML = rows.map(row => {
    const cls = row[0] === "Net Salary" ? "status approved" : row[1] === "Deduction" ? "status declined" : "status approved";
    return `<tr><td><strong>${row[0]}</strong></td><td><span class="${cls}">${row[1]}</span></td><td>${money(row[2])}</td></tr>`;
  }).join("");
}

function downloadPayslip() {
  const month = document.getElementById("payslipMonth").value;
  const profile = getProfile();
  const data = calculatePayslip(month);
  const content = `ModernTech Payslip\n\nEmployee: ${profile.fullName}\nEmployee ID: ${profile.employeeId}\nDepartment: ${profile.department}\nPosition: ${profile.jobTitle}\nPay Period: ${month}\n\nBasic Salary: ${money(data.basic)}\nTotal Earnings: ${money(data.earnings)}\nDeductions: ${money(data.deductions)}\nNet Salary: ${money(data.net)}\n`;
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `ModernTech-Payslip-${month.replaceAll(" ", "-")}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Payslip downloaded.");
}

function initializeSettings() {
  const button = document.getElementById("saveSettingsBtn");
  if (!button) return;
  button.addEventListener("click", () => {
    const settings = {
      notifyEmail: document.getElementById("notifyEmail").value,
      language: document.getElementById("language").value
    };
    localStorage.setItem("workerSettings", JSON.stringify(settings));
    showToast("Settings saved successfully.");
  });
}

function initializeToastButtons() {
  document.querySelectorAll("[data-toast]").forEach(button => {
    button.addEventListener("click", () => showToast(button.dataset.toast));
  });
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}