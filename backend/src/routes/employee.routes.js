const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authMiddleware, requireAdminOrHR } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Public employee routes (all authenticated users)
router.get('/', employeeController.getAllEmployees);
router.get('/statistics', employeeController.getStatistics);
router.get('/:id', employeeController.getEmployeeById);

// Admin/HR only routes
router.post('/', requireAdminOrHR, employeeController.createEmployee);
router.put('/:id', requireAdminOrHR, employeeController.updateEmployee);
router.delete('/:id', requireAdminOrHR, employeeController.deleteEmployee);

module.exports = router;
