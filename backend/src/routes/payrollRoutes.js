import express from 'express';
import { body, query } from 'express-validator';
import * as controller from '../controllers/payrollController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All payroll routes require a valid JWT.
router.use(authenticate);

const payPeriodPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const payPeriodRule = body('payPeriod')
  .matches(payPeriodPattern)
  .withMessage('payPeriod must be in YYYY-MM format');

router.get(
  '/',
  authorize('hr', 'worker'),
  [query('payPeriod').optional().matches(payPeriodPattern)],
  controller.list
);

router.get('/:id', authorize('hr', 'worker'), controller.getOne);

router.post(
  '/generate',
  authorize('hr'),
  [payPeriodRule],
  controller.generate
);

router.post(
  '/',
  authorize('hr'),
  [
    body('employeeId').isInt({ min: 1 }).withMessage('employeeId is required'),
    payPeriodRule,
    body('hoursWorked').isFloat({ min: 0 }).withMessage('hoursWorked must be a positive number'),
    body('leaveDeductions').optional().isFloat({ min: 0 }),
  ],
  controller.create
);

router.patch(
  '/:id',
  authorize('hr'),
  [
    body('hoursWorked').optional().isFloat({ min: 0 }),
    body('leaveDeductions').optional().isFloat({ min: 0 }),
  ],
  controller.update
);

router.delete('/:id', authorize('hr'), controller.remove);

export default router;
