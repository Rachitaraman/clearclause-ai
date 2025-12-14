import { useState } from 'react'
import { DemoAuth } from '../../utils/demoAuth.js'
import '../../styles/theme.css'
import '../../styles/cards.css'
import '../../styles/animations.css'

const OTPLogin = ({ onLogin, onBack }) => {
  const [step, setStep] = useState('method') // method, phone, email, otp, success
  const [method, setMethod] = useState('')
  const [contact, setContact] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod)
    setStep(selectedMethod)
  }

  const handleSendOTP = async () => {
    setLoading(true)
    
    try {
      const result = await DemoAuth.sendOTP(contact, method)
      setLoading(false)
      
      if (result.success) {
        setStep('otp')
        setCountdown(60)
        
        // Show demo message with the code
        alert(`🚨 DEMO MODE: In a real application, an OTP would be sent to ${contact}. For this demo, use code: ${result.demoCode}`)
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        alert('Failed to send OTP: ' + result.error)
      }
    } catch (error) {
      setLoading(false)
      alert('Error sending OTP: ' + error.message)
    }
  }

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) return
    
    setLoading(true)
    
    try {
      const result = await DemoAuth.validateOTP(contact, otpString)
      setLoading(false)
      
      if (result.success) {
        setStep('success')
        setTimeout(() => {
          onLogin(result.user)
        }, 2000)
      } else {
        alert('OTP verification failed: ' + result.error)
        // Reset OTP inputs
        setOtp(['', '', '', '', '', ''])
      }
    } catch (error) {
      setLoading(false)
      alert('Error verifying OTP: ' + error.message)
    }
  }

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--gradient-primary)',
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          fontSize: '32px',
          color: 'white',
          animation: 'pulse 2s infinite'
        }}>
          🔐
        </div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-2)'
        }}>
          Secure Login
        </h2>
        <p style={{
          color: 'var(--gray-600)',
          fontSize: '16px'
        }}>
          Choose your preferred verification method
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleMethodSelect('phone')}
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            background: 'white',
            border: '2px solid var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            transition: 'all var(--duration-200) var(--ease-out)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--primary)'
            e.target.style.background = 'var(--primary-light)'
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = 'var(--shadow-lg)'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--gray-200)'
            e.target.style.background = 'white'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--gradient-emerald)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: 'white'
          }}>
            📱
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontWeight: '600', color: 'var(--gray-900)', marginBottom: '2px' }}>
              Phone Number
            </div>
            <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
              Receive OTP via SMS
            </div>
          </div>
          <div style={{ color: 'var(--primary)', fontSize: '20px' }}>→</div>
        </button>

        <button
          onClick={() => handleMethodSelect('email')}
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            background: 'white',
            border: '2px solid var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            transition: 'all var(--duration-200) var(--ease-out)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--accent-purple)'
            e.target.style.background = '#f3f4f6'
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = 'var(--shadow-lg)'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--gray-200)'
            e.target.style.background = 'white'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--gradient-purple)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: 'white'
          }}>
            📧
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontWeight: '600', color: 'var(--gray-900)', marginBottom: '2px' }}>
              Email Address
            </div>
            <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
              Receive OTP via email
            </div>
          </div>
          <div style={{ color: 'var(--accent-purple)', fontSize: '20px' }}>→</div>
        </button>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: 'var(--space-6)',
        padding: 'var(--space-4)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)'
      }}>
        <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: 'var(--space-2)' }}>
          🔒 Your information is encrypted and secure
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          ← Back to simple login
        </button>
      </div>
    </div>
  )

  const renderContactInput = () => (
    <div className="space-y-6">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: method === 'phone' ? 'var(--gradient-emerald)' : 'var(--gradient-purple)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          fontSize: '24px',
          color: 'white'
        }}>
          {method === 'phone' ? '📱' : '📧'}
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-2)'
        }}>
          Enter your {method === 'phone' ? 'phone number' : 'email address'}
        </h3>
        <p style={{
          color: 'var(--gray-600)',
          fontSize: '14px'
        }}>
          We'll send you a 6-digit verification code
        </p>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--gray-700)',
          marginBottom: 'var(--space-2)'
        }}>
          {method === 'phone' ? 'Phone Number' : 'Email Address'}
        </label>
        <input
          type={method === 'phone' ? 'tel' : 'email'}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={method === 'phone' ? '+1 (555) 123-4567' : 'your@email.com'}
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            border: '2px solid var(--gray-300)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '16px',
            outline: 'none',
            transition: 'all var(--duration-200) var(--ease-out)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = method === 'phone' ? 'var(--accent-emerald)' : 'var(--accent-purple)'
            e.target.style.boxShadow = `0 0 0 3px ${method === 'phone' ? 'rgb(16 185 129 / 0.1)' : 'rgb(139 92 246 / 0.1)'}`
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--gray-300)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      <button
        onClick={handleSendOTP}
        disabled={!contact || loading}
        className={`btn btn-lg ${method === 'phone' ? 'btn-success' : 'btn-purple'}`}
        style={{ width: '100%' }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid white',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Sending...
          </div>
        ) : (
          `Send OTP ${method === 'phone' ? '📱' : '📧'}`
        )}
      </button>

      <button
        onClick={() => setStep('method')}
        className="btn btn-secondary"
        style={{ width: '100%' }}
      >
        ← Choose different method
      </button>
    </div>
  )

  const renderOTPInput = () => (
    <div className="space-y-6">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--gradient-info)',
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          fontSize: '32px',
          color: 'white',
          animation: 'pulse 2s infinite'
        }}>
          🔢
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-2)'
        }}>
          Enter verification code
        </h3>
        <p style={{
          color: 'var(--gray-600)',
          fontSize: '14px',
          marginBottom: 'var(--space-3)'
        }}>
          We sent a 6-digit code to {contact}
        </p>
        <div style={{
          padding: 'var(--space-3)',
          background: 'rgba(249, 115, 22, 0.1)',
          border: '1px solid var(--accent-orange)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '13px',
          color: 'var(--accent-orange)',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          🚨 DEMO: Use any 6-digit code (e.g., 123456)
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        justifyContent: 'center',
        marginBottom: 'var(--space-6)'
      }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleOTPChange(index, e.target.value)}
            onKeyDown={(e) => handleOTPKeyDown(index, e)}
            maxLength={1}
            style={{
              width: '48px',
              height: '56px',
              border: '2px solid var(--gray-300)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '20px',
              fontWeight: '700',
              textAlign: 'center',
              outline: 'none',
              transition: 'all var(--duration-200) var(--ease-out)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)'
              e.target.style.boxShadow = '0 0 0 3px rgb(37 99 235 / 0.1)'
              e.target.style.transform = 'scale(1.05)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--gray-300)'
              e.target.style.boxShadow = 'none'
              e.target.style.transform = 'scale(1)'
            }}
          />
        ))}
      </div>

      <button
        onClick={handleVerifyOTP}
        disabled={otp.join('').length !== 6 || loading}
        className="btn btn-primary btn-lg"
        style={{ width: '100%' }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid white',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Verifying...
          </div>
        ) : (
          'Verify & Continue ✓'
        )}
      </button>

      <div style={{ textAlign: 'center' }}>
        {countdown > 0 ? (
          <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
            Resend code in {countdown}s
          </p>
        ) : (
          <button
            onClick={handleSendOTP}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Resend code
          </button>
        )}
      </div>
    </div>
  )

  const renderSuccess = () => (
    <div style={{ textAlign: 'center' }} className="space-y-6">
      <div style={{
        width: '96px',
        height: '96px',
        background: 'var(--gradient-success)',
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto var(--space-6)',
        fontSize: '40px',
        color: 'white',
        animation: 'bounce 1s ease-in-out'
      }}>
        ✅
      </div>
      <h3 style={{
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--gray-900)',
        marginBottom: 'var(--space-2)'
      }}>
        Verification Successful!
      </h3>
      <p style={{
        color: 'var(--gray-600)',
        fontSize: '16px',
        marginBottom: 'var(--space-6)'
      }}>
        Welcome to ClearClause AI. Redirecting you to the dashboard...
      </p>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-1)'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--primary)',
              animation: `pulse 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gray-50)',
      padding: 'var(--space-4)'
    }}>
      <div className="login-card" style={{
        width: '100%',
        maxWidth: '420px',
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-8)',
        border: '1px solid var(--gray-200)',
        boxShadow: 'var(--shadow-2xl)'
      }}>
        {step === 'method' && renderMethodSelection()}
        {(step === 'phone' || step === 'email') && renderContactInput()}
        {step === 'otp' && renderOTPInput()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  )
}

export default OTPLogin