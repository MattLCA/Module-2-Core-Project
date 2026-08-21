// ============================================================
// ModernTech Worker Attendance
// ============================================================
//
// Handles:
// - Clock status
// - Clock in
// - Start break
// - End break
// - Clock out
// - Attendance history
//
// Authentication and API requests are handled by worker_api.js.
//
// Backend endpoints:
//
// GET  /api/worker/attendance/clock-status
// POST /api/worker/attendance/clock-in
// PUT  /api/worker/attendance/break/start
// PUT  /api/worker/attendance/break/end
// PUT  /api/worker/attendance/clock-out
// GET  /api/worker/attendance/history
//
// ============================================================

console.log("Worker Attendance JS connected.");


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeAttendance();
});


// ============================================================
// INITIALIZE ATTENDANCE
// ============================================================

async function initializeAttendance() {

    // --------------------------------------------------------
    // Make sure worker is authenticated
    // --------------------------------------------------------

    if (typeof requireWorkerLogin === "function") {

        if (!requireWorkerLogin()) {
            return;
        }

    }


    // --------------------------------------------------------
    // Load stored employee information
    // --------------------------------------------------------

    if (typeof initializeStoredEmployee === "function") {
        initializeStoredEmployee();
    }


    // --------------------------------------------------------
    // Load current attendance status
    // --------------------------------------------------------

    await loadClockStatus();


    // --------------------------------------------------------
    // Load attendance history
    // --------------------------------------------------------

    await loadAttendanceHistory();


    // --------------------------------------------------------
    // Setup buttons
    // --------------------------------------------------------

    initializeAttendanceEvents();

}


// ============================================================
// LOAD CLOCK STATUS
// ============================================================

async function loadClockStatus() {

    try {

        if (typeof getWorkerClockStatus !== "function") {

            console.error(
                "getWorkerClockStatus() is not available."
            );

            return;

        }


        const response =
            await getWorkerClockStatus();


        console.log(
            "Clock status response:",
            response
        );


        const status =
            extractClockStatus(response);


        updateAttendanceUI(status);


    } catch (error) {

        console.error(
            "Could not load clock status:",
            error
        );


        showAttendanceMessage(
            error.message ||
            "Could not load your attendance status.",
            "error"
        );

    }

}


// ============================================================
// EXTRACT CLOCK STATUS
// ============================================================

function extractClockStatus(response) {

    if (!response) {
        return {};
    }


    // --------------------------------------------------------
    // { data: {...} }
    // --------------------------------------------------------

    if (
        response.data &&
        typeof response.data === "object"
    ) {

        return response.data;

    }


    // --------------------------------------------------------
    // { status: {...} }
    // --------------------------------------------------------

    if (
        response.status &&
        typeof response.status === "object"
    ) {

        return response.status;

    }


    // --------------------------------------------------------
    // Direct object
    // --------------------------------------------------------

    return response;

}


// ============================================================
// UPDATE ATTENDANCE UI
// ============================================================

function updateAttendanceUI(status) {

    if (!status) {
        return;
    }


    console.log(
        "Updating attendance UI:",
        status
    );


    // --------------------------------------------------------
    // Determine current state
    // --------------------------------------------------------

    const clockedIn =
        status.clockedIn === true ||
        status.isClockedIn === true ||
        status.clocked_in === true;


    const onBreak =
        status.onBreak === true ||
        status.isOnBreak === true ||
        status.on_break === true;


    const clockedOut =
        status.clockedOut === true ||
        status.isClockedOut === true ||
        status.clocked_out === true;


    // --------------------------------------------------------
    // Update status text
    // --------------------------------------------------------

    updateElementText(
        [
            "attendanceStatus",
            "currentStatus",
            "todayStatus"
        ],
        getStatusLabel(
            clockedIn,
            onBreak,
            clockedOut
        )
    );


    // --------------------------------------------------------
    // Clock-in time
    // --------------------------------------------------------

    const clockInTime =
        status.clockInTime ||
        status.clock_in_time ||
        status.clockIn ||
        status.clock_in;


    updateElementText(
        [
            "clockInTime",
            "todayClockIn"
        ],
        formatAttendanceTime(clockInTime)
    );


    // --------------------------------------------------------
    // Break start
    // --------------------------------------------------------

    const breakStart =
        status.breakStart ||
        status.break_start ||
        status.breakStartTime ||
        status.break_start_time;


    updateElementText(
        [
            "breakStartTime",
            "todayBreakStart"
        ],
        formatAttendanceTime(breakStart)
    );


    // --------------------------------------------------------
    // Break end
    // --------------------------------------------------------

    const breakEnd =
        status.breakEnd ||
        status.break_end ||
        status.breakEndTime ||
        status.break_end_time;


    updateElementText(
        [
            "breakEndTime",
            "todayBreakEnd"
        ],
        formatAttendanceTime(breakEnd)
    );


    // --------------------------------------------------------
    // Clock-out time
    // --------------------------------------------------------

    const clockOutTime =
        status.clockOutTime ||
        status.clock_out_time ||
        status.clockOut ||
        status.clock_out;


    updateElementText(
        [
            "clockOutTime",
            "todayClockOut"
        ],
        formatAttendanceTime(clockOutTime)
    );


    // --------------------------------------------------------
    // Update buttons
    // --------------------------------------------------------

    updateAttendanceButtons(
        clockedIn,
        onBreak,
        clockedOut
    );

}


