import express from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All employee routes require a valid JWT.
router.use(authenticate);

router.get('/', authorize('hr'), controller.list);
router.get('/:id', authorize('hr', 'worker'), controller.getOne);

router.post(
  '/',
  authorize('hr'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('baseSalary').isFloat({ min: 0 }).withMessage('baseSalary must be a positive number'),
    body('email').optional({ nullable: true }).isEmail().withMessage('Invalid email'),
    body('employeeCode').optional({ nullable: true }).trim(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['hr', 'worker']).withMessage('role must be hr or worker'),
  ],
  controller.create
);

router.patch(
  '/:id',
  authorize('hr'),
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional({ nullable: true }).isEmail(),
    body('position').optional().trim().notEmpty(),
    body('department').optional().trim().notEmpty(),
    body('base_salary').optional().isFloat({ min: 0 }),
  ],
  controller.update
);

router.delete('/:id', authorize('hr'), controller.remove);

export default router;