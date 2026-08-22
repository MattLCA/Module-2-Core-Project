import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import * as employeeModel from '../models/employeeModel.js';
import { ApiError } from '../middleware/errorHandler.js';

// POST /api/auth/login
// Body: { role: 'hr'|'worker', identifier: string, password: string }
// 'identifier' is an email for HR, an employee_code (e.g. 'EMP001') for workers.
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(422, 'Validation failed');
    }

    const { role, identifier, password } = req.body;

    const user = role === 'hr'
      ? await employeeModel.findByLoginIdentifier({ email: identifier })
      : await employeeModel.findByLoginIdentifier({ employeeCode: identifier });

    // Same generic message whether the user doesn't exist or the password is
    // wrong — don't reveal which one it was.
    if (!user || user.role !== role) {
      throw new ApiError(401, 'Incorrect email/employee ID or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Incorrect email/employee ID or password');
    }

    const token = jwt.sign(
      { employeeId: user.employee_id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.status(200).json({
      data: {
        token,
        employee: {
          employeeId: user.employee_id,
          name: user.name,
          role: user.role,
          department: user.department,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export { login };