// ============================================================
// GET STATUS LABEL
// ============================================================

function getStatusLabel(
    clockedIn,
    onBreak,
    clockedOut
) {

    if (clockedOut) {
        return "Clocked out";
    }


    if (onBreak) {
        return "On break";
    }


    if (clockedIn) {
        return "Clocked in";
    }


    return "Not clocked in";

}


// ============================================================
// UPDATE ATTENDANCE BUTTONS
// ============================================================

function updateAttendanceButtons(
    clockedIn,
    onBreak,
    clockedOut
) {

    const clockInButtons = document.querySelectorAll(
        "#clockInBtn, #clockInButton"
    );


    const breakStartButtons = document.querySelectorAll(
        "#breakStartBtn, #startBreakBtn, #breakStartButton"
    );


    const breakEndButtons = document.querySelectorAll(
        "#breakEndBtn, #endBreakBtn, #breakEndButton"
    );


    const clockOutButtons = document.querySelectorAll(
        "#clockOutBtn, #clockOutButton"
    );


    // --------------------------------------------------------
    // Clock in
    // --------------------------------------------------------

    clockInButtons.forEach((button) => {

        button.disabled =
            clockedIn ||
            clockedOut;

    });


    // --------------------------------------------------------
    // Start break
    // --------------------------------------------------------

    breakStartButtons.forEach((button) => {

        button.disabled =
            !clockedIn ||
            onBreak ||
            clockedOut;

    });


    // --------------------------------------------------------
    // End break
    // --------------------------------------------------------

    breakEndButtons.forEach((button) => {

        button.disabled =
            !onBreak ||
            clockedOut;

    });


    // --------------------------------------------------------
    // Clock out
    // --------------------------------------------------------

    clockOutButtons.forEach((button) => {

        button.disabled =
            !clockedIn ||
            clockedOut;

    });

}


// ============================================================
// INITIALIZE BUTTON EVENTS
// ============================================================

function initializeAttendanceEvents() {

    // --------------------------------------------------------
    // Clock in
    // --------------------------------------------------------

    const clockInButtons =
        document.querySelectorAll(
            "#clockInBtn, #clockInButton"
        );


    clockInButtons.forEach((button) => {

        button.addEventListener(
            "click",
            handleClockIn
        );

    });


    // --------------------------------------------------------
    // Start break
    // --------------------------------------------------------

    const breakStartButtons =
        document.querySelectorAll(
            "#breakStartBtn, #startBreakBtn, #breakStartButton"
        );


    breakStartButtons.forEach((button) => {

        button.addEventListener(
            "click",
            handleBreakStart
        );

    });


    // --------------------------------------------------------
    // End break
    // --------------------------------------------------------

    const breakEndButtons =
        document.querySelectorAll(
            "#breakEndBtn, #endBreakBtn, #breakEndButton"
        );


    breakEndButtons.forEach((button) => {

        button.addEventListener(
            "click",
            handleBreakEnd
        );

    });


    // --------------------------------------------------------
    // Clock out
    // --------------------------------------------------------

    const clockOutButtons =
        document.querySelectorAll(
            "#clockOutBtn, #clockOutButton"
        );


    clockOutButtons.forEach((button) => {

        button.addEventListener(
            "click",
            handleClockOut
        );

    });

}


// ============================================================
// CLOCK IN
// ============================================================

