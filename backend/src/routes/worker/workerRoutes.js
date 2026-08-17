// src/routes/worker/workerRoutes.js
const express = require('express');
const router = express.Router();

const attendanceController = require('../../controllers/worker/attendanceController');
const authenticateToken = require('../../middleware/authMiddleware');     //JWT Middleware

// Route:POST /api/worker/clock-in
router.post('/clock-in', authenticateToekn, attendanceController.clockIn);

module.exports = router;