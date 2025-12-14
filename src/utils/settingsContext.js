// Settings and Theme Management
export const SettingsManager = {
  // Theme Management
  getTheme: () => {
    return localStorage.getItem('theme') || 'light'
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  },

  toggleTheme: () => {
    const current = SettingsManager.getTheme()
    const newTheme = current === 'light' ? 'dark' : 'light'
    SettingsManager.setTheme(newTheme)
    return newTheme
  },

  // User Settings
  getUserSettings: () => {
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
  },

  updateUserSettings: (settings) => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    
    // Apply theme if changed
    if (settings.theme) {
      SettingsManager.setTheme(settings.theme)
    }
    
    // Apply other settings
    if (settings.preferences?.animationsEnabled === false) {
      document.documentElement.style.setProperty('--duration-200', '0ms')
      document.documentElement.style.setProperty('--duration-300', '0ms')
    } else {
      document.documentElement.style.removeProperty('--duration-200')
      document.documentElement.style.removeProperty('--duration-300')
    }
  },

  // User Stats
  getUserStats: () => {
    const saved = localStorage.getItem('userStats')
    return saved ? JSON.parse(saved) : {
      totalAnalyses: 0,
      documentsProcessed: 0,
      risksIdentified: 0,
      timesSaved: 0,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }
  },

  updateUserStats: (stats) => {
    const current = SettingsManager.getUserStats()
    const updated = { ...current, ...stats, lastActive: new Date().toISOString() }
    localStorage.setItem('userStats', JSON.stringify(updated))
    return updated
  },

  incrementAnalysis: () => {
    const stats = SettingsManager.getUserStats()
    return SettingsManager.updateUserStats({
      totalAnalyses: stats.totalAnalyses + 1,
      documentsProcessed: stats.documentsProcessed + 1,
      risksIdentified: stats.risksIdentified + Math.floor(Math.random() * 5) + 1,
      timesSaved: stats.timesSaved + Math.floor(Math.random() * 30) + 15
    })
  },

  // Analysis History
  getAnalysisHistory: () => {
    const saved = localStorage.getItem('analysisHistory')
    return saved ? JSON.parse(saved) : []
  },

  addAnalysisToHistory: (analysis) => {
    const history = SettingsManager.getAnalysisHistory()
    const newEntry = {
      id: Date.now(),
      name: analysis.name || `Analysis ${history.length + 1}`,
      type: analysis.type || 'Document',
      date: new Date().toISOString(),
      risks: analysis.risks || 0,
      confidence: analysis.confidence || 95,
      ...analysis
    }
    
    const updated = [newEntry, ...history].slice(0, 50) // Keep last 50
    localStorage.setItem('analysisHistory', JSON.stringify(updated))
    
    // Update stats
    SettingsManager.incrementAnalysis()
    
    return updated
  },

  clearAnalysisHistory: () => {
    localStorage.removeItem('analysisHistory')
    localStorage.removeItem('history') // Legacy history
  },

  // Notifications
  getNotifications: () => {
    const saved = localStorage.getItem('notifications')
    return saved ? JSON.parse(saved) : []
  },

  addNotification: (notification) => {
    const notifications = SettingsManager.getNotifications()
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }
    
    const updated = [newNotification, ...notifications].slice(0, 20) // Keep last 20
    localStorage.setItem('notifications', JSON.stringify(updated))
    return updated
  },

  markNotificationAsRead: (id) => {
    const notifications = SettingsManager.getNotifications()
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    localStorage.setItem('notifications', JSON.stringify(updated))
    return updated
  },

  // Data Export
  exportUserData: () => {
    const data = {
      profile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
      settings: SettingsManager.getUserSettings(),
      stats: SettingsManager.getUserStats(),
      history: SettingsManager.getAnalysisHistory(),
      notifications: SettingsManager.getNotifications(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clearclause-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  // Data Import
  importUserData: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          if (data.profile) localStorage.setItem('userProfile', JSON.stringify(data.profile))
          if (data.settings) SettingsManager.updateUserSettings(data.settings)
          if (data.stats) localStorage.setItem('userStats', JSON.stringify(data.stats))
          if (data.history) localStorage.setItem('analysisHistory', JSON.stringify(data.history))
          if (data.notifications) localStorage.setItem('notifications', JSON.stringify(data.notifications))
          
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
  const theme = SettingsManager.getTheme()
  SettingsManager.setTheme(theme)
})

export default SettingsManager