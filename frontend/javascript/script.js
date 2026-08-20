// ============================================================
// ModernTech Worker Portal
// Shared JavaScript
// ============================================================
//
// This file contains ONLY functionality shared across
// worker portal pages.
//
// Page-specific functionality belongs in:
//
// worker-dashboard.js
// worker-attendance.js
// worker-leave.js
// worker-payslip.js
// worker-profile.js
// worker-notifications.js
//
// API functionality belongs in:
//
// worker_api.js
//
// Logout functionality belongs in:
//
// logout.js
//
// Employee information should come from the API.
// This file does NOT hard-code a worker.
// ============================================================

console.log("ModernTech shared script connected.");


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeSidebar();
    highlightCurrentPage();
    initializeToastButtons();
});


// ============================================================
// SIDEBAR
// ============================================================

function initializeSidebar() {

    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebarToggle");

    if (!sidebar || !toggle) {
        return;
    }

    toggle.addEventListener("click", () => {

        const isOpen = sidebar.classList.toggle("open");

        toggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });


    // Close mobile sidebar after selecting a page
    document
        .querySelectorAll(".nav-item")
        .forEach((item) => {

            item.addEventListener("click", () => {

                sidebar.classList.remove("open");

                toggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

}


// ============================================================
// ACTIVE NAVIGATION
// ============================================================

function highlightCurrentPage() {

    const currentPage =
        location.pathname
            .split("/")
            .pop() ||
        "worker-dashboard.html";


    document
        .querySelectorAll(".nav-item")
        .forEach((link) => {

            const href = link.getAttribute("href");

            if (!href) {
                return;
            }


            if (href === currentPage) {

                link.classList.add("active");

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                link.classList.remove("active");

                link.removeAttribute(
                    "aria-current"
                );

            }

        });

}


// ============================================================
// UPDATE SIDEBAR EMPLOYEE
// ============================================================
//
// Call this function from a page-specific script when the
// employee information has been retrieved from the API.
//
// Example:
//
// updateSidebarEmployee(employee);
//
// Supported employee formats:
//
// {
//     name: "Sibongile Nkosi",
//     employee_code: "EMP-001"
// }
//
// OR:
//
// {
//     first_name: "Sibongile",
//     last_name: "Nkosi",
//     employee_code: "EMP-001"
// }
// ============================================================

function updateSidebarEmployee(employee) {

    if (!employee) {
        return;
    }


    // --------------------------------------------------------
    // Employee name
    // --------------------------------------------------------

    const name =
        employee.name ||
        employee.fullName ||
        (
            employee.first_name &&
            employee.last_name
                ? `${employee.first_name} ${employee.last_name}`
                : null
        ) ||
        "Worker";


    // --------------------------------------------------------
    // Employee code
    // --------------------------------------------------------

    const employeeCode =
        employee.employee_code ||
        employee.employeeCode ||
        employee.employee_id ||
        employee.employeeId ||
        "";


    // --------------------------------------------------------
    // Find sidebar elements
    // --------------------------------------------------------

    const avatar =
        document.getElementById("sidebarAvatar");

    const sidebarName =
        document.getElementById("sidebarWorkerName");

    const sidebarCode =
        document.getElementById("sidebarEmployeeCode");

    const welcomeName =
        document.getElementById("welcomeName");


    // --------------------------------------------------------
    // Update sidebar name
    // --------------------------------------------------------

    if (sidebarName) {

        sidebarName.textContent = name;

    }


    // --------------------------------------------------------
    // Update employee code
    // --------------------------------------------------------

    if (sidebarCode) {

        sidebarCode.textContent = employeeCode;

    }


    // --------------------------------------------------------
    // Update avatar
    // --------------------------------------------------------

    if (avatar) {

        avatar.textContent = getInitials(name);

    }


    // --------------------------------------------------------
    // Update dashboard welcome name
    // --------------------------------------------------------

    if (welcomeName) {

        welcomeName.textContent = getFirstName(name);

    }

}


// ============================================================
// INITIALS
// ============================================================

function getInitials(name) {

    if (!name) {
        return "--";
    }


    return name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


// ============================================================
// FIRST NAME
// ============================================================

function getFirstName(name) {

    if (!name) {
        return "Worker";
    }


    return name
        .trim()
        .split(/\s+/)[0];

}


// ============================================================
// PAGE PROTECTION
// ============================================================
//
// This is a shared helper.
// Page-specific files can call:
//
// requireWorkerLogin();
//
// or:
//
// protectPage("worker");
//
// The actual JWT is stored by worker_api.js under:
//
// "token"
// ============================================================

function protectPage(requiredRole = null) {

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("workerToken") ||
        localStorage.getItem("authToken");


    const loggedInUser =
        localStorage.getItem("loggedInUser");


    // --------------------------------------------------------
    // No authentication information
    // --------------------------------------------------------

    if (!token && !loggedInUser) {

        window.location.href = "index.html";

        return false;

    }


    // --------------------------------------------------------
    // Optional role protection
    // --------------------------------------------------------

    if (
        requiredRole &&
        loggedInUser &&
        loggedInUser !== requiredRole
    ) {

        if (loggedInUser === "hr") {

            window.location.href = "hr-dashboard.html";

        } else {

            window.location.href = "worker-dashboard.html";

        }

        return false;

    }


    return true;

}


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

    if (!message) {
        return;
    }


    let toast =
        document.querySelector(".toast");


    // --------------------------------------------------------
    // Create toast if one does not already exist
    // --------------------------------------------------------

    if (!toast) {

        toast =
            document.createElement("div");

        toast.className = "toast";

        document.body.appendChild(toast);

    }


    // --------------------------------------------------------
    // Set message
    // --------------------------------------------------------

    toast.textContent = message;


    // --------------------------------------------------------
    // Show toast
    // --------------------------------------------------------

    toast.classList.add("show");


    // --------------------------------------------------------
    // Remove previous timeout if it exists
    // --------------------------------------------------------

    if (toast._timeout) {

        clearTimeout(toast._timeout);

    }


    // --------------------------------------------------------
    // Hide after 2.8 seconds
    // --------------------------------------------------------

    toast._timeout = setTimeout(() => {

        toast.classList.remove("show");

    }, 2800);

}


// ============================================================
// DATA-TOAST BUTTONS
// ============================================================
//
// Any button can use:
//
// data-toast="Your message here"
//
// Example:
//
// <button data-toast="Saved successfully">
//     Save
// </button>
// ============================================================

function initializeToastButtons() {

    document
        .querySelectorAll("[data-toast]")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    showToast(
                        button.dataset.toast
                    );

                }
            );

        });

}


