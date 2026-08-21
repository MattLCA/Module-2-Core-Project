// ============================================================
// ModernTech Worker Dashboard
// ============================================================
//
// Connects the Worker Dashboard to the backend API.
//
// Expected API wrappers:
//   getWorkerProfile()
//   getWorkerAttendance()
//   getWorkerLeaveBalances()
//   getWorkerLeaveRequests()
//   getWorkerNotifications()
//   getWorkerPayslips()
//
// Authentication:
//   localStorage["token"]
//
// ============================================================

console.log("Worker Dashboard JS connected.");


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof requireWorkerLogin === "function") {

        if (!requireWorkerLogin()) {
            return;
        }

    }

    await initializeDashboard();

});


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeDashboard() {

    try {

        console.log("Loading worker dashboard...");

        const results = await Promise.allSettled([

            loadDashboardProfile(),

            loadDashboardAttendance(),

            loadDashboardLeave(),

            loadDashboardNotifications(),

            loadDashboardPayslip()

        ]);


        results.forEach((result, index) => {

            if (result.status === "rejected") {

                console.error(
                    `Dashboard section ${index + 1} failed:`,
                    result.reason
                );

            }

        });


        updateDashboardDate();

        console.log("Worker dashboard loaded.");

    } catch (error) {

        console.error(
            "Could not initialize worker dashboard:",
            error
        );

        showDashboardMessage(
            error.message ||
            "Could not load your dashboard."
        );

    }

}


// ============================================================
// LOAD PROFILE
// ============================================================

async function loadDashboardProfile() {

    if (typeof getWorkerProfile !== "function") {

        console.warn(
            "getWorkerProfile() is not available."
        );

        return;

    }


    const response =
        await getWorkerProfile();


    const profile =
        getResponseData(response);


    if (!profile) {
        return;
    }


    // Save latest employee information.

    if (
        typeof saveLoggedInWorker ===
        "function"
    ) {

        saveLoggedInWorker(profile);

    }


    localStorage.setItem(
        "employee",
        JSON.stringify(profile)
    );


    // Update sidebar.

    if (
        typeof updateSidebarEmployee ===
        "function"
    ) {

        updateSidebarEmployee(profile);

    }


    renderDashboardProfile(profile);

}


// ============================================================
// RENDER PROFILE
// ============================================================

function renderDashboardProfile(profile) {

    const name =
        profile.name ||
        profile.fullName ||
        (
            profile.first_name &&
            profile.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : ""
        ) ||
        "Worker";


    const employeeCode =
        profile.employee_code ||
        profile.employeeCode ||
        "";


    setDashboardText(
        [
            "workerName",
            "dashboardName",
            "employeeName",
            "profileName",
            "welcomeName",
            "welcomeMessageName"
        ],
        name
    );


    setDashboardText(
        [
            "employeeCode",
            "profileEmployeeCode",
            "dashboardEmployeeCode"
        ],
        employeeCode
    );


    setDashboardText(
        [
            "employeeEmail",
            "profileEmail"
        ],
        profile.email
    );


    setDashboardText(
        [
            "employeeDepartment",
            "profileDepartment",
            "department"
        ],
        profile.department_name ||
        getDashboardNestedName(profile.department)
    );


    setDashboardText(
        [
            "employeePosition",
            "profilePosition",
            "position"
        ],
        profile.position_name ||
        getDashboardNestedName(profile.position)
    );

}


// ============================================================
// LOAD ATTENDANCE
// ============================================================

async function loadDashboardAttendance() {

    if (
        typeof getWorkerAttendance !==
        "function"
    ) {

        console.warn(
            "getWorkerAttendance() is not available."
        );

        return;

    }


    const response =
        await getWorkerAttendance();


    const attendance =
        getResponseData(response);


    const records =
        normalizeArray(attendance);


    renderAttendanceSummary(records);

}


// ============================================================
// ATTENDANCE SUMMARY
// ============================================================

