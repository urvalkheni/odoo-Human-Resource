const express = require('express');
const { body } = require('express-validator');
const {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/company.controller');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

// Validation rules
const companyValidation = [
  body('name').notEmpty().withMessage('Company name is required'),
  body('short_name')
    .notEmpty().withMessage('Short name is required')
    .isLength({ min: 2, max: 6 }).withMessage('Short name must be 2-6 characters')
    .matches(/^[A-Z]+$/).withMessage('Short name must contain only uppercase letters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().notEmpty().withMessage('Phone number is required')
];

// Routes (All protected - uncomment protect middleware when auth is active)
router
  .route('/')
  .post(companyValidation, validateRequest, createCompany)
  .get(getCompanies);

router
  .route('/:id')
  .get(getCompany)
  .put(updateCompany)
  .delete(deleteCompany);

module.exports = router;