// ============================================================
// CURRENCY FORMATTER
// ============================================================

function formatCurrency(amount) {

    const number = Number(amount);


    if (Number.isNaN(number)) {

        return amount;

    }


    return new Intl.NumberFormat(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2
        }
    ).format(number);

}


// ============================================================
// DATE FORMATTER
// ============================================================

function todayLabel() {

    return new Date()
        .toLocaleDateString(
            "en-ZA",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


// ============================================================
// TIME FORMATTER
// ============================================================

function timeLabel() {

    return new Date()
        .toLocaleTimeString(
            "en-ZA",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


// ============================================================
// SAFE TEXT HELPER
// ============================================================
//
// Useful when page-specific JavaScript needs to display
// optional API data.
//
// Example:
//
// element.textContent = safeText(employee.department);
// ============================================================

function safeText(value, fallback = "Not available") {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return fallback;

    }


    return String(value);

}


// ============================================================
// FORMAT DATE FROM API
// ============================================================
//
// Converts an API date into:
//
// 20 Aug 2026
//
// If the value cannot be parsed, the original value is
// returned.
// ============================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Not available";
    }


    const date = new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return String(dateValue);

    }


    return date.toLocaleDateString(
        "en-ZA",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ============================================================
// FORMAT DATE + TIME FROM API
// ============================================================

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "Not available";
    }


    const date = new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return String(dateValue);

    }


    return date.toLocaleString(
        "en-ZA",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ============================================================
// API RESPONSE DATA HELPER
// ============================================================
//
// Backend responses may sometimes look like:
//
// { data: {...} }
//
// or:
//
// { employee: {...} }
//
// or simply:
//
// {...}
//
// This helper makes page-specific code easier to write.
// ============================================================

function getResponseData(response) {

    if (!response) {
        return null;
    }


    if (response.data !== undefined) {

        return response.data;

    }


    return response;

}


// ============================================================
// LOGGED-IN EMPLOYEE HELPER
// ============================================================
//
// The API layer stores the employee in localStorage under:
//
// "employee"
//
// This helper only reads that already-saved API result.
// It does NOT create or hard-code employee information.
// ============================================================

function getStoredEmployee() {

    const employee =
        localStorage.getItem("employee");


    if (!employee) {

        return null;

    }


    try {

        return JSON.parse(employee);

    } catch (error) {

        console.error(
            "Could not parse stored employee:",
            error
        );

        return null;

    }

}


// ============================================================
// INITIALIZE SIDEBAR FROM STORED API EMPLOYEE
// ============================================================
//
// This does NOT replace backend API integration.
//
// It simply allows the sidebar to immediately display the
// employee returned by login while page-specific API calls
// are being made.
// ============================================================

function initializeStoredEmployee() {

    const employee =
        getStoredEmployee();


    if (!employee) {

        return;

    }


    updateSidebarEmployee(employee);

}


// ============================================================
// EXPORT / GLOBAL ACCESS
// ============================================================
//
// These functions are intentionally attached to window so
// that page-specific JavaScript files can use them.
// ============================================================

window.updateSidebarEmployee =
    updateSidebarEmployee;

window.getInitials =
    getInitials;

window.getFirstName =
    getFirstName;

window.protectPage =
    protectPage;

window.showToast =
    showToast;

window.formatCurrency =
    formatCurrency;

window.todayLabel =
    todayLabel;

window.timeLabel =
    timeLabel;

window.safeText =
    safeText;

window.formatDate =
    formatDate;

window.formatDateTime =
    formatDateTime;

window.getResponseData =
    getResponseData;

window.getStoredEmployee =
    getStoredEmployee;

window.initializeStoredEmployee =
    initializeStoredEmployee;