function renderAttendanceSummary(records) {

    if (!records.length) {

        setDashboardText(
            [
                "attendanceStatus",
                "todayAttendanceStatus",
                "attendanceSummary"
            ],
            "No attendance recorded"
        );

        return;

    }


    const today =
        getTodayString();


    let todayRecord =
        records.find(
            record =>
                normalizeDate(
                    record.attendance_date ||
                    record.date
                ) === today
        );


    if (!todayRecord) {

        todayRecord =
            records[0];

    }


    const status =
        todayRecord.attendance_status ||
        todayRecord.status ||
        "Present";


    setDashboardText(
        [
            "attendanceStatus",
            "todayAttendanceStatus",
            "attendanceSummary"
        ],
        status
    );


    setDashboardText(
        [
            "clockInTime",
            "todayClockIn"
        ],
        formatTime(
            todayRecord.clock_in ||
            todayRecord.clockIn
        )
    );


    setDashboardText(
        [
            "clockOutTime",
            "todayClockOut"
        ],
        formatTime(
            todayRecord.clock_out ||
            todayRecord.clockOut
        )
    );


    setDashboardText(
        [
            "breakStartTime",
            "todayBreakStart"
        ],
        formatTime(
            todayRecord.break_start ||
            todayRecord.breakStart
        )
    );


    setDashboardText(
        [
            "breakEndTime",
            "todayBreakEnd"
        ],
        formatTime(
            todayRecord.break_end ||
            todayRecord.breakEnd
        )
    );

}


// ============================================================
// LOAD LEAVE
// ============================================================

async function loadDashboardLeave() {

    if (
        typeof getWorkerLeaveBalances !==
        "function"
    ) {

        console.warn(
            "getWorkerLeaveBalances() is not available."
        );

        return;

    }


    const response =
        await getWorkerLeaveBalances();


    const balances =
        getResponseData(response);


    const records =
        normalizeArray(balances);


    renderLeaveSummary(records);


    // Also load requests if the wrapper exists.

    if (
        typeof getWorkerLeaveRequests ===
        "function"
    ) {

        try {

            const requestResponse =
                await getWorkerLeaveRequests();


            const requests =
                normalizeArray(
                    getResponseData(
                        requestResponse
                    )
                );


            renderLeaveRequestSummary(
                requests
            );

        } catch (error) {

            console.error(
                "Could not load leave requests:",
                error
            );

        }

    }

}


// ============================================================
// LEAVE BALANCE SUMMARY
// ============================================================

function renderLeaveSummary(records) {

    if (!records.length) {

        setDashboardText(
            [
                "leaveBalance",
                "remainingLeave",
                "leaveDaysRemaining"
            ],
            "0"
        );

        return;

    }


    let totalRemaining = 0;


    records.forEach(
        record => {

            const remaining =
                Number(
                    record.remaining_days ??
                    (
                        Number(
                            record.allocated_days || 0
                        ) -
                        Number(
                            record.used_days || 0
                        )
                    )
                );


            if (
                Number.isFinite(
                    remaining
                )
            ) {

                totalRemaining += remaining;

            }

        }
    );


    setDashboardText(
        [
            "leaveBalance",
            "remainingLeave",
            "leaveDaysRemaining",
            "totalLeaveBalance"
        ],
        formatNumber(totalRemaining)
    );

}


// ============================================================
// LEAVE REQUEST SUMMARY
// ============================================================

function renderLeaveRequestSummary(
    requests
) {

    if (!requests.length) {

        setDashboardText(
            [
                "leaveRequestStatus",
                "latestLeaveStatus"
            ],
            "No leave requests"
        );

        return;

    }


    const sorted =
        [...requests].sort(
            (a, b) =>
                new Date(
                    b.created_at ||
                    b.submitted_date ||
                    0
                ) -
                new Date(
                    a.created_at ||
                    a.submitted_date ||
                    0
                )
        );


    const latest =
        sorted[0];


    setDashboardText(
        [
            "leaveRequestStatus",
            "latestLeaveStatus"
        ],
        latest.status ||
        "Pending"
    );

}


// ============================================================
// LOAD NOTIFICATIONS
// ============================================================

async function loadDashboardNotifications() {

    if (
        typeof getWorkerNotifications !==
        "function"
    ) {

        console.warn(
            "getWorkerNotifications() is not available."
        );

        return;

    }


    const response =
        await getWorkerNotifications();


    const notifications =
        normalizeArray(
            getResponseData(response)
        );


    renderNotificationSummary(
        notifications
    );

}


// ============================================================
// NOTIFICATION SUMMARY
// ============================================================

function renderNotificationSummary(
    notifications
) {

    const unread =
        notifications.filter(
            notification =>
                Number(
                    notification.is_read
                ) === 0 ||
                notification.is_read === false
        )
        .length;


    setDashboardText(
        [
            "notificationCount",
            "unreadNotifications",
            "notificationsCount"
        ],
        String(unread)
    );


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (badge) {

        badge.textContent =
            String(unread);


        badge.style.display =
            unread > 0
                ? ""
                : "none";

    }

}


