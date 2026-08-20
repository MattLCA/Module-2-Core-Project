import { validationResult } from 'express-validator';
import * as performanceModel from '../models/performanceModel.js';
import { ApiError } from '../middleware/errorHandler.js';

function handleValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new ApiError(422, 'Validation failed');
    err.details = errors.array();
    throw err;
  }
}

// GET /api/performance  (HR only) — every active employee + their review, if any.
async function list(req, res, next) {
  try {
    const rows = await performanceModel.findAll();
    res.status(200).json({ data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/performance/summary  (HR only) — stat-card aggregates.
async function summary(req, res, next) {
  try {
    const data = await performanceModel.getSummary();
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

// GET /api/performance/:employeeId  (HR, or worker viewing their own)
async function getOne(req, res, next) {
  try {
    const { employeeId } = req.params;

    if (req.user.role === 'worker' && String(req.user.employeeId) !== String(employeeId)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    const record = await performanceModel.findByEmployee(employeeId);
    if (!record) throw new ApiError(404, 'Employee not found');
    res.status(200).json({ data: record });
  } catch (err) {
    next(err);
  }
}

// PUT /api/performance/:employeeId  (HR only) — start or edit a review.
async function upsert(req, res, next) {
  try {
    handleValidation(req);
    const { employeeId } = req.params;

    const existing = await performanceModel.findByEmployee(employeeId);
    if (!existing) throw new ApiError(404, 'Employee not found');

    const record = await performanceModel.upsert(employeeId, {
      ...req.body,
      reviewedBy: req.user.employeeId,
    });
    res.status(200).json({ data: record });
  } catch (err) {
    next(err);
  }
}

export { list, summary, getOne, upsert };
