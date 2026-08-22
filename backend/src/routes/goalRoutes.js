import express from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/goalController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('hr', 'worker'), controller.list);
router.get('/summary', authorize('hr'), controller.summary);

router.post(
  '/',
  authorize('hr'),
  [
    body('employeeId').isInt().withMessage('employeeId is required'),
    body('title').isString().trim().notEmpty().withMessage('title is required'),
    body('status').optional().isIn(['on_track', 'at_risk', 'behind', 'completed']),
    body('progress').optional().isInt({ min: 0, max: 100 }),
    body('dueDate').optional({ nullable: true }).isISO8601(),
  ],
  controller.create
);

router.put(
  '/:goalId',
  authorize('hr'),
  [
    body('title').optional().isString().trim().notEmpty(),
    body('status').optional().isIn(['on_track', 'at_risk', 'behind', 'completed']),
    body('progress').optional().isInt({ min: 0, max: 100 }),
    body('dueDate').optional({ nullable: true }).isISO8601(),
  ],
  controller.update
);

router.delete('/:goalId', authorize('hr'), controller.remove);

export default router;