const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');
const { body, param } = require('express-validator');
const {
  createPayroll,
  getAllPayroll,
  getPayrollById,
  getMyPayroll,
  getPayrollByEmployee,
  updatePayroll,
  updatePaymentStatus,
  deletePayroll,
  generatePayslip,
  getPayrollStats,
  bulkCreatePayroll
} = require('../controllers/payroll.controller');

// Validation rules
const createPayrollValidation = [
  body('employee_id').isUUID().withMessage('Valid employee ID is required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Valid month is required (1-12)'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  body('basic_salary').isFloat({ min: 0 }).withMessage('Valid basic salary is required'),
  body('allowances').optional().isObject(),
  body('deductions').optional().isObject(),
  body('overtime_amount').optional().isFloat({ min: 0 }),
  body('bonus').optional().isFloat({ min: 0 }),
  body('payment_method').optional().isIn(['bank_transfer', 'cash', 'cheque']),
  validateRequest
];

const updatePayrollValidation = [
  param('id').isUUID().withMessage('Valid payroll ID is required'),
  body('basic_salary').optional().isFloat({ min: 0 }),
  body('allowances').optional().isObject(),
  body('deductions').optional().isObject(),
  body('overtime_amount').optional().isFloat({ min: 0 }),
  body('bonus').optional().isFloat({ min: 0 }),
  validateRequest
];

const updatePaymentStatusValidation = [
  param('id').isUUID().withMessage('Valid payroll ID is required'),
  body('payment_status').isIn(['pending', 'processing', 'paid', 'failed'])
    .withMessage('Invalid payment status'),
  body('payment_date').optional().isISO8601().withMessage('Valid payment date is required'),
  validateRequest
];

const bulkCreateValidation = [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Valid month is required (1-12)'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  body('employees').isArray().withMessage('Employees array is required'),
  validateRequest
];

const idValidation = [
  param('id').isUUID().withMessage('Valid payroll ID is required'),
  validateRequest
];

// Protected routes
router.use(protect);

// Employee routes
router.get('/my-payroll', getMyPayroll);
router.get('/:id/payslip', idValidation, generatePayslip);

// HR/Admin routes
router.get('/stats', authorize('hr', 'admin'), getPayrollStats);
router.get('/', authorize('hr', 'admin'), getAllPayroll);
router.post('/', authorize('hr', 'admin'), createPayrollValidation, createPayroll);
router.post('/bulk-create', authorize('hr', 'admin'), bulkCreateValidation, bulkCreatePayroll);
router.get('/employee/:employeeId', authorize('hr', 'admin'), getPayrollByEmployee);
router.put('/:id', authorize('hr', 'admin'), updatePayrollValidation, updatePayroll);
router.put('/:id/payment-status', authorize('hr', 'admin'), updatePaymentStatusValidation, updatePaymentStatus);
router.delete('/:id', authorize('admin'), idValidation, deletePayroll);

// Shared routes (with role-based access inside controller)
router.get('/:id', idValidation, getPayrollById);

module.exports = router;
