// ============================================================
// ModernTech Worker Payslip
// ============================================================
//
// Connects the Worker Payslip page to the backend API.
//
// Database source:
//   employee_payslips
//
// Expected fields:
//   payroll_id
//   employee_id
//   employee_code
//   name
//   pay_period
//   hours_worked
//   leave_deductions
//   final_salary
//   created_at
//
// Expected API wrapper:
//   getWorkerPayslips()
//
// ============================================================

console.log("Worker Payslip JS connected.");


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (
            typeof requireWorkerLogin ===
            "function"
        ) {

            if (!requireWorkerLogin()) {
                return;
            }

        }


        await initializePayslip();

    }
);


// ============================================================
// INITIALIZE PAYSLIP
// ============================================================

async function initializePayslip() {

    try {

        console.log(
            "Loading worker payslips..."
        );


        if (
            typeof getWorkerPayslips !==
            "function"
        ) {

            throw new Error(
                "getWorkerPayslips() is not available. Check your API wrapper."
            );

        }


        const response =
            await getWorkerPayslips();


        console.log(
            "Payslip API response:",
            response
        );


        const data =
            getPayslipResponseData(
                response
            );


        const payslips =
            normalizePayslips(data);


        console.log(
            "Payslips:",
            payslips
        );


        renderPayslips(
            payslips
        );


        updatePayslipSummary(
            payslips
        );


    } catch (error) {

        console.error(
            "Could not load worker payslips:",
            error
        );


        showPayslipMessage(
            error.message ||
            "Could not load your payslips."
        );

    }

}


// ============================================================
// GET RESPONSE DATA
// ============================================================

function getPayslipResponseData(
    response
) {

    if (
        response === null ||
        response === undefined
    ) {

        return null;

    }


    // Axios-style response.

    if (
        response.data !== undefined
    ) {

        return response.data;

    }


    // Standard backend response.

    if (
        response.result !== undefined
    ) {

        return response.result;

    }


    return response;

}


// ============================================================
// NORMALIZE PAYSLIPS
// ============================================================

