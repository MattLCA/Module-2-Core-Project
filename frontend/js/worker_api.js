// ============================================================
// ModernTech Worker Portal API
// ============================================================
//
// Frontend:
//     HTML / CSS / JavaScript
//
// Backend:
//     Node.js / Express
//
// Database:
//     MySQL
//
// API:
//     http://localhost:4000/api
//
// ============================================================

console.log("ModernTech Worker API connected.");

const WORKER_API_BASE_URL = "http://localhost:4000/api";


// ============================================================
// TOKEN
// ============================================================

function getWorkerToken() {
    return (
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("workerToken")
    );
}


function saveWorkerToken(token) {

    if (!token) {
        return;
    }

    localStorage.setItem("authToken", token);
    localStorage.setItem("token", token);
    localStorage.setItem("workerToken", token);
}


function clearWorkerToken() {

    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("workerToken");

    localStorage.removeItem("employee");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("workerProfile");
    localStorage.removeItem("userRole");
}


// ============================================================
// EMPLOYEE STORAGE
// ============================================================

function getLoggedInWorker() {

    const keys = [
        "employee",
        "loggedInUser",
        "workerProfile"
    ];

    for (const key of keys) {

        const stored =
            localStorage.getItem(key);

        if (!stored) {
            continue;
        }

        try {

            return JSON.parse(stored);

        } catch (error) {

            console.error(
                `Could not parse ${key}:`,
                error
            );

        }

    }

    return null;
}


function saveLoggedInWorker(employee) {

    if (!employee) {
        return;
    }

    const json =
        JSON.stringify(employee);

    localStorage.setItem(
        "employee",
        json
    );

    localStorage.setItem(
        "loggedInUser",
        json
    );

    localStorage.setItem(
        "workerProfile",
        json
    );
}


// ============================================================
// GENERIC API REQUEST
// ============================================================

