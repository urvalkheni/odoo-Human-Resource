const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');
const { body, param } = require('express-validator');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  updateLeaveStatus,
  updateLeave,
  cancelLeave,
  deleteLeave,
  getLeaveStats,
  getLeaveBalance
} = require('../controllers/leave.controller');

// Validation rules
const applyLeaveValidation = [
  body('leave_type').isIn(['paid', 'sick', 'unpaid', 'casual', 'maternity', 'paternity'])
    .withMessage('Invalid leave type'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  body('attachments').optional(),
  validateRequest
];

const updateLeaveStatusValidation = [
  param('id').isUUID().withMessage('Valid leave ID is required'),
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('approval_remarks').optional().trim(),
  validateRequest
];

const updateLeaveValidation = [
  param('id').isUUID().withMessage('Valid leave ID is required'),
  body('leave_type').optional().isIn(['paid', 'sick', 'unpaid', 'casual', 'maternity', 'paternity']),
  body('start_date').optional().isISO8601().withMessage('Valid start date is required'),
  body('end_date').optional().isISO8601().withMessage('Valid end date is required'),
  body('reason').optional().trim().notEmpty().withMessage('Reason cannot be empty'),
  validateRequest
];

const idValidation = [
  param('id').isUUID().withMessage('Valid leave ID is required'),
  validateRequest
];

// Protected routes
router.use(protect);

// Employee routes
router.post('/', applyLeaveValidation, applyLeave);
router.get('/my-leaves', getMyLeaves);
router.put('/:id', updateLeaveValidation, updateLeave);
router.put('/:id/cancel', idValidation, cancelLeave);
router.get('/balance/:employeeId', getLeaveBalance);

// HR/Admin routes
router.get('/stats', authorize('hr', 'admin'), getLeaveStats);
router.get('/', authorize('hr', 'admin'), getAllLeaves);
router.put('/:id/status', authorize('hr', 'admin'), updateLeaveStatusValidation, updateLeaveStatus);
router.delete('/:id', authorize('admin'), idValidation, deleteLeave);

// Shared routes (with role-based access inside controller)
router.get('/:id', idValidation, getLeaveById);

module.exports = router;
