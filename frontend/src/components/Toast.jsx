import { useEffect } from 'react'
import './Toast.css'

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  if (!message) return null

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type] || 'ℹ️'}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  )
}

export default Toast
