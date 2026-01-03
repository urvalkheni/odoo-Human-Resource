const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authMiddleware, requireAdminOrHR } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Employee routes
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);

// HR/Admin routes
router.get('/', requireAdminOrHR, attendanceController.getAttendance);

module.exports = router;
