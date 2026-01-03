import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../utils/AuthContext'
import Layout from '../components/Layout'
import './ProfileEnhanced.css'

const API_URL = 'http://localhost:5000/api'

function ProfileEnhanced() {
  const { user: authUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [imagePreview, setImagePreview] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [skills, setSkills] = useState([
    'JavaScript',
    'React',
    'Node.js',
    'Python',
  ])
  const [newSkill, setNewSkill] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/employees/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        setFormData(data.user)
        setImagePreview(
          data.user.profilePicture
            ? `${API_URL.replace('/api', '')}${data.user.profilePicture}`
            : null
        )
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
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

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Upload immediately
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
        setMessage({
          type: 'success',
          text: 'Profile picture updated successfully!',
        })
        setImagePreview(`${API_URL.replace('/api', '')}${data.profilePicture}`)
        fetchProfile()
      } else {
        setMessage({ type: 'error', text: data.message || 'Upload failed' })
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
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setEditing(false)
        fetchProfile()
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    }
  }

  if (loading) {
    return (
      <div className="profile-enhanced-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-enhanced-page">
      <div className="profile-header-section">
        <div className="header-content">
          <h1>My Profile</h1>
          <p>Manage your personal information and settings</p>
        </div>
        {!editing && (
          <button className="edit-profile-btn" onClick={() => setEditing(true)}>
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

      {message.text && (
        <div className={`message-alert ${message.type}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            {message.type === 'success' ? (
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          {message.text}
        </div>
      )}

      <div className="profile-grid">
        {/* Profile Picture Card */}
        <div className="profile-card profile-picture-card">
          <div className="card-header">
            <h2>Profile Picture</h2>
          </div>
          <div className="picture-section">
            <div className="picture-wrapper">
              <div className="picture-container">
                {uploading && (
                  <div className="upload-overlay">
                    <div className="upload-spinner"></div>
                  </div>
                )}
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" />
                ) : (
                  <div className="picture-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                className="change-picture-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
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
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>
            <div className="picture-info">
              <p className="picture-hint">Upload a professional photo</p>
              <p className="picture-requirements">
                • JPG, PNG, GIF or WEBP
                <br />
                • Maximum size: 5MB
                <br />• Recommended: 400x400px
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="profile-card personal-info-card">
          <div className="card-header">
            <h2>Personal Information</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="form-input"
                    disabled
                  />
                ) : (
                  <p className="form-value">{user?.name}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="form-input"
                    disabled
                  />
                ) : (
                  <p className="form-value">{user?.email}</p>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="form-value">{user?.phone || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Department</label>
                <p className="form-value">
                  {user?.department || 'Not assigned'}
                </p>
              </div>

              <div className="form-group">
                <label>Position</label>
                <p className="form-value">{user?.position || 'Not assigned'}</p>
              </div>

              <div className="form-group">
                <label>Role</label>
                <p className="form-value role-badge">
                  <span className={`badge ${user?.role}`}>{user?.role}</span>
                </p>
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                {editing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="form-value">
                    {user?.address || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {editing && (
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false)
                    setFormData(user)
                    setMessage({ type: '', text: '' })
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Details Card */}
        <div className="profile-card account-details-card">
          <div className="card-header">
            <h2>Account Details</h2>
          </div>
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 2v2a6 6 0 0 0 3.697 5.535a0.99.99 0 0 1.382.83c0 .087.011.17.011.267v1.242L12.505 13.5a0.75.75 0 0 1-1.01 0L9.91 11.874v-1.242c0-.097.01-.18.011-.267a0.99.99 0 0 1 .382-.83A6 6 0 0 0 14 4V2a8 8 0 0 1-8 8v2c0 .363.097.704.268.997M15 10.803a0.75.75 0 0 1 1.5 0v5.644a0.75.75 0 0 1-1.5 0v-5.644zM7.5 10.803a0.75.75 0 0 1 1.5 0v5.644a0.75.75 0 0 1-1.5 0v-5.644z" />
                </svg>
              </div>
              <div className="detail-content">
                <h4>Employee ID</h4>
                <p>{user?.employeeId || user?.id}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="detail-content">
                <h4>Join Date</h4>
                <p>
                  {user?.joinDate
                    ? new Date(user.joinDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="detail-content">
                <h4>Account Status</h4>
                <p>
                  <span className={`status-badge ${user?.status || 'active'}`}>
                    {user?.status || 'Active'}
                  </span>
                </p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="detail-content">
                <h4>Last Updated</h4>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="profile-card stats-card">
          <div className="card-header">
            <h2>Quick Stats</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon attendance">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <h4>Attendance</h4>
                <p className="stat-value">96.5%</p>
                <span className="stat-label">This month</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon leaves">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="stat-content">
                <h4>Leave Balance</h4>
                <p className="stat-value">12 days</p>
                <span className="stat-label">Remaining</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon performance">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="stat-content">
                <h4>Performance</h4>
                <p className="stat-value">Excellent</p>
                <span className="stat-label">Last review</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon tasks">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="stat-content">
                <h4>Active Tasks</h4>
                <p className="stat-value">8</p>
                <span className="stat-label">In progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileEnhanced
