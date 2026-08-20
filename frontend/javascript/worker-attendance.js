// ============================================================
// ModernTech Worker Attendance
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    const table = document.getElementById("attendanceTable");

    if (!table) return;

    initializeAttendanceButtons();

    await loadAttendance();

});


// ============================================================
// ATTENDANCE BUTTONS
// ============================================================

function initializeAttendanceButtons() {

    document.querySelectorAll("[data-attendance]")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const action =
                    button.dataset.attendance;

                try {

                    await submitAttendance(action);

                    showToast(
                        `${action} saved successfully.`
                    );

                    await loadAttendance();

                } catch (error) {

                    console.error(error);

                    showToast(
                        error.message ||
                        `Unable to save ${action}.`
                    );

                }

            });

        });


    const clearButton =
        document.getElementById("clearAttendanceBtn");

    if (clearButton) {

        clearButton.addEventListener("click", async () => {

            /*
             * DO NOT connect this to the database yet.
             *
             * Database attendance records should normally not
             * be deleted from the worker interface.
             */

            showToast(
                "Attendance records cannot be cleared."
            );

        });

    }

}


// ============================================================
// LOAD ATTENDANCE
// ============================================================

async function loadAttendance() {

    try {

        const response =
            await getWorkerAttendance();

        console.log(
            "Attendance response:",
            response
        );

        const logs =
            response.attendance ||
            response.data ||
            response.logs ||
            [];

        renderAttendance(logs);

    } catch (error) {

        console.error(
            "Failed to load attendance:",
            error
        );

        showToast(
            "Unable to load attendance."
        );

    }

}


// ============================================================
// RENDER ATTENDANCE
// ============================================================

function renderAttendance(logs) {

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
            logs.length
                ? logs[0].action || "Recorded"
                : "Not clocked in";

    }


    if (count) {

        count.textContent =
            `${logs.length} logs`;

    }


    if (last) {

        if (logs.length) {

            const latest = logs[0];

            last.textContent =
                `${latest.action || "Action"} ${latest.time || ""}`;

        } else {

            last.textContent = "None";

        }

    }


    if (!logs.length) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No attendance records found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = logs.map(log => {

        return `
            <tr>
                <td>
                    ${log.date || log.attendance_date || "-"}
                </td>

                <td>
                    ${log.time || log.attendance_time || "-"}
                </td>

                <td>
                    ${log.action || log.status || "-"}
                </td>

                <td>
                    <span class="status approved">
                        ${log.status || "Recorded"}
                    </span>
                </td>
            </tr>
        `;

    }).join("");

}