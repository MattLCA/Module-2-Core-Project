// ============================================================
// ModernTech Worker Payslips
// ============================================================
// Backend endpoints:
//
// GET /api/worker/payslips
// GET /api/worker/payslips/:id
// GET /api/worker/payslips/:id/download
//
// Authentication is handled by worker_api.js.
// ============================================================

console.log("Worker Payslip JS connected.");


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initializing worker payslips...");

    // Protect page.
    if (typeof requireWorkerLogin === "function") {
        if (!requireWorkerLogin()) {
            return;
        }
    }

    // Display stored employee immediately.
    if (typeof initializeStoredEmployee === "function") {
        initializeStoredEmployee();
    }

    // Load employee information.
    await loadPayslipEmployee();

    // Load payslips.
    await loadPayslips();

    // Set up any payslip controls.
    initializePayslipControls();
});


// ============================================================
// EMPLOYEE
// ============================================================

async function loadPayslipEmployee() {
    try {
        if (typeof getWorkerProfile !== "function") {
            return;
        }

        const response = await getWorkerProfile();

        console.log(
            "Payslip employee response:",
            response
        );

        const employee =
            response?.data?.employee ||
            response?.data ||
            response?.employee ||
            response;

        if (!employee) {
            return;
        }

        if (typeof saveLoggedInWorker === "function") {
            saveLoggedInWorker(employee);
        }

        if (typeof updateSidebarEmployee === "function") {
            updateSidebarEmployee(employee);
        }

    } catch (error) {
        console.error(
            "Could not load payslip employee:",
            error
        );
    }
}


// ============================================================
// LOAD PAYSLIPS
// ============================================================

async function loadPayslips() {
    try {
        if (typeof getWorkerPayslips !== "function") {
            console.error(
                "getWorkerPayslips() is unavailable."
            );
            return;
        }

        const response =
            await getWorkerPayslips();

        console.log(
            "Payslips response:",
            response
        );

        const payslips =
            response?.data?.payslips ||
            response?.data?.payrolls ||
            response?.payslips ||
            response?.payrolls ||
            response?.data ||
            response;

        if (!Array.isArray(payslips)) {
            console.warn(
                "Payslips response was not an array."
            );
            return;
        }

        renderPayslips(payslips);

    } catch (error) {
        console.error(
            "Could not load payslips:",
            error
        );

        showPayslipMessage(
            error.message ||
            "Could not load your payslips.",
            "error"
        );
    }
}


// ============================================================
// RENDER PAYSLIPS
// ============================================================

function renderPayslips(payslips) {

    // Try common table body IDs.
    const tableBody =
        document.getElementById("payslipsBody") ||
        document.getElementById("payslipBody") ||
        document.getElementById("payrollBody") ||
        document.querySelector(
            "#payslipTable tbody"
        ) ||
        document.querySelector(
            "#payslipsTable tbody"
        );

    if (tableBody) {
        renderPayslipTable(
            tableBody,
            payslips
        );
        return;
    }

    // Try card container.
    const cardContainer =
        document.getElementById("payslips") ||
        document.getElementById("payslipList") ||
        document.getElementById("payslipCards");

    if (cardContainer) {
        renderPayslipCards(
            cardContainer,
            payslips
        );
        return;
    }

    console.warn(
        "No payslip table or card container found."
    );
}


// ============================================================
// TABLE
// ============================================================

