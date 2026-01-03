const express = require('express');
const { body } = require('express-validator');
const {
  signup,
  signin,
  verifyEmail,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('company_id')
    .notEmpty().withMessage('Company ID is required')
    .isUUID().withMessage('Company ID must be a valid UUID'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('date_of_joining').optional().isISO8601().withMessage('Invalid date format'),
  body('department').optional().notEmpty().withMessage('Department is required'),
  body('designation').optional().notEmpty().withMessage('Designation is required'),
  body('basic_salary').optional().isFloat({ min: 0 }).withMessage('Basic salary must be a positive number')
];

const signinValidation = [
  body('password').notEmpty().withMessage('Password is required'),
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.employee_id) {
      throw new Error('Please provide either email or employee_id');
    }
    if (req.body.email && !req.body.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Please provide a valid email');
    }
    return true;
  })
];

// Routes
router.post('/signup', signupValidation, validateRequest, signup);
router.post('/signin', signinValidation, validateRequest, signin);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/change-password', protect, changePassword);

module.exports = router;
