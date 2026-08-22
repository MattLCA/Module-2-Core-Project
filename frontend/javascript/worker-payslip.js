// ============================================================
// ModernTech Worker Payslip
// ============================================================
//
// This page loads payroll information from the backend.
//
// The database is the source of truth.
// The frontend only displays the information.
//
// ============================================================

console.log("Worker Payslip JS connected.");


// ============================================================
// VARIABLES
// ============================================================

// All payslips returned for the logged-in worker.
let workerPayslips = [];

// The payslip currently selected on the page.
let selectedPayslip = null;


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Initializing Worker Payslip..."
        );


        // --------------------------------------------------------
        // Check that the worker is logged in.
        // --------------------------------------------------------

        if (
            typeof requireWorkerLogin !== "function"
        ) {

            console.error(
                "requireWorkerLogin() is not available."
            );

            return;

        }


        if (
            !requireWorkerLogin()
        ) {

            return;

        }


        // --------------------------------------------------------
        // Set up buttons and dropdown.
        // --------------------------------------------------------

        initializePayslipControls();


        // --------------------------------------------------------
        // Load payslips from the database.
        // --------------------------------------------------------

        await loadPayslips();

    }
);


// ============================================================
// INITIALIZE CONTROLS
// ============================================================

function initializePayslipControls() {

    const monthSelect =
        document.getElementById(
            "payslipMonth"
        );


    const downloadButton =
        document.getElementById(
            "downloadPayslipBtn"
        );


    // --------------------------------------------------------
    // Pay period dropdown
    // --------------------------------------------------------

    if (monthSelect) {

        monthSelect.addEventListener(
            "change",
            () => {

                const payrollId =
                    Number(
                        monthSelect.value
                    );


                const payslip =
                    workerPayslips.find(
                        (item) =>
                            Number(
                                item.payrollId ??
                                item.payroll_id
                            ) === payrollId
                    );


                if (payslip) {

                    selectedPayslip =
                        payslip;


                    renderPayslip(
                        payslip
                    );

                }

            }
        );

    }


    // --------------------------------------------------------
    // Download button
    // --------------------------------------------------------

    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            downloadSelectedPayslip
        );

    }

}


// ============================================================
// LOAD PAYSLIPS
// ============================================================

async function loadPayslips() {

    try {

        console.log(
            "Loading worker payslips from the database..."
        );


        if (
            typeof getWorkerPayslips !== "function"
        ) {

            throw new Error(
                "getWorkerPayslips() is not available. Check worker_api.js."
            );

        }


        // ----------------------------------------------------
        // API request.
        //
        // The backend determines the employee from the JWT.
        // ----------------------------------------------------

        const response =
            await getWorkerPayslips();


        console.log(
            "================================================"
        );

        console.log(
            "PAYSLIP API RESPONSE:"
        );

        console.log(
            response
        );

        console.log(
            "================================================"
        );


        // ----------------------------------------------------
        // Extract the actual array.
        // ----------------------------------------------------

        workerPayslips =
            extractPayslipArray(
                response
            );


        console.log(
            "PAYSLIPS RETURNED FROM DATABASE:",
            workerPayslips
        );


        // ----------------------------------------------------
        // No payroll records.
        // ----------------------------------------------------

        if (
            workerPayslips.length === 0
        ) {

            showEmptyPayslip();

            return;

        }


        // ----------------------------------------------------
        // Sort newest pay period first.
        // ----------------------------------------------------

        workerPayslips.sort(
            (a, b) => {

                const periodA =
                    a.payPeriod ??
                    a.pay_period ??
                    "";


                const periodB =
                    b.payPeriod ??
                    b.pay_period ??
                    "";


                return String(
                    periodB
                ).localeCompare(
                    String(
                        periodA
                    )
                );

            }
        );


        // ----------------------------------------------------
        // Populate the pay period dropdown.
        // ----------------------------------------------------

        populatePayPeriodDropdown();


        // ----------------------------------------------------
        // Show the newest payslip.
        // ----------------------------------------------------

        selectedPayslip =
            workerPayslips[0];


        renderPayslip(
            selectedPayslip
        );


    } catch (error) {

        console.error(
            "Could not load worker payslips:",
            error
        );


        showPayslipError(
            error.message ||
            "Could not load your payslips."
        );

    }

}


