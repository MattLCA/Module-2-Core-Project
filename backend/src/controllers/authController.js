import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import * as employeeModel from '../models/employeeModel.js';
import { ApiError } from '../middleware/errorHandler.js';

// ============================================================
// POST /api/auth/login
// ============================================================
//
// Worker:
// {
//     role: "worker",
//     identifier: "EMP001",
//     password: "ChangeMe123!"
// }
//
// HR:
// {
//     role: "hr",
//     identifier: "lungile.moyo@moderntech.com",
//     password: "ChangeMe123!"
// }
//
// ============================================================

async function login(req, res, next) {

    try {

        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            console.error('Login validation errors:', errors.array());

            throw new ApiError(
                422,
                'Validation failed'
            );
        }

        // --------------------------------------------------------
        // REQUEST DATA
        // --------------------------------------------------------

        const {
            role,
            identifier,
            password
        } = req.body;

        // --------------------------------------------------------
        // FIND EMPLOYEE
        // --------------------------------------------------------

        let user;

        if (role === 'hr') {

            user = await employeeModel.findByLoginIdentifier({
                email: identifier
            });

        } else {

            user = await employeeModel.findByLoginIdentifier({
                employeeCode: identifier
            });

        }

        // --------------------------------------------------------
        // CHECK USER
        // --------------------------------------------------------

        if (!user || user.role !== role) {

            throw new ApiError(
                401,
                'Incorrect email/employee ID or password'
            );
        }

        // --------------------------------------------------------
        // CHECK ACTIVE ACCOUNT
        // --------------------------------------------------------

        if (!user.is_active) {

            throw new ApiError(
                403,
                'This account is inactive'
            );
        }

        // --------------------------------------------------------
        // CHECK PASSWORD
        // --------------------------------------------------------

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {

            throw new ApiError(
                401,
                'Incorrect email/employee ID or password'
            );
        }

        // --------------------------------------------------------
        // CREATE JWT
        // --------------------------------------------------------

        const token = jwt.sign(

            {
                employeeId: user.employee_id,
                employeeCode: user.employee_code,
                role: user.role,
                name: user.name
            },

            process.env.JWT_SECRET,

            {
                expiresIn:
                    process.env.JWT_EXPIRES_IN || '8h'
            }
        );

        // --------------------------------------------------------
        // RETURN LOGIN RESPONSE
        // --------------------------------------------------------

        res.status(200).json({

            message: 'Login successful',

            data: {

                token,

                employee: {

                    employeeId:
                        user.employee_id,

                    employeeCode:
                        user.employee_code,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role,

                    roleId:
                        user.role_id,

                    positionId:
                        user.position_id,

                    position:
                        user.position_name,

                    positionName:
                        user.position_name,

                    departmentId:
                        user.department_id,

                    department:
                        user.department_name,

                    departmentName:
                        user.department_name,

                    baseSalary:
                        user.base_salary,

                    employmentHistory:
                        user.employment_history,

                    contact:
                        user.contact

                }

            }

        });

    } catch (err) {

        next(err);

    }

}

export { login };