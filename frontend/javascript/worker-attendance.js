// ============================================================
// ModernTech Worker Attendance
// ============================================================

console.log("Worker Attendance JS connected.");


let attendanceHistory = [];


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (
            typeof requireWorkerLogin === "function" &&
            !requireWorkerLogin()
        ) {
            return;
        }


        if (
            typeof initializeStoredEmployee ===
            "function"
        ) {
            initializeStoredEmployee();
        }


        initializeAttendanceButtons();

        await loadAttendance();

    }
);


// ============================================================
// LOAD ATTENDANCE
// ============================================================

async function loadAttendance() {

    try {

        const [
            statusResponse,
            historyResponse
        ] = await Promise.all([
            getWorkerClockStatus(),
            getWorkerAttendanceHistory()
        ]);


        console.log(
            "Clock status:",
            statusResponse
        );


        console.log(
            "Attendance history:",
            historyResponse
        );


        renderClockStatus(
            statusResponse
        );


        attendanceHistory =
            historyResponse?.data ||
            [];


        renderAttendanceHistory(
            attendanceHistory
        );


    } catch (error) {

        console.error(
            "Attendance error:",
            error
        );


        showToast(
            error.message ||
            "Could not load attendance."
        );

    }

}


// ============================================================
// BUTTONS
// ============================================================

function initializeAttendanceButtons() {

    document
        .querySelectorAll(
            "[data-attendance]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        const action =
                            button.dataset.attendance;


                        await handleAttendanceAction(
                            action
                        );

                    }
                );

            }
        );


    const clearButton =
        document.getElementById(
            "clearAttendanceBtn"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                renderAttendanceHistory(
                    attendanceHistory
                );

                showToast(
                    "Attendance history is stored in the database and cannot be deleted from this page."
                );

            }
        );

    }

}


// ============================================================
// HANDLE ACTION
// ============================================================

async function handleAttendanceAction(
    action
) {

    try {

        let response;


        switch (action) {

            case "Clock In":

                response =
                    await workerClockIn();

                break;


            case "Break":

                response =
                    await workerStartBreak();

                break;


            case "Return":

                response =
                    await workerEndBreak();

                break;


            case "Clock Out":

                response =
                    await workerClockOut();

                break;


            default:

                return;

        }


        showToast(
            response?.message ||
            `${action} successful.`
        );


        await loadAttendance();


    } catch (error) {

        console.error(
            `${action} error:`,
            error
        );


        showToast(
            error.message ||
            `${action} failed.`
        );

    }

}


// ============================================================
// CLOCK STATUS
// ============================================================

function renderClockStatus(
    response
) {

    const statusElement =
        document.getElementById(
            "attendanceStatus"
        );


    const lastActionElement =
        document.getElementById(
            "lastAttendanceAction"
        );


    if (!response) {
        return;
    }


    const state =
        response.state;


    let status =
        "Not clocked in";


    if (
        state === "WORKING"
    ) {

        status =
            "Working";

    } else if (
        state === "ON_BREAK"
    ) {

        status =
            "On Break";

    } else if (
        state === "CLOCKED_OUT"
    ) {

        status =
            "Clocked Out";

    }


    if (statusElement) {

        statusElement.textContent =
            status;

    }


    const record =
        response.activeRecord;


    if (
        record &&
        lastActionElement
    ) {

        if (record.clockOut) {

            lastActionElement.textContent =
                "Clock Out";

        } else if (
            record.breakEnd
        ) {

            lastActionElement.textContent =
                "Return";

        } else if (
            record.breakStart
        ) {

            lastActionElement.textContent =
                "Break";

        } else if (
            record.clockIn
        ) {

            lastActionElement.textContent =
                "Clock In";

        }

    }

}


// ============================================================
// HISTORY
// ============================================================

function renderAttendanceHistory(
    records
) {

    const table =
        document.getElementById(
            "attendanceTable"
        );


    const count =
        document.getElementById(
            "attendanceCount"
        );


    if (!table) {
        return;
    }


    if (!Array.isArray(records)) {

        records = [];

    }


    if (count) {

        count.textContent =
            `${records.length} logs`;

    }


    if (!records.length) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No attendance records found.
                </td>
            </tr>
        `;

        return;
    }


    const rows = [];


    records.forEach(
        (record) => {

            const date =
                formatDate(
                    record.attendanceDate
                );


            addAttendanceRow(
                rows,
                date,
                record.clockIn,
                "Clock In"
            );


            addAttendanceRow(
                rows,
                date,
                record.breakStart,
                "Break"
            );


            addAttendanceRow(
                rows,
                date,
                record.breakEnd,
                "Return"
            );


            addAttendanceRow(
                rows,
                date,
                record.clockOut,
                "Clock Out"
            );

        }
    );


    if (!rows.length) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No attendance actions found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        rows.join("");

}


// ============================================================
// ADD ROW
// ============================================================

function addAttendanceRow(
    rows,
    date,
    timestamp,
    action
) {

    if (!timestamp) {
        return;
    }


    const time =
        new Date(
            timestamp
        );


    const timeText =
        Number.isNaN(
            time.getTime()
        )
            ? String(timestamp)
            : time.toLocaleTimeString(
                "en-ZA",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


    rows.push(`
        <tr>
            <td>${escapeHTML(date)}</td>
            <td>${escapeHTML(timeText)}</td>
            <td>${escapeHTML(action)}</td>
            <td>Present</td>
        </tr>
    `);

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