// ============================================================
// LOAD PAYSLIP
// ============================================================

async function loadDashboardPayslip() {

    if (
        typeof getWorkerPayslips !==
        "function"
    ) {

        console.warn(
            "getWorkerPayslips() is not available."
        );

        return;

    }


    const response =
        await getWorkerPayslips();


    const payslips =
        normalizeArray(
            getResponseData(response)
        );


    if (!payslips.length) {

        return;

    }


    const sorted =
        [...payslips].sort(
            (a, b) =>
                String(
                    b.pay_period || ""
                )
                .localeCompare(
                    String(
                        a.pay_period || ""
                    )
                )
        );


    const latest =
        sorted[0];


    renderLatestPayslip(
        latest
    );

}


// ============================================================
// LATEST PAYSLIP
// ============================================================

function renderLatestPayslip(
    payslip
) {

    if (!payslip) {
        return;
    }


    setDashboardText(
        [
            "latestPayPeriod",
            "payPeriod",
            "payslipPeriod"
        ],
        payslip.pay_period
    );


    setDashboardText(
        [
            "latestSalary",
            "finalSalary",
            "payslipSalary",
            "salary"
        ],
        formatCurrency(
            payslip.final_salary
        )
    );


    setDashboardText(
        [
            "hoursWorked",
            "payslipHours"
        ],
        payslip.hours_worked
    );


    setDashboardText(
        [
            "leaveDeductions",
            "payslipDeductions"
        ],
        formatCurrency(
            payslip.leave_deductions
        )
    );

}


// ============================================================
// UPDATE DATE
// ============================================================

function updateDashboardDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {
        return;
    }


    element.textContent =
        new Date().toLocaleDateString(
            "en-ZA",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


// ============================================================
// TEXT HELPER
// ============================================================

function setDashboardText(
    ids,
    value
) {

    if (!Array.isArray(ids)) {
        ids = [ids];
    }


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return;
    }


    ids.forEach(
        id => {

            const element =
                document.getElementById(id);


            if (!element) {
                return;
            }


            element.textContent =
                String(value);

        }
    );

}


// ============================================================
// RESPONSE DATA HELPER
// ============================================================

function getResponseData(
    response
) {

    if (
        response === null ||
        response === undefined
    ) {

        return null;

    }


    if (
        response.data !== undefined
    ) {

        return response.data;

    }


    if (
        response.result !== undefined
    ) {

        return response.result;

    }


    return response;

}


// ============================================================
// ARRAY NORMALIZER
// ============================================================

function normalizeArray(
    data
) {

    if (Array.isArray(data)) {
        return data;
    }


    if (
        data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }


    if (
        data &&
        Array.isArray(data.results)
    ) {

        return data.results;

    }


    if (data) {
        return [data];
    }


    return [];

}


// ============================================================
// NESTED NAME
// ============================================================

function getDashboardNestedName(
    value
) {

    if (!value) {
        return "";
    }


    if (typeof value === "string") {
        return value;
    }


    return (
        value.name ||
        value.title ||
        value.department_name ||
        value.position_name ||
        ""
    );

}


// ============================================================
// DATE HELPERS
// ============================================================

function getTodayString() {

    const date =
        new Date();


    return [
        date.getFullYear(),
        String(
            date.getMonth() + 1
        ).padStart(2, "0"),
        String(
            date.getDate()
        ).padStart(2, "0")
    ].join("-");

}


function normalizeDate(
    value
) {

    if (!value) {
        return "";
    }


    return String(value)
        .substring(0, 10);

}


function formatTime(
    value
) {

    if (!value) {
        return "--";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        const text =
            String(value);

        if (text.length >= 5) {
            return text.substring(0, 5);
        }

        return text;

    }


    return date.toLocaleTimeString(
        "en-ZA",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ============================================================
// NUMBER / CURRENCY
// ============================================================

function formatNumber(
    value
) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {
        return "0";
    }


    return number.toLocaleString(
        "en-ZA",
        {
            maximumFractionDigits: 2
        }
    );

}


function formatCurrency(
    value
) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {
        return "R0.00";
    }


    return number.toLocaleString(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR"
        }
    );

}


// ============================================================
// ERROR MESSAGE
// ============================================================

function showDashboardMessage(
    message
) {

    if (
        typeof showToast ===
        "function"
    ) {

        showToast(message);
        return;

    }


    console.error(message);

}


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.initializeDashboard =
    initializeDashboard;