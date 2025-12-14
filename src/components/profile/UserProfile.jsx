import { useState, useEffect } from 'react'
import '../../styles/theme.css'
import '../../styles/animations.css'

const UserProfile = ({ user, onUpdateUser, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || user?.contact || '',
    phone: user?.phone || user?.contact || '',
    company: user?.company || '',
    role: user?.role || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    location: user?.location || '',
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('userSettings')
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        analysis: true,
        security: true
      },
      privacy: {
        analytics: true,
        marketing: false,
        dataSharing: false
      },
      preferences: {
        autoSave: true,
        compactMode: false,
        animationsEnabled: true,
        soundEnabled: false
      }
    }
  })

  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const saved = localStorage.getItem('analysisHistory')
    return saved ? JSON.parse(saved) : []
  })

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('userStats')
    return saved ? JSON.parse(saved) : {
      totalAnalyses: 0,
      documentsProcessed: 0,
      risksIdentified: 0,
      timesSaved: 0,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }
  })

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme)
    localStorage.setItem('theme', settings.theme)
  }, [settings])

  const handleProfileUpdate = () => {
    const updatedUser = { ...user, ...profile }
    onUpdateUser(updatedUser)
    localStorage.setItem('userProfile', JSON.stringify(updatedUser))
  }

  const handleSettingsUpdate = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const exportData = () => {
    const data = {
      profile,
      settings,
      analysisHistory,
      stats,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clearclause-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
      setAnalysisHistory([])
      localStorage.removeItem('analysisHistory')
      localStorage.removeItem('history')
    }
  }

  const renderTabNavigation = () => (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid var(--gray-200)',
      marginBottom: 'var(--space-6)',
      gap: 'var(--space-1)'
    }}>
      {[
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'history', label: 'History', icon: '📊' },
        { id: 'security', label: 'Security', icon: '🔒' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            background: 'transparent',
            color: activeTab === tab.id ? 'var(--primary)' : 'var(--gray-600)',
            fontWeight: activeTab === tab.id ? '600' : '500',
            fontSize: '14px',
            cursor: 'pointer',
            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all var(--duration-200) var(--ease-out)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-6)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-200)'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          background: profile.avatar ? `url(${profile.avatar})` : 'var(--gradient-primary)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          fontSize: '48px',
          color: 'white',
          fontWeight: '700',
          border: '4px solid white',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {!profile.avatar && (profile.name?.[0] || user?.name?.[0] || '?')}
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => document.getElementById('avatar-input').click()}
        >
          📷 Change Avatar
        </button>
        <input
          id="avatar-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => setProfile(prev => ({ ...prev, avatar: e.target.result }))
              reader.readAsDataURL(file)
            }
          }}
        />
      </div>

      {/* Profile Form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--gray-700)',
            marginBottom: 'var(--space-2)'
          }}>
            Full Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--gray-700)',
            marginBottom: 'var(--space-2)'
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--gray-700)',
            marginBottom: 'var(--space-2)'
          }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--gray-700)',
            marginBottom: 'var(--space-2)'
          }}>
            Company
          </label>
          <input
            type="text"
            value={profile.company}
            onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--gray-700)',
            marginBottom: 'var(--space-2)'
          }}>
            Role/Title
          </label>
          <select
            value={profile.role}
            onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)',
              fontSize: '14px'
            }}
          >
            <option value="">Select Role</option>
            <option value="lawyer">Lawyer</option>
            <option value="paralegal">Paralegal</option>
            <option value="legal-counsel">Legal Counsel</option>
            <option value="contract-manager">Contract Manager</option>
            <option value="compliance-officer">Compliance Officer</option>
            <option value="business-analyst">Business Analyst</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--gray-700)',
            marginBottom: 'var(--space-2)'
          }}>
            Location
          </label>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City, Country"
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--gray-700)',
          marginBottom: 'var(--space-2)'
        }}>
          Bio
        </label>
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell us about yourself and your legal expertise..."
          rows={4}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            border: '1px solid var(--gray-300)',
            borderRadius: 'var(--radius)',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleProfileUpdate}
          className="btn btn-primary btn-lg"
        >
          💾 Save Profile
        </button>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-8">
      {/* Theme Settings */}
      <div className="profile-section" style={{
        padding: 'var(--space-6)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-200)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          🎨 Appearance
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          {[
            { id: 'light', label: 'Light Theme', icon: '☀️', desc: 'Clean and bright' },
            { id: 'dark', label: 'Dark Theme', icon: '🌙', desc: 'Easy on the eyes' },
            { id: 'auto', label: 'Auto Theme', icon: '🔄', desc: 'Follows system' }
          ].map((theme) => (
            <div
              key={theme.id}
              onClick={() => {
                setSettings(prev => ({ ...prev, theme: theme.id }))
                document.documentElement.setAttribute('data-theme', theme.id)
              }}
              style={{
                padding: 'var(--space-4)',
                background: settings.theme === theme.id ? 'var(--primary-light)' : 'white',
                border: `2px solid ${settings.theme === theme.id ? 'var(--primary)' : 'var(--gray-200)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all var(--duration-200) var(--ease-out)'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>
                {theme.icon}
              </div>
              <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                {theme.label}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                {theme.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="profile-white-section" style={{
        padding: 'var(--space-6)',
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-200)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          🔔 Notifications
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser notifications' },
            { key: 'analysis', label: 'Analysis Complete', desc: 'When document analysis finishes' },
            { key: 'security', label: 'Security Alerts', desc: 'Login attempts and security events' }
          ].map((item) => (
            <div key={item.key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3)',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                  {item.desc}
                </div>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key]}
                  onChange={(e) => handleSettingsUpdate('notifications', item.key, e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.notifications[item.key] ? 'var(--primary)' : 'var(--gray-300)',
                  borderRadius: '24px',
                  transition: 'var(--duration-200)',
                  '::before': {
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: settings.notifications[item.key] ? '26px' : '3px',
                    bottom: '3px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'var(--duration-200)'
                  }
                }} />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="profile-section" style={{
        padding: 'var(--space-6)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-200)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          ⚡ Preferences
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'autoSave', label: 'Auto-save Documents', desc: 'Automatically save your work' },
            { key: 'compactMode', label: 'Compact Mode', desc: 'Reduce spacing for more content' },
            { key: 'animationsEnabled', label: 'Animations', desc: 'Enable smooth animations' },
            { key: 'soundEnabled', label: 'Sound Effects', desc: 'Play sounds for notifications' }
          ].map((item) => (
            <div key={item.key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3)',
              background: 'white',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                  {item.desc}
                </div>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.preferences[item.key]}
                  onChange={(e) => handleSettingsUpdate('preferences', item.key, e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.preferences[item.key] ? 'var(--primary)' : 'var(--gray-300)',
                  borderRadius: '24px',
                  transition: 'var(--duration-200)'
                }} />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        {[
          { label: 'Total Analyses', value: stats.totalAnalyses, icon: '📊', color: 'var(--gradient-primary)' },
          { label: 'Documents Processed', value: stats.documentsProcessed, icon: '📄', color: 'var(--gradient-emerald)' },
          { label: 'Risks Identified', value: stats.risksIdentified, icon: '⚠️', color: 'var(--gradient-warning)' },
          { label: 'Hours Saved', value: Math.floor(stats.timesSaved / 60), icon: '⏰', color: 'var(--gradient-purple)' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              padding: 'var(--space-4)',
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--gray-200)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: stat.color,
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-3)',
              fontSize: '20px',
              color: 'white'
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '800',
              background: stat.color,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 'var(--space-1)'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--gray-600)',
              fontWeight: '500'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-200)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--gray-900)',
            margin: 0
          }}>
            📈 Recent Activity
          </h3>
          <button
            onClick={clearHistory}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--accent-red)' }}
          >
            🗑️ Clear History
          </button>
        </div>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {analysisHistory.length > 0 ? (
            analysisHistory.slice(0, 10).map((item, index) => (
              <div
                key={index}
                style={{
                  padding: 'var(--space-4) var(--space-6)',
                  borderBottom: index < analysisHistory.length - 1 ? '1px solid var(--gray-100)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--gradient-info)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: 'white'
                }}>
                  📄
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                    {item.name || `Analysis ${index + 1}`}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                    {item.date || new Date().toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  padding: 'var(--space-1) var(--space-2)',
                  background: 'var(--gray-100)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  color: 'var(--gray-600)'
                }}>
                  {item.type || 'Document'}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: 'var(--space-8)',
              textAlign: 'center',
              color: 'var(--gray-500)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>📊</div>
              <p>No analysis history yet. Start analyzing documents to see your activity here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Account Security */}
      <div style={{
        padding: 'var(--space-6)',
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-200)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          🔐 Account Security
        </h3>
        
        <div className="space-y-4">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4)',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                Two-Factor Authentication
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                Add an extra layer of security to your account
              </div>
            </div>
            <button className="btn btn-primary btn-sm">
              Enable 2FA
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4)',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                Change Password
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                Update your account password
              </div>
            </div>
            <button className="btn btn-secondary btn-sm">
              Change
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4)',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                Login Sessions
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                Manage your active login sessions
              </div>
            </div>
            <button className="btn btn-secondary btn-sm">
              View Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div style={{
        padding: 'var(--space-6)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-200)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          💾 Data Management
        </h3>
        
        <div className="space-y-4">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4)',
            background: 'white',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                Export Data
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                Download all your data in JSON format
              </div>
            </div>
            <button onClick={exportData} className="btn btn-primary btn-sm">
              📥 Export
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4)',
            background: 'white',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                Delete Account
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                Permanently delete your account and all data
              </div>
            </div>
            <button className="btn btn-danger btn-sm">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-4)'
    }}>
      <div className="profile-modal" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-2xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--gray-900)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: 'white'
            }}>
              👤
            </div>
            User Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: 'var(--gray-500)',
              cursor: 'pointer',
              padding: 'var(--space-2)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: 'var(--space-6)'
        }}>
          {renderTabNavigation()}
          
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
      </div>
    </div>
  )
}

export default UserProfile