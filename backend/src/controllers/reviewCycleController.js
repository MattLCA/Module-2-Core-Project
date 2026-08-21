import * as reviewCycleModel from '../models/reviewCycleModel.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/review-cycle — active cycle + funnel percentages for the stat page.
async function getFunnel(req, res, next) {
  try {
    const cycle = await reviewCycleModel.getActiveCycle();
    if (!cycle) {
      return res.status(200).json({ data: null });
    }
    const funnel = await reviewCycleModel.getFunnel(cycle.review_cycle_id);
    res.status(200).json({ data: { cycle, funnel } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/review-cycle/:employeeId  (HR only)
// Body: any subset of { selfReviewSubmitted, managerReviewSubmitted, calibrationComplete, finalized }
async function updateProgress(req, res, next) {
  try {
    const cycle = await reviewCycleModel.getActiveCycle();
    if (!cycle) throw new ApiError(404, 'No active review cycle');

    const { selfReviewSubmitted, managerReviewSubmitted, calibrationComplete, finalized } = req.body;
    const flags = {};
    if (selfReviewSubmitted !== undefined) flags.self_review_submitted = selfReviewSubmitted;
    if (managerReviewSubmitted !== undefined) flags.manager_review_submitted = managerReviewSubmitted;
    if (calibrationComplete !== undefined) flags.calibration_complete = calibrationComplete;
    if (finalized !== undefined) flags.finalized = finalized;

    await reviewCycleModel.updateProgress(cycle.review_cycle_id, req.params.employeeId, flags);
    const funnel = await reviewCycleModel.getFunnel(cycle.review_cycle_id);
    res.status(200).json({ data: { cycle, funnel } });
  } catch (err) {
    next(err);
  }
}

export { getFunnel, updateProgress };
