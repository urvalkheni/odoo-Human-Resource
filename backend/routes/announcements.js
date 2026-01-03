import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { db, addAnnouncement } from '../models/database.js'

const router = Router()
const JWT_SECRET = 'your-secret-key-change-in-production'

// Middleware to verify token
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

// Get all announcements
router.get('/', authenticate, (req, res) => {
  try {
    const announcements = [...db.announcements].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
    res.json({ success: true, announcements })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Create announcement (admin only)
router.post('/', authenticate, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' })
    }

    const { title, message, priority, type } = req.body

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' })
    }

    const announcement = {
      id: `ANN${Date.now()}`,
      title,
      message,
      priority: priority || 'normal',
      type: type || 'general',
      author: req.user.name,
      createdAt: new Date().toISOString()
    }

    addAnnouncement(announcement)
    console.log('📢 New announcement created:', announcement.id)

    res.json({ success: true, announcement })
  } catch (error) {
    console.error('Error creating announcement:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router
