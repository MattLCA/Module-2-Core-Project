// ============================================================
// ModernTech Worker Portal API
// ============================================================
//
// Connects the employee frontend to:
// Node.js / Express backend
// http://localhost:4000/api
//
// Backend worker routes:
// /worker/dashboard
// /worker/profile
// /worker/attendance
// /worker/leave
// /worker/payslips
// /worker/notifications
// ============================================================


const WORKER_API_BASE_URL =
    "http://localhost:4000/api";


// ============================================================
// TOKEN HELPERS
// ============================================================

function getWorkerToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("workerToken")
    );

}


function saveWorkerToken(token) {

    if (!token) {
        return;
    }

    // Keep both names because the login/frontend code
    // currently uses authToken while older API code uses token.

    localStorage.setItem(
        "token",
        token
    );

    localStorage.setItem(
        "authToken",
        token
    );

}


function clearWorkerToken() {

    localStorage.removeItem("token");

    localStorage.removeItem(
        "authToken"
    );

    localStorage.removeItem(
        "workerToken"
    );

    localStorage.removeItem(
        "employee"
    );

    localStorage.removeItem(
        "loggedInUser"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "workerProfile"
    );

}


// ============================================================
// LOGGED-IN EMPLOYEE
// ============================================================

function getLoggedInWorker() {

    const employee =
        localStorage.getItem("employee");

    if (employee) {

        try {

            return JSON.parse(employee);

        } catch (error) {

            console.error(
                "Could not parse employee:",
                error
            );

        }

    }


    const loggedInUser =
        localStorage.getItem(
            "loggedInUser"
        );

    if (loggedInUser) {

        try {

            return JSON.parse(
                loggedInUser
            );

        } catch (error) {

            console.error(
                "Could not parse loggedInUser:",
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

    const employeeJSON =
        JSON.stringify(employee);

    localStorage.setItem(
        "employee",
        employeeJSON
    );

    localStorage.setItem(
        "loggedInUser",
        employeeJSON
    );

}


// ============================================================
// AUTHENTICATED API REQUEST
// ============================================================

async function workerApiRequest(
    endpoint,
    options = {}
) {

    const token =
        getWorkerToken();


    // --------------------------------------------------------
    // Request configuration
    // --------------------------------------------------------

    const config = {

        ...options,

        headers: {

            "Content-Type":
                "application/json",

            ...(options.headers || {})

        }

    };


    // --------------------------------------------------------
    // JWT authentication
    // --------------------------------------------------------

    if (token) {

        config.headers.Authorization =
            `Bearer ${token}`;

    }


    console.log(
        `Worker API: ${config.method || "GET"} ${WORKER_API_BASE_URL}${endpoint}`
    );


    // --------------------------------------------------------
    // Make request
    // --------------------------------------------------------

    let response;

    try {

        response =
            await fetch(
                `${WORKER_API_BASE_URL}${endpoint}`,
                config
            );

    } catch (error) {

        console.error(
            "Could not connect to backend:",
            error
        );

        throw new Error(
            "Could not connect to the ModernTech backend. Make sure the backend is running on port 4000."
        );

    }


    // --------------------------------------------------------
    // Read response
    // --------------------------------------------------------

    let data = null;

    try {

        data =
            await response.json();

    } catch (error) {

        data = null;

    }


    console.log(
        "Worker API response:",
        response.status,
        data
    );


    // --------------------------------------------------------
    // Handle authentication failure
    // --------------------------------------------------------

    if (
        response.status === 401
    ) {

        clearWorkerToken();

        window.location.href =
            "index.html";

        return null;

    }


    // --------------------------------------------------------
    // Handle forbidden
    // --------------------------------------------------------

    if (
        response.status === 403
    ) {

        throw new Error(
            data?.error ||
            data?.message ||
            "You do not have permission to access this resource."
        );

    }


    // --------------------------------------------------------
    // Handle all other errors
    // --------------------------------------------------------

    if (!response.ok) {

        const errorMessage =
            data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`;

        throw new Error(
            errorMessage
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

                    identifier:
                        employeeCode,

                    password:
                        password

                })

            }
        );


    if (
        response?.data?.token
    ) {

        saveWorkerToken(
            response.data.token
        );

    }


    if (
        response?.data?.employee
    ) {

        saveLoggedInWorker(
            response.data.employee
        );

    }


    return response;

}


// ============================================================
// LOGOUT
// ============================================================

async function workerLogout() {

    clearWorkerToken();

    window.location.href =
        "index.html";

}


// ============================================================
// WORKER DASHBOARD
// ============================================================

async function getWorkerDashboard() {

    return await workerApiRequest(
        "/worker/dashboard"
    );

}


// ============================================================
// WORKER PROFILE
// ============================================================

async function getWorkerProfile() {

    return await workerApiRequest(
        "/worker/profile"
    );

}


async function updateWorkerProfile(
    profileData
) {

    return await workerApiRequest(
        "/worker/profile",
        {
            method: "PUT",

            body: JSON.stringify(
                profileData
            )

        }
    );

}


// ============================================================
// WORKER ATTENDANCE
// ============================================================


// ------------------------------------------------------------
// Clock status
// GET /api/worker/attendance/clock-status
// ------------------------------------------------------------

async function getWorkerClockStatus() {

    return await workerApiRequest(
        "/worker/attendance/clock-status"
    );

}


// ------------------------------------------------------------
// Clock in
// POST /api/worker/attendance/clock-in
// ------------------------------------------------------------

async function workerClockIn() {

    return await workerApiRequest(
        "/worker/attendance/clock-in",
        {
            method: "POST"
        }
    );

}


// ------------------------------------------------------------
// Start break
// PUT /api/worker/attendance/break/start
// ------------------------------------------------------------

async function workerStartBreak() {

    return await workerApiRequest(
        "/worker/attendance/break/start",
        {
            method: "PUT"
        }
    );

}


// ------------------------------------------------------------
// End break
// PUT /api/worker/attendance/break/end
// ------------------------------------------------------------

async function workerEndBreak() {

    return await workerApiRequest(
        "/worker/attendance/break/end",
        {
            method: "PUT"
        }
    );

}


// ------------------------------------------------------------
// Clock out
// PUT /api/worker/attendance/clock-out
// ------------------------------------------------------------

async function workerClockOut() {

    return await workerApiRequest(
        "/worker/attendance/clock-out",
        {
            method: "PUT"
        }
    );

}


// ------------------------------------------------------------
// Attendance history
// GET /api/worker/attendance/history
// ------------------------------------------------------------

async function getWorkerAttendanceHistory() {

    return await workerApiRequest(
        "/worker/attendance/history"
    );

}


// Backwards-compatible function name
async function getWorkerAttendance() {

    return await getWorkerAttendanceHistory();

}


// ============================================================
// WORKER LEAVE
// ============================================================


// ------------------------------------------------------------
// Leave types
// GET /api/worker/leave/types
// ------------------------------------------------------------

async function getWorkerLeaveTypes() {

    return await workerApiRequest(
        "/worker/leave/types"
    );

}


// ------------------------------------------------------------
// Leave balances
// GET /api/worker/leave/balances
// ------------------------------------------------------------

async function getWorkerLeaveBalances() {

    return await workerApiRequest(
        "/worker/leave/balances"
    );

}


// ------------------------------------------------------------
// Leave requests
// GET /api/worker/leave/requests
// ------------------------------------------------------------

async function getWorkerLeaveRequests() {

    return await workerApiRequest(
        "/worker/leave/requests"
    );

}


// ------------------------------------------------------------
// Create leave request
// POST /api/worker/leave/requests
// ------------------------------------------------------------

async function createWorkerLeaveRequest(
    leaveData
) {

    return await workerApiRequest(
        "/worker/leave/requests",
        {
            method: "POST",

            body: JSON.stringify(
                leaveData
            )

        }
    );

}


// ------------------------------------------------------------
// NOTE:
//
// Your backend currently exposes:
//
// POST /requests
//
// but does NOT show PUT /requests/:id
// or DELETE /requests/:id.
//
// Therefore those old frontend functions are intentionally
// not mapped to nonexistent backend endpoints.
// ------------------------------------------------------------


// ============================================================
// WORKER PAYSLIPS
// ============================================================


// ------------------------------------------------------------
// Get all payslips
// GET /api/worker/payslips
// ------------------------------------------------------------

async function getWorkerPayslips() {

    return await workerApiRequest(
        "/worker/payslips"
    );

}


// ------------------------------------------------------------
// Get one payslip
// GET /api/worker/payslips/:id
// ------------------------------------------------------------

async function getWorkerPayslip(
    payslipId
) {

    return await workerApiRequest(
        `/worker/payslips/${payslipId}`
    );

}


// ------------------------------------------------------------
// Download payslip
// GET /api/worker/payslips/:id/download
// ------------------------------------------------------------

async function downloadWorkerPayslip(
    payslipId
) {

    return await workerApiRequest(
        `/worker/payslips/${payslipId}/download`
    );

}


// ============================================================
// WORKER NOTIFICATIONS
// ============================================================


// ------------------------------------------------------------
// Get all notifications
// GET /api/worker/notifications
// ------------------------------------------------------------

async function getWorkerNotifications() {

    return await workerApiRequest(
        "/worker/notifications"
    );

}


// ------------------------------------------------------------
// Get unread notifications
// GET /api/worker/notifications/unread
// ------------------------------------------------------------

async function getUnreadWorkerNotifications() {

    return await workerApiRequest(
        "/worker/notifications/unread"
    );

}


// ------------------------------------------------------------
// Get unread count
// GET /api/worker/notifications/unread-count
// ------------------------------------------------------------

async function getUnreadWorkerNotificationCount() {

    return await workerApiRequest(
        "/worker/notifications/unread-count"
    );

}


// ------------------------------------------------------------
// Get one notification
// GET /api/worker/notifications/:id
// ------------------------------------------------------------

async function getWorkerNotification(
    notificationId
) {

    return await workerApiRequest(
        `/worker/notifications/${notificationId}`
    );

}


// ------------------------------------------------------------
// Mark notification as read
// PATCH /api/worker/notifications/:id/read
// ------------------------------------------------------------

async function markWorkerNotificationAsRead(
    notificationId
) {

    return await workerApiRequest(
        `/worker/notifications/${notificationId}/read`,
        {
            method: "PATCH"
        }
    );

}


// ------------------------------------------------------------
// Mark all notifications as read
// PATCH /api/worker/notifications/read-all
// ------------------------------------------------------------

async function markAllWorkerNotificationsAsRead() {

    return await workerApiRequest(
        "/worker/notifications/read-all",
        {
            method: "PATCH"
        }
    );

}


// ============================================================
// AUTHENTICATION HELPERS
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
// EXPORT FUNCTIONS TO WINDOW
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

window.updateWorkerProfile =
    updateWorkerProfile;

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

    