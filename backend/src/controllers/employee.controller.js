const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EmployeeController {
  // Get all employees
  async getAllEmployees(req, res) {
    try {
      const { page = 1, limit = 10, status, departmentId, search } = req.query;
      
      const where = {};
      if (status) where.status = status;
      if (departmentId) where.departmentId = parseInt(departmentId);
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { employeeCode: { contains: search, mode: 'insensitive' } },
          { workEmail: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          include: {
            department: true,
            jobPosition: true,
            manager: { select: { id: true, name: true, employeeCode: true } }
          },
          skip: (page - 1) * limit,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.employee.count({ where })
      ]);
      
      res.json({
        success: true,
        data: employees,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching employees',
        error: error.message
      });
    }
  }
  
  // Get employee by ID
  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: { select: { email: true, role: true, isActive: true } },
          department: true,
          jobPosition: true,
          manager: { select: { id: true, name: true, employeeCode: true } },
          subordinates: { select: { id: true, name: true, employeeCode: true } },
          attendance: { take: 10, orderBy: { date: 'desc' } },
          leaves: { take: 5, orderBy: { createdAt: 'desc' } }
        }
      });
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching employee',
        error: error.message
      });
    }
  }
  
  // Create employee
  async createEmployee(req, res) {
    try {
      const employeeData = req.body;
      
      // Generate employee code
      const lastEmployee = await prisma.employee.findFirst({
        orderBy: { id: 'desc' }
      });
      const nextNumber = lastEmployee ? parseInt(lastEmployee.employeeCode.replace('EMP', '')) + 1 : 1;
      const employeeCode = `EMP${String(nextNumber).padStart(5, '0')}`;
      
      const employee = await prisma.employee.create({
        data: {
          ...employeeData,
          employeeCode,
          dateOfJoining: new Date(employeeData.dateOfJoining)
        },
        include: {
          department: true,
          jobPosition: true
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating employee',
        error: error.message
      });
    }
  }
  
  // Update employee
  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const employee = await prisma.employee.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          department: true,
          jobPosition: true
        }
      });
      
      res.json({
        success: true,
        message: 'Employee updated successfully',
        data: employee
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating employee',
        error: error.message
      });
    }
  }
  
  // Delete employee
  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.employee.delete({
        where: { id: parseInt(id) }
      });
      
      res.json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting employee',
        error: error.message
      });
    }
  }
  
  // Get employee statistics
  async getStatistics(req, res) {
    try {
      const [total, active, inactive, onLeave, byDepartment] = await Promise.all([
        prisma.employee.count(),
        prisma.employee.count({ where: { status: 'ACTIVE' } }),
        prisma.employee.count({ where: { status: 'INACTIVE' } }),
        prisma.employee.count({ where: { status: 'ON_LEAVE' } }),
        prisma.employee.groupBy({
          by: ['departmentId'],
          _count: true
        })
      ]);
      
      res.json({
        success: true,
        data: {
          total,
          active,
          inactive,
          onLeave,
          byDepartment
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }
}

module.exports = new EmployeeController();
