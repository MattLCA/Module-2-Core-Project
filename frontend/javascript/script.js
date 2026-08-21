// ============================================================
// ModernTech Worker Portal
// Shared JavaScript
// ============================================================
//
// This file contains ONLY functionality shared across
// worker portal pages.
//
// Authentication:
// - Login stores JWT under "authToken"
// - Worker API also supports "token"
// - This file accepts both so the worker portal does not
//   immediately redirect back to the login page.
//
// Employee information comes from the API/login response.
// ============================================================

console.log("ModernTech shared script connected.");


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeSidebar();
    highlightCurrentPage();
    initializeToastButtons();
    initializeStoredEmployee();
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
// Call:
//
// updateSidebarEmployee(employee);
//
// Supported formats:
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
// AUTHENTICATION TOKEN
// ============================================================
//
// IMPORTANT:
//
// login.js stores the JWT as:
//
//     authToken
//
// worker_api.js historically looked for:
//
//     token
//
// We support both here.
//
// ============================================================

function getAuthToken() {

    return (
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("workerToken")
    );

}


// ============================================================
// PAGE PROTECTION
// ============================================================

function protectPage(requiredRole = null) {

    const token = getAuthToken();

    const loggedInUserRaw =
        localStorage.getItem("loggedInUser");

    const employeeRaw =
        localStorage.getItem("employee");

    // --------------------------------------------------------
    // No authentication information
    // --------------------------------------------------------

    if (!token) {

        console.warn(
            "No authentication token found. Redirecting to login."
        );

        window.location.href = "index.html";

        return false;
    }


    // --------------------------------------------------------
    // Get logged-in employee
    // --------------------------------------------------------

    let loggedInUser = null;

    if (loggedInUserRaw) {

        try {

            loggedInUser =
                JSON.parse(loggedInUserRaw);

        } catch (error) {

            console.error(
                "Could not parse loggedInUser:",
                error
            );

        }

    }


    // --------------------------------------------------------
    // If there is no loggedInUser but there is an employee,
    // use the employee object.
    // --------------------------------------------------------

    if (!loggedInUser && employeeRaw) {

        try {

            loggedInUser =
                JSON.parse(employeeRaw);

        } catch (error) {

            console.error(
                "Could not parse employee:",
                error
            );

        }

    }


    // --------------------------------------------------------
    // Optional role protection
    // --------------------------------------------------------

    if (requiredRole && loggedInUser) {

        const actualRole =
            loggedInUser.role ||
            loggedInUser.user_role ||
            loggedInUser.role_name;


        if (
            actualRole &&
            actualRole !== requiredRole
        ) {

            if (actualRole === "hr") {

                window.location.href =
                    "hr-dashboard.html";

            } else if (actualRole === "worker") {

                window.location.href =
                    "worker-dashboard.html";

            }

            return false;
        }

    }


    return true;

}


// ============================================================
// WORKER LOGIN CHECK
// ============================================================
//
// Worker pages call:
//
// requireWorkerLogin();
//
// The old problem was that login.js stored "authToken"
// while worker_api.js only checked "token".
//
// This function accepts both.
//
// ============================================================

function requireWorkerLogin() {

    const token = getAuthToken();

    if (!token) {

        console.warn(
            "Worker is not authenticated. Redirecting to login."
        );

        window.location.href =
            "index.html";

        return false;
    }


    // --------------------------------------------------------
    // Make sure the logged-in user is actually a worker
    // when role information exists.
    // --------------------------------------------------------

    const loggedInUserRaw =
        localStorage.getItem("loggedInUser");

    if (loggedInUserRaw) {

        try {

            const employee =
                JSON.parse(loggedInUserRaw);

            const role =
                employee?.role ||
                employee?.user_role ||
                employee?.role_name;


            if (
                role &&
                role !== "worker"
            ) {

                if (role === "hr") {

                    window.location.href =
                        "hr-dashboard.html";

                }

                return false;
            }

        } catch (error) {

            console.error(
                "Could not validate logged-in worker:",
                error
            );

        }

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
    // Remove previous timeout
    // --------------------------------------------------------

    if (toast._timeout) {

        clearTimeout(toast._timeout);

    }


    // --------------------------------------------------------
    // Hide after 2.8 seconds
    // --------------------------------------------------------

    toast._timeout =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2800);

}


