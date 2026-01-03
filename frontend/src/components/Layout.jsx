import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../utils/AuthContext'
import { useNotifications } from '../utils/NotificationContext'
import NotificationPanel from './NotificationPanel'
import Notifications from './Notifications'
import './Layout.css'

function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const { unreadCount } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/signin')
    }
  }

  const isActive = path => location.pathname === path

  const employeeLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/attendance', label: 'Attendance', icon: '📅' },
    { path: '/leaves', label: 'Leaves', icon: '🏖️' },
    { path: '/payroll', label: 'Payroll', icon: '💰' },
    { path: '/announcements', label: 'Announcements', icon: '📢' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ]

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/employees', label: 'Employees', icon: '👥' },
    { path: '/admin/attendance', label: 'Attendance', icon: '📅' },
    { path: '/admin/leaves', label: 'Leaves', icon: '🏖️' },
    { path: '/admin/payroll', label: 'Payroll', icon: '💰' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/announcements', label: 'Announcements', icon: '📢' },
    { path: '/admin/reports', label: 'Reports', icon: '📈' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ]

  const links = isAdmin() ? adminLinks : employeeLinks

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link
            to={isAdmin() ? '/admin/dashboard' : '/dashboard'}
            className="logo"
          >
            <div className="logo-icon">📊</div>
            <h1 className="logo-text">Dayflow</h1>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <img
              src={
                user?.profilePicture ||
                'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
              }
              alt={user?.name}
              className="user-avatar"
            />
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm logout-btn"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <h2 className="page-title">
              {links.find(l => l.path === location.pathname)?.label ||
                'Dashboard'}
            </h2>
          </div>
          <div className="top-bar-right">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            <Notifications />
            <div className="user-menu">
              <img
                src={
                  user?.profilePicture ||
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
                }
                alt={user?.name}
                className="user-avatar-small"
              />
            </div>
          </div>
        </div>
        <div className="content-wrapper">{children}</div>
      </main>

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  )
}

export default Layout
