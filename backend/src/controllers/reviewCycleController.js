// ============================================================
// ModernTech Review Cycle Controller
// ============================================================
//
// Handles:
//
// GET   /api/review-cycle
// PATCH /api/review-cycle/:employeeId
//
// HR users only.
// ============================================================

import * as reviewCycleModel from "../models/reviewCycleModel.js";

import {
    ApiError
} from "../middleware/errorHandler.js";


// ============================================================
// GET REVIEW CYCLE FUNNEL
// ============================================================
//
// GET /api/review-cycle
//
// Returns:
// - active review cycle
// - overall employee funnel percentages
//
// ============================================================

async function getFunnel(
    req,
    res,
    next
) {

    try {

        const cycle =
            await reviewCycleModel.getActiveCycle();


        // ----------------------------------------------------
        // No active cycle
        // ----------------------------------------------------

        if (!cycle) {

            return res.status(200).json({
                data: null
            });

        }


        // ----------------------------------------------------
        // Get funnel percentages
        // ----------------------------------------------------

        const funnel =
            await reviewCycleModel.getFunnel(
                cycle.review_cycle_id
            );


        return res.status(200).json({
            data: {
                cycle,
                funnel
            }
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// UPDATE EMPLOYEE REVIEW PROGRESS
// ============================================================
//
// PATCH /api/review-cycle/:employeeId
//
// Example body:
//
// {
//     "selfReviewSubmitted": true,
//     "managerReviewSubmitted": true,
//     "calibrationComplete": false,
//     "finalized": false
// }
//
// Only supplied fields are changed.
// ============================================================

async function updateProgress(
    req,
    res,
    next
) {

    try {

        const cycle =
            await reviewCycleModel.getActiveCycle();


        // ----------------------------------------------------
        // Make sure an active cycle exists
        // ----------------------------------------------------

        if (!cycle) {

            throw new ApiError(
                404,
                "No active review cycle"
            );

        }


        // ----------------------------------------------------
        // Read supplied progress values
        // ----------------------------------------------------

        const {
            selfReviewSubmitted,
            managerReviewSubmitted,
            calibrationComplete,
            finalized
        } = req.body;


        const flags = {};


        // ----------------------------------------------------
        // Convert frontend camelCase values to the database
        // snake_case column names used by reviewCycleModel.
        // ----------------------------------------------------

        if (
            selfReviewSubmitted !== undefined
        ) {

            flags.self_review_submitted =
                selfReviewSubmitted;

        }


        if (
            managerReviewSubmitted !== undefined
        ) {

            flags.manager_review_submitted =
                managerReviewSubmitted;

        }


        if (
            calibrationComplete !== undefined
        ) {

            flags.calibration_complete =
                calibrationComplete;

        }


        if (
            finalized !== undefined
        ) {

            flags.finalized =
                finalized;

        }


        // ----------------------------------------------------
        // Update the employee's progress
        // ----------------------------------------------------

        await reviewCycleModel.updateProgress(
            cycle.review_cycle_id,
            req.params.employeeId,
            flags
        );


        // ----------------------------------------------------
        // Return the updated funnel
        // ----------------------------------------------------

        const funnel =
            await reviewCycleModel.getFunnel(
                cycle.review_cycle_id
            );


        return res.status(200).json({
            data: {
                cycle,
                funnel
            }
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// EXPORT
// ============================================================

export {
    getFunnel,
    updateProgress
};