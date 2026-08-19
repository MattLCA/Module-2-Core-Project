import express from 'express';

import {
    listLeaveTypes,
    listLeaveBalances,
    listLeaveRequests,
    submitLeaveRequest
} from '../../controllers/worker/leaveController.js';

import { authenticate } from '../../middleware/auth.js';

const router = express.Router();


// ============================================================
// AUTHENTICATION
// ============================================================

router.use(authenticate);


// ============================================================
// LEAVE TYPES
// ============================================================
//
// GET /api/worker/leave/types
//
// ============================================================

router.get('/types', listLeaveTypes);


// ============================================================
// LEAVE BALANCES
// ============================================================
//
// GET /api/worker/leave/balances
//
// ============================================================

router.get('/balances', listLeaveBalances);


// ============================================================
// LEAVE REQUESTS
// ============================================================
//
// GET /api/worker/leave/requests
//
// ============================================================

router.get('/requests', listLeaveRequests);


// ============================================================
// SUBMIT LEAVE REQUEST
// ============================================================
//
// POST /api/worker/leave/requests
//
// ============================================================

router.post('/requests', submitLeaveRequest);


export default router;