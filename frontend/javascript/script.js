// ============================================================
// ModernTech Worker Portal
// Shared JavaScript
// ============================================================
//
// This file contains ONLY shared worker-portal functionality.
//
// Authentication:
// - token      = JWT
// - employee   = logged-in employee object
// - userRole   = worker / hr
//
// Employee data ALWAYS comes from the login/API response.
// No worker is hard-coded here.
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

    const sidebar =
        document.getElementById("sidebar");

    const toggle =
        document.getElementById("sidebarToggle");

    if (!sidebar || !toggle) {
        return;
    }

    toggle.addEventListener("click", () => {

        const isOpen =
            sidebar.classList.toggle("open");

        toggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });


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
        window.location.pathname
            .split("/")
            .pop() ||
        "worker-dashboard.html";


    document
        .querySelectorAll(".nav-item")
        .forEach((link) => {

            const href =
                link.getAttribute("href");

            if (!href) {
                return;
            }


            const linkPage =
                href.split("/").pop();


            if (linkPage === currentPage) {

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
// GET LOGGED-IN EMPLOYEE
// ============================================================

function getStoredEmployee() {

    const employeeJSON =
        localStorage.getItem("employee");

    if (!employeeJSON) {
        return null;
    }

    try {

        return JSON.parse(employeeJSON);

    } catch (error) {

        console.error(
            "Could not parse employee data:",
            error
        );

        return null;

    }

}


// ============================================================
// SAVE EMPLOYEE
// ============================================================

function saveStoredEmployee(employee) {

    if (!employee) {
        return;
    }

    const employeeJSON =
        JSON.stringify(employee);


    localStorage.setItem(
        "employee",
        employeeJSON
    );

    // Compatibility with existing pages.
    localStorage.setItem(
        "loggedInUser",
        employeeJSON
    );


    // Worker profile compatibility.
    if (
        employee.role === "worker" ||
        employee.roleName === "worker"
    ) {

        localStorage.setItem(
            "workerProfile",
            employeeJSON
        );

    }

}


// ============================================================
// INITIALIZE STORED EMPLOYEE
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
// UPDATE SIDEBAR EMPLOYEE
// ============================================================

function updateSidebarEmployee(employee) {

    if (!employee) {
        return;
    }


    const name =
        employee.name ||
        employee.fullName ||
        (
            employee.first_name &&
            employee.last_name
                ? `${employee.first_name} ${employee.last_name}`
                : ""
        ) ||
        "Worker";


    const employeeCode =
        employee.employeeCode ||
        employee.employee_code ||
        employee.employeeId ||
        employee.employee_id ||
        "";


    const avatar =
        document.getElementById(
            "sidebarAvatar"
        );

    const sidebarName =
        document.getElementById(
            "sidebarWorkerName"
        );

    const sidebarCode =
        document.getElementById(
            "sidebarEmployeeCode"
        );

    const welcomeName =
        document.getElementById(
            "welcomeName"
        );


    if (sidebarName) {

        sidebarName.textContent =
            name;

    }


    if (sidebarCode) {

        sidebarCode.textContent =
            employeeCode;

    }


    if (avatar) {

        avatar.textContent =
            getInitials(name);

    }


    if (welcomeName) {

        welcomeName.textContent =
            getFirstName(name);

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
        .map((part) =>
            part.charAt(0)
        )
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

function protectPage(requiredRole = null) {

    const token =
        localStorage.getItem("token");

    const employee =
        getStoredEmployee();

    const userRole =
        localStorage.getItem("userRole");


    // --------------------------------------------------------
    // No authentication
    // --------------------------------------------------------

    if (!token || !employee) {

        window.location.href =
            "index.html";

        return false;

    }


    // --------------------------------------------------------
    // Determine actual role
    // --------------------------------------------------------

    const actualRole =
        userRole ||
        employee.role ||
        employee.roleName ||
        null;


    // --------------------------------------------------------
    // Role protection
    // --------------------------------------------------------

    if (
        requiredRole &&
        actualRole !== requiredRole
    ) {

        if (actualRole === "hr") {

            window.location.href =
                "hr-dashboard.html";

        } else {

            window.location.href =
                "worker-dashboard.html";

        }

        return false;

    }


    return true;

}


// ============================================================
// REQUIRE WORKER LOGIN
// ============================================================

function requireWorkerLogin() {

    return protectPage("worker");

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


    if (!toast) {

        toast =
            document.createElement("div");

        toast.className =
            "toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add("show");


    if (toast._timeout) {

        clearTimeout(
            toast._timeout
        );

    }


    toast._timeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2800);

}


// ============================================================
// TOAST BUTTONS
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
// CURRENCY
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
// TODAY
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
// TIME
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
// SAFE TEXT
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
// DATE
// ============================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Not available";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateValue
        );

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
// DATE + TIME
// ============================================================

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "Not available";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateValue
        );

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
// API RESPONSE HELPER
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
// GLOBAL ACCESS
// ============================================================

window.getStoredEmployee =
    getStoredEmployee;

window.saveStoredEmployee =
    saveStoredEmployee;

window.updateSidebarEmployee =
    updateSidebarEmployee;

window.getInitials =
    getInitials;

window.getFirstName =
    getFirstName;

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

window.initializeStoredEmployee =
    initializeStoredEmployee;