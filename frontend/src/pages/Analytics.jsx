import { useState, useEffect } from 'react'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import './Analytics.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const API_URL = 'http://localhost:5000/api'

function Analytics() {
  const [timeRange, setTimeRange] = useState('week')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    attendance: {
      labels: [],
      present: [],
      absent: [],
      late: [],
    },
    leaves: {
      approved: 0,
      pending: 0,
      rejected: 0,
    },
    performance: {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
    },
    departments: {},
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/analytics?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const attendanceChartData = {
    labels: analytics.attendance.labels,
    datasets: [
      {
        label: 'Present',
        data: analytics.attendance.present,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Absent',
        data: analytics.attendance.absent,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Late',
        data: analytics.attendance.late,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const leaveChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          analytics.leaves.approved,
          analytics.leaves.pending,
          analytics.leaves.rejected,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  }

  const performanceChartData = {
    labels: ['Excellent', 'Good', 'Average', 'Poor'],
    datasets: [
      {
        label: 'Performance Distribution',
        data: [
          analytics.performance.excellent,
          analytics.performance.good,
          analytics.performance.average,
          analytics.performance.poor,
        ],
        backgroundColor: ['#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444'],
        borderRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
        },
      },
    },
  }

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
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

      <div className="analytics-grid">
        {/* Attendance Trends */}
        <div className="chart-card large">
          <h3>Attendance Trends</h3>
          <div className="chart-wrapper">
            <Line data={attendanceChartData} options={chartOptions} />
          </div>
        </div>

        {/* Leave Statistics */}
        <div className="chart-card">
          <h3>Leave Requests</h3>
          <div className="chart-wrapper">
            <Doughnut
              data={leaveChartData}
              options={{
                ...chartOptions,
                cutout: '70%',
              }}
            />
          </div>
          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-label">Approved</span>
              <span className="stat-value green">
                {analytics.leaves.approved}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending</span>
              <span className="stat-value orange">
                {analytics.leaves.pending}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rejected</span>
              <span className="stat-value red">
                {analytics.leaves.rejected}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="chart-card">
          <h3>Performance Distribution</h3>
          <div className="chart-wrapper">
            <Bar
              data={performanceChartData}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Department Statistics */}
        <div className="chart-card">
          <h3>Department Overview</h3>
          <div className="department-list">
            {Object.entries(analytics.departments).map(([dept, count]) => (
              <div key={dept} className="department-item">
                <span className="dept-name">{dept}</span>
                <div className="dept-bar">
                  <div
                    className="dept-bar-fill"
                    style={{
                      width: `${
                        (count /
                          Math.max(...Object.values(analytics.departments))) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="dept-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
