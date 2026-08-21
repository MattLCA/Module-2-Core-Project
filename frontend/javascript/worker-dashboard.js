// ============================================================
// ModernTech Worker Dashboard
// ============================================================

console.log("Worker Dashboard JS connected.");


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Initializing Worker Dashboard...");

    // ----------------------------------------------------------
    // Authentication
    // ----------------------------------------------------------

    if (typeof requireWorkerLogin === "function") {

        if (!requireWorkerLogin()) {
            return;
        }

    } else {

        console.error(
            "requireWorkerLogin() is not available."
        );

        return;
    }


    // ----------------------------------------------------------
    // Sidebar
    // ----------------------------------------------------------

    if (typeof initializeSidebar === "function") {

        initializeSidebar();

    }


    // ----------------------------------------------------------
    // Dashboard
    // ----------------------------------------------------------

    await initializeWorkerDashboard();


    // ----------------------------------------------------------
    // Buttons
    // ----------------------------------------------------------

    initializeDashboardButtons();

});


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeWorkerDashboard() {

    console.log("Loading worker dashboard...");


    // We deliberately load each section separately.
    // If one API fails, the rest of the dashboard still loads.

    await loadDashboardProfile();

    await loadDashboardAttendance();

    await loadDashboardLeave();

    await loadDashboardPayslips();

    await loadDashboardLeaveRequests();


    console.log(
        "Worker Dashboard loaded successfully."
    );
}


// ============================================================
// PROFILE
// ============================================================

async function loadDashboardProfile() {

    try {

        if (typeof getWorkerProfile !== "function") {

            console.error(
                "getWorkerProfile() is not available."
            );

            return;
        }


        const response =
            await getWorkerProfile();


        console.log(
            "Profile API response:",
            response
        );


        const profile =
            extractProfile(response);


        if (!profile) {

            console.warn(
                "No worker profile returned from API."
            );

            return;
        }


        console.log(
            "Worker profile:",
            profile
        );


        // Save latest database information

        if (
            typeof saveLoggedInWorker ===
            "function"
        ) {

            saveLoggedInWorker(profile);

        }


        renderDashboardProfile(profile);


    } catch (error) {

        console.error(
            "Could not load worker profile:",
            error
        );

    }
}


// ============================================================
// EXTRACT PROFILE
// ============================================================

function extractProfile(response) {

    if (!response) {
        return null;
    }


    // { data: {...} }

    if (
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
    ) {

        return response.data;

    }


    // { employee: {...} }

    if (
        response.employee &&
        typeof response.employee === "object"
    ) {

        return response.employee;

    }


    // { profile: {...} }

    if (
        response.profile &&
        typeof response.profile === "object"
    ) {

        return response.profile;

    }


    // Direct object

    if (
        typeof response === "object" &&
        !Array.isArray(response)
    ) {

        return response;

    }


    return null;
}


// ============================================================
// RENDER PROFILE
// ============================================================

