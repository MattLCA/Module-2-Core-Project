// ============================================================
// ModernTech Worker Dashboard
// ============================================================
//
// This file handles:
// - Worker authentication
// - Loading the logged-in worker
// - Loading dashboard information
// - Quick clock-in
// - Updating dashboard UI
// - Loading recent activity
//
// Backend endpoints used:
// GET  /api/worker/dashboard
// POST /api/worker/attendance/clock-in
//
// Authentication:
// Bearer JWT stored in localStorage as "authToken"
// ============================================================

console.log("Worker Dashboard JS connected.");


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard();
});


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeDashboard() {

    console.log("Initializing worker dashboard...");

    // --------------------------------------------------------
    // Make sure the user is logged in
    // --------------------------------------------------------

    if (!requireWorkerLogin()) {
        return;
    }


    // --------------------------------------------------------
    // Make sure the logged-in user is a worker
    // --------------------------------------------------------

    const userRole = localStorage.getItem("userRole");

    if (userRole !== "worker") {

        console.error(
            "Access denied. Current role:",
            userRole
        );

        window.location.href = "index.html";

        return;
    }


    // --------------------------------------------------------
    // Load employee information
    // --------------------------------------------------------

    const employee = getLoggedInEmployee();

    if (employee) {

        updateWorkerInterface(employee);

    }


    // --------------------------------------------------------
    // Initialize quick clock button
    // --------------------------------------------------------

    initializeQuickClock();


    // --------------------------------------------------------
    // Load dashboard data
    // --------------------------------------------------------

    await loadDashboardData();

}


// ============================================================
// AUTHENTICATION
// ============================================================

function requireWorkerLogin() {

    const token =
        localStorage.getItem("authToken");

    const loggedInUser =
        localStorage.getItem("loggedInUser");

    const userRole =
        localStorage.getItem("userRole");


    // --------------------------------------------------------
    // No JWT
    // --------------------------------------------------------

    if (!token) {

        console.warn(
            "No authentication token found."
        );

        window.location.href = "index.html";

        return false;
    }


    // --------------------------------------------------------
    // No logged-in user
    // --------------------------------------------------------

    if (!loggedInUser) {

        console.warn(
            "No logged-in employee found."
        );

        clearWorkerAuthentication();

        window.location.href = "index.html";

        return false;
    }


    // --------------------------------------------------------
    // Must be worker
    // --------------------------------------------------------

    if (userRole !== "worker") {

        console.warn(
            "User is not a worker."
        );

        window.location.href = "index.html";

        return false;
    }


    return true;
}


// ============================================================
// GET LOGGED-IN EMPLOYEE
// ============================================================

function getLoggedInEmployee() {

    const storedEmployee =
        localStorage.getItem("loggedInUser");


    if (!storedEmployee) {

        return null;

    }


    try {

        return JSON.parse(
            storedEmployee
        );

    } catch (error) {

        console.error(
            "Could not read logged-in employee:",
            error
        );

        return null;
    }

}


// ============================================================
// UPDATE WORKER INTERFACE
// ============================================================

function updateWorkerInterface(employee) {

    if (!employee) {
        return;
    }


    console.log(
        "Logged-in worker:",
        employee
    );


    // --------------------------------------------------------
    // Determine employee name
    // --------------------------------------------------------

    const firstName =
        employee.first_name ||
        employee.firstName ||
        "";


    const lastName =
        employee.last_name ||
        employee.lastName ||
        "";


    const fullName =
        employee.name ||
        employee.fullName ||
        `${firstName} ${lastName}`.trim() ||
        "Worker";


    // --------------------------------------------------------
    // Employee code
    // --------------------------------------------------------

    const employeeCode =
        employee.employee_code ||
        employee.employeeCode ||
        employee.employee_id ||
        employee.employeeId ||
        "--";


    // --------------------------------------------------------
    // Sidebar name
    // --------------------------------------------------------

    const sidebarName =
        document.getElementById(
            "sidebarWorkerName"
        );


    if (sidebarName) {

        sidebarName.textContent =
            fullName;

    }


    // --------------------------------------------------------
    // Sidebar employee code
    // --------------------------------------------------------

    const sidebarCode =
        document.getElementById(
            "sidebarEmployeeCode"
        );


    if (sidebarCode) {

        sidebarCode.textContent =
            employeeCode;

    }


    // --------------------------------------------------------
    // Sidebar avatar
    // --------------------------------------------------------

    const avatar =
        document.getElementById(
            "sidebarAvatar"
        );


    if (avatar) {

        avatar.textContent =
            getInitials(fullName);

    }


    // --------------------------------------------------------
    // Dashboard welcome name
    // --------------------------------------------------------

    const welcomeName =
        document.getElementById(
            "welcomeName"
        );


    if (welcomeName) {

        const welcomeFirstName =
            firstName ||
            fullName.split(" ")[0] ||
            "Worker";


        welcomeName.textContent =
            welcomeFirstName;

    }

}


// ============================================================
// GET INITIALS
// ============================================================

