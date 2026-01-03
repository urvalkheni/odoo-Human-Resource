import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { db } from '../models/database.js';

const router = express.Router();

// Get attendance records
router.get('/', authMiddleware, (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    let records = db.attendance;

    // Filter by employee
    if (employeeId) {
      // Check permissions
      if (req.user.id !== employeeId && req.user.role !== 'admin' && req.user.role !== 'hr') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      records = records.filter(r => r.employeeId === employeeId);
    } else if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      // Non-admin can only see their own records
      records = records.filter(r => r.employeeId === req.user.id);
    }

    // Filter by date range
    if (startDate) {
      records = records.filter(r => r.date >= startDate);
    }
    if (endDate) {
      records = records.filter(r => r.date <= endDate);
    }

    res.json({ success: true, attendance: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Check in/out
router.post('/checkin', authMiddleware, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5);

    // Check if already checked in today
    const existingRecord = db.attendance.find(
      r => r.employeeId === req.user.id && r.date === today
    );

    if (existingRecord) {
      if (!existingRecord.checkOut) {
        // Check out
        existingRecord.checkOut = timeString;

        // Calculate hours worked
        const checkIn = new Date(`${today}T${existingRecord.checkIn}:00`);
        const checkOut = new Date(`${today}T${timeString}:00`);
        const hoursWorked = ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2);
        existingRecord.hoursWorked = parseFloat(hoursWorked);

        return res.json({
          success: true,
          message: 'Checked out successfully',
          attendance: existingRecord,
          action: 'checkout'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Already checked out for today'
        });
      }
    } else {
      // Check in
      const newRecord = {
        id: `ATT${Date.now()}`,
        employeeId: req.user.id,
        date: today,
        checkIn: timeString,
        checkOut: null,
        status: 'present',
        hoursWorked: 0
      };

      db.attendance.push(newRecord);
      return res.json({
        success: true,
        message: 'Checked in successfully',
        attendance: newRecord,
        action: 'checkin'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Mark attendance (Admin only)
router.post('/mark', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, date, and status are required'
      });
    }

    // Check if record exists
    const existingIndex = db.attendance.findIndex(
      r => r.employeeId === employeeId && r.date === date
    );

    const record = {
      id: existingIndex >= 0 ? db.attendance[existingIndex].id : `ATT${Date.now()}`,
      employeeId,
      date,
      status,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      hoursWorked: 0
    };

    // Calculate hours if both times are present
    if (checkIn && checkOut) {
      const checkInTime = new Date(`${date}T${checkIn}:00`);
      const checkOutTime = new Date(`${date}T${checkOut}:00`);
      const hoursWorked = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2);
      record.hoursWorked = parseFloat(hoursWorked);
    }

    if (existingIndex >= 0) {
      db.attendance[existingIndex] = record;
    } else {
      db.attendance.push(record);
    }

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get today's attendance status
router.get('/today', authMiddleware, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const record = db.attendance.find(
      r => r.employeeId === req.user.id && r.date === today
    );

    res.json({
      success: true,
      attendance: record || null,
      hasCheckedIn: !!record,
      hasCheckedOut: record ? !!record.checkOut : false
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
