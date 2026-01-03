import { useState, useEffect } from 'react'
import './Announcements.css'

const API_URL = 'http://localhost:5000/api'

function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal',
    type: 'general',
  })
  const userRole = localStorage.getItem('role')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setAnnouncements(data.announcements)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        setAnnouncements(prev => [data.announcement, ...prev])
        setShowModal(false)
        setFormData({
          title: '',
          message: '',
          priority: 'normal',
          type: 'general',
        })
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case 'urgent':
        return '#ef4444'
      case 'high':
        return '#f59e0b'
      default:
        return '#6366f1'
    }
  }

  const getTypeIcon = type => {
    switch (type) {
      case 'policy':
        return '📜'
      case 'event':
        return '📅'
      case 'holiday':
        return '🏖️'
      case 'meeting':
        return '👥'
      default:
        return '📢'
    }
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="announcements-container">
      <div className="announcements-header">
        <div>
          <h1>📢 Announcements</h1>
          <p>Stay updated with company news and updates</p>
        </div>
        {userRole === 'admin' && (
          <button
            className="create-announcement-btn"
            onClick={() => setShowModal(true)}
          >
            + New Announcement
          </button>
        )}
      </div>

      <div className="announcements-list">
        {announcements.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No announcements yet</h3>
            <p>Check back later for updates</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div
              key={announcement.id}
              className="announcement-card"
              style={{
                borderLeft: `4px solid ${getPriorityColor(
                  announcement.priority
                )}`,
              }}
            >
              <div className="announcement-header-row">
                <div className="announcement-meta">
                  <span className="announcement-icon">
                    {getTypeIcon(announcement.type)}
                  </span>
                  <span className={`priority-badge ${announcement.priority}`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                  <span className="announcement-date">
                    {formatDate(announcement.createdAt)}
                  </span>
                </div>
              </div>
              <h3>{announcement.title}</h3>
              <p>{announcement.message}</p>
              <div className="announcement-footer">
                <span className="announcement-author">
                  By {announcement.author}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowModal(false)} />
          <div className="announcement-modal">
            <h2>Create New Announcement</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Enter announcement title"
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={formData.message}
                  onChange={e =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  rows="5"
                  placeholder="Enter announcement details"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={e =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="general">General</option>
                    <option value="policy">Policy</option>
                    <option value="event">Event</option>
                    <option value="holiday">Holiday</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default Announcements
