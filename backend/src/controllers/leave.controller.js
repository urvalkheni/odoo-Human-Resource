const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LeaveController {
  // Apply for leave
  async applyLeave(req, res) {
    try {
      const employeeId = req.user.employee.id;
      const { leaveType, startDate, endDate, reason } = req.body;
      
      // Calculate total days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;
      
      const leave = await prisma.leave.create({
        data: {
          employeeId,
          leaveType,
          startDate: start,
          endDate: end,
          totalDays,
          reason
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Leave application submitted',
        data: leave
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Get leaves
  async getLeaves(req, res) {
    try {
      const { employeeId, status } = req.query;
      const where = {};
      
      if (employeeId) where.employeeId = parseInt(employeeId);
      if (status) where.status = status;
      
      // If employee, only show their leaves
      if (req.user.role === 'EMPLOYEE') {
        where.employeeId = req.user.employee.id;
      }
      
      const leaves = await prisma.leave.findMany({
        where,
        include: { employee: { select: { name: true, employeeCode: true } } },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({ success: true, data: leaves });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Approve/Reject leave
  async updateLeaveStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;
      
      const updateData = {
        status,
        adminNote
      };
      
      if (status === 'APPROVED') {
        updateData.approvedBy = req.user.employee.id;
        updateData.approvedAt = new Date();
      } else if (status === 'REJECTED') {
        updateData.rejectedBy = req.user.employee.id;
        updateData.rejectedAt = new Date();
      }
      
      const leave = await prisma.leave.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      
      res.json({
        success: true,
        message: `Leave ${status.toLowerCase()}`,
        data: leave
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new LeaveController();
