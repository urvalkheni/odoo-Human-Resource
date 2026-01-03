const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');
const { body, param } = require('express-validator');
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendanceHistory,
  getAllAttendance,
  getAttendanceByEmployee,
  markAbsent,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats
} = require('../controllers/attendance.controller');

// Validation rules
const checkInValidation = [
  body('location').optional().trim(),
  body('ip_address').optional().trim(),
  body('notes').optional().trim(),
  validateRequest
];

const checkOutValidation = [
  body('notes').optional().trim(),
  validateRequest
];

const markAbsentValidation = [
  body('employee_ids').isArray().withMessage('Employee IDs must be an array'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  validateRequest
];

const updateAttendanceValidation = [
  param('id').isUUID().withMessage('Valid attendance ID is required'),
  body('status').optional().isIn(['present', 'absent', 'half_day', 'leave']),
  body('check_in').optional().isISO8601().withMessage('Valid check-in time is required'),
  body('check_out').optional().isISO8601().withMessage('Valid check-out time is required'),
  validateRequest
];

const idValidation = [
  param('id').isUUID().withMessage('Valid attendance ID is required'),
  validateRequest
];

// Protected routes
router.use(protect);

// Employee routes
router.post('/check-in', checkInValidation, checkIn);
router.post('/check-out', checkOutValidation, checkOut);
router.get('/today', getTodayAttendance);
router.get('/my-history', getMyAttendanceHistory);

// HR/Admin routes
router.get('/stats', authorize('hr', 'admin'), getAttendanceStats);
router.get('/', authorize('hr', 'admin'), getAllAttendance);
router.get('/employee/:employeeId', authorize('hr', 'admin'), getAttendanceByEmployee);
router.post('/mark-absent', authorize('hr', 'admin'), markAbsentValidation, markAbsent);
router.put('/:id', authorize('hr', 'admin'), updateAttendanceValidation, updateAttendance);
router.delete('/:id', authorize('admin'), idValidation, deleteAttendance);

module.exports = router;
