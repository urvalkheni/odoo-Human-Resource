import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { db } from '../models/database.js';

const router = express.Router();

// Sign Up
router.post('/signup',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('employeeId').notEmpty().withMessage('Employee ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password, name, employeeId, role = 'employee' } = req.body;

      // Check if user already exists
      const existingUser = db.users.find(u => u.email === email || u.id === employeeId);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = {
        id: employeeId,
        email,
        password: hashedPassword,
        role,
        name,
        phone: '',
        address: '',
        department: '',
        position: '',
        joinDate: new Date().toISOString().split('T')[0],
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        salary: {
          basic: 0,
          hra: 0,
          allowances: 0,
          deductions: 0,
          netSalary: 0
        }
      };

      db.users.push(newUser);

      // Initialize leave balance
      db.leaveBalances[employeeId] = {
        paid: 20,
        sick: 10,
        unpaid: 0
      };

      // Generate token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userResponse = { ...newUser };
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: userResponse
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// Sign In
router.post('/signin',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = db.users.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userResponse = { ...user };
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userResponse
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

export default router;
