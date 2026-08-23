import LeaveModel
  from "../modules/leave/LeaveModel.js";

import {
  create
} from "../models/notificationModel.js";


// ============================================================
// GET ALL LEAVE REQUESTS
// ============================================================

export const getLeaveRequests = async (
  req,
  res
) => {

  try {

    const {
      status
    } = req.query;

    const rows =
      await LeaveModel.findAll(
        status || null
      );

    return res.status(200).json({
      data: rows
    });

  } catch (error) {

    console.error(
      "Error fetching leave requests:",
      error
    );

    return res.status(500).json({
      error:
        "Internal server error while fetching leave requests."
    });

  }

};


// ============================================================
// CREATE LEAVE REQUEST
// ============================================================

export const submitLeaveRequest = async (
  req,
  res
) => {

  try {

    const {
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      totalDays
    } = req.body;

    if (
      !employeeId ||
      !leaveTypeId ||
      !startDate ||
      !endDate ||
      !totalDays
    ) {

      return res.status(400).json({
        error:
          "Missing required leave fields."
      });

    }


    const result =
      await LeaveModel.create(
        req.body
      );


    return res.status(201).json({

      message:
        "Leave request submitted successfully.",

      data: {
        requestId:
          result.insertId
      }

    });

  } catch (error) {

    console.error(
      "Error submitting leave request:",
      error
    );

    return res.status(500).json({
      error:
        "Internal server error while submitting leave."
    });

  }

};


// ============================================================
// PROCESS HR DECISION
// ============================================================

export const processLeaveDecision = async (
  req,
  res
) => {

  try {

    const {
      id
    } = req.params;

    const {
      status
    } = req.body;


    if (
      ![
        "Approved",
        "Rejected",
        "Pending"
      ].includes(status)
    ) {

      return res.status(400).json({
        error:
          "Status must be Approved, Rejected, or Pending."
      });

    }


    const record =
      await LeaveModel.findById(
        id
      );


    if (!record) {

      return res.status(404).json({
        error:
          "Leave request not found."
      });

    }


    const reviewerId =
      req.user?.employeeId || null;


    await LeaveModel.updateStatus(
      id,
      status,
      reviewerId
    );


    // --------------------------------------------------------
    // Notify the worker
    // --------------------------------------------------------

    if (
      status === "Approved" ||
      status === "Rejected"
    ) {

      const notificationTitle =
        status === "Approved"
          ? "Leave Request Approved"
          : "Leave Request Rejected";


      const notificationMessage =
        status === "Approved"

          ? `Your ${record.leaveType} request from ${record.startDate} to ${record.endDate} has been approved by HR.`

          : `Your ${record.leaveType} request from ${record.startDate} to ${record.endDate} has been rejected by HR.`;


      await create({

        employeeId:
          record.employeeId,

        notificationType:
          "leave",

        title:
          notificationTitle,

        message:
          notificationMessage,

        status:
          "New"

      });

    }


    return res.status(200).json({

      message:
        `Leave request ${status.toLowerCase()} successfully.`

    });

  } catch (error) {

    console.error(
      "Error processing leave decision:",
      error
    );

    return res.status(500).json({
      error:
        "Internal server error processing leave decision."
    });

  }

};