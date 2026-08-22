import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import * as employeeModel from '../models/employeeModel.js';
import { ApiError } from '../middleware/errorHandler.js';

const SALT_ROUNDS = 10;

function handleValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new ApiError(422, 'Validation failed');
    err.details = errors.array();
    throw err;
  }
}

// GET /api/employees?department=Development
async function list(req, res, next) {
  try {
    const { department } = req.query;
    const employees = await employeeModel.findAll({ department });
    res.status(200).json({ data: employees });
  } catch (err) {
    next(err);
  }
}

// GET /api/employees/:id
async function getOne(req, res, next) {
  try {
    const employee = await employeeModel.findById(req.params.id);
    if (!employee) throw new ApiError(404, 'Employee not found');

    // Workers may only view their own record; HR can view any.
    if (req.user.role === 'worker' && String(req.user.employeeId) !== String(employee.employee_id)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    res.status(200).json({ data: employee });
  } catch (err) {
    next(err);
  }
}

// POST /api/employees  (HR only)
// Accepts a plain `password` field and hashes it here — the caller
// (browser) should never be the one computing password_hash.
async function create(req, res, next) {
  try {
    handleValidation(req);

    const passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const employeeCode = req.body.employeeCode || await employeeModel.getNextEmployeeCode();

    const employee = await employeeModel.create({
      ...req.body,
      employeeCode,
      passwordHash,
      role: req.body.role || 'worker',
    });
    res.status(201).json({ data: employee });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/employees/:id  (HR only)
async function update(req, res, next) {
  try {
    handleValidation(req);
    const existing = await employeeModel.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Employee not found');

    const updated = await employeeModel.update(req.params.id, req.body);
    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/employees/:id  (HR only) — soft delete
async function remove(req, res, next) {
  try {
    const deleted = await employeeModel.remove(req.params.id);
    if (!deleted) throw new ApiError(404, 'Employee not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export { list, getOne, create, update, remove };
