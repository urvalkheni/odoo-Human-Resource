const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getEmployeeDashboard,
  getAdminDashboard,
  getAttendanceTrends,
  getLeaveTrends,
  getQuickStats,
  getAnalytics
} = require('../controllers/dashboard.controller');

// Protected routes
router.use(protect);

// Quick stats (accessible to all authenticated users)
router.get('/quick-stats', getQuickStats);

// Employee dashboard
router.get('/employee', getEmployeeDashboard);

// HR/Admin dashboard
router.get('/admin', authorize('hr', 'admin'), getAdminDashboard);

// Trends and analytics (HR/Admin only)
router.get('/attendance-trends', authorize('hr', 'admin'), getAttendanceTrends);
router.get('/leave-trends', authorize('hr', 'admin'), getLeaveTrends);
router.get('/analytics', authorize('hr', 'admin'), getAnalytics);

module.exports = router;