async function workerApiRequest(
    endpoint,
    options = {}
) {

    const token =
        getWorkerToken();

    const config = {
        ...options,

        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };


    if (token) {

        config.headers.Authorization =
            `Bearer ${token}`;

    }


    const url =
        `${WORKER_API_BASE_URL}${endpoint}`;


    console.log(
        `Worker API: ${config.method || "GET"} ${url}`
    );


    let response;

    try {

        response =
            await fetch(
                url,
                config
            );

    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );

        throw new Error(
            "Could not connect to the ModernTech backend. Make sure the backend is running on port 4000."
        );

    }


    let data = null;

    const contentType =
        response.headers.get(
            "content-type"
        );


    if (
        contentType &&
        contentType.includes("application/json")
    ) {

        try {

            data =
                await response.json();

        } catch (error) {

            console.error(
                "Could not parse API response:",
                error
            );

        }

    }


    console.log(
        "API response:",
        response.status,
        data
    );


    // --------------------------------------------------------
    // Unauthorized
    // --------------------------------------------------------

    if (response.status === 401) {

        clearWorkerToken();

        window.location.href =
            "index.html";

        return null;
    }


    // --------------------------------------------------------
    // Forbidden
    // --------------------------------------------------------

    if (response.status === 403) {

        throw new Error(
            data?.error ||
            data?.message ||
            "You do not have permission to access this resource."
        );

    }


    // --------------------------------------------------------
    // Other errors
    // --------------------------------------------------------

    if (!response.ok) {

        throw new Error(
            data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`
        );

    }


    return data;
}


// ============================================================
// LOGIN
// ============================================================

async function workerLogin(
    employeeCode,
    password
) {

    const response =
        await workerApiRequest(
            "/auth/login",
            {
                method: "POST",

                body: JSON.stringify({
                    role: "worker",
                    identifier: employeeCode,
                    password: password
                })
            }
        );


    if (!response) {
        return null;
    }


    const data =
        response.data ||
        response;


    if (data.token) {

        saveWorkerToken(
            data.token
        );

    }


    if (data.employee) {

        saveLoggedInWorker(
            data.employee
        );

    }


    return response;
}


// ============================================================
// LOGOUT
// ============================================================

function workerLogout() {

    clearWorkerToken();

    window.location.href =
        "index.html";
}


// ============================================================
// DASHBOARD
// ============================================================

async function getWorkerDashboard() {

    return workerApiRequest(
        "/worker/dashboard"
    );
}


// ============================================================
// PROFILE
// ============================================================

async function getWorkerProfile() {

    return workerApiRequest(
        "/worker/profile"
    );
}


// IMPORTANT:
//
// Your current backend ONLY exposes:
// GET /api/worker/profile
//
// There is currently NO PUT endpoint.
//
// Therefore DO NOT call updateWorkerProfile()
// until the backend has a PUT route.
//
// ============================================================


// ============================================================
// ATTENDANCE
// ============================================================

async function getWorkerClockStatus() {

    return workerApiRequest(
        "/worker/attendance/clock-status"
    );
}


async function workerClockIn() {

    return workerApiRequest(
        "/worker/attendance/clock-in",
        {
            method: "POST"
        }
    );
}


async function workerStartBreak() {

    return workerApiRequest(
        "/worker/attendance/break/start",
        {
            method: "PUT"
        }
    );
}


async function workerEndBreak() {

    return workerApiRequest(
        "/worker/attendance/break/end",
        {
            method: "PUT"
        }
    );
}


async function workerClockOut() {

    return workerApiRequest(
        "/worker/attendance/clock-out",
        {
            method: "PUT"
        }
    );
}


async function getWorkerAttendanceHistory() {

    return workerApiRequest(
        "/worker/attendance/history"
    );
}


async function getWorkerAttendance() {

    return getWorkerAttendanceHistory();
}


// ============================================================
// LEAVE
// ============================================================

async function getWorkerLeaveTypes() {

    return workerApiRequest(
        "/worker/leave/types"
    );
}


async function getWorkerLeaveBalances() {

    return workerApiRequest(
        "/worker/leave/balances"
    );
}


async function getWorkerLeaveRequests() {

    return workerApiRequest(
        "/worker/leave/requests"
    );
}


async function createWorkerLeaveRequest(
    leaveData
) {

    return workerApiRequest(
        "/worker/leave/requests",
        {
            method: "POST",

            body: JSON.stringify(
                leaveData
            )
        }
    );
}


// ============================================================
// PAYSLIPS
// ============================================================

async function getWorkerPayslips() {

    return workerApiRequest(
        "/worker/payslips"
    );
}


async function getWorkerPayslip(
    payslipId
) {

    return workerApiRequest(
        `/worker/payslips/${payslipId}`
    );
}


async function downloadWorkerPayslip(
    payslipId
) {

    const token =
        getWorkerToken();


    const response =
        await fetch(
            `${WORKER_API_BASE_URL}/worker/payslips/${payslipId}/download`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


    if (response.status === 401) {

        clearWorkerToken();

        window.location.href =
            "index.html";

        return;

    }


    if (!response.ok) {

        let message =
            "Could not download payslip.";

        try {

            const data =
                await response.json();

            message =
                data.error ||
                data.message ||
                message;

        } catch (error) {
            // Ignore JSON parsing failure.
        }

        throw new Error(message);

    }


    const blob =
        await response.blob();


    const url =
        window.URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `Payslip-${payslipId}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
}


// ============================================================
// NOTIFICATIONS
// ============================================================

async function getWorkerNotifications() {

    return workerApiRequest(
        "/worker/notifications"
    );
}


async function getUnreadWorkerNotifications() {

    return workerApiRequest(
        "/worker/notifications/unread"
    );
}


async function getUnreadWorkerNotificationCount() {

    return workerApiRequest(
        "/worker/notifications/unread-count"
    );
}


async function getWorkerNotification(
    notificationId
) {

    return workerApiRequest(
        `/worker/notifications/${notificationId}`
    );
}


async function markWorkerNotificationAsRead(
    notificationId
) {

    return workerApiRequest(
        `/worker/notifications/${notificationId}/read`,
        {
            method: "PATCH"
        }
    );
}


async function markAllWorkerNotificationsAsRead() {

    return workerApiRequest(
        "/worker/notifications/read-all",
        {
            method: "PATCH"
        }
    );
}


// ============================================================
// AUTHENTICATION
// ============================================================

function isWorkerLoggedIn() {

    return Boolean(
        getWorkerToken()
    );
}


function requireWorkerLogin() {

    const token =
        getWorkerToken();


    if (!token) {

        window.location.href =
            "index.html";

        return false;
    }


    return true;
}


// ============================================================
// GLOBALS
// ============================================================

window.getWorkerToken =
    getWorkerToken;

window.saveWorkerToken =
    saveWorkerToken;

window.clearWorkerToken =
    clearWorkerToken;

window.getLoggedInWorker =
    getLoggedInWorker;

window.saveLoggedInWorker =
    saveLoggedInWorker;

window.workerApiRequest =
    workerApiRequest;

window.workerLogin =
    workerLogin;

window.workerLogout =
    workerLogout;

window.getWorkerDashboard =
    getWorkerDashboard;

window.getWorkerProfile =
    getWorkerProfile;

window.getWorkerClockStatus =
    getWorkerClockStatus;

window.workerClockIn =
    workerClockIn;

window.workerStartBreak =
    workerStartBreak;

window.workerEndBreak =
    workerEndBreak;

window.workerClockOut =
    workerClockOut;

window.getWorkerAttendance =
    getWorkerAttendance;

window.getWorkerAttendanceHistory =
    getWorkerAttendanceHistory;

window.getWorkerLeaveTypes =
    getWorkerLeaveTypes;

window.getWorkerLeaveBalances =
    getWorkerLeaveBalances;

window.getWorkerLeaveRequests =
    getWorkerLeaveRequests;

window.createWorkerLeaveRequest =
    createWorkerLeaveRequest;

window.getWorkerPayslips =
    getWorkerPayslips;

window.getWorkerPayslip =
    getWorkerPayslip;

window.downloadWorkerPayslip =
    downloadWorkerPayslip;

window.getWorkerNotifications =
    getWorkerNotifications;

window.getUnreadWorkerNotifications =
    getUnreadWorkerNotifications;

window.getUnreadWorkerNotificationCount =
    getUnreadWorkerNotificationCount;

window.getWorkerNotification =
    getWorkerNotification;

window.markWorkerNotificationAsRead =
    markWorkerNotificationAsRead;

window.markAllWorkerNotificationsAsRead =
    markAllWorkerNotificationsAsRead;

window.isWorkerLoggedIn =
    isWorkerLoggedIn;

window.requireWorkerLogin =
    requireWorkerLogin;