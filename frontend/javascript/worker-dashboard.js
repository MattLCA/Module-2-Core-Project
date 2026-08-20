// ============================================================
// ModernTech Worker Dashboard
// ============================================================

console.log(
    "Worker Dashboard JS connected."
);


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeDashboard();

    }
);


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeDashboard() {

    // Make sure the worker is authenticated.
    if (
        typeof requireWorkerLogin ===
        "function"
    ) {

        if (!requireWorkerLogin()) {
            return;
        }
    }


    // Load the logged-in employee from the API.
    if (
        typeof loadCurrentWorker ===
        "function"
    ) {

        await loadCurrentWorker();
    }


    // Initialize dashboard functionality.
    initializeQuickClock();

    await loadDashboardData();

    renderDashboardActivity();
}


// ============================================================
// LOAD DASHBOARD DATA
// ============================================================

async function loadDashboardData() {

    try {

        if (
            typeof getWorkerDashboard !==
            "function"
        ) {
            return;
        }


        const response =
            await getWorkerDashboard();


        console.log(
            "Worker dashboard response:",
            response
        );


        const dashboard =
            response?.data ||
            response;


        // Today's status.
        const todayStatus =
            document.getElementById(
                "todayStatus"
            );


        if (
            todayStatus &&
            dashboard?.todayStatus
        ) {

            todayStatus.textContent =
                dashboard.todayStatus;
        }


        // Leave balance.
        const leaveBalance =
            document.getElementById(
                "leaveBalanceDash"
            );


        if (
            leaveBalance &&
            dashboard?.leaveBalance !== undefined
        ) {

            leaveBalance.textContent =
                `${dashboard.leaveBalance} days`;
        }


        // Net pay.
        const netPay =
            document.getElementById(
                "netPayDash"
            );


        if (
            netPay &&
            dashboard?.netPay !== undefined
        ) {

            if (
                typeof formatCurrency ===
                "function"
            ) {

                netPay.textContent =
                    formatCurrency(
                        dashboard.netPay
                    );

            } else {

                netPay.textContent =
                    dashboard.netPay;
            }
        }

    } catch (error) {

        console.error(
            "Could not load dashboard data:",
            error
        );

        // Do not break the entire dashboard
        // if the endpoint is not finished yet.
    }
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


    button.addEventListener(
        "click",
        async () => {

            try {

                if (
                    typeof workerClockIn !==
                    "function"
                ) {

                    showToast(
                        "Attendance API is unavailable."
                    );

                    return;
                }


                button.disabled = true;


                const response =
                    await workerClockIn();


                console.log(
                    "Clock-in response:",
                    response
                );


                showToast(
                    "You have been clocked in."
                );


                const status =
                    document.getElementById(
                        "todayStatus"
                    );


                if (status) {

                    status.textContent =
                        "Clocked in";
                }


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

                button.disabled = false;
            }
        }
    );
}


// ============================================================
// DASHBOARD ACTIVITY
// ============================================================

function renderDashboardActivity() {

    const table =
        document.getElementById(
            "dashboardActivity"
        );


    if (!table) {
        return;
    }


    // Do not insert fake employee information.
    //
    // The actual activity will eventually come from
    // the dashboard API.

    table.innerHTML = `
        <tr>
            <td colspan="3">
                Activity will appear here when available.
            </td>
        </tr>
    `;
}