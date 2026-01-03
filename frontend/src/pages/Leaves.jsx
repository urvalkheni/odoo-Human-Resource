import { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext'
import { useNotifications } from '../utils/NotificationContext'
import Layout from '../components/Layout'
import Toast from '../components/Toast'
import api from '../utils/api'
import './Leaves.css'

function Leaves() {
  const { user, isAdmin } = useAuth()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [leaves, setLeaves] = useState([])
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [formData, setFormData] = useState({
    leaveType: 'Paid Leave',
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    fetchLeaves()
    if (!isAdmin()) {
      fetchLeaveBalance()
    }
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchLeaves()
      if (!isAdmin()) {
        fetchLeaveBalance()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await api.getLeaves()
      setLeaves(response.leaves)
    } catch (error) {
      console.error('Error fetching leaves:', error)
      // Show user-friendly error message
      if (
        error.message.includes('Token is not valid') ||
        error.message.includes('No authentication token')
      ) {
        alert('Your session has expired. Please log in again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/signin'
      } else {
        alert('Failed to load leaves: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveBalance = async () => {
    try {
      const response = await api.getLeaveBalance()
      setLeaveBalance(response.balance)
    } catch (error) {
      console.error('Error fetching leave balance:', error)
      // Don't show error popup for balance, just log it
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
    try {
      setToast({
        show: true,
        message: 'Submitting leave request...',
        type: 'info',
      })
      const result = await api.applyLeave(formData)
      setToast({
        show: true,
        message: '✅ Leave request submitted successfully!',
        type: 'success',
      })
      setShowApplyForm(false)
      setFormData({
        leaveType: 'Paid Leave',
        startDate: '',
        endDate: '',
        reason: '',
      })
      fetchLeaves()
      fetchLeaveBalance()
    } catch (error) {
      setToast({ show: true, message: `❌ ${error.message}`, type: 'error' })
    }
  }

  const handleApproval = async (leaveId, status) => {
    const comments = prompt(`Enter comments for ${status}:`)
    try {
      await api.updateLeaveStatus(leaveId, { status, comments })
      setToast({
        show: true,
        message: `✅ Leave ${status} successfully!`,
        type: 'success',
      })
      // Send notification
      addNotification({
        title: `Leave Request ${status}`,
        message: `Leave request has been ${status.toLowerCase()}`,
        type: status === 'Approved' ? 'approval' : 'rejection',
      })
      fetchLeaves()
    } catch (error) {
      setToast({ show: true, message: `❌ ${error.message}`, type: 'error' })
    }
  }

  return (
    <Layout>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
      <div className="leaves-container">
        <div className="page-header">
          <h1>Leave Management</h1>
          {!isAdmin() && (
            <button
              onClick={() => setShowApplyForm(true)}
              className="btn btn-primary"
            >
              Apply for Leave
            </button>
          )}
        </div>

        {!isAdmin() && leaveBalance && (
          <div className="leave-balance-section">
            <div className="leave-balance-card">
              <div className="balance-icon">🏖️</div>
              <div className="balance-info">
                <div className="balance-value">{leaveBalance.paid}</div>
                <div className="balance-label">Paid Leave</div>
              </div>
            </div>
            <div className="leave-balance-card">
              <div className="balance-icon">🏥</div>
              <div className="balance-info">
                <div className="balance-value">{leaveBalance.sick}</div>
                <div className="balance-label">Sick Leave</div>
              </div>
            </div>
          </div>
        )}

        {showApplyForm && (
          <div
            className="modal-overlay"
            onClick={() => setShowApplyForm(false)}
          >
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Apply for Leave</h2>
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select
                    name="leaveType"
                    className="form-select"
                    value={formData.leaveType}
                    onChange={handleChange}
                    required
                  >
                    <option value="Paid Leave">Paid Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      className="form-input"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      className="form-input"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea
                    name="reason"
                    className="form-textarea"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Enter reason for leave..."
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {isAdmin() ? 'All Leave Requests' : 'My Leave Requests'}
            </h2>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {isAdmin() && <th>Employee</th>}
                    {isAdmin() && <th>Department</th>}
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    {isAdmin() && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaves.length > 0 ? (
                    leaves
                      .slice()
                      .reverse()
                      .map(leave => (
                        <tr key={leave.id}>
                          {isAdmin() && <td>{leave.employeeName}</td>}
                          {isAdmin() && <td>{leave.employeeDepartment}</td>}
                          <td>
                            <span
                              className="badge badge-info"
                              style={{ textTransform: 'capitalize' }}
                            >
                              {leave.leaveType}
                            </span>
                          </td>
                          <td>{leave.startDate}</td>
                          <td>{leave.endDate}</td>
                          <td>{leave.days} days</td>
                          <td>
                            <span
                              className={`badge badge-${
                                leave.status === 'approved'
                                  ? 'success'
                                  : leave.status === 'rejected'
                                  ? 'danger'
                                  : 'warning'
                              }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          {isAdmin() && (
                            <td>
                              {leave.status === 'pending' && (
                                <div className="action-buttons">
                                  <button
                                    onClick={() =>
                                      handleApproval(leave.id, 'approved')
                                    }
                                    className="btn btn-sm btn-success"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleApproval(leave.id, 'rejected')
                                    }
                                    className="btn btn-sm btn-danger"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan={isAdmin() ? '8' : '6'}
                        className="text-center text-secondary"
                      >
                        No leave requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Leaves