function getInitials(name) {

    if (!name) {
        return "--";
    }


    return name
        .trim()
        .split(/\s+/)
        .map(
            part => part.charAt(0)
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


// ============================================================
// LOAD DASHBOARD DATA
// ============================================================

async function loadDashboardData() {

    const token =
        localStorage.getItem(
            "authToken"
        );


    if (!token) {

        window.location.href =
            "index.html";

        return;

    }


    try {

        console.log(
            "Loading worker dashboard..."
        );


        // ----------------------------------------------------
        // Call backend
        // ----------------------------------------------------

        const response =
            await fetch(
                "http://localhost:4000/api/worker/dashboard",
                {
                    method: "GET",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        // ----------------------------------------------------
        // Read response
        // ----------------------------------------------------

        let result = null;


        try {

            result =
                await response.json();

        } catch (error) {

            result = null;

        }


        console.log(
            "Dashboard API response:",
            result
        );


        // ----------------------------------------------------
        // Unauthorized
        // ----------------------------------------------------

        if (response.status === 401) {

            console.warn(
                "Authentication token is invalid or expired."
            );

            clearWorkerAuthentication();

            window.location.href =
                "index.html";

            return;

        }


        // ----------------------------------------------------
        // Forbidden
        // ----------------------------------------------------

        if (response.status === 403) {

            console.error(
                "Worker does not have permission to access dashboard."
            );

            showToast(
                "You do not have permission to access the dashboard."
            );

            return;

        }


        // ----------------------------------------------------
        // Other API errors
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                result?.error ||
                result?.message ||
                `Dashboard request failed (${response.status})`
            );

        }


        // ----------------------------------------------------
        // Extract dashboard data
        // ----------------------------------------------------

        const dashboard =
            result?.data ||
            result;


        console.log(
            "Dashboard data:",
            dashboard
        );


        // ----------------------------------------------------
        // Today's status
        // ----------------------------------------------------

        updateTodayStatus(
            dashboard
        );


        // ----------------------------------------------------
        // Leave balance
        // ----------------------------------------------------

        updateLeaveBalance(
            dashboard
        );


        // ----------------------------------------------------
        // Net pay
        // ----------------------------------------------------

        updateNetPay(
            dashboard
        );


        // ----------------------------------------------------
        // Recent activity
        // ----------------------------------------------------

        renderDashboardActivity(
            dashboard
        );


    } catch (error) {

        console.error(
            "Could not load dashboard data:",
            error
        );


        showToast(
            error.message ||
            "Could not load dashboard information."
        );

    }

}


// ============================================================
// UPDATE TODAY'S STATUS
// ============================================================

function updateTodayStatus(dashboard) {

    const element =
        document.getElementById(
            "todayStatus"
        );


    if (!element) {
        return;
    }


    const status =
        dashboard?.todayStatus ||
        dashboard?.today_status ||
        dashboard?.attendanceStatus ||
        dashboard?.attendance_status;


    if (status !== undefined &&
        status !== null &&
        status !== "") {

        element.textContent =
            formatStatus(status);

    }

}


// ============================================================
// UPDATE LEAVE BALANCE
// ============================================================

function updateLeaveBalance(dashboard) {

    const element =
        document.getElementById(
            "leaveBalanceDash"
        );


    if (!element) {
        return;
    }


    const balance =
        dashboard?.leaveBalance ??
        dashboard?.leave_balance;


    if (balance !== undefined &&
        balance !== null) {

        element.textContent =
            `${balance} days`;

    }

}


// ============================================================
// UPDATE NET PAY
// ============================================================

function updateNetPay(dashboard) {

    const element =
        document.getElementById(
            "netPayDash"
        );


    if (!element) {
        return;
    }


    const netPay =
        dashboard?.netPay ??
        dashboard?.net_pay;


    if (netPay === undefined ||
        netPay === null) {

        return;

    }


    const numericValue =
        Number(netPay);


    if (!Number.isNaN(numericValue)) {

        element.textContent =
            new Intl.NumberFormat(
                "en-ZA",
                {
                    style: "currency",
                    currency: "ZAR",
                    minimumFractionDigits: 2
                }
            ).format(numericValue);

    } else {

        element.textContent =
            netPay;

    }

}


// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(status) {

    if (!status) {
        return "Not clocked in";
    }


    const value =
        String(status)
            .replace(/_/g, " ")
            .trim();


    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}


// ============================================================
// QUICK CLOCK
// ============================================================

function initializeQuickClock() {

    const button =
        document.getElementById(
            "quickClockBtn"
        );


    if (!button) {
        return;
    }


    // --------------------------------------------------------
    // Prevent duplicate listeners
    // --------------------------------------------------------

    if (
        button.dataset.listenerAttached ===
        "true"
    ) {

        return;

    }


    button.dataset.listenerAttached =
        "true";


    button.addEventListener(
        "click",
        handleQuickClock
    );

}


// ============================================================
// HANDLE QUICK CLOCK
// ============================================================

async function handleQuickClock() {

    const button =
        document.getElementById(
            "quickClockBtn"
        );


    if (!button) {
        return;
    }


    const token =
        localStorage.getItem(
            "authToken"
        );


    if (!token) {

        window.location.href =
            "index.html";

        return;

    }


    try {

        // ----------------------------------------------------
        // Disable button
        // ----------------------------------------------------

        button.disabled = true;


        const originalHTML =
            button.innerHTML;


        button.dataset.originalHTML =
            originalHTML;


        button.innerHTML = `
            <i class="ti ti-loader-2"></i>
            Clocking in...
        `;


        // ----------------------------------------------------
        // Send clock-in request
        // ----------------------------------------------------

        const response =
            await fetch(
                "http://localhost:4000/api/worker/attendance/clock-in",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        // ----------------------------------------------------
        // Read response
        // ----------------------------------------------------

        let result = null;


        try {

            result =
                await response.json();

        } catch (error) {

            result = null;

        }


        console.log(
            "Clock-in response:",
            result
        );


        // ----------------------------------------------------
        // Authentication failure
        // ----------------------------------------------------

        if (response.status === 401) {

            clearWorkerAuthentication();

            window.location.href =
                "index.html";

            return;

        }


        // ----------------------------------------------------
        // Permission failure
        // ----------------------------------------------------

        if (response.status === 403) {

            throw new Error(
                "You do not have permission to clock in."
            );

        }


        // ----------------------------------------------------
        // Other errors
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                result?.error ||
                result?.message ||
                "Could not clock in."
            );

        }


        // ----------------------------------------------------
        // Success
        // ----------------------------------------------------

        showToast(
            result?.message ||
            "You have been clocked in."
        );


        // ----------------------------------------------------
        // Update dashboard status
        // ----------------------------------------------------

        const status =
            document.getElementById(
                "todayStatus"
            );


        if (status) {

            status.textContent =
                "Clocked in";

        }


        // ----------------------------------------------------
        // Change button
        // ----------------------------------------------------

        button.innerHTML = `
            <i class="ti ti-check"></i>
            Clocked In
        `;


        // ----------------------------------------------------
        // Reload dashboard information
        // ----------------------------------------------------

        await loadDashboardData();


    } catch (error) {

        console.error(
            "Clock-in failed:",
            error
        );


        showToast(
            error.message ||
            "Could not clock in."
        );


    } finally {

        // ----------------------------------------------------
        // Re-enable button
        // ----------------------------------------------------

        button.disabled = false;

    }

}


