import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { db } from '../models/database.js';

const router = express.Router();

// Get payroll information
router.get('/', authMiddleware, (req, res) => {
  try {
    const { employeeId } = req.query;

    // Check permissions
    if (employeeId) {
      if (req.user.id !== employeeId && req.user.role !== 'admin' && req.user.role !== 'hr') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const employee = db.users.find(u => u.id === employeeId);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      return res.json({
        success: true,
        payroll: {
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          position: employee.position,
          ...employee.salary
        }
      });
    }

    // Admin can see all payrolls
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      const payrolls = db.users.map(user => ({
        employeeId: user.id,
        employeeName: user.name,
        department: user.department,
        position: user.position,
        ...user.salary
      }));

      return res.json({ success: true, payrolls });
    }

    // Employee can only see their own
    const employee = db.users.find(u => u.id === req.user.id);
    res.json({
      success: true,
      payroll: {
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        position: employee.position,
        ...employee.salary
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update payroll (Admin only)
router.put('/:employeeId', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { employeeId } = req.params;
    const { basic, hra, allowances, deductions } = req.body;

    const userIndex = db.users.findIndex(u => u.id === employeeId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Calculate net salary
    const netSalary = (basic || 0) + (hra || 0) + (allowances || 0) - (deductions || 0);

    db.users[userIndex].salary = {
      basic: basic || db.users[userIndex].salary.basic,
      hra: hra || db.users[userIndex].salary.hra,
      allowances: allowances || db.users[userIndex].salary.allowances,
      deductions: deductions || db.users[userIndex].salary.deductions,
      netSalary
    };

    res.json({
      success: true,
      message: 'Payroll updated successfully',
      salary: db.users[userIndex].salary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Generate salary slip
router.get('/slip/:employeeId', authMiddleware, (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    // Check permissions
    if (req.user.id !== employeeId && req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const employee = db.users.find(u => u.id === employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const currentDate = new Date();
    const slipMonth = month || currentDate.getMonth() + 1;
    const slipYear = year || currentDate.getFullYear();

    const salarySlip = {
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      month: slipMonth,
      year: slipYear,
      generatedDate: currentDate.toISOString().split('T')[0],
      earnings: {
        basic: employee.salary.basic,
        hra: employee.salary.hra,
        allowances: employee.salary.allowances,
        total: employee.salary.basic + employee.salary.hra + employee.salary.allowances
      },
      deductions: {
        tax: employee.salary.deductions,
        total: employee.salary.deductions
      },
      netSalary: employee.salary.netSalary
    };

    res.json({ success: true, salarySlip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