function renderPayslipTable(
    tableBody,
    payslips
) {

    if (payslips.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No payslips available.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = "";

    payslips.forEach((payslip) => {

        const id =
            payslip.id ??
            payslip.payroll_id ??
            payslip.payslip_id ??
            payslip.payrollId ??
            payslip.payslipId;

        const period =
            payslip.pay_period ||
            payslip.payPeriod ||
            payslip.period ||
            payslip.payroll_period ||
            formatPayPeriod(payslip);

        const payDate =
            payslip.pay_date ||
            payslip.payDate ||
            payslip.payment_date ||
            payslip.paymentDate;

        const gross =
            payslip.gross_pay ??
            payslip.grossPay ??
            payslip.gross_salary ??
            payslip.grossSalary ??
            0;

        const deductions =
            payslip.total_deductions ??
            payslip.totalDeductions ??
            payslip.deductions ??
            0;

        const net =
            payslip.net_pay ??
            payslip.netPay ??
            payslip.net_salary ??
            payslip.netSalary ??
            0;

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${escapeHtml(period)}
            </td>

            <td>
                ${formatCurrencySafe(gross)}
            </td>

            <td>
                ${formatCurrencySafe(deductions)}
            </td>

            <td>
                ${formatCurrencySafe(net)}
            </td>

            <td>
                ${formatPayslipDate(payDate)}
            </td>

            <td>
                <span class="status approved">
                    Available
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="btn payslip-view-btn"
                    data-payslip-id="${escapeHtml(id)}"
                >
                    View
                </button>

                <button
                    type="button"
                    class="btn payslip-download-btn"
                    data-payslip-id="${escapeHtml(id)}"
                >
                    Download
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ============================================================
// CARDS
// ============================================================

function renderPayslipCards(
    container,
    payslips
) {

    if (payslips.length === 0) {
        container.innerHTML = `
            <p class="empty-state">
                No payslips available.
            </p>
        `;

        return;
    }

    container.innerHTML = "";

    payslips.forEach((payslip) => {

        const id =
            payslip.id ??
            payslip.payroll_id ??
            payslip.payslip_id ??
            "";

        const period =
            payslip.pay_period ||
            payslip.payPeriod ||
            payslip.period ||
            formatPayPeriod(payslip);

        const gross =
            payslip.gross_pay ??
            payslip.grossPay ??
            0;

        const deductions =
            payslip.total_deductions ??
            payslip.totalDeductions ??
            payslip.deductions ??
            0;

        const net =
            payslip.net_pay ??
            payslip.netPay ??
            0;

        const card =
            document.createElement("article");

        card.className =
            "payslip-card";

        card.innerHTML = `
            <div class="payslip-card-header">
                <div>
                    <span>Pay Period</span>
                    <h3>
                        ${escapeHtml(period)}
                    </h3>
                </div>

                <span class="status approved">
                    Available
                </span>
            </div>

            <div class="payslip-card-details">

                <div>
                    <span>Gross Pay</span>
                    <strong>
                        ${formatCurrencySafe(gross)}
                    </strong>
                </div>

                <div>
                    <span>Deductions</span>
                    <strong>
                        ${formatCurrencySafe(deductions)}
                    </strong>
                </div>

                <div>
                    <span>Net Pay</span>
                    <strong>
                        ${formatCurrencySafe(net)}
                    </strong>
                </div>

            </div>

            <div class="payslip-card-actions">

                <button
                    type="button"
                    class="btn payslip-view-btn"
                    data-payslip-id="${escapeHtml(id)}"
                >
                    View Payslip
                </button>

                <button
                    type="button"
                    class="btn payslip-download-btn"
                    data-payslip-id="${escapeHtml(id)}"
                >
                    Download
                </button>

            </div>
        `;

        container.appendChild(card);
    });
}


// ============================================================
// CONTROLS
// ============================================================

function initializePayslipControls() {

    document.addEventListener(
        "click",
        async (event) => {

            const viewButton =
                event.target.closest(
                    ".payslip-view-btn"
                );

            if (viewButton) {

                const payslipId =
                    viewButton.dataset.payslipId;

                if (payslipId) {
                    await viewPayslip(
                        payslipId
                    );
                }

                return;
            }


            const downloadButton =
                event.target.closest(
                    ".payslip-download-btn"
                );

            if (downloadButton) {

                const payslipId =
                    downloadButton.dataset.payslipId;

                if (payslipId) {
                    await downloadPayslip(
                        payslipId
                    );
                }
            }

        }
    );
}


// ============================================================
// VIEW PAYSLIP
// ============================================================

async function viewPayslip(payslipId) {

    try {

        if (
            typeof getWorkerPayslip !==
            "function"
        ) {
            throw new Error(
                "Payslip API is unavailable."
            );
        }

        const response =
            await getWorkerPayslip(
                payslipId
            );

        console.log(
            "Payslip details:",
            response
        );

        const payslip =
            response?.data?.payslip ||
            response?.data ||
            response?.payslip ||
            response;

        if (!payslip) {
            throw new Error(
                "Payslip data was not returned."
            );
        }

        displayPayslipDetails(
            payslip
        );

    } catch (error) {

        console.error(
            "Could not load payslip:",
            error
        );

        showPayslipMessage(
            error.message ||
            "Could not load payslip.",
            "error"
        );
    }
}


// ============================================================
// DISPLAY PAYSLIP DETAILS
// ============================================================

function displayPayslipDetails(
    payslip
) {

    let modal =
        document.getElementById(
            "payslipModal"
        );

    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "payslipModal";

        modal.className =
            "modal";

        document.body.appendChild(
            modal
        );
    }

    const period =
        payslip.pay_period ||
        payslip.payPeriod ||
        payslip.period ||
        formatPayPeriod(payslip);

    const gross =
        payslip.gross_pay ??
        payslip.grossPay ??
        0;

    const deductions =
        payslip.total_deductions ??
        payslip.totalDeductions ??
        payslip.deductions ??
        0;

    const net =
        payslip.net_pay ??
        payslip.netPay ??
        0;

    const payDate =
        payslip.pay_date ||
        payslip.payDate ||
        payslip.payment_date ||
        payslip.paymentDate;

    modal.innerHTML = `
        <div class="modal-content">

            <button
                type="button"
                class="modal-close"
                id="closePayslipModal"
                aria-label="Close"
            >
                ×
            </button>

            <div class="modal-header">
                <h2>
                    Payslip
                </h2>

                <p>
                    ${escapeHtml(period)}
                </p>
            </div>

            <div class="payslip-details">

                <div class="payslip-detail-row">
                    <span>Pay Period</span>
                    <strong>
                        ${escapeHtml(period)}
                    </strong>
                </div>

                <div class="payslip-detail-row">
                    <span>Payment Date</span>
                    <strong>
                        ${formatPayslipDate(payDate)}
                    </strong>
                </div>

                <div class="payslip-detail-row">
                    <span>Gross Pay</span>
                    <strong>
                        ${formatCurrencySafe(gross)}
                    </strong>
                </div>

                <div class="payslip-detail-row">
                    <span>Deductions</span>
                    <strong>
                        ${formatCurrencySafe(deductions)}
                    </strong>
                </div>

                <div class="payslip-detail-row total">
                    <span>Net Pay</span>
                    <strong>
                        ${formatCurrencySafe(net)}
                    </strong>
                </div>

            </div>

            <div class="modal-actions">

                <button
                    type="button"
                    class="btn"
                    id="modalDownloadPayslip"
                    data-payslip-id="${escapeHtml(
                        payslip.id ??
                        payslip.payroll_id ??
                        payslip.payslip_id ??
                        ""
                    )}"
                >
                    Download Payslip
                </button>

            </div>

        </div>
    `;

    modal.classList.add("show");

    const closeButton =
        document.getElementById(
            "closePayslipModal"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {
                modal.classList.remove(
                    "show"
                );
            }
        );
    }

    const downloadButton =
        document.getElementById(
            "modalDownloadPayslip"
        );

    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            async () => {

                const id =
                    downloadButton.dataset
                        .payslipId;

                if (id) {
                    await downloadPayslip(
                        id
                    );
                }

            }
        );
    }

    modal.addEventListener(
        "click",
        (event) => {

            if (event.target === modal) {

                modal.classList.remove(
                    "show"
                );
            }

        }
    );
}


