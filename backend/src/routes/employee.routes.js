const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');
const { uploadSingle } = require('../middleware/upload');
const { body, param, query } = require('express-validator');
const {
  getAllEmployees,
  getEmployeeById,
  getMyProfile,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadProfilePicture,
  getEmployeeStats
} = require('../controllers/employee.controller');

// Validation rules
const createEmployeeValidation = [
  body('user_id').notEmpty().isUUID().withMessage('Valid user ID is required'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('date_of_birth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('employee_code').optional().trim(),
  body('date_of_joining').optional().isISO8601().withMessage('Valid date of joining is required'),
  body('employment_type').optional().isIn(['full-time', 'part-time', 'contract', 'intern']),
  body('department').optional().trim(),
  body('designation').optional().trim(),
  validateRequest
];

const updateEmployeeValidation = [
  param('id').isUUID().withMessage('Valid employee ID is required'),
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('date_of_birth').optional().isISO8601().withMessage('Valid date is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  validateRequest
];

const idValidation = [
  param('id').isUUID().withMessage('Valid employee ID is required'),
  validateRequest
];

// Protected routes
router.use(protect);

// Get current employee profile
router.get('/me', getMyProfile);

// Get employee statistics (HR/Admin only)
router.get('/stats', authorize('hr', 'admin'), getEmployeeStats);

// Get all employees (HR/Admin only)
router.get('/', authorize('hr', 'admin'), getAllEmployees);

// Create new employee (HR/Admin only)
router.post('/', authorize('hr', 'admin'), createEmployeeValidation, createEmployee);

// Get employee by ID
router.get('/:id', idValidation, getEmployeeById);

// Update employee
router.put('/:id', updateEmployeeValidation, updateEmployee);

// Delete employee (Admin only)
router.delete('/:id', authorize('admin'), idValidation, deleteEmployee);

// Upload profile picture
router.post('/:id/upload-picture', uploadSingle, uploadProfilePicture);

module.exports = router;
