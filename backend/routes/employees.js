import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { db, updateUser, saveData } from '../models/database.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all employees (Admin only)
router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const employees = db.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get specific employee (Admin or self)
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is accessing their own profile or is admin
    if (req.user.id !== id && req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, employee: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update employee profile
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find user
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin' || req.user.role === 'hr';
    const isSelf = req.user.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // If employee, restrict what they can update
    if (!isAdmin && isSelf) {
      const allowedFields = ['phone', 'address', 'profilePicture', 'name'];
      const filteredUpdates = {};
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });
      Object.assign(db.users[userIndex], filteredUpdates);
    } else {
      // Admin can update everything except password
      const { password, ...safeUpdates } = updates;
      Object.assign(db.users[userIndex], safeUpdates);
    }

    // Save to file
    saveData(db);

    const { password, ...userWithoutPassword } = db.users[userIndex];
    res.json({
      success: true,
      message: 'Profile updated successfully',
      employee: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Upload profile picture
router.post('/profile/picture', authMiddleware, upload.single('profilePicture'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user profile picture
    const pictureUrl = `/uploads/${req.file.filename}`;
    db.users[userIndex].profilePicture = pictureUrl;

    // Save to file
    saveData(db);

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: pictureUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
