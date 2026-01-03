import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  exportToPDF,
  exportToExcel,
  exportAttendanceReport,
  exportLeaveReport,
  exportPayrollReport,
} from '../utils/exportUtils'
import Layout from '../components/Layout'
import './Reports.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const API_URL = 'http://localhost:5000/api'

function Reports() {
  const [timeRange, setTimeRange] = useState('week')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [attendanceData, setAttendanceData] = useState(null)
  const [leaveData, setLeaveData] = useState(null)
  const [performanceData, setPerformanceData] = useState(null)
  const [payrollData, setPayrollData] = useState(null)
  const [insights, setInsights] = useState([])

  // Fetch all analytics data
  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      // Fetch all data in parallel
      const [
        overviewRes,
        attendanceRes,
        leaveRes,
        performanceRes,
        payrollRes,
        insightsRes,
      ] = await Promise.all([
        fetch(`${API_URL}/reports/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reports/attendance-trend?period=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reports/leave-distribution`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reports/department-performance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reports/payroll-trend`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reports/insights`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const overviewData = await overviewRes.json()
      const attendanceTrendData = await attendanceRes.json()
      const leaveDistData = await leaveRes.json()
      const perfData = await performanceRes.json()
      const payrollTrendData = await payrollRes.json()
      const insightsData = await insightsRes.json()

      if (overviewData.success) setOverview(overviewData.data)

      if (attendanceTrendData.success) {
        setAttendanceData({
          labels: attendanceTrendData.data.labels,
          datasets: [
            {
              label: 'Present',
              data: attendanceTrendData.data.datasets[0].data,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Absent',
              data: attendanceTrendData.data.datasets[1].data,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
            },
          ],
        })
      }

      if (leaveDistData.success) {
        setLeaveData({
          labels: leaveDistData.data.labels,
          datasets: [
            {
              data: leaveDistData.data.values,
              backgroundColor: ['#667eea', '#f093fb', '#4ade80', '#fbbf24'],
              borderWidth: 0,
            },
          ],
        })
      }

      if (perfData.success) {
        setPerformanceData({
          labels: perfData.data.labels,
          datasets: [
            {
              label: 'Productivity Score',
              data: perfData.data.scores,
              backgroundColor: 'rgba(102, 126, 234, 0.8)',
              borderColor: '#667eea',
              borderWidth: 1,
            },
          ],
        })
      }

      if (payrollTrendData.success) {
        setPayrollData({
          labels: payrollTrendData.data.labels,
          datasets: [
            {
              label: 'Total Payroll (in thousands)',
              data: payrollTrendData.data.values,
              borderColor: '#f5576c',
              backgroundColor: 'rgba(245, 87, 108, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        })
      }

      if (insightsData.success) setInsights(insightsData.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  }

  if (loading) {
    return (
      <Layout>
        <div className="reports-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const handleExportPDF = type => {
    let reportData
    let title

    switch (type) {
      case 'attendance':
        const attendance = db.attendance || []
        reportData = exportAttendanceReport(attendance)
        title = 'Attendance Report'
        break
      case 'leaves':
        const leaves = db.leaves || []
        reportData = exportLeaveReport(leaves)
        title = 'Leave Report'
        break
      case 'payroll':
        const users = db.users || []
        const payroll = users.map(u => ({
          employeeId: u.id,
          name: u.name,
          basicSalary: u.salary?.basic || 0,
          hra: u.salary?.hra || 0,
          allowances: u.salary?.allowances || 0,
          deductions: u.salary?.deductions || 0,
          netSalary: u.salary?.netSalary || 0,
        }))
        reportData = exportPayrollReport(payroll)
        title = 'Payroll Report'
        break
    }

    exportToPDF(reportData.data, title, reportData.headers)
  }

  const handleExportExcel = type => {
    let reportData
    let title

    switch (type) {
      case 'attendance':
        const attendance = db.attendance || []
        reportData = exportAttendanceReport(attendance)
        title = 'Attendance Report'
        break
      case 'leaves':
        const leaves = db.leaves || []
        reportData = exportLeaveReport(leaves)
        title = 'Leave Report'
        break
      case 'payroll':
        const users = db.users || []
        const payroll = users.map(u => ({
          employeeId: u.id,
          name: u.name,
          basicSalary: u.salary?.basic || 0,
          hra: u.salary?.hra || 0,
          allowances: u.salary?.allowances || 0,
          deductions: u.salary?.deductions || 0,
          netSalary: u.salary?.netSalary || 0,
        }))
        reportData = exportPayrollReport(payroll)
        title = 'Payroll Report'
        break
    }

    exportToExcel(reportData.data, title, reportData.headers)
  }

  return (
    <Layout>
      <div className="reports-page">
        <div className="reports-header">
          <div className="reports-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <div>
              <h1>Reports & Analytics</h1>
              <p>Comprehensive insights into your workforce</p>
            </div>
          </div>
          <div className="export-buttons">
            <button
              className="export-btn pdf-btn"
              onClick={() => handleExportPDF('attendance')}
            >
              📄 Export PDF
            </button>
            <button
              className="export-btn excel-btn"
              onClick={() => handleExportExcel('attendance')}
            >
              📊 Export Excel
            </button>
          </div>
        </div>
        <div className="time-range-selector">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {overview && (
        <div className="metrics-grid">
          <div className="metric-card gradient-1">
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Total Employees</h3>
              <div className="metric-value">{overview.totalEmployees}</div>
              <div className="metric-change positive">
                +{overview.trends.employeeGrowth}% from last month
              </div>
            </div>
          </div>

          <div className="metric-card gradient-2">
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Attendance Rate</h3>
              <div className="metric-value">{overview.attendanceRate}%</div>
              <div className="metric-change positive">
                +{overview.trends.attendanceChange}% from last week
              </div>
            </div>
          </div>

          <div className="metric-card gradient-3">
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Pending Leaves</h3>
              <div className="metric-value">{overview.pendingLeaves}</div>
              <div className="metric-change negative">
                +{overview.trends.leaveChange} since yesterday
              </div>
            </div>
          </div>

          <div className="metric-card gradient-4">
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Monthly Payroll</h3>
              <div className="metric-value">
                ${(overview.totalPayroll / 1000).toFixed(1)}K
              </div>
              <div className="metric-change positive">
                +{overview.trends.payrollGrowth}% from last month
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Insights */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h2>Quick Insights</h2>
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className={`insight-icon ${insight.type}`}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    />
                  </svg>
                </div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-grid">
        {attendanceData && (
          <div className="chart-card large">
            <div className="chart-header">
              <h3>Attendance Trend</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-dot green"></span>
                  Present
                </span>
                <span className="legend-item">
                  <span className="legend-dot red"></span>
                  Absent
                </span>
              </div>
            </div>
            <div className="chart-container">
              <Line data={attendanceData} options={chartOptions} />
            </div>
          </div>
        )}

        {leaveData && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>Leave Distribution</h3>
            </div>
            <div className="chart-container">
              <Doughnut data={leaveData} options={doughnutOptions} />
            </div>
          </div>
        )}

        {performanceData && (
          <div className="chart-card large">
            <div className="chart-header">
              <h3>Department Performance</h3>
            </div>
            <div className="chart-container">
              <Bar data={performanceData} options={chartOptions} />
            </div>
          </div>
        )}

        {payrollData && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>Payroll Trend</h3>
            </div>
            <div className="chart-container">
              <Line data={payrollData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Reports