// ============================================================
// RECENT ACTIVITY
// ============================================================

function renderDashboardActivity(
    dashboard
) {

    const table =
        document.getElementById(
            "dashboardActivity"
        );


    if (!table) {
        return;
    }


    // --------------------------------------------------------
    // Try possible backend property names
    // --------------------------------------------------------

    const activities =
        dashboard?.recentActivity ||
        dashboard?.recent_activity ||
        dashboard?.activities ||
        dashboard?.activity ||
        [];


    // --------------------------------------------------------
    // No activity
    // --------------------------------------------------------

    if (
        !Array.isArray(activities) ||
        activities.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="3">
                    No recent activity.
                </td>
            </tr>
        `;

        return;

    }


    // --------------------------------------------------------
    // Render activity
    // --------------------------------------------------------

    table.innerHTML =
        activities
            .map(activity => {

                const date =
                    activity.date ||
                    activity.created_at ||
                    activity.createdAt ||
                    activity.timestamp ||
                    "--";


                const activityName =
                    activity.activity ||
                    activity.description ||
                    activity.type ||
                    "Activity";


                const status =
                    activity.status ||
                    "Completed";


                return `
                    <tr>
                        <td>
                            ${escapeHTML(
                                formatActivityDate(date)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                activityName
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatStatus(status)
                            )}
                        </td>
                    </tr>
                `;

            })
            .join("");

}


// ============================================================
// FORMAT ACTIVITY DATE
// ============================================================

function formatActivityDate(
    dateValue
) {

    if (!dateValue) {
        return "--";
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
// ESCAPE HTML
// ============================================================
//
// Prevents API data from being inserted as HTML.
// ============================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// CLEAR AUTHENTICATION
// ============================================================

function clearWorkerAuthentication() {

    localStorage.removeItem(
        "authToken"
    );

    localStorage.removeItem(
        "loggedInUser"
    );

    localStorage.removeItem(
        "userRole"
    );

    // Remove old keys as well.
    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "workerToken"
    );

    localStorage.removeItem(
        "employee"
    );

    localStorage.removeItem(
        "workerProfile"
    );

}


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

    if (!message) {
        return;
    }


    // --------------------------------------------------------
    // Use shared showToast() if script.js loaded it
    // --------------------------------------------------------

    if (
        typeof window.showToast ===
        "function" &&
        window.showToast !== showToast
    ) {

        window.showToast(
            message
        );

        return;

    }


    // --------------------------------------------------------
    // Fallback toast
    // --------------------------------------------------------

    let toast =
        document.querySelector(
            ".toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.className =
            "toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.initializeDashboard =
    initializeDashboard;

window.loadDashboardData =
    loadDashboardData;

window.handleQuickClock =
    handleQuickClock;