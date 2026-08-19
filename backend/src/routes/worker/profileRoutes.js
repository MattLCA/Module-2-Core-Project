import express from 'express';

import {
    getProfile
} from '../../controllers/worker/profileController.js';

import { authenticate } from '../../middleware/auth.js';

const router = express.Router();


// ============================================================
// AUTHENTICATION
// ============================================================

router.use(authenticate);


// ============================================================
// GET WORKER PROFILE
// ============================================================
//
// GET /api/worker/profile
//
// Returns information belonging to the currently logged-in
// worker only.
//
// ============================================================

router.get('/', getProfile);


export default router;