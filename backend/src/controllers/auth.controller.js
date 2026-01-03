const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, role, employeeData } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate employee code
      const lastEmployee = await prisma.employee.findFirst({
        orderBy: { id: 'desc' }
      });
      const nextNumber = lastEmployee ? parseInt(lastEmployee.employeeCode.replace('EMP', '')) + 1 : 1;
      const employeeCode = `EMP${String(nextNumber).padStart(5, '0')}`;
      
      // Create user and employee in transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: role || 'EMPLOYEE'
          }
        });
        
        const employee = await tx.employee.create({
          data: {
            employeeCode,
            userId: user.id,
            name: employeeData.name,
            dateOfJoining: new Date(employeeData.dateOfJoining || new Date()),
            workEmail: email,
            ...employeeData
          }
        });
        
        return { user, employee };
      });
      
      // Generate token
      const token = jwt.sign(
        { userId: result.user.id, email: result.user.email, role: result.user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role
          },
          employee: {
            id: result.employee.id,
            employeeCode: result.employee.employeeCode,
            name: result.employee.name
          },
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  }
  
  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          employee: {
            include: {
              department: true,
              jobPosition: true
            }
          }
        }
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account is inactive. Please contact admin.'
        });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          employee: user.employee ? {
            id: user.employee.id,
            employeeCode: user.employee.employeeCode,
            name: user.employee.name,
            status: user.employee.status,
            department: user.employee.department?.name,
            jobPosition: user.employee.jobPosition?.title
          } : null,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message
      });
    }
  }
  
  // Get current user
  async getMe(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          employee: {
            include: {
              department: true,
              jobPosition: true,
              manager: {
                select: {
                  id: true,
                  name: true,
                  employeeCode: true
                }
              }
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          employee: user.employee
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user data',
        error: error.message
      });
    }
  }
  
  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      });
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error changing password',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
