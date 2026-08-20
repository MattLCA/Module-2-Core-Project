import express from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/performanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('hr'), controller.list);
router.get('/summary', authorize('hr'), controller.summary);
router.get('/:employeeId', authorize('hr', 'worker'), controller.getOne);

router.put(
  '/:employeeId',
  authorize('hr'),
  [
    body('rating').isFloat({ min: 2.0, max: 5.0 }).withMessage('rating must be between 2.0 and 5.0'),
    body('notes').optional().isString(),
    body('goalProgress').optional().isInt({ min: 0, max: 100 }),
  ],
  controller.upsert
);

export default router;
