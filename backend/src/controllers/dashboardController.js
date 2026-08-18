import * as dashboardModel from '../models/dashboardModel.js';

// GET /api/dashboard/summary  (HR only)
async function summary(req, res, next) {
  try {
    const data = await dashboardModel.getSummary();
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export { summary };
