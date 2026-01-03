import { useState, useEffect } from 'react'
import { useNotifications } from '../utils/NotificationContext'
import './NotificationPanel.css'

function NotificationPanel({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotifications()

  if (!isOpen) return null

  const getNotificationIcon = type => {
    switch (type) {
      case 'leave':
        return '📅'
      case 'attendance':
        return '⏰'
      case 'payroll':
        return '💰'
      case 'announcement':
        return '📢'
      case 'approval':
        return '✅'
      case 'rejection':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const formatTime = timestamp => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      <div className="notification-overlay" onClick={onClose} />
      <div className="notification-panel">
        <div className="notification-header">
          <div>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="close-btn">
              ×
            </button>
          </div>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔔</span>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? 'read' : 'unread'
                }`}
                onClick={() =>
                  !notification.read && markAsRead(notification.id)
                }
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
                <button
                  className="delete-notification"
                  onClick={e => {
                    e.stopPropagation()
                    clearNotification(notification.id)
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default NotificationPanel
