// Demo Authentication System
// In a real application, this would be handled by a backend API

const DEMO_USERS = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@clearclause.ai',
    password: 'demo123',
    name: 'Demo User',
    role: 'lawyer',
    company: 'ClearClause AI',
    verified: true
  },
  {
    id: 2,
    username: 'john.doe',
    email: 'john.doe@lawfirm.com',
    password: 'password123',
    name: 'John Doe',
    role: 'legal-counsel',
    company: 'Legal Associates LLC',
    verified: true
  },
  {
    id: 3,
    username: 'sarah.chen',
    email: 'sarah.chen@techcorp.com',
    password: 'secure456',
    name: 'Sarah Chen',
    role: 'contract-manager',
    company: 'TechCorp Inc.',
    verified: true
  },
  {
    id: 4,
    username: 'admin',
    email: 'admin@clearclause.ai',
    password: 'admin',
    name: 'Administrator',
    role: 'lawyer',
    company: 'ClearClause AI',
    verified: true
  }
]

export const DemoAuth = {
  // Authenticate user with username/email and password
  authenticate: async (usernameOrEmail, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = DEMO_USERS.find(u => 
          (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
          u.password === password
        )
        
        if (user) {
          const { password: _, ...userWithoutPassword } = user
          resolve({
            success: true,
            user: {
              ...userWithoutPassword,
              loginMethod: 'traditional',
              lastLogin: new Date().toISOString()
            }
          })
        } else {
          // In demo mode, accept any credentials
          resolve({
            success: true,
            user: {
              id: Date.now(),
              username: usernameOrEmail,
              email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@example.com`,
              name: usernameOrEmail,
              role: 'lawyer',
              company: 'Demo Company',
              verified: true,
              loginMethod: 'traditional',
              lastLogin: new Date().toISOString()
            }
          })
        }
      }, 1000 + Math.random() * 1000) // Simulate network delay
    })
  },

  // Get demo credentials for display
  getDemoCredentials: () => [
    { username: 'demo', password: 'demo123', name: 'Demo User' },
    { username: 'john.doe', password: 'password123', name: 'John Doe' },
    { username: 'admin', password: 'admin', name: 'Administrator' }
  ],

  // Validate OTP (demo - accepts any 6-digit code)
  validateOTP: async (contact, otp) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (otp.length === 6 && /^\d{6}$/.test(otp)) {
          resolve({
            success: true,
            user: {
              id: Date.now(),
              name: 'Verified User',
              email: contact.includes('@') ? contact : `${contact}@example.com`,
              phone: contact.includes('@') ? '' : contact,
              verified: true,
              loginMethod: 'otp',
              lastLogin: new Date().toISOString()
            }
          })
        } else {
          resolve({
            success: false,
            error: 'Invalid OTP code'
          })
        }
      }, 1500)
    })
  },

  // Send OTP (demo - just returns success)
  sendOTP: async (contact, method) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `OTP sent to ${contact} via ${method}`,
          // In demo, we tell them what code to use
          demoCode: '123456'
        })
      }, 1500)
    })
  },

  // Check if user exists
  userExists: (usernameOrEmail) => {
    return DEMO_USERS.some(u => 
      u.username === usernameOrEmail || u.email === usernameOrEmail
    )
  },

  // Get user by username/email
  getUser: (usernameOrEmail) => {
    const user = DEMO_USERS.find(u => 
      u.username === usernameOrEmail || u.email === usernameOrEmail
    )
    if (user) {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return null
  }
}

export default DemoAuth