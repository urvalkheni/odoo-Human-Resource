const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PayrollController {
  // Get payroll records
  async getPayrolls(req, res) {
    try {
      const { employeeId, month, year } = req.query;
      const where = {};
      
      if (employeeId) where.employeeId = parseInt(employeeId);
      if (month) where.month = parseInt(month);
      if (year) where.year = parseInt(year);
      
      // If employee, only show their payroll
      if (req.user.role === 'EMPLOYEE') {
        where.employeeId = req.user.employee.id;
      }
      
      const payrolls = await prisma.payroll.findMany({
        where,
        include: { employee: { select: { name: true, employeeCode: true } } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }]
      });
      
      res.json({ success: true, data: payrolls });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Generate payroll
  async generatePayroll(req, res) {
    try {
      const { employeeId, month, year, basicPay, allowances, bonus, overtime, tax, providentFund, insurance, otherDeductions } = req.body;
      
      const grossPay = basicPay + (allowances || 0) + (bonus || 0) + (overtime || 0);
      const totalDeductions = (tax || 0) + (providentFund || 0) + (insurance || 0) + (otherDeductions || 0);
      const netPay = grossPay - totalDeductions;
      
      const payroll = await prisma.payroll.create({
        data: {
          employeeId,
          month,
          year,
          basicPay,
          allowances: allowances || 0,
          bonus: bonus || 0,
          overtime: overtime || 0,
          tax: tax || 0,
          providentFund: providentFund || 0,
          insurance: insurance || 0,
          otherDeductions: otherDeductions || 0,
          grossPay,
          netPay
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Payroll generated successfully',
        data: payroll
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Mark as paid
  async markAsPaid(req, res) {
    try {
      const { id } = req.params;
      
      const payroll = await prisma.payroll.update({
        where: { id: parseInt(id) },
        data: {
          isPaid: true,
          paidAt: new Date()
        }
      });
      
      res.json({
        success: true,
        message: 'Payroll marked as paid',
        data: payroll
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PayrollController();
