import { useState } from 'react'
import '../../styles/theme.css'
import '../../styles/cards.css'

const Signup = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim() && formData.email.trim()) {
      onSignup(formData)
    }
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--slate-50)'
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ 
            color: 'var(--primary)', 
            fontSize: 32, 
            fontWeight: 700, 
            marginBottom: 8 
          }}>
            Join ClearClause AI
          </h1>
          <p style={{ color: 'var(--slate-500)', margin: 0 }}>
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontWeight: 500,
              color: 'var(--slate-700)'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="Enter your full name"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--slate-300)',
                borderRadius: 'var(--radius)',
                fontSize: 16,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontWeight: 500,
              color: 'var(--slate-700)'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--slate-300)',
                borderRadius: 'var(--radius)',
                fontSize: 16,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontWeight: 500,
              color: 'var(--slate-700)'
            }}>
              Company (Optional)
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={handleChange('company')}
              placeholder="Enter your company name"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--slate-300)',
                borderRadius: 'var(--radius)',
                fontSize: 16,
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={!formData.name.trim() || !formData.email.trim()}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}

export default Signup