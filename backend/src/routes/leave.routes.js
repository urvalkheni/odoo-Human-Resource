const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { authMiddleware, requireAdminOrHR } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Employee routes
router.post('/apply', leaveController.applyLeave);
router.get('/', leaveController.getLeaves);

// HR/Admin routes
router.put('/:id/status', requireAdminOrHR, leaveController.updateLeaveStatus);

module.exports = router;