async function handleClockIn(event) {

    const button =
        event.currentTarget;


    try {

        setButtonLoading(
            button,
            true,
            "Clocking in..."
        );


        if (
            typeof workerClockIn !==
            "function"
        ) {

            throw new Error(
                "Attendance API is unavailable."
            );

        }


        const response =
            await workerClockIn();


        console.log(
            "Clock-in response:",
            response
        );


        showAttendanceMessage(
            "You have been clocked in successfully.",
            "success"
        );


        await loadClockStatus();

        await loadAttendanceHistory();


    } catch (error) {

        console.error(
            "Clock-in failed:",
            error
        );


        showAttendanceMessage(
            error.message ||
            "Could not clock in.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


// ============================================================
// START BREAK
// ============================================================

async function handleBreakStart(event) {

    const button =
        event.currentTarget;


    try {

        setButtonLoading(
            button,
            true,
            "Starting break..."
        );


        if (
            typeof workerStartBreak !==
            "function"
        ) {

            throw new Error(
                "Attendance API is unavailable."
            );

        }


        const response =
            await workerStartBreak();


        console.log(
            "Break start response:",
            response
        );


        showAttendanceMessage(
            "Your break has started.",
            "success"
        );


        await loadClockStatus();

        await loadAttendanceHistory();


    } catch (error) {

        console.error(
            "Start break failed:",
            error
        );


        showAttendanceMessage(
            error.message ||
            "Could not start your break.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


// ============================================================
// END BREAK
// ============================================================

async function handleBreakEnd(event) {

    const button =
        event.currentTarget;


    try {

        setButtonLoading(
            button,
            true,
            "Ending break..."
        );


        if (
            typeof workerEndBreak !==
            "function"
        ) {

            throw new Error(
                "Attendance API is unavailable."
            );

        }


        const response =
            await workerEndBreak();


        console.log(
            "Break end response:",
            response
        );


        showAttendanceMessage(
            "Your break has ended.",
            "success"
        );


        await loadClockStatus();

        await loadAttendanceHistory();


    } catch (error) {

        console.error(
            "End break failed:",
            error
        );


        showAttendanceMessage(
            error.message ||
            "Could not end your break.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


// ============================================================
// CLOCK OUT
// ============================================================

async function handleClockOut(event) {

    const button =
        event.currentTarget;


    try {

        setButtonLoading(
            button,
            true,
            "Clocking out..."
        );


        if (
            typeof workerClockOut !==
            "function"
        ) {

            throw new Error(
                "Attendance API is unavailable."
            );

        }


        const response =
            await workerClockOut();


        console.log(
            "Clock-out response:",
            response
        );


        showAttendanceMessage(
            "You have been clocked out successfully.",
            "success"
        );


        await loadClockStatus();

        await loadAttendanceHistory();


    } catch (error) {

        console.error(
            "Clock-out failed:",
            error
        );


        showAttendanceMessage(
            error.message ||
            "Could not clock out.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


// ============================================================
// LOAD ATTENDANCE HISTORY
// ============================================================

async function loadAttendanceHistory() {

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


        const response =
            await getWorkerAttendanceHistory();


        console.log(
            "Attendance history response:",
            response
        );


        const history =
            extractAttendanceHistory(
                response
            );


        renderAttendanceHistory(
            history
        );


    } catch (error) {

        console.error(
            "Could not load attendance history:",
            error
        );


        renderAttendanceHistoryError(
            error.message ||
            "Could not load attendance history."
        );

    }

}


// ============================================================
// EXTRACT ATTENDANCE HISTORY
// ============================================================

function extractAttendanceHistory(response) {

    if (!response) {
        return [];
    }


    // --------------------------------------------------------
    // { data: [...] }
    // --------------------------------------------------------

    if (Array.isArray(response.data)) {
        return response.data;
    }


    // --------------------------------------------------------
    // { history: [...] }
    // --------------------------------------------------------

    if (Array.isArray(response.history)) {
        return response.history;
    }


    // --------------------------------------------------------
    // { attendance: [...] }
    // --------------------------------------------------------

    if (Array.isArray(response.attendance)) {
        return response.attendance;
    }


    // --------------------------------------------------------
    // { data: { history: [...] } }
    // --------------------------------------------------------

    if (
        response.data &&
        Array.isArray(response.data.history)
    ) {

        return response.data.history;

    }


    // --------------------------------------------------------
    // { data: { attendance: [...] } }
    // --------------------------------------------------------

    if (
        response.data &&
        Array.isArray(response.data.attendance)
    ) {

        return response.data.attendance;

    }


    // --------------------------------------------------------
    // Direct array
    // --------------------------------------------------------

    if (Array.isArray(response)) {
        return response;
    }


    return [];

}


// ============================================================
// RENDER ATTENDANCE HISTORY
// ============================================================

function renderAttendanceHistory(history) {

    const tableBody =
        document.getElementById(
            "attendanceHistory"
        ) ||
        document.getElementById(
            "attendanceTableBody"
        ) ||
        document.querySelector(
            "#attendanceHistoryTable tbody"
        );


    if (!tableBody) {

        console.warn(
            "Attendance history table was not found."
        );

        return;

    }


    // --------------------------------------------------------
    // Empty history
    // --------------------------------------------------------

    if (!history.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No attendance records found.
                </td>
            </tr>
        `;

        return;

    }


    // --------------------------------------------------------
    // Render records
    // --------------------------------------------------------

    tableBody.innerHTML =
        history
            .map(
                record =>
                    createAttendanceRow(
                        record
                    )
            )
            .join("");

}


// ============================================================
// CREATE ATTENDANCE ROW
// ============================================================

function createAttendanceRow(record) {

    const date =
        record.date ||
        record.attendance_date ||
        record.attendanceDate ||
        record.work_date ||
        record.workDate;


    const clockIn =
        record.clock_in ||
        record.clockIn ||
        record.clock_in_time ||
        record.clockInTime;


    const breakStart =
        record.break_start ||
        record.breakStart ||
        record.break_start_time ||
        record.breakStartTime;


    const breakEnd =
        record.break_end ||
        record.breakEnd ||
        record.break_end_time ||
        record.breakEndTime;


    const clockOut =
        record.clock_out ||
        record.clockOut ||
        record.clock_out_time ||
        record.clockOutTime;


    const status =
        record.status ||
        getRecordStatus(
            record
        );


    return `
        <tr>

            <td>
                ${escapeHTML(
                    formatAttendanceDate(date)
                )}
            </td>

            <td>
                ${escapeHTML(
                    formatAttendanceTime(clockIn)
                )}
            </td>

            <td>
                ${escapeHTML(
                    formatAttendanceTime(breakStart)
                )}
            </td>

            <td>
                ${escapeHTML(
                    formatAttendanceTime(breakEnd)
                )}
            </td>

            <td>
                ${escapeHTML(
                    formatAttendanceTime(clockOut)
                )}
            </td>

            <td>
                <span class="status-badge">
                    ${escapeHTML(status)}
                </span>
            </td>

        </tr>
    `;

}


// ============================================================
// GET RECORD STATUS
// ============================================================

function getRecordStatus(record) {

    const clockIn =
        record.clock_in ||
        record.clockIn;


    const clockOut =
        record.clock_out ||
        record.clockOut;


    if (
        clockIn &&
        clockOut
    ) {

        return "Completed";

    }


    if (clockIn) {

        return "Clocked in";

    }


    return "Not clocked in";

}


// ============================================================
// FORMAT ATTENDANCE DATE
// ============================================================

function formatAttendanceDate(
    value
) {

    if (!value) {
        return "—";
    }


    if (
        typeof formatDate ===
        "function"
    ) {

        return formatDate(value);

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
// FORMAT ATTENDANCE TIME
// ============================================================

function formatAttendanceTime(
    value
) {

    if (!value) {
        return "—";
    }


    // --------------------------------------------------------
    // If backend sends a simple HH:MM:SS time
    // --------------------------------------------------------

    if (
        typeof value === "string" &&
        /^\d{2}:\d{2}(:\d{2})?$/.test(value)
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
// UPDATE ELEMENT TEXT
// ============================================================

function updateElementText(
    ids,
    value
) {

    ids.forEach((id) => {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value;

        }

    });

}


// ============================================================
// BUTTON LOADING STATE
// ============================================================

function setButtonLoading(
    button,
    loading,
    loadingText = "Loading..."
) {

    if (!button) {
        return;
    }


    if (loading) {

        if (!button.dataset.originalHTML) {

            button.dataset.originalHTML =
                button.innerHTML;

        }


        button.disabled = true;


        button.innerHTML = `
            <i class="ti ti-loader-2"></i>
            <span>
                ${escapeHTML(loadingText)}
            </span>
        `;

    } else {

        button.disabled = false;


        if (button.dataset.originalHTML) {

            button.innerHTML =
                button.dataset.originalHTML;

            delete button.dataset.originalHTML;

        }

    }

}


// ============================================================
// ATTENDANCE MESSAGE
// ============================================================

function showAttendanceMessage(
    message,
    type = "success"
) {

    if (
        typeof showToast ===
        "function"
    ) {

        showToast(message);

        return;

    }


    let messageBox =
        document.querySelector(
            ".attendance-message"
        );


    if (!messageBox) {

        messageBox =
            document.createElement(
                "div"
            );

        messageBox.className =
            "attendance-message";

        document.body.appendChild(
            messageBox
        );

    }


    messageBox.textContent =
        message;


    messageBox.className =
        `attendance-message ${type}`;

}


// ============================================================
// RENDER HISTORY ERROR
// ============================================================

function renderAttendanceHistoryError(
    message
) {

    const tableBody =
        document.getElementById(
            "attendanceHistory"
        ) ||
        document.getElementById(
            "attendanceTableBody"
        ) ||
        document.querySelector(
            "#attendanceHistoryTable tbody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="6">
                ${escapeHTML(message)}
            </td>
        </tr>
    `;

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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
// GLOBAL ACCESS
// ============================================================

window.initializeAttendance =
    initializeAttendance;

window.loadClockStatus =
    loadClockStatus;

window.loadAttendanceHistory =
    loadAttendanceHistory;

window.handleClockIn =
    handleClockIn;

window.handleBreakStart =
    handleBreakStart;

window.handleBreakEnd =
    handleBreakEnd;

window.handleClockOut =
    handleClockOut;

window.updateAttendanceUI =
    updateAttendanceUI;