function renderDashboardProfile(profile) {

    if (!profile) {
        return;
    }


    console.log(
        "Rendering worker profile:",
        profile
    );


    // ----------------------------------------------------------
    // FIRST NAME
    // ----------------------------------------------------------

    const firstName =
        profile.first_name ??
        profile.firstName ??
        "";


    // ----------------------------------------------------------
    // LAST NAME
    // ----------------------------------------------------------

    const lastName =
        profile.last_name ??
        profile.lastName ??
        "";


    // ----------------------------------------------------------
    // FULL NAME
    // ----------------------------------------------------------

    const fullName =
        profile.name ??
        profile.fullName ??
        `${firstName} ${lastName}`.trim() ??
        "Worker";


    const displayName =
        fullName.trim() ||
        "Worker";


    // ----------------------------------------------------------
    // EMPLOYEE CODE
    // ----------------------------------------------------------

    const employeeCode =
        profile.employee_code ??
        profile.employeeCode ??
        profile.employee_id ??
        profile.employeeId ??
        "--";


    // ----------------------------------------------------------
    // WELCOME NAME
    // ----------------------------------------------------------

    setText(
        "welcomeName",
        firstName || displayName
    );


    // ----------------------------------------------------------
    // SIDEBAR NAME
    // ----------------------------------------------------------

    setText(
        "sidebarWorkerName",
        displayName
    );


    // ----------------------------------------------------------
    // SIDEBAR EMPLOYEE CODE
    // ----------------------------------------------------------

    setText(
        "sidebarEmployeeCode",
        employeeCode
    );


    // ----------------------------------------------------------
    // AVATAR
    // ----------------------------------------------------------

    const avatar =
        document.getElementById(
            "sidebarAvatar"
        );


    if (avatar) {

        avatar.textContent =
            getInitials(displayName);

    }


    // ----------------------------------------------------------
    // OPTIONAL PROFILE ELEMENTS
    // ----------------------------------------------------------

    setTextIfExists(
        "employeeName",
        displayName
    );

    setTextIfExists(
        "employeeCode",
        employeeCode
    );

    setTextIfExists(
        "employeeEmail",
        profile.email
    );

    setTextIfExists(
        "employeeDepartment",
        profile.department_name ??
        profile.departmentName ??
        getNestedName(profile.department)
    );

    setTextIfExists(
        "employeePosition",
        profile.position_name ??
        profile.positionName ??
        getNestedName(profile.position)
    );

}


// ============================================================
// INITIALS
// ============================================================

