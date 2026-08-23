// ============================================================
// ModernTech Authentication Controller
// ============================================================

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { validationResult } from "express-validator";

import * as employeeModel from "../models/employeeModel.js";

import { ApiError } from "../middleware/errorHandler.js";

// ============================================================
// LOGIN
// ============================================================
//
// POST /api/auth/login
//
// HR:
//
// {
//     role: "hr",
//     identifier: "lungile.moyo@moderntech.com",
//     password: "ChangeMe123!"
// }
//
// Worker:
//
// {
//     role: "worker",
//     identifier: "EMP001",
//     password: "ChangeMe123!"
// }
//
// ============================================================

async function login(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new ApiError(422, "Validation failed.", errors.array());
    }

    const { role, identifier, password } = req.body;

    const user =
      role === "hr"
        ? await employeeModel.findByLoginIdentifier({
            email: identifier,
          })
        : await employeeModel.findByLoginIdentifier({
            employeeCode: identifier,
          });

    if (!user || user.role !== role || !user.is_active) {
      throw new ApiError(401, "Incorrect email/employee ID or password.");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      throw new ApiError(401, "Incorrect email/employee ID or password.");
    }

    if (!process.env.JWT_SECRET) {
      throw new ApiError(500, "JWT authentication is not configured.");
    }

    const token = jwt.sign(
      {
        employeeId: user.employee_id,

        employeeCode: user.employee_code,

        name: user.name,

        role: user.role,

        department: user.department,

        position: user.position,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      },
    );

    return res.status(200).json({
      data: {
        token,

        employee: {
          employeeId: user.employee_id,

          employeeCode: user.employee_code,

          name: user.name,

          email: user.email,

          role: user.role,

          department: user.department,

          position: user.position,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export { login };
