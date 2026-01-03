import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'
import './Dashboard.css'

function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    employees: [],
    pendingLeaves: [],
    todayAttendance: [],
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, leavesRes, attendanceRes] = await Promise.all([
        api.getEmployees(),
        api.getLeaves(),
        api.getAttendance(),
      ])

      const today = new Date().toISOString().split('T')[0]
      const todayAttendance = attendanceRes.attendance.filter(
        a => a.date === today
      )
      const pendingLeaves = leavesRes.leaves.filter(l => l.status === 'pending')

      setStats({
        employees: employeesRes.employees,
        pendingLeaves,
        todayAttendance,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const totalEmployees = stats.employees.length
    const presentToday = stats.todayAttendance.filter(
      a => a.status === 'present'
    ).length
    const attendanceRate =
      totalEmployees > 0
        ? ((presentToday / totalEmployees) * 100).toFixed(1)
        : 0

    return {
      totalEmployees,
      presentToday,
      absentToday: totalEmployees - presentToday,
      pendingLeaves: stats.pendingLeaves.length,
      attendanceRate,
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

  const calculatedStats = calculateStats()

  return (
    <Layout>
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard 📊</h1>
          <p className="text-secondary">Overview of your organization</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-section">
        <div className="grid grid-cols-4">
          <div className="stats-card">
            <div className="stats-icon" style={{ backgroundColor: '#dbeafe' }}>
              👥
            </div>
            <div className="stats-content">
              <div className="stats-value">
                {calculatedStats.totalEmployees}
              </div>
              <div className="stats-label">Total Employees</div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon" style={{ backgroundColor: '#dcfce7' }}>
              ✓
            </div>
            <div className="stats-content">
              <div className="stats-value">{calculatedStats.presentToday}</div>
              <div className="stats-label">Present Today</div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon" style={{ backgroundColor: '#fee2e2' }}>
              ✗
            </div>
            <div className="stats-content">
              <div className="stats-value">{calculatedStats.absentToday}</div>
              <div className="stats-label">Absent Today</div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon" style={{ backgroundColor: '#fef3c7' }}>
              ⏳
            </div>
            <div className="stats-content">
              <div className="stats-value">{calculatedStats.pendingLeaves}</div>
              <div className="stats-label">Pending Approvals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-4">
          <Link to="/admin/employees" className="dashboard-card quick-action">
            <div
              className="dashboard-icon"
              style={{ backgroundColor: '#dbeafe' }}
            >
              👥
            </div>
            <h3>Manage Employees</h3>
            <p>View and edit employee details</p>
          </Link>

          <Link to="/admin/attendance" className="dashboard-card quick-action">
            <div
              className="dashboard-icon"
              style={{ backgroundColor: '#dcfce7' }}
            >
              📅
            </div>
            <h3>Attendance</h3>
            <p>Mark and track attendance</p>
          </Link>

          <Link to="/admin/leaves" className="dashboard-card quick-action">
            <div
              className="dashboard-icon"
              style={{ backgroundColor: '#fef3c7' }}
            >
              🏖️
            </div>
            <h3>Leave Approvals</h3>
            <p>Approve or reject requests</p>
          </Link>

          <Link to="/admin/payroll" className="dashboard-card quick-action">
            <div
              className="dashboard-icon"
              style={{ backgroundColor: '#f3e8ff' }}
            >
              💰
            </div>
            <h3>Payroll</h3>
            <p>Manage salary structures</p>
          </Link>
        </div>
      </div>

      {/* Pending Leave Requests */}
      <div className="dashboard-section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pending Leave Requests</h2>
            <Link to="/admin/leaves" className="btn btn-sm btn-primary">
              View All
            </Link>
          </div>
          <div className="card-body">
            {stats.pendingLeaves.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pendingLeaves.slice(0, 5).map(leave => (
                      <tr key={leave.id}>
                        <td>{leave.employeeName}</td>
                        <td>{leave.employeeDepartment}</td>
                        <td>
                          <span className="badge badge-info">
                            {leave.leaveType}
                          </span>
                        </td>
                        <td>
                          {leave.startDate} to {leave.endDate}
                        </td>
                        <td>{leave.days} days</td>
                        <td>
                          <span className="badge badge-warning">
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-secondary text-center">
                No pending leave requests
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="dashboard-section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Employees</h2>
            <Link to="/admin/employees" className="btn btn-sm btn-primary">
              View All
            </Link>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.employees.slice(0, 5).map(employee => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <img
                            src={employee.profilePicture}
                            alt={employee.name}
                            className="employee-avatar-sm"
                          />
                          {employee.name}
                        </div>
                      </td>
                      <td>{employee.department || 'N/A'}</td>
                      <td>{employee.position || 'N/A'}</td>
                      <td>
                        <span
                          className={`badge ${
                            employee.role === 'admin'
                              ? 'badge-danger'
                              : employee.role === 'hr'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}
                        >
                          {employee.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
