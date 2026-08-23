import PDFDocument from "pdfkit";

import {
  getPayslipsByEmployeeId,
  getPayslipById,
} from "../../models/worker/payslipModel.js";

// ============================================================
// GET ALL PAYSLIPS
// ============================================================
//
// GET /api/worker/payslips
//
// ============================================================

export const getPayslips = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const payslips = await getPayslipsByEmployeeId(employeeId);

    res.status(200).json({
      data: payslips,
    });
  } catch (error) {
    console.error("getPayslips error:", error);

    res.status(500).json({
      error: "Failed to retrieve payslips.",
    });
  }
};

// ============================================================
// GET ONE PAYSLIP
// ============================================================
//
// GET /api/worker/payslips/:id
//
// ============================================================

export const getPayslip = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const payrollId = Number(req.params.id);

    if (!Number.isInteger(payrollId)) {
      return res.status(400).json({
        message: "Invalid payslip ID.",
      });
    }

    const payslip = await getPayslipById(payrollId, employeeId);

    if (!payslip) {
      return res.status(404).json({
        message: "Payslip not found.",
      });
    }

    res.status(200).json({
      data: payslip,
    });
  } catch (error) {
    console.error("getPayslip error:", error);

    res.status(500).json({
      error: "Failed to retrieve payslip.",
    });
  }
};

// ============================================================
// DOWNLOAD PAYSLIP AS PDF
// ============================================================
//
// GET /api/worker/payslips/:id/download
//
// ============================================================

export const downloadPayslip = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const payrollId = Number(req.params.id);

    if (!Number.isInteger(payrollId)) {
      return res.status(400).json({
        message: "Invalid payslip ID.",
      });
    }

    // --------------------------------------------------------
    // GET PAYSLIP
    // --------------------------------------------------------

    const payslip = await getPayslipById(payrollId, employeeId);

    if (!payslip) {
      return res.status(404).json({
        message: "Payslip not found.",
      });
    }

    // --------------------------------------------------------
    // FORMAT PAY PERIOD
    // --------------------------------------------------------

    const payPeriod = payslip.payPeriod || "Unknown";

    // --------------------------------------------------------
    // RESPONSE HEADERS
    // --------------------------------------------------------

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Payslip-${payslip.employeeCode}-${payPeriod}.pdf"`,
    );

    // --------------------------------------------------------
    // CREATE PDF
    // --------------------------------------------------------

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Pipe PDF directly to browser/download
    doc.pipe(res);

    // ========================================================
    // HEADER
    // ========================================================

    doc.fontSize(24).font("Helvetica-Bold").text("ModernTech Solutions", {
      align: "center",
    });

    doc
      .moveDown(0.5)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("EMPLOYEE PAYSLIP", {
        align: "center",
      });

    doc.moveDown(1);

    // ========================================================
    // EMPLOYEE INFORMATION
    // ========================================================

    doc.fontSize(11).font("Helvetica-Bold").text("Employee Information");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .text(`Employee Code: ${payslip.employeeCode}`)
      .text(`Employee Name: ${payslip.employeeName}`)
      .text(`Email: ${payslip.employeeEmail}`)
      .text(`Department: ${payslip.departmentName}`)
      .text(`Position: ${payslip.positionName}`)
      .text(`Pay Period: ${payslip.payPeriod}`);

    doc.moveDown(1);

    // ========================================================
    // PAYROLL INFORMATION
    // ========================================================

    doc.fontSize(11).font("Helvetica-Bold").text("Payroll Information");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .text(`Base Salary: R ${formatMoney(payslip.baseSalary)}`)
      .text(`Hours Worked: ${formatNumber(payslip.hoursWorked)}`)
      .text(`Leave Deductions: R ${formatMoney(payslip.leaveDeductions)}`);

    doc.moveDown(1);

    // ========================================================
    // FINAL SALARY
    // ========================================================

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

    doc.moveDown(0.7);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`FINAL SALARY: R ${formatMoney(payslip.finalSalary)}`, {
        align: "right",
      });

    doc.moveDown(2);

    // ========================================================
    // FOOTER
    // ========================================================

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        "This payslip was generated electronically by the ModernTech HR system.",
        {
          align: "center",
        },
      );

    doc.moveDown(0.5).text(`Generated: ${new Date().toLocaleString("en-ZA")}`, {
      align: "center",
    });

    // ========================================================
    // FINISH PDF
    // ========================================================

    doc.end();
  } catch (error) {
    console.error("downloadPayslip error:", error);

    // If headers have not already been sent, return JSON.
    if (!res.headersSent) {
      return res.status(500).json({
        error: "Failed to download payslip.",
      });
    }

    res.end();
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const formatMoney = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return number.toFixed(2);
};
