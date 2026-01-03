import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../utils/AuthContext'
import { useNotifications } from '../utils/NotificationContext'
import Layout from '../components/Layout'
import Toast from '../components/Toast'
import './ProfilePremium.css'

const API_URL = 'http://localhost:5000/api'

function ProfilePremium() {
  const { user: authUser, refreshUser } = useAuth()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [imagePreview, setImagePreview] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [skills, setSkills] = useState([
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'MongoDB',
  ])
  const [newSkill, setNewSkill] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' })
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/employees/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        setFormData(data.user)
        setImagePreview(
          data.user.profilePicture
            ? `${API_URL.replace('/api', '')}${data.user.profilePicture}`
            : null
        )
        setMessage({ type: '', text: '' })
      } else {
        throw new Error(data.message || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({
        type: 'error',
        text: 'Cannot connect to server. Using cached data.',
      })
      // Fallback to authUser data from context
      if (authUser) {
        setUser(authUser)
        setFormData(authUser)
        setImagePreview(
          authUser.profilePicture
            ? `${API_URL.replace('/api', '')}${authUser.profilePicture}`
            : null
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = e => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      handleImageUpload(file)
    }
  }

  const handleImageUpload = async file => {
    setUploading(true)
    const formData = new FormData()
    formData.append('profilePicture', file)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/employees/profile/picture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: '✓ Profile picture updated!' })
        setToast({
          show: true,
          message: 'Profile picture updated successfully!',
          type: 'success',
        })
        setImagePreview(`${API_URL.replace('/api', '')}${data.profilePicture}`)

        // Update local storage and context
        const updatedUser = { ...authUser, profilePicture: data.profilePicture }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        fetchProfile()
        if (refreshUser) refreshUser()

        addNotification({
          title: 'Profile Updated',
          message: 'Your profile picture has been updated',
          type: 'approval',
        })

        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Upload failed' })
        setToast({
          show: true,
          message: data.message || 'Upload failed',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage({ type: 'error', text: 'Failed to upload image' })
    } finally {
      setUploading(false)
    }
  }

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/employees/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: '✓ Profile updated successfully!' })
        setToast({
          show: true,
          message: 'Profile updated successfully!',
          type: 'success',
        })
        setEditing(false)

        // Update local storage
        const updatedUser = { ...authUser, ...data.employee }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        fetchProfile()
        if (refreshUser) refreshUser()

        addNotification({
          title: 'Profile Updated',
          message: 'Your profile information has been updated',
          type: 'approval',
        })

        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' })
        setToast({
          show: true,
          message: data.message || 'Update failed',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = skillToRemove => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const calculateProfileCompletion = () => {
    const fields = [
      user?.name,
      user?.email,
      user?.phone,
      user?.address,
      user?.department,
      user?.position,
      user?.profilePicture,
      skills.length > 0,
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  if (loading) {
    return (
      <Layout>
        <div className="premium-loading">
          <div className="loading-circle"></div>
          <p>Loading your profile...</p>
        </div>
      </Layout>
    )
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <Layout>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
      <div className="profile-premium">
        {/* Animated Background */}
        <div className="profile-bg-animation">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
        </div>

        {/* Header Section */}
        <div className="profile-hero">
          <div className="hero-backdrop"></div>
          <div className="hero-content">
            <div className="profile-image-wrapper">
              <div className="profile-image-container">
                {uploading && (
                  <div className="upload-progress">
                    <div className="progress-spinner"></div>
                  </div>
                )}
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="profile-avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                <button
                  className="camera-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="profile-completion">
                <svg className="completion-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="ring-bg" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="ring-progress"
                    style={{
                      strokeDasharray: `${(283 * profileCompletion) / 100} 283`,
                    }}
                  />
                </svg>
                <div className="completion-text">{profileCompletion}%</div>
              </div>
            </div>

            <div className="hero-info">
              <h1 className="profile-name">{user?.name || 'User Name'}</h1>
              <p className="profile-role">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                </svg>
                {user?.position || 'Position'} •{' '}
                {user?.department || 'Department'}
              </p>
              <div className="profile-meta">
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {user?.status || 'Active'}
                </span>
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                  </svg>
                  ID: {user?.employeeId || user?.id}
                </span>
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {user?.address ? user.address.split(',')[0] : 'Location'}
                </span>
              </div>

              {!editing && (
                <button
                  className="edit-hero-btn"
                  onClick={() => setEditing(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats">
            <div className="stat-box">
              <div className="stat-icon attendance-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">96.5%</span>
                <span className="stat-label">Attendance</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon leaves-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">12 days</span>
                <span className="stat-label">Leave Balance</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon performance-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">Excellent</span>
                <span className="stat-label">Performance</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon tasks-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">8 Active</span>
                <span className="stat-label">Tasks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`premium-alert ${message.type}`}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              {message.type === 'success' ? (
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 13h6a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1zm0 8h6a1 1 0 001-1v-4a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1zm10 0h6a1 1 0 001-1v-8a1 1 0 00-1-1h-6a1 1 0 00-1 1v8a1 1 0 001 1zM13 4v4a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1h-6a1 1 0 00-1 1z" />
            </svg>
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Personal Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
            Skills
          </button>
          <button
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
            </svg>
            Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-grid">
              <div className="info-card glass-card">
                <div className="card-header-premium">
                  <h3>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Quick Info
                  </h3>
                </div>
                <div className="info-list">
                  <div className="info-row">
                    <span className="info-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </span>
                    <div className="info-content">
                      <span className="info-label">Email</span>
                      <span className="info-value">
                        {user?.email || 'Not provided'}
                      </span>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </span>
                    <div className="info-content">
                      <span className="info-label">Phone</span>
                      <span className="info-value">
                        {user?.phone || 'Not provided'}
                      </span>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                      </svg>
                    </span>
                    <div className="info-content">
                      <span className="info-label">Department</span>
                      <span className="info-value">
                        {user?.department || 'Not assigned'}
                      </span>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    </span>
                    <div className="info-content">
                      <span className="info-label">Location</span>
                      <span className="info-value">
                        {user?.address || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="achievements-card glass-card">
                <div className="card-header-premium">
                  <h3>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    Achievements
                  </h3>
                </div>
                <div className="achievements-grid">
                  <div className="achievement-badge">
                    <div className="badge-icon gold">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <span>Top Performer</span>
                  </div>
                  <div className="achievement-badge">
                    <div className="badge-icon silver">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span>Perfect Attendance</span>
                  </div>
                  <div className="achievement-badge">
                    <div className="badge-icon bronze">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                      </svg>
                    </div>
                    <span>Team Player</span>
                  </div>
                  <div className="achievement-badge">
                    <div className="badge-icon platinum">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18z" />
                      </svg>
                    </div>
                    <span>Fast Learner</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="details-card glass-card">
              <form onSubmit={handleSubmit}>
                <div className="form-grid-premium">
                  <div className="form-group-premium">
                    <label>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="premium-input"
                        disabled
                      />
                    ) : (
                      <div className="value-display">
                        {user?.name || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="form-group-premium">
                    <label>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                      Email Address
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="premium-input"
                        disabled
                      />
                    ) : (
                      <div className="value-display">
                        {user?.email || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="form-group-premium">
                    <label>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="premium-input"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="value-display">
                        {user?.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="form-group-premium">
                    <label>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                      </svg>
                      Department
                    </label>
                    <div className="value-display">
                      {user?.department || 'Not assigned'}
                    </div>
                  </div>

                  <div className="form-group-premium">
                    <label>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      Position
                    </label>
                    <div className="value-display">
                      {user?.position || 'Not assigned'}
                    </div>
                  </div>

                  <div className="form-group-premium">
                    <label>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      Role
                    </label>
                    <div className="value-display">
                      <span className={`role-badge-premium ${user?.role}`}>
                        {user?.role || 'employee'}
                      </span>
                    </div>
                  </div>

                  <div className="form-group-premium full-width">
                    <label>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      Address
                    </label>
                    {editing ? (
                      <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        className="premium-input"
                        rows="3"
                        placeholder="Enter your address"
                      />
                    ) : (
                      <div className="value-display">
                        {user?.address || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="form-actions-premium">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setEditing(false)
                        setFormData(user)
                        setMessage({ type: '', text: '' })
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                      Cancel
                    </button>
                    <button type="submit" className="btn-save">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                      </svg>
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="skills-card glass-card">
              <div className="card-header-premium">
                <h3>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                  </svg>
                  Technical Skills
                </h3>
              </div>
              <div className="skills-container">
                <div className="skills-list">
                  {skills.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      <span>{skill}</span>
                      <button
                        className="remove-skill"
                        onClick={() => removeSkill(skill)}
                        type="button"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-skill-form">
                  <input
                    type="text"
                    className="skill-input"
                    placeholder="Add a new skill..."
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={e =>
                      e.key === 'Enter' && (e.preventDefault(), addSkill())
                    }
                  />
                  <button
                    className="add-skill-btn"
                    onClick={addSkill}
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    Add Skill
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-card glass-card">
              <div className="card-header-premium">
                <h3>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                  </svg>
                  Recent Activity
                </h3>
              </div>
              <div className="activity-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot success"></div>
                  <div className="timeline-content">
                    <h4>Logged in to system</h4>
                    <p>Accessed the HRMS dashboard</p>
                    <span className="timeline-time">Today, 9:30 AM</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot info"></div>
                  <div className="timeline-content">
                    <h4>Profile updated</h4>
                    <p>Updated contact information</p>
                    <span className="timeline-time">Yesterday, 3:15 PM</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot warning"></div>
                  <div className="timeline-content">
                    <h4>Leave request submitted</h4>
                    <p>Applied for 2 days vacation leave</p>
                    <span className="timeline-time">2 days ago, 11:20 AM</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot success"></div>
                  <div className="timeline-content">
                    <h4>Task completed</h4>
                    <p>Finished Q1 report submission</p>
                    <span className="timeline-time">3 days ago, 5:45 PM</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot info"></div>
                  <div className="timeline-content">
                    <h4>Attendance marked</h4>
                    <p>Checked in at office</p>
                    <span className="timeline-time">5 days ago, 9:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePremium
