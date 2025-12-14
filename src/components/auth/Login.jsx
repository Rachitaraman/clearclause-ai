import { useState } from 'react'
import OTPLogin from './OTPLogin.jsx'
import { DemoAuth } from '../../utils/demoAuth.js'
import '../../styles/theme.css'
import '../../styles/cards.css'

const Login = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState('traditional') // traditional, quick, otp
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleTraditionalLogin = async (e) => {
    e.preventDefault()
    if (!formData.username.trim() || !formData.password.trim()) return
    
    setIsLoading(true)
    
    try {
      const result = await DemoAuth.authenticate(formData.username, formData.password)
      setIsLoading(false)
      
      if (result.success) {
        onLogin(result.user)
      } else {
        alert('Login failed: ' + (result.error || 'Invalid credentials'))
      }
    } catch (error) {
      setIsLoading(false)
      alert('Login error: ' + error.message)
    }
  }

  const handleQuickLogin = (e) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onLogin({ name: formData.name.trim(), loginMethod: 'quick' })
    }
  }

  const handleDemoLogin = () => {
    onLogin({ name: 'Demo User', loginMethod: 'demo' })
  }

  if (loginMode === 'otp') {
    return <OTPLogin onLogin={onLogin} onBack={() => setLoginMode('traditional')} />
  }

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 50%, var(--accent-pink) 100%)',
      padding: 'var(--space-4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '120px',
        height: '120px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '80px',
        height: '80px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '50%',
        animation: 'float 7s ease-in-out infinite'
      }} />

      <div className="login-card" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Logo and Title */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'var(--gradient-rainbow)',
            borderRadius: 'var(--radius-2xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)',
            fontSize: '32px',
            color: 'white',
            fontWeight: '700',
            animation: 'pulse 3s infinite'
          }}>
            C
          </div>
          <h1 className="login-title" style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'var(--gradient-rainbow)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 'var(--space-2)'
          }}>
            Welcome to ClearClause AI
          </h1>
          <p className="login-subtitle" style={{
            color: 'var(--gray-600)',
            fontSize: '16px',
            margin: '0'
          }}>
            ✨ Transform legal documents with AI intelligence
          </p>
        </div>

        {/* Login Mode Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-1)',
          marginBottom: 'var(--space-6)',
          gap: 'var(--space-1)'
        }}>
          {[
            { id: 'traditional', label: 'Login', icon: '🔐' },
            { id: 'quick', label: 'Quick Start', icon: '⚡' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setLoginMode(mode.id)}
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-3)',
                border: 'none',
                borderRadius: 'var(--radius)',
                background: loginMode === mode.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: 'white',
                fontWeight: loginMode === mode.id ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all var(--duration-200) var(--ease-out)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <span>{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>

        {/* Traditional Login Form */}
        {loginMode === 'traditional' && (
          <form onSubmit={handleTraditionalLogin} className="space-y-6">
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--gray-700)',
                marginBottom: 'var(--space-2)'
              }}>
                📧 Username or Email
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username or email"
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  border: '2px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all var(--duration-200) var(--ease-out)',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)'
                  e.target.style.boxShadow = '0 0 0 3px rgb(37 99 235 / 0.1)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--gray-200)'
                  e.target.style.boxShadow = 'none'
                  e.target.style.transform = 'translateY(0)'
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
                🔒 Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    paddingRight: 'var(--space-12)',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all var(--duration-200) var(--ease-out)',
                    background: 'rgba(255, 255, 255, 0.9)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)'
                    e.target.style.boxShadow = '0 0 0 3px rgb(37 99 235 / 0.1)'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--gray-200)'
                    e.target.style.boxShadow = 'none'
                    e.target.style.transform = 'translateY(0)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--gray-500)',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: '14px',
                color: 'var(--gray-600)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--primary)'
                  }}
                />
                Remember me
              </label>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg hover-lift"
              style={{ 
                width: '100%',
                fontWeight: '700',
                background: 'var(--gradient-primary)'
              }}
              disabled={!formData.username.trim() || !formData.password.trim() || isLoading}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Signing In...
                </div>
              ) : (
                '🔐 Sign In'
              )}
            </button>

            {/* Demo Credentials Notice */}
            <div className="demo-notice" style={{
              padding: 'var(--space-3)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--accent-emerald)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '13px',
              color: 'var(--accent-emerald)',
              fontWeight: '500'
            }}>
              <div style={{ marginBottom: 'var(--space-2)', textAlign: 'center' }}>
                💡 <strong>Demo Credentials:</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: '12px' }}>
                <div><strong>Username:</strong> demo</div>
                <div><strong>Password:</strong> demo123</div>
                <div><strong>Username:</strong> admin</div>
                <div><strong>Password:</strong> admin</div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--space-2)', fontSize: '11px', opacity: 0.8 }}>
                Or use any username/password combination
              </div>
            </div>
          </form>
        )}

        {/* Quick Login Form */}
        {loginMode === 'quick' && (
          <form onSubmit={handleQuickLogin} className="space-y-6">
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--gray-700)',
                marginBottom: 'var(--space-2)'
              }}>
                👤 Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name to get started"
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  border: '2px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all var(--duration-200) var(--ease-out)',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)'
                  e.target.style.boxShadow = '0 0 0 3px rgb(37 99 235 / 0.1)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--gray-200)'
                  e.target.style.boxShadow = 'none'
                  e.target.style.transform = 'translateY(0)'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg hover-lift"
              style={{ 
                width: '100%',
                fontWeight: '700',
                background: 'var(--gradient-primary)'
              }}
              disabled={!formData.name.trim()}
            >
              ⚡ Quick Start
            </button>
          </form>
        )}

        {/* Divider */}
        <div style={{
          position: 'relative',
          margin: 'var(--space-6) 0',
          textAlign: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--gray-300), transparent)'
          }} />
          <span style={{
            background: 'white',
            padding: '0 var(--space-4)',
            color: 'var(--gray-500)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            or
          </span>
        </div>

        {/* Alternative Login Options */}
        <div className="space-y-3">
          <button
            onClick={() => setLoginMode('otp')}
            className="btn btn-purple btn-lg hover-lift"
            style={{ 
              width: '100%',
              fontWeight: '600',
              background: 'var(--gradient-purple)'
            }}
          >
            📱 OTP Login (SMS/Email)
          </button>

          <button
            onClick={handleDemoLogin}
            className="btn btn-secondary btn-lg hover-lift"
            style={{ 
              width: '100%',
              fontWeight: '600'
            }}
          >
            🎯 Try Demo Mode
          </button>
        </div>

        {/* Sign Up Link */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-4)',
          fontSize: '14px',
          color: 'var(--gray-600)'
        }}>
          Don't have an account?{' '}
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign up for free
          </button>
        </div>

        {/* Features Showcase */}
        <div className="login-features" style={{
          marginTop: 'var(--space-8)',
          padding: 'var(--space-6)',
          background: 'linear-gradient(135deg, var(--gray-50), rgba(255, 255, 255, 0.8))',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--gray-200)'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--gray-900)',
            marginBottom: 'var(--space-4)',
            textAlign: 'center'
          }}>
            🌟 Why Choose ClearClause AI?
          </h4>
          <div className="space-y-3">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              fontSize: '14px',
              color: 'var(--gray-700)'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'var(--gradient-emerald)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white'
              }}>✓</div>
              <span><strong>99.9% Accuracy</strong> - Enterprise-grade AI analysis</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              fontSize: '14px',
              color: 'var(--gray-700)'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'var(--gradient-info)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white'
              }}>⚡</div>
              <span><strong>10-15 seconds</strong> - Lightning-fast processing</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              fontSize: '14px',
              color: 'var(--gray-700)'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'var(--gradient-warning)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white'
              }}>🔒</div>
              <span><strong>Bank-grade security</strong> - Your data stays private</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              fontSize: '14px',
              color: 'var(--gray-700)'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'var(--gradient-pink)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white'
              }}>💎</div>
              <span><strong>No credit card</strong> - Start analyzing immediately</span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="login-trust" style={{
          marginTop: 'var(--space-6)',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--gray-500)'
        }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            🏆 Trusted by 10,000+ legal professionals worldwide
          </div>
          <div>
            🌍 SOC 2 Compliant • GDPR Ready • ISO 27001 Certified
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login