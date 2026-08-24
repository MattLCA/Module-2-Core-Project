import * as dashboardModel from "../models/dashboardModel.js";

async function summary(req, res, next) {
  try {
    const data = await dashboardModel.getSummary();

    res.status(200).json({
      data,
    });
  } catch (error) {
    next(error);
  }
}

export { summary };
