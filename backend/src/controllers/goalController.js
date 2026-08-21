import { validationResult } from 'express-validator';
import * as goalModel from '../models/goalModel.js';
import { ApiError } from '../middleware/errorHandler.js';

function handleValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new ApiError(422, 'Validation failed');
    err.details = errors.array();
    throw err;
  }
}

// GET /api/goals
async function list(req, res, next) {
  try {
    const rows = await goalModel.findAll();
    res.status(200).json({ data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/goals/summary
async function summary(req, res, next) {
  try {
    const data = await goalModel.getSummary();
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

// POST /api/goals  (HR only)
async function create(req, res, next) {
  try {
    handleValidation(req);
    const { employeeId, title, status, progress, dueDate } = req.body;
    const goalId = await goalModel.create({
      employeeId,
      title,
      status,
      progress,
      dueDate,
      createdBy: req.user.employeeId,
    });
    const goal = await goalModel.findById(goalId);
    res.status(201).json({ data: goal });
  } catch (err) {
    next(err);
  }
}

// PUT /api/goals/:goalId  (HR only)
async function update(req, res, next) {
  try {
    const existing = await goalModel.findById(req.params.goalId);
    if (!existing) throw new ApiError(404, 'Goal not found');
    await goalModel.update(req.params.goalId, req.body);
    const goal = await goalModel.findById(req.params.goalId);
    res.status(200).json({ data: goal });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/goals/:goalId  (HR only)
async function remove(req, res, next) {
  try {
    const existing = await goalModel.findById(req.params.goalId);
    if (!existing) throw new ApiError(404, 'Goal not found');
    await goalModel.remove(req.params.goalId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export { list, summary, create, update, remove };
