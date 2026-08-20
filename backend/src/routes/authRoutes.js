import express from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/login',
  [
    body('role').isIn(['hr', 'worker']).withMessage('role must be hr or worker'),
    body('identifier').trim().notEmpty().withMessage('identifier is required'),
    body('password').notEmpty().withMessage('password is required'),
  ],
  controller.login
);

export default router;