function getInitials(name) {

    if (!name) {
        return "--";
    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


// ============================================================
// ATTENDANCE
// ============================================================

async function loadDashboardAttendance() {

    try {

        if (
            typeof getWorkerAttendanceHistory !==
            "function"
        ) {

            console.error(
                "getWorkerAttendanceHistory() is not available."
            );

            return;
        }


        // ------------------------------------------------------
        // Get history
        // ------------------------------------------------------

        const historyResponse =
            await getWorkerAttendanceHistory();


        console.log(
            "Attendance history response:",
            historyResponse
        );


        const attendance =
            extractArray(historyResponse);


        console.log(
            "Attendance records:",
            attendance
        );


        renderTodayStatus(
            attendance
        );

        renderAttendanceActivity(
            attendance
        );


        // ------------------------------------------------------
        // Get current clock status
        // ------------------------------------------------------

        if (
            typeof getWorkerClockStatus ===
            "function"
        ) {

            const statusResponse =
                await getWorkerClockStatus();


            console.log(
                "Clock status response:",
                statusResponse
            );


            renderClockStatus(
                statusResponse
            );

        }


    } catch (error) {

        console.error(
            "Could not load attendance:",
            error
        );


        setText(
            "todayStatus",
            "Not clocked in"
        );

    }
}


// ============================================================
// TODAY STATUS
// ============================================================

function renderTodayStatus(attendance) {

    if (!Array.isArray(attendance)) {

        setText(
            "todayStatus",
            "Not clocked in"
        );

        return;
    }


    const today =
        getTodayDateString();


    console.log(
        "Looking for today's attendance:",
        today
    );


    const todayRecord =
        attendance.find(
            record => {

                const date =
                    record.attendanceDate ??
                    record.attendance_date ??
                    record.workDate ??
                    record.work_date ??
                    record.date;


                return (
                    normalizeDate(date) ===
                    today
                );

            }
        );


    if (!todayRecord) {

        setText(
            "todayStatus",
            "Not clocked in"
        );

        return;
    }


    console.log(
        "Today's attendance record:",
        todayRecord
    );


    const clockIn =
        todayRecord.clockIn ??
        todayRecord.clock_in ??
        todayRecord.timeIn ??
        todayRecord.time_in;


    const clockOut =
        todayRecord.clockOut ??
        todayRecord.clock_out ??
        todayRecord.timeOut ??
        todayRecord.time_out;


    const breakStart =
        todayRecord.breakStart ??
        todayRecord.break_start;


    const breakEnd =
        todayRecord.breakEnd ??
        todayRecord.break_end;


    const status =
        todayRecord.attendanceStatus ??
        todayRecord.attendance_status ??
        todayRecord.status;


    // ----------------------------------------------------------
    // Determine status
    // ----------------------------------------------------------

    if (clockOut) {

        setText(
            "todayStatus",
            "Clocked out"
        );

    } else if (
        breakStart &&
        !breakEnd
    ) {

        setText(
            "todayStatus",
            "On break"
        );

    } else if (clockIn) {

        setText(
            "todayStatus",
            "Clocked in"
        );

    } else if (status) {

        setText(
            "todayStatus",
            status
        );

    } else {

        setText(
            "todayStatus",
            "Not clocked in"
        );

    }

}


// ============================================================
// CURRENT CLOCK STATUS
// ============================================================

function renderClockStatus(response) {

    if (!response) {
        return;
    }


    console.log(
        "Rendering clock status:",
        response
    );


    /*
        Backend response:

        {
            isClockedIn: true,
            state: "WORKING",
            activeRecord: {
                attendanceId,
                employeeId,
                attendanceDate,
                clockIn,
                breakStart,
                breakEnd,
                clockOut,
                attendanceStatus
            }
        }
    */


    const state =
        response.state;


    const activeRecord =
        response.activeRecord;


    // ----------------------------------------------------------
    // ON BREAK
    // ----------------------------------------------------------

    if (
        state === "ON_BREAK"
    ) {

        setText(
            "todayStatus",
            "On break"
        );

    }


    // ----------------------------------------------------------
    // WORKING
    // ----------------------------------------------------------

    else if (
        state === "WORKING"
    ) {

        setText(
            "todayStatus",
            "Clocked in"
        );

    }


    // ----------------------------------------------------------
    // CLOCKED OUT
    // ----------------------------------------------------------

    else if (
        state === "CLOCKED_OUT"
    ) {

        setText(
            "todayStatus",
            "Clocked out"
        );

    }


    // ----------------------------------------------------------
    // FALLBACK
    // ----------------------------------------------------------

    else if (
        response.isClockedIn === true
    ) {

        setText(
            "todayStatus",
            "Clocked in"
        );

    }


    // ----------------------------------------------------------
    // Update quick clock button
    // ----------------------------------------------------------

    updateQuickClockButton(
        response
    );


    // ----------------------------------------------------------
    // Optional dashboard clock information
    // ----------------------------------------------------------

    if (activeRecord) {

        setTextIfExists(
            "todayClockIn",
            formatTime(
                activeRecord.clockIn
            )
        );

        setTextIfExists(
            "todayBreakStart",
            formatTime(
                activeRecord.breakStart
            )
        );

        setTextIfExists(
            "todayBreakEnd",
            formatTime(
                activeRecord.breakEnd
            )
        );

        setTextIfExists(
            "todayClockOut",
            formatTime(
                activeRecord.clockOut
            )
        );

    }

}


// ============================================================
// QUICK CLOCK BUTTON
// ============================================================

function updateQuickClockButton(status) {

    const button =
        document.getElementById(
            "quickClockBtn"
        );


    if (!button) {
        return;
    }


    const state =
        status?.state;


    // ----------------------------------------------------------
    // Currently working
    // ----------------------------------------------------------

    if (
        state === "WORKING"
    ) {

        button.disabled = true;

        button.innerHTML =
            '<i class="ti ti-check"></i> Clocked In';

        return;
    }


    // ----------------------------------------------------------
    // On break
    // ----------------------------------------------------------

    if (
        state === "ON_BREAK"
    ) {

        button.disabled = true;

        button.innerHTML =
            '<i class="ti ti-coffee"></i> On Break';

        return;
    }


    // ----------------------------------------------------------
    // Clocked out
    // ----------------------------------------------------------

    if (
        state === "CLOCKED_OUT"
    ) {

        button.disabled = false;

        button.innerHTML =
            '<i class="ti ti-login-2"></i> Clock In';

        return;
    }


    // ----------------------------------------------------------
    // Default
    // ----------------------------------------------------------

    button.disabled = false;

    button.innerHTML =
        '<i class="ti ti-login-2"></i> Clock In';

}


// ============================================================
// ATTENDANCE ACTIVITY
// ============================================================

function renderAttendanceActivity(
    attendance
) {

    const tbody =
        document.getElementById(
            "dashboardActivity"
        );


    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(attendance) ||
        attendance.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    No activity yet.
                </td>
            </tr>
        `;

        return;
    }


    const activities = [];


    attendance.forEach(
        record => {

            const date =
                record.attendanceDate ??
                record.attendance_date ??
                record.date;


            if (!date) {
                return;
            }


            const clockIn =
                record.clockIn ??
                record.clock_in;


            const breakStart =
                record.breakStart ??
                record.break_start;


            const breakEnd =
                record.breakEnd ??
                record.break_end;


            const clockOut =
                record.clockOut ??
                record.clock_out;


            if (clockIn) {

                activities.push({
                    date,
                    activity: "Clocked in",
                    status: formatTime(clockIn)
                });

            }


            if (breakStart) {

                activities.push({
                    date,
                    activity: "Break started",
                    status: formatTime(breakStart)
                });

            }


            if (breakEnd) {

                activities.push({
                    date,
                    activity: "Break ended",
                    status: formatTime(breakEnd)
                });

            }


            if (clockOut) {

                activities.push({
                    date,
                    activity: "Clocked out",
                    status: formatTime(clockOut)
                });

            }

        }
    );


    activities.sort(
        (a, b) => {

            const dateA =
                new Date(a.date).getTime();

            const dateB =
                new Date(b.date).getTime();

            return dateB - dateA;

        }
    );


    const recent =
        activities.slice(0, 5);


    if (!recent.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    No activity yet.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        recent.map(
            item => `
                <tr>
                    <td>
                        ${escapeHtml(
                            formatDisplayDate(
                                item.date
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.activity
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.status
                        )}
                    </td>
                </tr>
            `
        ).join("");

}


// ============================================================
// LEAVE
// ============================================================

async function loadDashboardLeave() {

    try {

        if (
            typeof getWorkerLeaveBalances !==
            "function"
        ) {

            return;
        }


        const response =
            await getWorkerLeaveBalances();


        console.log(
            "Leave balance response:",
            response
        );


        const balances =
            extractArray(response);


        renderLeaveBalance(
            balances
        );


    } catch (error) {

        console.error(
            "Could not load leave balance:",
            error
        );


        setText(
            "leaveBalanceDash",
            "0 days"
        );

    }

}


// ============================================================
// LEAVE BALANCE
// ============================================================

function renderLeaveBalance(
    balances
) {

    if (
        !Array.isArray(balances) ||
        balances.length === 0
    ) {

        setText(
            "leaveBalanceDash",
            "0 days"
        );

        return;
    }


    let balance =
        balances.find(
            item => {

                const type =
                    String(
                        item.leave_type_name ??
                        item.leaveTypeName ??
                        item.leave_type ??
                        item.leaveType ??
                        ""
                    ).toLowerCase();


                return (
                    type.includes("annual") ||
                    type.includes("vacation")
                );

            }
        );


    if (!balance) {
        balance = balances[0];
    }


    let remaining;


    if (
        balance.remaining_days !== undefined
    ) {

        remaining =
            Number(
                balance.remaining_days
            );

    } else if (
        balance.remainingDays !== undefined
    ) {

        remaining =
            Number(
                balance.remainingDays
            );

    } else {

        const allocated =
            Number(
                balance.allocated_days ??
                balance.allocatedDays ??
                balance.total_days ??
                balance.totalDays ??
                0
            );


        const used =
            Number(
                balance.used_days ??
                balance.usedDays ??
                0
            );


        remaining =
            allocated - used;

    }


    if (!Number.isFinite(remaining)) {
        remaining = 0;
    }


    setText(
        "leaveBalanceDash",
        `${remaining} days`
    );

}


// ============================================================
// PAYSLIPS
// ============================================================

async function loadDashboardPayslips() {

    try {

        if (
            typeof getWorkerPayslips !==
            "function"
        ) {

            return;
        }


        const response =
            await getWorkerPayslips();


        console.log(
            "Payslips response:",
            response
        );


        const payslips =
            extractArray(response);


        renderLatestPayslip(
            payslips
        );


    } catch (error) {

        console.error(
            "Could not load payslips:",
            error
        );


        setText(
            "netPayDash",
            "R0.00"
        );

    }

}


// ============================================================
// LATEST PAYSLIP
// ============================================================

function renderLatestPayslip(
    payslips
) {

    if (
        !Array.isArray(payslips) ||
        payslips.length === 0
    ) {

        setText(
            "netPayDash",
            "R0.00"
        );

        return;
    }


    const sorted =
        [...payslips].sort(
            (a, b) => {

                const dateA =
                    a.pay_period ??
                    a.payPeriod ??
                    a.created_at ??
                    a.createdAt ??
                    "";

                const dateB =
                    b.pay_period ??
                    b.payPeriod ??
                    b.created_at ??
                    b.createdAt ??
                    "";


                return String(dateB)
                    .localeCompare(
                        String(dateA)
                    );

            }
        );


    const latest =
        sorted[0];


    const netPay =
        latest.net_salary ??
        latest.netSalary ??
        latest.final_salary ??
        latest.finalSalary ??
        latest.net_pay ??
        latest.netPay ??
        0;


    setText(
        "netPayDash",
        formatCurrency(netPay)
    );

}


// ============================================================
// LEAVE REQUESTS
// ============================================================

async function loadDashboardLeaveRequests() {

    try {

        if (
            typeof getWorkerLeaveRequests !==
            "function"
        ) {

            return;
        }


        const response =
            await getWorkerLeaveRequests();


        console.log(
            "Leave requests response:",
            response
        );


        const requests =
            extractArray(response);


        renderLeaveActivity(
            requests
        );


    } catch (error) {

        console.error(
            "Could not load leave requests:",
            error
        );

    }

}


// ============================================================
// LEAVE ACTIVITY
// ============================================================

function renderLeaveActivity(
    requests
) {

    const tbody =
        document.getElementById(
            "dashboardActivity"
        );


    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(requests) ||
        requests.length === 0
    ) {

        return;
    }


    // Do not overwrite attendance activity.

    if (
        tbody.children.length > 0 &&
        !tbody.textContent.includes(
            "No activity yet"
        )
    ) {

        return;
    }


    const recent =
        requests.slice(0, 5);


    tbody.innerHTML =
        recent.map(
            request => {

                const date =
                    request.start_date ??
                    request.startDate ??
                    request.created_at ??
                    request.createdAt;


                const leaveType =
                    request.leave_type_name ??
                    request.leaveTypeName ??
                    request.leave_type ??
                    "Leave";


                const status =
                    request.status ??
                    "Pending";


                return `
                    <tr>

                        <td>
                            ${escapeHtml(
                                formatDisplayDate(
                                    date
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                leaveType
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                status
                            )}
                        </td>

                    </tr>
                `;

            }
        ).join("");

}


// ============================================================
// DASHBOARD BUTTONS
// ============================================================

function initializeDashboardButtons() {

    console.log(
        "Initializing dashboard buttons..."
    );


    const quickClockBtn =
        document.getElementById(
            "quickClockBtn"
        );


    if (quickClockBtn) {

        quickClockBtn.addEventListener(
            "click",
            handleClockButton
        );

    }

}


// ============================================================
// QUICK CLOCK IN
// ============================================================

async function handleClockButton(
    event
) {

    event.preventDefault();


    const button =
        event.currentTarget;


    if (!button) {
        return;
    }


    try {

        button.disabled = true;

        button.innerHTML =
            '<i class="ti ti-loader-2"></i> Clocking in...';


        if (
            typeof workerClockIn !==
            "function"
        ) {

            throw new Error(
                "workerClockIn() is not available."
            );

        }


        console.log(
            "Sending clock-in request..."
        );


        const response =
            await workerClockIn();


        console.log(
            "Clock-in response:",
            response
        );


        showDashboardToast(
            response?.message ||
            "You have been clocked in successfully."
        );


        // Refresh everything from database

        await loadDashboardAttendance();


    } catch (error) {

        console.error(
            "Clock-in failed:",
            error
        );


        button.disabled = false;

        button.innerHTML =
            '<i class="ti ti-login-2"></i> Clock In';


        showDashboardToast(
            error.message ||
            "Could not clock in."
        );

    }

}


// ============================================================
// RESPONSE HELPERS
// ============================================================

function extractArray(response) {

    if (!response) {
        return [];
    }


    if (Array.isArray(response)) {
        return response;
    }


    if (
        Array.isArray(response.data)
    ) {

        return response.data;
    }


    if (
        Array.isArray(response.rows)
    ) {

        return response.rows;
    }


    if (
        Array.isArray(response.results)
    ) {

        return response.results;
    }


    if (
        Array.isArray(response.attendance)
    ) {

        return response.attendance;
    }


    if (
        Array.isArray(response.balances)
    ) {

        return response.balances;
    }


    if (
        Array.isArray(response.requests)
    ) {

        return response.requests;
    }


    if (
        Array.isArray(response.payslips)
    ) {

        return response.payslips;
    }


    return [];
}


// ============================================================
// GENERIC TEXT
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {

        console.warn(
            `Element #${id} not found.`
        );

        return;
    }


    element.textContent =
        value === undefined ||
        value === null ||
        value === ""
            ? "-"
            : value;

}


// ============================================================
// OPTIONAL TEXT
// ============================================================

function setTextIfExists(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return;
    }


    element.textContent =
        value;

}


// ============================================================
// NESTED NAME
// ============================================================

function getNestedName(
    value
) {

    if (!value) {
        return "";
    }


    if (
        typeof value ===
        "string"
    ) {

        return value;
    }


    return (
        value.name ??
        value.title ??
        value.department_name ??
        value.departmentName ??
        value.position_name ??
        value.positionName ??
        ""
    );

}


// ============================================================
// DATE
// ============================================================

function getTodayDateString() {

    const now =
        new Date();


    return [
        now.getFullYear(),
        String(
            now.getMonth() + 1
        ).padStart(2, "0"),
        String(
            now.getDate()
        ).padStart(2, "0")
    ].join("-");

}


function normalizeDate(
    value
) {

    if (!value) {
        return "";
    }


    // YYYY-MM-DD or YYYY-MM-DD HH:mm:ss

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}/.test(value)
    ) {

        return value.substring(
            0,
            10
        );

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value)
            .substring(0, 10);

    }


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


