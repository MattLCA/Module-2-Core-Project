import bcrypt from "bcrypt";

import {
    validationResult
} from "express-validator";

import * as employeeModel
    from "../models/employeeModel.js";

import {
    ApiError
} from "../middleware/errorHandler.js";


const SALT_ROUNDS = 10;


function validateRequest(
    req
) {

    const errors =
        validationResult(req);


    if (
        !errors.isEmpty()
    ) {

        throw new ApiError(
            422,
            "Validation failed.",
            errors.array()
        );

    }

}


// ============================================================
// GET EMPLOYEES
// ============================================================

async function list(
    req,
    res,
    next
) {

    try {

        const employees =
            await employeeModel.findAll({
                department:
                    req.query.department
            });


        res.status(200).json({
            data: employees
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// GET EMPLOYEE
// ============================================================

async function getOne(
    req,
    res,
    next
) {

    try {

        const employee =
            await employeeModel.findById(
                req.params.id
            );


        if (!employee) {

            throw new ApiError(
                404,
                "Employee not found."
            );

        }


        if (
            req.user.role ===
            "worker" &&

            String(
                req.user.employeeId
            ) !==
            String(
                employee.employee_id
            )
        ) {

            throw new ApiError(
                403,
                "Insufficient permissions."
            );

        }


        res.status(200).json({
            data: employee
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// CREATE EMPLOYEE
// ============================================================

async function create(
    req,
    res,
    next
) {

    try {

        validateRequest(
            req
        );


        const passwordHash =
            await bcrypt.hash(
                req.body.password,
                SALT_ROUNDS
            );


        const employeeCode =
            req.body.employeeCode ||
            await employeeModel
                .getNextEmployeeCode();


        const employee =
            await employeeModel.create({

                ...req.body,

                employeeCode,

                passwordHash,

                role:
                    req.body.role ||
                    "worker"

            });


        res.status(201).json({
            data: employee
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// UPDATE EMPLOYEE
// ============================================================

async function update(
    req,
    res,
    next
) {

    try {

        validateRequest(
            req
        );


        const existing =
            await employeeModel.findById(
                req.params.id
            );


        if (!existing) {

            throw new ApiError(
                404,
                "Employee not found."
            );

        }


        const employee =
            await employeeModel.update(
                req.params.id,
                req.body
            );


        res.status(200).json({
            data: employee
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// DELETE EMPLOYEE
// ============================================================

async function remove(
    req,
    res,
    next
) {

    try {

        const deleted =
            await employeeModel.remove(
                req.params.id
            );


        if (!deleted) {

            throw new ApiError(
                404,
                "Employee not found."
            );

        }


        res.status(204).send();

    } catch (error) {

        next(error);

    }

}


export {
    list,
    getOne,
    create,
    update,
    remove
};