function normalizePayslips(
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
        Array.isArray(data.payslips)
    ) {

        return data.payslips;

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
// RENDER PAYSLIPS
// ============================================================

function renderPayslips(
    payslips
) {

    const container =
        findPayslipContainer();


    if (!container) {

        console.warn(
            "Payslip container not found."
        );

        return;

    }


    container.innerHTML = "";


    if (!payslips.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>No payslips are available yet.</p>
            </div>
        `;

        return;

    }


    // Newest payslip first.

    const sortedPayslips =
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


    sortedPayslips.forEach(
        payslip => {

            const element =
                createPayslipElement(
                    payslip
                );


            container.appendChild(
                element
            );

        }
    );

}


// ============================================================
// FIND PAYSLIP CONTAINER
// ============================================================

function findPayslipContainer() {

    const possibleIds = [

        "payslipContainer",

        "payslipsContainer",

        "payrollContainer",

        "payslipList",

        "payslipsList",

        "payrollList",

        "employeePayslips",

        "payslipTableBody"

    ];


    for (
        const id of possibleIds
    ) {

        const element =
            document.getElementById(id);


        if (element) {
            return element;
        }

    }


    // If a table exists, use tbody.

    const tbody =
        document.querySelector(
            "table tbody"
        );


    if (tbody) {
        return tbody;
    }


    return null;

}


// ============================================================
// CREATE PAYSLIP ELEMENT
// ============================================================

function createPayslipElement(
    payslip
) {

    const period =
        payslip.pay_period ||
        payslip.payPeriod ||
        "Unknown";


    const salary =
        Number(
            payslip.final_salary ??
            payslip.finalSalary ??
            0
        );


    const hours =
        Number(
            payslip.hours_worked ??
            payslip.hoursWorked ??
            0
        );


    const deductions =
        Number(
            payslip.leave_deductions ??
            payslip.leaveDeductions ??
            0
        );


    const payrollId =
        payslip.payroll_id ||
        payslip.payrollId ||
        "";


    // --------------------------------------------------------
    // TABLE ROW
    // --------------------------------------------------------

    if (
        findPayslipContainer() &&
        findPayslipContainer().tagName ===
        "TBODY"
    ) {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `
            <td>${escapePayslipHTML(period)}</td>

            <td>
                ${formatPayslipCurrency(salary)}
            </td>

            <td>
                ${formatPayslipNumber(hours)}
            </td>

            <td>
                ${formatPayslipCurrency(deductions)}
            </td>

            <td>
                <button
                    type="button"
                    class="view-payslip-btn"
                    data-payroll-id="${escapePayslipHTML(payrollId)}"
                >
                    View
                </button>
            </td>
        `;


        return row;

    }


    // --------------------------------------------------------
    // CARD
    // --------------------------------------------------------

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "payslip-card";


    card.innerHTML = `
        <div class="payslip-card-header">

            <div>
                <h3>
                    Payslip
                </h3>

                <span>
                    ${escapePayslipHTML(period)}
                </span>
            </div>

            <strong>
                ${formatPayslipCurrency(salary)}
            </strong>

        </div>

        <div class="payslip-card-body">

            <div class="payslip-detail">

                <span>
                    Hours Worked
                </span>

                <strong>
                    ${formatPayslipNumber(hours)}
                </strong>

            </div>

            <div class="payslip-detail">

                <span>
                    Leave Deductions
                </span>

                <strong>
                    ${formatPayslipCurrency(deductions)}
                </strong>

            </div>

        </div>

        <div class="payslip-card-footer">

            <button
                type="button"
                class="view-payslip-btn"
                data-payroll-id="${escapePayslipHTML(payrollId)}"
            >
                View Payslip
            </button>

        </div>
    `;


    return card;

}


// ============================================================
// SUMMARY
// ============================================================

function updatePayslipSummary(
    payslips
) {

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


    const salary =
        Number(
            latest.final_salary ||
            0
        );


    setPayslipText(
        [
            "latestSalary",
            "currentSalary",
            "finalSalary",
            "payslipSalary"
        ],
        formatPayslipCurrency(
            salary
        )
    );


    setPayslipText(
        [
            "latestPayPeriod",
            "currentPayPeriod",
            "payPeriod",
            "payslipPeriod"
        ],
        latest.pay_period
    );


    setPayslipText(
        [
            "totalPayslips",
            "payslipCount"
        ],
        String(
            payslips.length
        )
    );


    setPayslipText(
        [
            "hoursWorked",
            "latestHoursWorked"
        ],
        formatPayslipNumber(
            latest.hours_worked
        )
    );


    setPayslipText(
        [
            "leaveDeductions",
            "latestLeaveDeductions"
        ],
        formatPayslipCurrency(
            latest.leave_deductions
        )
    );

}


// ============================================================
// TEXT HELPER
// ============================================================

function setPayslipText(
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
// CURRENCY
// ============================================================

function formatPayslipCurrency(
    value
) {

    const amount =
        Number(value);


    if (!Number.isFinite(amount)) {

        return "R0.00";

    }


    return amount.toLocaleString(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR"
        }
    );

}


// ============================================================
// NUMBER
// ============================================================

function formatPayslipNumber(
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


// ============================================================
// HTML ESCAPE
// ============================================================

function escapePayslipHTML(
    value
) {

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
// BUTTON EVENTS
// ============================================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".view-payslip-btn"
            );


        if (!button) {
            return;
        }


        const payrollId =
            button.dataset.payrollId;


        console.log(
            "Selected payroll:",
            payrollId
        );


        // If your HTML has a payslip modal,
        // this can be connected to it later.

        if (
            typeof openPayslipModal ===
            "function"
        ) {

            openPayslipModal(
                payrollId
            );

        }

    }
);


// ============================================================
// ERROR MESSAGE
// ============================================================

function showPayslipMessage(
    message
) {

    if (
        typeof showToast ===
        "function"
    ) {

        showToast(message);

        return;

    }


    const container =
        findPayslipContainer();


    if (container) {

        container.innerHTML = `
            <div class="error-state">
                <p>
                    ${escapePayslipHTML(message)}
                </p>
            </div>
        `;

    }

    console.error(message);

}


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.initializePayslip =
    initializePayslip;

window.renderPayslips =
    renderPayslips;