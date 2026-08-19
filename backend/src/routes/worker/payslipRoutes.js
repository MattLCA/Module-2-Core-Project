import express from 'express';

import {
    getPayslips,
    getPayslip,
    downloadPayslip
} from '../../controllers/worker/payslipController.js';

import { authenticate } from '../../middleware/auth.js';

const router = express.Router();


// ============================================================
// AUTHENTICATION
// ============================================================

router.use(authenticate);


// ============================================================
// GET ALL MY PAYSLIPS
// ============================================================
//
// GET /api/worker/payslips
//
// ============================================================

router.get('/', getPayslips);


// ============================================================
// DOWNLOAD A PAYSLIP
// ============================================================
//
// IMPORTANT:
// This route comes BEFORE /:id so that "download" is not
// interpreted as an ID.
//
// GET /api/worker/payslips/:id/download
//
// ============================================================

router.get('/:id/download', downloadPayslip);


// ============================================================
// GET ONE PAYSLIP
// ============================================================
//
// GET /api/worker/payslips/:id
//
// ============================================================

router.get('/:id', getPayslip);


export default router;