// ============================================================
// DISPLAY DATE
// ============================================================

function formatDisplayDate(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);
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
// TIME
// ============================================================

function formatTime(
    value
) {

    if (!value) {
        return "-";
    }


    // MySQL TIME

    if (
        typeof value === "string" &&
        /^\d{2}:\d{2}/.test(value)
    ) {

        return value.substring(
            0,
            5
        );

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);
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
// CURRENCY
// ============================================================

function formatCurrency(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "R0.00";
    }


    return number.toLocaleString(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2
        }
    );

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// TOAST
// ============================================================

function showDashboardToast(
    message
) {

    if (
        typeof showToast ===
        "function"
    ) {

        showToast(message);

        return;
    }


    let toast =
        document.getElementById(
            "dashboardToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "dashboardToast";


        toast.style.position =
            "fixed";


        toast.style.bottom =
            "25px";


        toast.style.right =
            "25px";


        toast.style.padding =
            "14px 20px";


        toast.style.borderRadius =
            "10px";


        toast.style.background =
            "#27187E";


        toast.style.color =
            "#ffffff";


        toast.style.zIndex =
            "9999";


        toast.style.boxShadow =
            "0 5px 20px rgba(0,0,0,0.2)";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    setTimeout(
        () => {

            if (toast) {
                toast.remove();
            }

        },
        3000
    );

}


// ============================================================
// GLOBALS
// ============================================================

window.initializeWorkerDashboard =
    initializeWorkerDashboard;

window.renderDashboardProfile =
    renderDashboardProfile;

window.renderTodayStatus =
    renderTodayStatus;

window.renderClockStatus =
    renderClockStatus;

window.renderLeaveBalance =
    renderLeaveBalance;

window.renderLatestPayslip =
    renderLatestPayslip;

window.handleClockButton =
    handleClockButton;