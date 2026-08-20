// ============================================================
// ModernTech Worker Payslips
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    const select =
        document.getElementById("payslipMonth");

    if (!select) return;

    select.addEventListener(
        "change",
        () => loadPayslip(select.value)
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


    await loadPayslip(select.value);

});


// ============================================================
// LOAD PAYSLIP
// ============================================================

async function loadPayslip(month) {

    try {

        const response =
            await getWorkerPayslip(month);

        console.log(
            "Payslip response:",
            response
        );


        const payslip =
            response.payslip ||
            response.data ||
            response;


        renderPayslip(payslip);

    } catch (error) {

        console.error(
            "Failed to load payslip:",
            error
        );

        showToast(
            "Unable to load payslip."
        );

    }

}


// ============================================================
// RENDER PAYSLIP
// ============================================================

function renderPayslip(data) {

    const basic =
        Number(data.basic || data.base_salary || 0);

    const overtime =
        Number(data.overtime || 0);

    const allowance =
        Number(data.allowance || 0);

    const bonus =
        Number(data.bonus || 0);

    const tax =
        Number(data.tax || 0);

    const uif =
        Number(data.uif || 0);

    const pension =
        Number(data.pension || 0);

    const medical =
        Number(data.medical || 0);


    const earnings =
        basic +
        overtime +
        allowance +
        bonus;


    const deductions =
        tax +
        uif +
        pension +
        medical;


    const net =
        earnings - deductions;


    setText(
        "basicSalary",
        money(basic)
    );

    setText(
        "totalEarnings",
        money(earnings)
    );

    setText(
        "totalDeductions",
        money(deductions)
    );

    setText(
        "netSalary",
        money(net)
    );


    const rows = [

        ["Basic Salary", "Earning", basic],

        ["Overtime", "Earning", overtime],

        ["Transport Allowance", "Earning", allowance],

        ["Bonus", "Earning", bonus],

        ["PAYE Tax", "Deduction", tax],

        ["UIF", "Deduction", uif],

        ["Pension", "Deduction", pension],

        ["Medical Aid", "Deduction", medical],

        ["Net Salary", "Final Pay", net]

    ];


    const table =
        document.getElementById("payslipRows");


    if (!table) return;


    table.innerHTML =
        rows.map(row => {

            const statusClass =
                row[0] === "Net Salary"
                    ? "approved"
                    : row[1] === "Deduction"
                        ? "declined"
                        : "approved";


            return `
                <tr>

                    <td>
                        <strong>
                            ${row[0]}
                        </strong>
                    </td>

                    <td>
                        <span class="status ${statusClass}">
                            ${row[1]}
                        </span>
                    </td>

                    <td>
                        ${money(row[2])}
                    </td>

                </tr>
            `;

        }).join("");

}


// ============================================================
// DOWNLOAD PAYSLIP
// ============================================================

async function downloadPayslip() {

    const select =
        document.getElementById("payslipMonth");

    if (!select) return;


    const month =
        select.value;


    try {

        const response =
            await getWorkerPayslip(month);


        const data =
            response.payslip ||
            response.data ||
            response;


        const content =
            JSON.stringify(
                data,
                null,
                2
            );


        const blob =
            new Blob(
                [content],
                {
                    type: "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            `ModernTech-Payslip-${month}.json`;


        link.click();


        URL.revokeObjectURL(url);


        showToast(
            "Payslip downloaded."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to download payslip."
        );

    }

}


// ============================================================
// HELPERS
// ============================================================

function money(value) {

    return "R" +
        Number(value || 0)
            .toLocaleString("en-ZA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}