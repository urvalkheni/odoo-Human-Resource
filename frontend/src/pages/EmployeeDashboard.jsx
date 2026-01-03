import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import Layout from '../components/Layout'
import api from '../utils/api'
import './Dashboard.css'

function EmployeeDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    attendance: null,
    leaveBalance: null,
    recentLeaves: [],
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [attendanceRes, leaveBalanceRes, leavesRes] = await Promise.all([
        api.getTodayAttendance(),
        api.getLeaveBalance(),
        api.getLeaves(),
      ])

      setStats({
        attendance: attendanceRes.attendance,
        leaveBalance: leaveBalanceRes.balance,
        recentLeaves: leavesRes.leaves.slice(0, 5),
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckInOut = async () => {
    try {
      const response = await api.checkIn()
      alert(response.message)
      fetchDashboardData()
    } catch (error) {
      alert(error.message)
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
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p className="text-secondary">
            Here's what's happening with your work today
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="grid grid-cols-4">
          <Link to="/profile" className="dashboard-card quick-action">
            <div
              className="dashboard-icon"
              style={{ backgroundColor: '#dbeafe' }}
            >
              👤
            </div>
            <h3>My Profile</h3>
            <p>View & edit your details</p>
          </Link>

          <Link to="/attendance" className="dashboard-card quick-action">
            <div
              className="dashboard-icon"
              style={{ backgroundColor: '#dcfce7' }}
            >
              📅
            </div>
            <h3>Attendance</h3>
            <p>Track your work hours</p>
          </Link>

          <Link to="/leaves" className="dashboard-card quick-action">
            <div
              className="dashboard-icon"
              style={{ backgroundColor: '#fef3c7' }}
            >
              🏖️
            </div>
            <h3>Leave Requests</h3>
            <p>Apply for time off</p>
          </Link>

          <Link to="/payroll" className="dashboard-card quick-action">
            <div
              className="dashboard-icon"
              style={{ backgroundColor: '#f3e8ff' }}
            >
              💰
            </div>
            <h3>Payroll</h3>
            <p>View salary details</p>
          </Link>
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="dashboard-section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Today's Attendance</h2>
          </div>
          <div className="card-body">
            {stats.attendance ? (
              <div className="attendance-status">
                <div className="attendance-info">
                  <span className="badge badge-success">✓ Checked In</span>
                  <p className="mt-2">
                    Check-in: <strong>{stats.attendance.checkIn}</strong>
                    {stats.attendance.checkOut && (
                      <>
                        {' '}
                        | Check-out:{' '}
                        <strong>{stats.attendance.checkOut}</strong>
                      </>
                    )}
                  </p>
                  {stats.attendance.hoursWorked > 0 && (
                    <p className="text-secondary">
                      Hours worked: {stats.attendance.hoursWorked} hrs
                    </p>
                  )}
                </div>
                {!stats.attendance.checkOut && (
                  <button onClick={handleCheckInOut} className="btn btn-danger">
                    Check Out
                  </button>
                )}
              </div>
            ) : (
              <div className="attendance-status">
                <div className="attendance-info">
                  <span className="badge badge-warning">Not Checked In</span>
                  <p className="mt-2 text-secondary">
                    Start your workday by checking in
                  </p>
                </div>
                <button onClick={handleCheckInOut} className="btn btn-success">
                  Check In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Leave Balance */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Leave Balance</h2>
          </div>
          <div className="card-body">
            <div className="leave-balance-grid">
              <div className="leave-balance-item">
                <div className="leave-balance-value">
                  {stats.leaveBalance?.paid || 0}
                </div>
                <div className="leave-balance-label">Paid Leave</div>
              </div>
              <div className="leave-balance-item">
                <div className="leave-balance-value">
                  {stats.leaveBalance?.sick || 0}
                </div>
                <div className="leave-balance-label">Sick Leave</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Leave Requests</h2>
          </div>
          <div className="card-body">
            {stats.recentLeaves.length > 0 ? (
              <div className="leave-list">
                {stats.recentLeaves.map(leave => (
                  <div key={leave.id} className="leave-item">
                    <div>
                      <div className="leave-type">{leave.leaveType}</div>
                      <div className="leave-dates text-secondary">
                        {leave.startDate} to {leave.endDate}
                      </div>
                    </div>
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary text-center">
                No leave requests yet
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default EmployeeDashboard
