import { useState, useEffect } from 'react'
import '../../styles/theme.css'
import '../../styles/animations.css'

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications')
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        type: 'success',
        title: 'Analysis Complete',
        message: 'Your document analysis has been completed successfully.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        icon: '✅'
      },
      {
        id: 2,
        type: 'info',
        title: 'New Feature Available',
        message: 'URL document analysis is now available! Try analyzing documents from web links.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        icon: '🆕'
      },
      {
        id: 3,
        type: 'warning',
        title: 'High Risk Detected',
        message: 'Your last document analysis identified 3 high-risk clauses that need attention.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        icon: '⚠️'
      },
      {
        id: 4,
        type: 'security',
        title: 'Security Update',
        message: 'Your account security settings have been updated successfully.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        icon: '🔒'
      }
    ]
  })

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([])
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'var(--gradient-success)'
      case 'warning': return 'var(--gradient-warning)'
      case 'error': return 'var(--gradient-danger)'
      case 'security': return 'var(--gradient-purple)'
      default: return 'var(--gradient-info)'
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999
        }}
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: 'var(--space-4)',
        width: '400px',
        maxHeight: '600px',
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--gray-200)',
        boxShadow: 'var(--shadow-2xl)',
        zIndex: 1000,
        animation: 'slideInRight 0.3s ease-out',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--gray-50)'
        }}>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--gray-900)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              🔔 Notifications
              {unreadCount > 0 && (
                <span style={{
                  background: 'var(--accent-red)',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gray-500)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: 'var(--space-1)'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                style={{
                  padding: 'var(--space-4) var(--space-6)',
                  borderBottom: '1px solid var(--gray-100)',
                  cursor: 'pointer',
                  background: notification.read ? 'transparent' : 'rgba(37, 99, 235, 0.02)',
                  transition: 'all var(--duration-200) var(--ease-out)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--gray-50)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = notification.read ? 'transparent' : 'rgba(37, 99, 235, 0.02)'
                }}
              >
                {!notification.read && (
                  <div style={{
                    position: 'absolute',
                    left: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '6px',
                    height: '6px',
                    background: 'var(--primary)',
                    borderRadius: '50%'
                  }} />
                )}
                
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  marginLeft: notification.read ? 0 : 'var(--space-3)'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: getTypeColor(notification.type),
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {notification.icon}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: notification.read ? '500' : '600',
                      color: 'var(--gray-900)',
                      marginBottom: '2px',
                      fontSize: '14px'
                    }}>
                      {notification.title}
                    </div>
                    <div style={{
                      color: 'var(--gray-600)',
                      fontSize: '13px',
                      lineHeight: 1.4,
                      marginBottom: 'var(--space-2)'
                    }}>
                      {notification.message}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--gray-500)'
                    }}>
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--gray-400)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: 'var(--space-1)',
                      opacity: 0,
                      transition: 'opacity var(--duration-200) var(--ease-out)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--accent-red)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--gray-400)'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: 'var(--space-12)',
              textAlign: 'center',
              color: 'var(--gray-500)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>🔔</div>
              <p style={{ margin: 0 }}>No notifications yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div style={{
            padding: 'var(--space-3) var(--space-6)',
            borderTop: '1px solid var(--gray-200)',
            background: 'var(--gray-50)',
            textAlign: 'center'
          }}>
            <button
              onClick={clearAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-red)',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default NotificationCenter