import { validationResult } from 'express-validator';
import * as payrollModel from '../models/payrollModel.js';
import { ApiError } from '../middleware/errorHandler.js';

function handleValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new ApiError(422, 'Validation failed');
    err.details = errors.array();
    throw err;
  }
}

// GET /api/payroll?payPeriod=2026-08&employeeId=5  (HR only, or worker viewing own)
async function list(req, res, next) {
  try {
    const { payPeriod } = req.query;
    let { employeeId } = req.query;

    // Workers may only list their own payroll records.
    if (req.user.role === 'worker') {
      employeeId = req.user.employeeId;
    }

    const records = await payrollModel.findAll({ payPeriod, employeeId });
    res.status(200).json({ data: records });
  } catch (err) {
    next(err);
  }
}

// GET /api/payroll/:id  (HR, or worker who owns the record)
async function getOne(req, res, next) {
  try {
    const record = await payrollModel.findById(req.params.id);
    if (!record) throw new ApiError(404, 'Payroll record not found');

    if (req.user.role === 'worker' && String(req.user.employeeId) !== String(record.employee_id)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    res.status(200).json({ data: record });
  } catch (err) {
    next(err);
  }
}

// POST /api/payroll  (HR only) — create a single record, e.g. a manual/off-cycle entry.
async function create(req, res, next) {
  try {
    handleValidation(req);
    const { employeeId, payPeriod } = req.body;

    const existing = await payrollModel.findByEmployeeAndPeriod(employeeId, payPeriod);
    if (existing) throw new ApiError(409, 'A payroll record already exists for this employee and period');

    const record = await payrollModel.create(req.body);
    if (!record) throw new ApiError(404, 'Employee not found');
    res.status(201).json({ data: record });
  } catch (err) {
    next(err);
  }
}

// POST /api/payroll/generate  (HR only) — bulk-generate records for every active
// employee for a pay period, using standard hours as a starting point.
async function generate(req, res, next) {
  try {
    handleValidation(req);
    const { payPeriod } = req.body;
    const created = await payrollModel.generateForPeriod(payPeriod);
    res.status(201).json({ data: created, count: created.length });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/payroll/:id  (HR only) — correct hours_worked/leave_deductions;
// final_salary is recalculated automatically.
async function update(req, res, next) {
  try {
    handleValidation(req);
    const existing = await payrollModel.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Payroll record not found');

    const updated = await payrollModel.update(req.params.id, req.body);
    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/payroll/:id  (HR only) — e.g. to undo a mistaken entry.
async function remove(req, res, next) {
  try {
    const deleted = await payrollModel.remove(req.params.id);
    if (!deleted) throw new ApiError(404, 'Payroll record not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export { list, getOne, create, generate, update, remove };