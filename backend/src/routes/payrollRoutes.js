import express from "express";

import {
    body,
    query
} from "express-validator";

import * as controller
    from "../controllers/payrollController.js";

import {
    authenticate,
    authorize
} from "../middleware/auth.js";


const router =
    express.Router();


router.use(
    authenticate
);


const payPeriodPattern =
    /^\d{4}-(0[1-9]|1[0-2])$/;


router.get(

    "/",

    authorize(
        "hr",
        "worker"
    ),

    [

        query("payPeriod")
            .optional()
            .matches(
                payPeriodPattern
            ),

        query("employeeId")
            .optional()
            .isInt({
                min: 1
            })

    ],

    controller.list

);


router.get(

    "/:id",

    authorize(
        "hr",
        "worker"
    ),

    controller.getOne

);


// HR creates a payslip
router.post(

    "/",

    authorize("hr"),

    [

        body("employeeId")
            .isInt({
                min: 1
            }),

        body("payPeriod")
            .matches(
                payPeriodPattern
            ),

        body("hoursWorked")
            .optional()
            .isFloat({
                min: 0
            }),

        body("overtimePay")
            .optional()
            .isFloat({
                min: 0
            }),

        body("transportAllowance")
            .optional()
            .isFloat({
                min: 0
            }),

        body("bonus")
            .optional()
            .isFloat({
                min: 0
            }),

        body("payeTax")
            .optional()
            .isFloat({
                min: 0
            }),

        body("uif")
            .optional()
            .isFloat({
                min: 0
            }),

        body("pension")
            .optional()
            .isFloat({
                min: 0
            }),

        body("medicalAid")
            .optional()
            .isFloat({
                min: 0
            }),

        body("leaveDeductions")
            .optional()
            .isFloat({
                min: 0
            })

    ],

    controller.create

);


// HR edits payslip
router.patch(

    "/:id",

    authorize("hr"),

    [

        body("hoursWorked")
            .optional()
            .isFloat({
                min: 0
            }),

        body("overtimePay")
            .optional()
            .isFloat({
                min: 0
            }),

        body("transportAllowance")
            .optional()
            .isFloat({
                min: 0
            }),

        body("bonus")
            .optional()
            .isFloat({
                min: 0
            }),

        body("payeTax")
            .optional()
            .isFloat({
                min: 0
            }),

        body("uif")
            .optional()
            .isFloat({
                min: 0
            }),

        body("pension")
            .optional()
            .isFloat({
                min: 0
            }),

        body("medicalAid")
            .optional()
            .isFloat({
                min: 0
            }),

        body("leaveDeductions")
            .optional()
            .isFloat({
                min: 0
            })

    ],

    controller.update

);


router.delete(

    "/:id",

    authorize("hr"),

    controller.remove

);


export default router;