import { validationResult } from "express-validator";

import * as payrollModel from "../models/payrollModel.js";

import { ApiError } from "../middleware/errorHandler.js";

function validateRequest(req) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(422, "Validation failed.", errors.array());
  }
}

// ============================================================
// LIST
// ============================================================

async function list(req, res, next) {
  try {
    let employeeId = req.query.employeeId;

    if (req.user.role === "worker") {
      employeeId = req.user.employeeId;
    }

    const records = await payrollModel.findAll({
      payPeriod: req.query.payPeriod,
      employeeId,
    });

    res.status(200).json({
      data: records,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET ONE
// ============================================================

async function getOne(req, res, next) {
  try {
    const record = await payrollModel.findById(req.params.id);

    if (!record) {
      throw new ApiError(404, "Payroll record not found.");
    }

    if (
      req.user.role === "worker" &&
      String(req.user.employeeId) !== String(record.employeeId)
    ) {
      throw new ApiError(403, "Insufficient permissions.");
    }

    res.status(200).json({
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// CREATE
// ============================================================

async function create(req, res, next) {
  try {
    validateRequest(req);

    const existing = await payrollModel.findByEmployeeAndPeriod(
      req.body.employeeId,
      req.body.payPeriod,
    );

    if (existing) {
      throw new ApiError(
        409,
        "A payroll record already exists for this employee and period.",
      );
    }

    const record = await payrollModel.create(req.body);

    if (!record) {
      throw new ApiError(404, "Employee not found.");
    }

    res.status(201).json({
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// UPDATE
// ============================================================

async function update(req, res, next) {
  try {
    validateRequest(req);

    const record = await payrollModel.update(
      req.params.id,
      req.body,
    );

    if (!record) {
      throw new ApiError(404, "Payroll record not found.");
    }

    res.status(200).json({
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// DELETE
// ============================================================

async function remove(req, res, next) {
  try {
    const deleted = await payrollModel.remove(req.params.id);

    if (!deleted) {
      throw new ApiError(404, "Payroll record not found.");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GENERATE (BULK, ONE PER ACTIVE EMPLOYEE)
// ============================================================

async function generate(req, res, next) {
  try {
    validateRequest(req);

    const records = await payrollModel.generateForPeriod(
      req.body.payPeriod
    );

    res.status(201).json({
      data: records,
      count: records.length,
    });
  } catch (error) {
    next(error);
  }
}

export {
  list,
  getOne,
  create,
  update,
  remove,
  generate,
};