// ============================================================
// DATA-TOAST BUTTONS
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

    const number =
        Number(amount);


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

function safeText(
    value,
    fallback = "Not available"
) {

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

function formatDate(dateValue) {

    if (!dateValue) {
        return "Not available";
    }


    const date =
        new Date(dateValue);


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


    const date =
        new Date(dateValue);


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

function getResponseData(response) {

    if (!response) {
        return null;
    }


    if (
        response.data !== undefined
    ) {

        return response.data;

    }


    return response;

}


// ============================================================
// LOGGED-IN EMPLOYEE HELPER
// ============================================================
//
// Login stores the employee as:
//
//     loggedInUser
//
// worker_api.js stores the employee as:
//
//     employee
//
// This helper supports both.
//
// ============================================================

function getStoredEmployee() {

    // --------------------------------------------------------
    // First try the API worker employee key.
    // --------------------------------------------------------

    const employee =
        localStorage.getItem("employee");


    if (employee) {

        try {

            return JSON.parse(employee);

        } catch (error) {

            console.error(
                "Could not parse stored employee:",
                error
            );

        }

    }


    // --------------------------------------------------------
    // Fall back to login's loggedInUser key.
    // --------------------------------------------------------

    const loggedInUser =
        localStorage.getItem("loggedInUser");


    if (loggedInUser) {

        try {

            return JSON.parse(loggedInUser);

        } catch (error) {

            console.error(
                "Could not parse loggedInUser:",
                error
            );

        }

    }


    return null;

}


// ============================================================
// SYNCHRONIZE AUTH STORAGE
// ============================================================
//
// This fixes the mismatch between login.js and worker_api.js.
//
// login.js:
//
//     authToken
//     loggedInUser
//
// worker_api.js:
//
//     token
//     employee
//
// We keep both copies synchronized.
//
// ============================================================

function synchronizeAuthStorage() {

    // --------------------------------------------------------
    // TOKEN
    // --------------------------------------------------------

    const authToken =
        localStorage.getItem("authToken");

    const token =
        localStorage.getItem("token");


    if (authToken && !token) {

        localStorage.setItem(
            "token",
            authToken
        );

    }


    if (token && !authToken) {

        localStorage.setItem(
            "authToken",
            token
        );

    }


    // --------------------------------------------------------
    // EMPLOYEE
    // --------------------------------------------------------

    const loggedInUser =
        localStorage.getItem("loggedInUser");

    const employee =
        localStorage.getItem("employee");


    if (loggedInUser && !employee) {

        localStorage.setItem(
            "employee",
            loggedInUser
        );

    }


    if (employee && !loggedInUser) {

        localStorage.setItem(
            "loggedInUser",
            employee
        );

    }

}


// ============================================================
// INITIALIZE SIDEBAR FROM STORED EMPLOYEE
// ============================================================

function initializeStoredEmployee() {

    // Make sure both authentication storage systems agree.
    synchronizeAuthStorage();


    const employee =
        getStoredEmployee();


    if (!employee) {

        return;

    }


    updateSidebarEmployee(employee);

}


// ============================================================
// LOGOUT / CLEAR AUTHENTICATION
// ============================================================

function clearAuthentication() {

    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("workerToken");

    localStorage.removeItem("employee");
    localStorage.removeItem("loggedInUser");

    localStorage.removeItem("userRole");
    localStorage.removeItem("workerProfile");

}


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.updateSidebarEmployee =
    updateSidebarEmployee;

window.getInitials =
    getInitials;

window.getFirstName =
    getFirstName;

window.getAuthToken =
    getAuthToken;

window.protectPage =
    protectPage;

window.requireWorkerLogin =
    requireWorkerLogin;

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

window.synchronizeAuthStorage =
    synchronizeAuthStorage;

window.clearAuthentication =
    clearAuthentication;