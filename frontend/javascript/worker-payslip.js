// ============================================================
// ModernTech Worker Payslip
// ============================================================

console.log("Worker Payslip JS connected.");

document.addEventListener("DOMContentLoaded", () => {

    initializePayslip();

});


function initializePayslip() {

    const select =
        document.getElementById(
            "payslipMonth"
        );

    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        () => {

            loadPayslip(
                select.value
            );

        }
    );


    const downloadButton =
        document.getElementById(
            "downloadPayslipBtn"
        );


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            downloadPayslip
        );

    }


    /*
     * Don't use the old hard-coded payslipData.
     *
     * Database/API integration will load the actual payslip.
     */

    showPendingPayslipState();

}


// ============================================================
// LOAD PAYSLIP
// ============================================================

async function loadPayslip(month) {

    console.log(
        "Payslip requested:",
        month
    );


    /*
     * Future API call:
     *
     * const data =
     *     await getWorkerPayslip(month);
     *
     * renderPayslip(data);
     */


    showToast(
        "Payslip API integration is pending."
    );
}


// ============================================================
// PENDING STATE
// ============================================================

function showPendingPayslipState() {

    const fields = [

        "basicSalary",
        "totalEarnings",
        "totalDeductions",
        "netSalary"

    ];


    fields.forEach((id) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                "Loading from database...";
        }

    });
}


// ============================================================
// RENDER PAYSLIP
// ============================================================

function renderPayslip(data) {

    if (!data) {
        return;
    }


    const basicSalary =
        document.getElementById(
            "basicSalary"
        );

    const totalEarnings =
        document.getElementById(
            "totalEarnings"
        );

    const totalDeductions =
        document.getElementById(
            "totalDeductions"
        );

    const netSalary =
        document.getElementById(
            "netSalary"
        );


    if (basicSalary) {
        basicSalary.textContent =
            formatCurrency(
                data.basic_salary ??
                data.basicSalary
            );
    }


    if (totalEarnings) {
        totalEarnings.textContent =
            formatCurrency(
                data.total_earnings ??
                data.totalEarnings
            );
    }


    if (totalDeductions) {
        totalDeductions.textContent =
            formatCurrency(
                data.total_deductions ??
                data.totalDeductions
            );
    }


    if (netSalary) {
        netSalary.textContent =
            formatCurrency(
                data.net_salary ??
                data.netSalary
            );
    }
}


// ============================================================
// DOWNLOAD
// ============================================================

function downloadPayslip() {

    showToast(
        "Payslip download will be connected to the database."
    );
}