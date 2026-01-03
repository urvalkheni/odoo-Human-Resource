import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { db, addLeave, updateLeave, updateLeaveBalance, saveData } from '../models/database.js';

const router = express.Router();

// Get leave requests
router.get('/', authMiddleware, (req, res) => {
  try {
    let leaves = db.leaves;
    console.log(`📋 Total leaves in database: ${leaves.length}`);

    // Non-admin can only see their own leaves
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      leaves = leaves.filter(l => l.employeeId === req.user.id);
      console.log(`👤 User ${req.user.id} has ${leaves.length} leave(s)`);
    } else {
      console.log(`👔 Admin viewing all ${leaves.length} leave(s)`);
    }

    // Add employee details
    const leavesWithDetails = leaves.map(leave => {
      const employee = db.users.find(u => u.id === leave.employeeId);
      return {
        ...leave,
        employeeName: employee ? employee.name : 'Unknown',
        employeeDepartment: employee ? employee.department : 'Unknown'
      };
    });

    res.json({ success: true, leaves: leavesWithDetails });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get leave balance
router.get('/balance', authMiddleware, (req, res) => {
  try {
    const { employeeId } = req.query;
    const targetId = employeeId || req.user.id;

    // Check permissions
    if (targetId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const balance = db.leaveBalances[targetId] || { paid: 20, sick: 10, unpaid: 0 };
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Apply for leave
router.post('/apply', authMiddleware, (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, and end date are required'
      });
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check leave balance for paid/sick leave
    if (leaveType !== 'unpaid' && leaveType !== 'Unpaid Leave') {
      const balance = db.leaveBalances[req.user.id];
      // Normalize leave type to lowercase key
      const leaveKey = leaveType.toLowerCase().replace(' leave', '');

      if (!balance || balance[leaveKey] === undefined) {
        return res.status(400).json({
          success: false,
          message: `Invalid leave type: ${leaveType}`
        });
      }

      if (balance[leaveKey] < days) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} balance. Available: ${balance[leaveKey]} days, Requested: ${days} days`
        });
      }
    }

    const newLeave = {
      id: `LVE${Date.now()}`,
      employeeId: req.user.id,
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason || '',
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedBy: null,
      approvedDate: null,
      comments: ''
    };

    addLeave(newLeave);
    console.log(`✅ New leave request created: ${newLeave.id} by ${req.user.id}`);

    res.json({
      success: true,
      message: 'Leave request submitted successfully',
      leave: newLeave
    });
  } catch (error) {
    console.error('Error in leave application:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Approve/Reject leave (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const validStatuses = ['Approved', 'Rejected', 'approved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (Approved/Rejected) is required'
      });
    }

    // Normalize status to title case
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const leaveIndex = db.leaves.findIndex(l => l.id === id);
    if (leaveIndex === -1) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const leave = db.leaves[leaveIndex];

    if (leave.status !== 'Pending' && leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }

    // Update leave status
    const updatedLeave = {
      ...leave,
      status: normalizedStatus,
      approvedBy: req.user.id,
      approvedDate: new Date().toISOString().split('T')[0],
      comments: comments || ''
    };

    // Update in database
    updateLeave(id, updatedLeave);

    // Deduct leave balance if approved
    if (normalizedStatus === 'Approved' && leave.leaveType !== 'unpaid' && leave.leaveType !== 'Unpaid Leave') {
      const leaveKey = leave.leaveType.toLowerCase().replace(' leave', '');
      const currentBalance = db.leaveBalances[leave.employeeId][leaveKey];
      updateLeaveBalance(leave.employeeId, leaveKey, currentBalance - leave.days);
      console.log(`📉 Deducted ${leave.days} ${leaveKey} days from ${leave.employeeId}`);
    }

    console.log(`✅ Leave ${normalizedStatus}: ${id} by admin ${req.user.id}`);

    res.json({
      success: true,
      message: `Leave request ${normalizedStatus} successfully`,
      leave: updatedLeave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
