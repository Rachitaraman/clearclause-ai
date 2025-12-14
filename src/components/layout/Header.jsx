import { useState } from 'react'
import NotificationCenter from '../ui/NotificationCenter.jsx'
import '../../styles/theme.css'
import '../../styles/layout.css'

const Header = ({ user, onUpdateUser }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">C</div>
          ClearClause AI
        </div>
        
        <div className="user-info">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)'
          }}>
            {/* Notifications */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gray-600)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius)',
                transition: 'all var(--duration-200) var(--ease-out)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--gray-100)'
                e.target.style.color = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = 'var(--gray-600)'
              }}
            >
              🔔
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                background: 'var(--accent-red)',
                borderRadius: '50%',
                fontSize: '0'
              }}>
                •
              </span>
            </button>

            {/* Theme Toggle */}
            <button style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--gray-600)',
              fontSize: '18px',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius)',
              transition: 'all var(--duration-200) var(--ease-out)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--gray-100)'
              e.target.style.color = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = 'var(--gray-600)'
            }}
            onClick={() => {
              const currentTheme = document.documentElement.getAttribute('data-theme') || 'light'
              const newTheme = currentTheme === 'light' ? 'dark' : 'light'
              document.documentElement.setAttribute('data-theme', newTheme)
              localStorage.setItem('theme', newTheme)
            }}
            >
              {document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* User Profile */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all var(--duration-200) var(--ease-out)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--gray-100)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                }}
              >
                <span className="user-name" style={{
                  color: 'var(--gray-700)',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  {user?.name || 'User'}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: user?.avatar ? `url(${user.avatar})` : 'var(--gradient-primary)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '600',
                  border: '2px solid white',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {!user?.avatar && (user?.name || 'U')[0].toUpperCase()}
                </div>
                <span style={{
                  color: 'var(--gray-500)',
                  fontSize: '12px',
                  transition: 'transform var(--duration-200) var(--ease-out)',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 'var(--space-2)',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow-xl)',
                  minWidth: '200px',
                  zIndex: 1000,
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--gray-100)'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--gray-900)',
                      marginBottom: '2px'
                    }}>
                      {user?.name || 'User'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--gray-500)'
                    }}>
                      {user?.email || user?.contact || 'No email set'}
                    </div>
                  </div>
                  
                  <div style={{ padding: 'var(--space-2)' }}>
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        // This will be handled by the parent component
                        if (onUpdateUser) {
                          onUpdateUser({ ...user, showProfile: true })
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius)',
                        fontSize: '14px',
                        color: 'var(--gray-700)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        transition: 'background var(--duration-200) var(--ease-out)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--gray-100)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                      }}
                    >
                      <span>👤</span>
                      View Profile
                    </button>
                    
                    <button
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius)',
                        fontSize: '14px',
                        color: 'var(--gray-700)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        transition: 'background var(--duration-200) var(--ease-out)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--gray-100)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                      }}
                    >
                      <span>⚙️</span>
                      Settings
                    </button>
                    
                    <button
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius)',
                        fontSize: '14px',
                        color: 'var(--gray-700)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        transition: 'background var(--duration-200) var(--ease-out)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--gray-100)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                      }}
                    >
                      <span>📊</span>
                      Analytics
                    </button>
                    
                    <hr style={{
                      border: 'none',
                      borderTop: '1px solid var(--gray-100)',
                      margin: 'var(--space-2) 0'
                    }} />
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to sign out?')) {
                          localStorage.clear()
                          window.location.reload()
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius)',
                        fontSize: '14px',
                        color: 'var(--accent-red)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        transition: 'background var(--duration-200) var(--ease-out)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                      }}
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </header>
  )
}

export default Header