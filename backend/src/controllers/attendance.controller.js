const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AttendanceController {
  // Check-in
  async checkIn(req, res) {
    try {
      const employeeId = req.user.employee.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if already checked in
      const existing = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId,
            date: today
          }
        }
      });
      
      if (existing && existing.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'Already checked in today'
        });
      }
      
      const attendance = await prisma.attendance.upsert({
        where: {
          employeeId_date: { employeeId, date: today }
        },
        update: {
          checkIn: new Date(),
          status: 'PRESENT'
        },
        create: {
          employeeId,
          date: today,
          checkIn: new Date(),
          status: 'PRESENT'
        }
      });
      
      res.json({
        success: true,
        message: 'Checked in successfully',
        data: attendance
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Check-out
  async checkOut(req, res) {
    try {
      const employeeId = req.user.employee.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const attendance = await prisma.attendance.findUnique({
        where: {
          employeeId_date: { employeeId, date: today }
        }
      });
      
      if (!attendance || !attendance.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'Please check in first'
        });
      }
      
      if (attendance.checkOut) {
        return res.status(400).json({
          success: false,
          message: 'Already checked out today'
        });
      }
      
      const checkOutTime = new Date();
      const workHours = (checkOutTime - attendance.checkIn) / (1000 * 60 * 60);
      
      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOut: checkOutTime,
          workHours: parseFloat(workHours.toFixed(2))
        }
      });
      
      res.json({
        success: true,
        message: 'Checked out successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Get attendance records
  async getAttendance(req, res) {
    try {
      const { employeeId, startDate, endDate } = req.query;
      const where = {};
      
      if (employeeId) where.employeeId = parseInt(employeeId);
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }
      
      const attendance = await prisma.attendance.findMany({
        where,
        include: { employee: { select: { name: true, employeeCode: true } } },
        orderBy: { date: 'desc' }
      });
      
      res.json({ success: true, data: attendance });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AttendanceController();
