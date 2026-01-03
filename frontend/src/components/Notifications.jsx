import { useState, useEffect } from 'react'
import './Notifications.css'

function Notifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'leave',
      title: 'Leave Request Approved',
      message: 'Your leave request for Jan 15-17 has been approved by HR.',
      time: '2 hours ago',
      read: false,
      icon: '✅',
    },
    {
      id: 2,
      type: 'attendance',
      title: 'Attendance Reminder',
      message: "Don't forget to check in! Your shift starts in 30 minutes.",
      time: '5 hours ago',
      read: false,
      icon: '⏰',
    },
    {
      id: 3,
      type: 'payroll',
      title: 'Salary Credited',
      message: 'Your salary for December has been credited to your account.',
      time: '1 day ago',
      read: true,
      icon: '💰',
    },
    {
      id: 4,
      type: 'system',
      title: 'Profile Update Required',
      message: 'Please update your emergency contact information.',
      time: '2 days ago',
      read: true,
      icon: 'ℹ️',
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = id => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
    setIsOpen(false)
  }

  const getNotificationClass = type => {
    const classes = {
      leave: 'notification-leave',
      attendance: 'notification-attendance',
      payroll: 'notification-payroll',
      system: 'notification-system',
    }
    return classes[type] || 'notification-system'
  }

  return (
    <div className="notifications-container">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="notification-overlay"
            onClick={() => setIsOpen(false)}
          />
          <div className="notification-dropdown">
            <div className="notification-header">
              <div className="notification-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Notifications
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount} new</span>
                )}
              </div>
              <div className="notification-actions">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="action-btn"
                      title="Mark all as read"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={clearAll}
                      className="action-btn"
                      title="Clear all"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p>No notifications</p>
                  <span>You're all caught up!</span>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      !notification.read ? 'unread' : ''
                    } ${getNotificationClass(notification.type)}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-icon">{notification.icon}</div>
                    <div className="notification-content">
                      <div className="notification-item-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {notification.time}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="notification-dot"></div>
                    )}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-footer">
                <button className="view-all-btn">
                  View All Notifications
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Notifications
