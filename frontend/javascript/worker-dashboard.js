// ============================================================
// ModernTech Worker Dashboard
// Loads dashboard information from the backend API
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

    // Make sure the worker is authenticated.
    if (!requireWorkerLogin()) {
        return;
    }

    await loadWorkerDashboard();
});


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadWorkerDashboard() {

    try {

        console.log('Loading worker dashboard...');

        const response = await getWorkerDashboard();

        console.log(
            'Worker dashboard API response:',
            response
        );

        const dashboard = response?.data;

        if (!dashboard) {

            console.warn(
                'Dashboard response contains no data.'
            );

            return;
        }

        updateDashboard(dashboard);

    } catch (error) {

        console.error(
            'Failed to load worker dashboard:',
            error
        );

        showDashboardError(error.message);
    }
}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard(dashboard) {

    // --------------------------------------------------------
    // EMPLOYEE INFORMATION
    // --------------------------------------------------------

    const employee = dashboard.employee;

    if (employee) {

        // Welcome message
        const welcomeName =
            document.getElementById('welcomeName');

        if (welcomeName) {

            const firstName =
                employee.name?.split(' ')[0] ||
                employee.name ||
                'Worker';

            welcomeName.textContent =
                firstName;
        }


        // Sidebar employee name
        const sidebarWorkerName =
            document.getElementById(
                'sidebarWorkerName'
            );

        if (
            sidebarWorkerName &&
            employee.name
        ) {

            sidebarWorkerName.textContent =
                employee.name;
        }


        // Sidebar employee code
        const sidebarEmployeeCode =
            document.getElementById(
                'sidebarEmployeeCode'
            );

        if (
            sidebarEmployeeCode &&
            employee.employee_code
        ) {

            sidebarEmployeeCode.textContent =
                employee.employee_code;
        }


        // Sidebar avatar
        const sidebarAvatar =
            document.getElementById(
                'sidebarAvatar'
            );

        if (
            sidebarAvatar &&
            employee.name
        ) {

            sidebarAvatar.textContent =
                getInitials(employee.name);
        }
    }


    // --------------------------------------------------------
    // TODAY'S ATTENDANCE STATUS
    // --------------------------------------------------------

    if (dashboard.attendance) {

        const todayStatus =
            document.getElementById(
                'todayStatus'
            );

        if (todayStatus) {

            todayStatus.textContent =
                dashboard.attendance.status ||
                'Not clocked in';
        }
    }


    // --------------------------------------------------------
    // LEAVE BALANCE
    // --------------------------------------------------------

    if (
        dashboard.leaveBalance !== undefined &&
        dashboard.leaveBalance !== null
    ) {

        const leaveBalance =
            document.getElementById(
                'leaveBalanceDash'
            );

        if (leaveBalance) {

            leaveBalance.textContent =
                `${dashboard.leaveBalance} days`;
        }
    }


    // --------------------------------------------------------
    // LATEST NET PAY
    // --------------------------------------------------------

    if (dashboard.latestPayslip) {

        const netPay =
            document.getElementById(
                'netPayDash'
            );

        if (
            netPay &&
            dashboard.latestPayslip.net_salary !== undefined
        ) {

            netPay.textContent =
                formatCurrency(
                    dashboard.latestPayslip.net_salary
                );
        }
    }


    // --------------------------------------------------------
    // NEXT PAYDAY
    // --------------------------------------------------------

    const nextPayday =
        document.getElementById(
            'nextPaydayDash'
        );

    if (
        nextPayday &&
        dashboard.nextPayday
    ) {

        nextPayday.textContent =
            formatDate(
                dashboard.nextPayday
            );
    }


    // --------------------------------------------------------
    // RECENT ACTIVITY
    // --------------------------------------------------------

    if (
        Array.isArray(
            dashboard.recentActivity
        )
    ) {

        renderRecentActivity(
            dashboard.recentActivity
        );
    }
}


// ============================================================
// RECENT ACTIVITY
// ============================================================

function renderRecentActivity(activities) {

    const tableBody =
        document.getElementById(
            'dashboardActivity'
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = '';


    // No activity
    if (activities.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    No recent activity.
                </td>
            </tr>
        `;

        return;
    }


    // Add each activity
    activities.forEach(activity => {

        const row =
            document.createElement('tr');

        row.innerHTML = `
            <td>
                ${formatDate(activity.date)}
            </td>

            <td>
                ${escapeHtml(
                    activity.activity ||
                    activity.description ||
                    '-'
                )}
            </td>

            <td>
                ${escapeHtml(
                    activity.status ||
                    '-'
                )}
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return '-';
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;
    }

    return date.toLocaleDateString(
        'en-ZA',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }
    );
}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(amount) {

    const number =
        Number(amount);

    if (
        Number.isNaN(number)
    ) {

        return amount;
    }

    return new Intl.NumberFormat(
        'en-ZA',
        {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 2
        }
    ).format(number);
}


// ============================================================
// GET EMPLOYEE INITIALS
// ============================================================

function getInitials(name) {

    if (!name) {
        return '--';
    }

    return name
        .trim()
        .split(/\s+/)
        .map(
            part => part.charAt(0)
        )
        .join('')
        .substring(0, 2)
        .toUpperCase();
}


// ============================================================
// ESCAPE HTML
// Prevents API data from being inserted as HTML.
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// ============================================================
// DASHBOARD ERROR
// ============================================================

function showDashboardError(message) {

    const activity =
        document.getElementById(
            'dashboardActivity'
        );

    if (activity) {

        activity.innerHTML = `
            <tr>
                <td colspan="3">
                    Unable to load dashboard data.
                </td>
            </tr>
        `;
    }

    console.error(
        'Dashboard API error:',
        message
    );
}