// ============================================================
// DOWNLOAD PAYSLIP
// ============================================================

async function downloadPayslip(
    payslipId
) {

    try {

        if (
            typeof downloadWorkerPayslip !==
            "function"
        ) {
            throw new Error(
                "Payslip download API is unavailable."
            );
        }

        showPayslipMessage(
            "Preparing payslip download...",
            "info"
        );

        await downloadWorkerPayslip(
            payslipId
        );

        showPayslipMessage(
            "Payslip downloaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Payslip download failed:",
            error
        );

        showPayslipMessage(
            error.message ||
            "Could not download payslip.",
            "error"
        );
    }
}


// ============================================================
// PAY PERIOD
// ============================================================

function formatPayPeriod(payslip) {

    const month =
        payslip.month;

    const year =
        payslip.year;

    if (month && year) {
        return `${month} ${year}`;
    }

    const start =
        payslip.period_start ||
        payslip.periodStart;

    const end =
        payslip.period_end ||
        payslip.periodEnd;

    if (start && end) {
        return `${formatPayslipDate(start)} - ${formatPayslipDate(end)}`;
    }

    return "Pay Period";
}


// ============================================================
// DATE
// ============================================================

function formatPayslipDate(
    dateValue
) {

    if (!dateValue) {
        return "-";
    }

    if (
        typeof formatDate ===
        "function"
    ) {
        return formatDate(
            dateValue
        );
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(dateValue);
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
// CURRENCY
// ============================================================

function formatCurrencySafe(
    amount
) {

    if (
        typeof formatCurrency ===
        "function"
    ) {
        return formatCurrency(
            amount
        );
    }

    const number =
        Number(amount);

    if (
        Number.isNaN(number)
    ) {
        return String(amount);
    }

    return new Intl.NumberFormat(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR"
        }
    ).format(number);
}


// ============================================================
// MESSAGE
// ============================================================

function showPayslipMessage(
    message,
    type = "info"
) {

    if (
        typeof showToast ===
        "function"
    ) {
        showToast(message);
        return;
    }

    console.log(
        `[${type}] ${message}`
    );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
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

window.loadPayslips =
    loadPayslips;

window.viewPayslip =
    viewPayslip;

window.downloadPayslip =
    downloadPayslip;