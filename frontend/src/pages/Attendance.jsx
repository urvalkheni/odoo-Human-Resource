import { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext'
import Layout from '../components/Layout'
import api from '../utils/api'
import './Attendance.css'

function Attendance() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState([])
  const [filter, setFilter] = useState({
    employeeId: user?.id,
    startDate: '',
    endDate: '',
  })
  const [todayStatus, setTodayStatus] = useState(null)

  useEffect(() => {
    fetchAttendance()
    if (!isAdmin()) {
      fetchTodayStatus()
    }
  }, [filter])

  const fetchAttendance = async () => {
    try {
      const params = isAdmin() ? filter : { employeeId: user.id }
      const response = await api.getAttendance(params)
      setAttendance(response.attendance)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayStatus = async () => {
    try {
      const response = await api.getTodayAttendance()
      setTodayStatus(response)
    } catch (error) {
      console.error('Error fetching today status:', error)
    }
  }

  const handleCheckInOut = async () => {
    try {
      const response = await api.checkIn()
      alert(response.message)
      fetchAttendance()
      fetchTodayStatus()
    } catch (error) {
      alert(error.message)
    }
  }

  const getWeekDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const weekDates = getWeekDates()
  const weekAttendance = weekDates.map(date => {
    const record = attendance.find(a => a.date === date)
    return { date, record }
  })

  return (
    <Layout>
      <div className="attendance-container">
        <div className="page-header">
          <h1>Attendance Management</h1>
          {!isAdmin() && todayStatus && (
            <button
              onClick={handleCheckInOut}
              className={`btn ${
                todayStatus.hasCheckedOut
                  ? 'btn-secondary'
                  : todayStatus.hasCheckedIn
                  ? 'btn-danger'
                  : 'btn-success'
              }`}
              disabled={todayStatus.hasCheckedOut}
            >
              {todayStatus.hasCheckedOut
                ? 'Checked Out'
                : todayStatus.hasCheckedIn
                ? 'Check Out'
                : 'Check In'}
            </button>
          )}
        </div>

        {/* Week View */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">This Week</h2>
          </div>
          <div className="card-body">
            <div className="week-grid">
              {weekAttendance.map(({ date, record }) => {
                const dayName = new Date(date).toLocaleDateString('en-US', {
                  weekday: 'short',
                })
                const dayDate = new Date(date).getDate()
                const isToday = date === new Date().toISOString().split('T')[0]

                return (
                  <div
                    key={date}
                    className={`week-day ${isToday ? 'today' : ''}`}
                  >
                    <div className="week-day-header">
                      <div className="week-day-name">{dayName}</div>
                      <div className="week-day-date">{dayDate}</div>
                    </div>
                    <div className="week-day-status">
                      {record ? (
                        <>
                          <span
                            className={`badge badge-${
                              record.status === 'present'
                                ? 'success'
                                : record.status === 'absent'
                                ? 'danger'
                                : record.status === 'half-day'
                                ? 'warning'
                                : 'info'
                            }`}
                          >
                            {record.status}
                          </span>
                          {record.checkIn && (
                            <div className="week-day-time">
                              {record.checkIn}
                              {record.checkOut && ` - ${record.checkOut}`}
                            </div>
                          )}
                          {record.hoursWorked > 0 && (
                            <div className="week-day-hours">
                              {record.hoursWorked}h
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-secondary">-</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Attendance Records</h2>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length > 0 ? (
                    attendance
                      .slice()
                      .reverse()
                      .map(record => (
                        <tr key={record.id}>
                          <td>{record.date}</td>
                          <td>{record.checkIn || '-'}</td>
                          <td>{record.checkOut || '-'}</td>
                          <td>
                            {record.hoursWorked > 0
                              ? `${record.hoursWorked}h`
                              : '-'}
                          </td>
                          <td>
                            <span
                              className={`badge badge-${
                                record.status === 'present'
                                  ? 'success'
                                  : record.status === 'absent'
                                  ? 'danger'
                                  : record.status === 'half-day'
                                  ? 'warning'
                                  : 'info'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-secondary">
                        No attendance records found
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

export default Attendance
