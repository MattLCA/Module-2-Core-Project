// ============================================================
// ModernTech Worker Attendance
// ============================================================

console.log("Worker Attendance JS connected.");

document.addEventListener("DOMContentLoaded", () => {

    initializeAttendance();

});


function initializeAttendance() {

    const table =
        document.getElementById("attendanceTable");

    if (!table) {
        return;
    }


    document
        .querySelectorAll("[data-attendance]")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const action =
                    button.dataset.attendance;

                handleAttendanceAction(action);

            });

        });


    const clearButton =
        document.getElementById("clearAttendanceBtn");

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearAttendance
        );

    }


    renderAttendance();
}


// ============================================================
// ATTENDANCE ACTION
// ============================================================

function handleAttendanceAction(action) {

    /*
     * Backend integration will eventually call worker_api.js.
     *
     * Example:
     *
     * await clockIn();
     * await clockOut();
     * await startBreak();
     * await returnFromBreak();
     */

    console.log(
        "Attendance action requested:",
        action
    );

    showToast(
        `${action} API integration is pending.`
    );
}


// ============================================================
// RENDER
// ============================================================

function renderAttendance() {

    const table =
        document.getElementById("attendanceTable");

    const status =
        document.getElementById("attendanceStatus");

    const count =
        document.getElementById("attendanceCount");

    const last =
        document.getElementById("lastAttendanceAction");


    if (status) {
        status.textContent =
            "Waiting for database";
    }

    if (count) {
        count.textContent =
            "0 logs";
    }

    if (last) {
        last.textContent =
            "None";
    }


    if (table) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    Attendance records will load from the
                    database after backend integration is finalized.
                </td>
            </tr>
        `;

    }
}


// ============================================================
// CLEAR ATTENDANCE
// ============================================================

function clearAttendance() {

    /*
     * Do NOT clear database records here.
     *
     * This button will eventually be removed or replaced
     * depending on the final backend requirements.
     */

    showToast(
        "Attendance history is managed by the database."
    );
}