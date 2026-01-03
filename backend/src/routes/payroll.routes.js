const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const { authMiddleware, requireAdminOrHR } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// All users can view their payroll
router.get('/', payrollController.getPayrolls);

// HR/Admin only routes
router.post('/generate', requireAdminOrHR, payrollController.generatePayroll);
router.put('/:id/mark-paid', requireAdminOrHR, payrollController.markAsPaid);

module.exports = router;
