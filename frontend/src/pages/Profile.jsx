import { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext'
import Layout from '../components/Layout'
import api from '../utils/api'
import './Profile.css'

function Profile() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.getProfile()
      setProfile(response.user)
      setFormData(response.user)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSalaryChange = e => {
    setFormData({
      ...formData,
      salary: {
        ...formData.salary,
        [e.target.name]: parseFloat(e.target.value) || 0,
      },
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setMessage('')

    try {
      // Calculate net salary if admin is updating salary
      if (isAdmin() && formData.salary) {
        formData.salary.netSalary =
          (formData.salary.basic || 0) +
          (formData.salary.hra || 0) +
          (formData.salary.allowances || 0) -
          (formData.salary.deductions || 0)
      }

      await api.updateEmployee(user.id, formData)
      setMessage('Profile updated successfully!')
      setEditing(false)
      fetchProfile()
    } catch (error) {
      setMessage('Error updating profile: ' + error.message)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div
            className={`alert ${
              message.includes('Error') ? 'alert-danger' : 'alert-success'
            }`}
          >
            {message}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Personal Information</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.id}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isAdmin()}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isAdmin()}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isAdmin() && (
              <>
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Job Information</h2>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-2">
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <input
                          type="text"
                          name="department"
                          className="form-input"
                          value={formData.department}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Position</label>
                        <input
                          type="text"
                          name="position"
                          className="form-input"
                          value={formData.position}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Join Date</label>
                        <input
                          type="date"
                          name="joinDate"
                          className="form-input"
                          value={formData.joinDate}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                          name="role"
                          className="form-select"
                          value={formData.role}
                          onChange={handleChange}
                        >
                          <option value="employee">Employee</option>
                          <option value="hr">HR Officer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Salary Information</h2>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-2">
                      <div className="form-group">
                        <label className="form-label">Basic Salary</label>
                        <input
                          type="number"
                          name="basic"
                          className="form-input"
                          value={formData.salary?.basic || 0}
                          onChange={handleSalaryChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">HRA</label>
                        <input
                          type="number"
                          name="hra"
                          className="form-input"
                          value={formData.salary?.hra || 0}
                          onChange={handleSalaryChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Allowances</label>
                        <input
                          type="number"
                          name="allowances"
                          className="form-input"
                          value={formData.salary?.allowances || 0}
                          onChange={handleSalaryChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Deductions</label>
                        <input
                          type="number"
                          name="deductions"
                          className="form-input"
                          value={formData.salary?.deductions || 0}
                          onChange={handleSalaryChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="profile-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData(profile)
                  setMessage('')
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-view">
              <div className="profile-avatar-section">
                <img
                  src={profile.profilePicture}
                  alt={profile.name}
                  className="profile-avatar"
                />
                <h2>{profile.name}</h2>
                <p className="text-secondary">
                  {profile.position || 'Employee'}
                </p>
                <span
                  className={`badge badge-${
                    profile.role === 'admin'
                      ? 'danger'
                      : profile.role === 'hr'
                      ? 'warning'
                      : 'info'
                  }`}
                >
                  {profile.role}
                </span>
              </div>

              <div className="profile-details">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Personal Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Employee ID</span>
                        <span className="info-value">{profile.id}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{profile.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Phone</span>
                        <span className="info-value">
                          {profile.phone || 'Not provided'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Address</span>
                        <span className="info-value">
                          {profile.address || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Job Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Department</span>
                        <span className="info-value">
                          {profile.department || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Position</span>
                        <span className="info-value">
                          {profile.position || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Join Date</span>
                        <span className="info-value">{profile.joinDate}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Role</span>
                        <span
                          className="info-value"
                          style={{ textTransform: 'capitalize' }}
                        >
                          {profile.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Profile