// ============================================================
// EXTRACT PAYSLIP ARRAY
// ============================================================

function extractPayslipArray(
    response
) {

    if (
        Array.isArray(
            response
        )
    ) {

        return response;

    }


    if (
        Array.isArray(
            response?.data
        )
    ) {

        return response.data;

    }


    if (
        Array.isArray(
            response?.data?.payslips
        )
    ) {

        return response.data.payslips;

    }


    if (
        Array.isArray(
            response?.payslips
        )
    ) {

        return response.payslips;

    }


    return [];

}


// ============================================================
// POPULATE PAY PERIOD DROPDOWN
// ============================================================

function populatePayPeriodDropdown() {

    const select =
        document.getElementById(
            "payslipMonth"
        );


    if (!select) {

        return;

    }


    // Remove the old hardcoded options.

    select.innerHTML = "";


    workerPayslips.forEach(
        (payslip) => {

            const payrollId =
                payslip.payrollId ??
                payslip.payroll_id;


            const payPeriod =
                payslip.payPeriod ??
                payslip.pay_period;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                payrollId;


            option.textContent =
                formatPayPeriod(
                    payPeriod
                );


            select.appendChild(
                option
            );

        }
    );


    // Select the newest payslip.

    if (
        workerPayslips.length > 0
    ) {

        select.value =
            workerPayslips[0].payrollId ??
            workerPayslips[0].payroll_id;

    }

}


// ============================================================
// RENDER PAYSLIP
// ============================================================

function renderPayslip(
    payslip
) {

    if (!payslip) {

        return;

    }


    console.log(
        "Rendering selected payslip:",
        payslip
    );


    // --------------------------------------------------------
    // EMPLOYEE INFORMATION
    // --------------------------------------------------------

    const employeeName =
        payslip.employeeName ??
        payslip.employee_name ??
        "--";


    const employeeCode =
        payslip.employeeCode ??
        payslip.employee_code ??
        "--";


    const department =
        payslip.departmentName ??
        payslip.department_name ??
        "--";


    const position =
        payslip.positionName ??
        payslip.position_name ??
        "--";


    // --------------------------------------------------------
    // PAYROLL INFORMATION
    // --------------------------------------------------------

    const baseSalary =
        toNumber(
            payslip.baseSalary ??
            payslip.base_salary
        );


    const overtime =
        toNumber(
            payslip.overtimePay ??
            payslip.overtime_pay
        );


    const transport =
        toNumber(
            payslip.transportAllowance ??
            payslip.transport_allowance
        );


    const bonus =
        toNumber(
            payslip.bonus
        );


    const paye =
        toNumber(
            payslip.payeTax ??
            payslip.paye_tax
        );


    const uif =
        toNumber(
            payslip.uif
        );


    const pension =
        toNumber(
            payslip.pension
        );


    const medical =
        toNumber(
            payslip.medicalAid ??
            payslip.medical_aid
        );


    const leaveDeductions =
        toNumber(
            payslip.leaveDeductions ??
            payslip.leave_deductions
        );


    const hoursWorked =
        toNumber(
            payslip.hoursWorked ??
            payslip.hours_worked
        );


    // --------------------------------------------------------
    // CALCULATED TOTALS
    // --------------------------------------------------------
    //
    // Earnings:
    //
    //   base salary
    //   + overtime
    //   + transport allowance
    //   + bonus
    //
    // Deductions:
    //
    //   PAYE
    //   + UIF
    //   + pension
    //   + medical aid
    //   + leave deductions
    //
    // These calculations are also performed by the backend.
    // The frontend calculates them again only for display
    // consistency.
    // --------------------------------------------------------

    const totalEarnings =
        baseSalary +
        overtime +
        transport +
        bonus;


    const totalDeductions =
        paye +
        uif +
        pension +
        medical +
        leaveDeductions;


    const calculatedNetSalary =
        totalEarnings -
        totalDeductions;


    // --------------------------------------------------------
    // Use backend final salary when available.
    //
    // This keeps the database/backend as the source of truth.
    // --------------------------------------------------------

    const backendFinalSalary =
        payslip.finalSalary ??
        payslip.final_salary;


    const netSalary =
        backendFinalSalary !==
        undefined &&
        backendFinalSalary !==
        null
            ? toNumber(
                backendFinalSalary
            )
            : calculatedNetSalary;


    // --------------------------------------------------------
    // SUMMARY CARDS
    // --------------------------------------------------------

    setText(
        "basicSalary",
        formatCurrency(
            baseSalary
        )
    );


    setText(
        "totalEarnings",
        formatCurrency(
            totalEarnings
        )
    );


    setText(
        "totalDeductions",
        formatCurrency(
            totalDeductions
        )
    );


    setText(
        "netSalary",
        formatCurrency(
            netSalary
        )
    );


    // --------------------------------------------------------
    // PAY PERIOD
    // --------------------------------------------------------

    const payPeriod =
        payslip.payPeriod ??
        payslip.pay_period;


    setText(
        "payPeriodLabel",
        `Pay Period: ${formatPayPeriod(
            payPeriod
        )}`
    );


    // --------------------------------------------------------
    // EMPLOYEE DETAILS
    // --------------------------------------------------------

    setText(
        "payEmployeeName",
        employeeName
    );


    setText(
        "payEmployeeId",
        employeeCode
    );


    setText(
        "payDepartment",
        department
    );


    setText(
        "payPosition",
        position
    );


    // --------------------------------------------------------
    // RENDER FULL PAYSLIP TABLE
    // --------------------------------------------------------

    renderPayslipRows({

        baseSalary,

        overtime,

        transport,

        bonus,

        paye,

        uif,

        pension,

        medical,

        leaveDeductions,

        netSalary

    });

}


// ============================================================
// RENDER PAYSLIP TABLE
// ============================================================

function renderPayslipRows({

    baseSalary,
    overtime,
    transport,
    bonus,
    paye,
    uif,
    pension,
    medical,
    leaveDeductions,
    netSalary

}) {

    const table =
        document.getElementById(
            "payslipRows"
        );


    if (!table) {

        console.error(
            "#payslipRows was not found."
        );

        return;

    }


    const rows = [

        // ----------------------------------------------------
        // EARNINGS
        // ----------------------------------------------------

        {
            description:
                "Basic Salary",

            type:
                "Earning",

            amount:
                baseSalary

        },

        {
            description:
                "Overtime",

            type:
                "Earning",

            amount:
                overtime

        },

        {
            description:
                "Transport Allowance",

            type:
                "Earning",

            amount:
                transport

        },

        {
            description:
                "Bonus",

            type:
                "Earning",

            amount:
                bonus

        },


        // ----------------------------------------------------
        // DEDUCTIONS
        // ----------------------------------------------------

        {
            description:
                "PAYE Tax",

            type:
                "Deduction",

            amount:
                paye

        },

        {
            description:
                "UIF",

            type:
                "Deduction",

            amount:
                uif

        },

        {
            description:
                "Pension",

            type:
                "Deduction",

            amount:
                pension

        },

        {
            description:
                "Medical Aid",

            type:
                "Deduction",

            amount:
                medical

        },

        {
            description:
                "Leave Deduction",

            type:
                "Deduction",

            amount:
                leaveDeductions

        },


        // ----------------------------------------------------
        // FINAL PAY
        // ----------------------------------------------------

        {
            description:
                "Net Salary",

            type:
                "Final Pay",

            amount:
                netSalary

        }

    ];


    table.innerHTML =
        rows
            .map(
                (row) => {

                    let statusClass =
                        "status approved";


                    if (
                        row.type ===
                        "Deduction"
                    ) {

                        statusClass =
                            "status declined";

                    }


                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        row.description
                                    )}
                                </strong>
                            </td>

                            <td>
                                <span class="${statusClass}">
                                    ${escapeHTML(
                                        row.type
                                    )}
                                </span>
                            </td>

                            <td>
                                ${formatCurrency(
                                    row.amount
                                )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


// ============================================================
// DOWNLOAD PAYSLIP
// ============================================================

async function downloadSelectedPayslip() {

    if (!selectedPayslip) {

        showPayslipError(
            "Please select a payslip first."
        );

        return;

    }


    const payrollId =
        selectedPayslip.payrollId ??
        selectedPayslip.payroll_id;


    if (!payrollId) {

        showPayslipError(
            "The selected payslip does not have a valid payroll ID."
        );

        return;

    }


    try {

        console.log(
            "Downloading payroll ID:",
            payrollId
        );


        if (
            typeof downloadWorkerPayslip !==
            "function"
        ) {

            throw new Error(
                "downloadWorkerPayslip() is not available. Check worker_api.js."
            );

        }


        await downloadWorkerPayslip(
            payrollId
        );


        showToast(
            "Payslip downloaded successfully."
        );


    } catch (error) {

        console.error(
            "Payslip download error:",
            error
        );


        showPayslipError(
            error.message ||
            "Could not download the payslip."
        );

    }

}


// ============================================================
// FORMAT PAY PERIOD
// ============================================================
//
// Converts:
//
//     2026-06
//
// into:
//
//     June 2026
//
// ============================================================

function formatPayPeriod(
    payPeriod
) {

    if (!payPeriod) {

        return "--";

    }


    const text =
        String(
            payPeriod
        );


    const parts =
        text.split(
            "-"
        );


    if (
        parts.length !== 2
    ) {

        return text;

    }


    const year =
        Number(
            parts[0]
        );


    const month =
        Number(
            parts[1]
        );


    if (
        !year ||
        !month ||
        month < 1 ||
        month > 12
    ) {

        return text;

    }


    const date =
        new Date(
            year,
            month - 1,
            1
        );


    return date.toLocaleDateString(
        "en-ZA",
        {
            month:
                "long",

            year:
                "numeric"
        }
    );

}


// ============================================================
// CURRENCY
// ============================================================

function formatCurrency(
    value
) {

    const amount =
        toNumber(
            value
        );


    return amount.toLocaleString(
        "en-ZA",
        {
            style:
                "currency",

            currency:
                "ZAR",

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    );

}


// ============================================================
// NUMBER
// ============================================================

function toNumber(
    value
) {

    const number =
        Number(
            value
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return 0;

    }


    return number;

}


// ============================================================
// SET TEXT
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ??
            "--";

    } else {

        console.warn(
            `Payslip element #${id} was not found.`
        );

    }

}


// ============================================================
// EMPTY PAYSLIP
// ============================================================

function showEmptyPayslip() {

    setText(
        "basicSalary",
        "R0.00"
    );


    setText(
        "totalEarnings",
        "R0.00"
    );


    setText(
        "totalDeductions",
        "R0.00"
    );


    setText(
        "netSalary",
        "R0.00"
    );


    setText(
        "payPeriodLabel",
        "No payslips available"
    );


    setText(
        "payEmployeeName",
        "--"
    );


    setText(
        "payEmployeeId",
        "--"
    );


    setText(
        "payDepartment",
        "--"
    );


    setText(
        "payPosition",
        "--"
    );


    const table =
        document.getElementById(
            "payslipRows"
        );


    if (table) {

        table.innerHTML = `
            <tr>
                <td colspan="3">
                    No payslips are available for your account.
                </td>
            </tr>
        `;

    }

}


// ============================================================
// ERROR
// ============================================================

function showPayslipError(
    message
) {

    console.error(
        message
    );


    if (
        typeof showToast ===
        "function"
    ) {

        showToast(
            message
        );

    }


    const table =
        document.getElementById(
            "payslipRows"
        );


    if (table) {

        table.innerHTML = `
            <tr>
                <td colspan="3">
                    Could not load your payslip information.
                </td>
            </tr>
        `;

    }

}


// ============================================================
// GLOBAL
// ============================================================

window.initializePayslip =
    loadPayslips;