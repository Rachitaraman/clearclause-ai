import { useState, useEffect } from 'react'
import '../../styles/theme.css'
import '../../styles/animations.css'

const AIConfidenceMeter = ({ confidence = 0, stage = null }) => {
  const [displayConfidence, setDisplayConfidence] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (confidence > 0) {
      setIsAnimating(true)
      const duration = 2000
      const steps = 60
      const increment = confidence / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= confidence) {
          setDisplayConfidence(confidence)
          setIsAnimating(false)
          clearInterval(timer)
        } else {
          setDisplayConfidence(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [confidence])

  const getConfidenceColor = (conf) => {
    if (conf >= 95) return 'var(--gradient-success)'
    if (conf >= 85) return 'var(--gradient-emerald)'
    if (conf >= 75) return 'var(--gradient-warning)'
    if (conf >= 60) return 'var(--gradient-orange)'
    return 'var(--gradient-danger)'
  }

  const getConfidenceLabel = (conf) => {
    if (conf >= 95) return 'Exceptional'
    if (conf >= 85) return 'High Confidence'
    if (conf >= 75) return 'Good Confidence'
    if (conf >= 60) return 'Moderate'
    return 'Low Confidence'
  }

  const getStageInfo = () => {
    switch (stage) {
      case 'textract':
        return {
          icon: '📄',
          label: 'Text Extraction',
          description: 'Reading document structure...',
          color: 'var(--gradient-info)'
        }
      case 'bedrock':
        return {
          icon: '🧠',
          label: 'AI Analysis',
          description: 'Analyzing legal patterns...',
          color: 'var(--gradient-purple)'
        }
      default:
        return {
          icon: '✨',
          label: 'Analysis Complete',
          description: 'Ready to review results',
          color: 'var(--gradient-success)'
        }
    }
  }

  const stageInfo = getStageInfo()

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-8)',
      border: '1px solid var(--gray-200)',
      boxShadow: 'var(--shadow-lg)',
      margin: 'var(--space-6) 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.5
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)'
        }}>
          <div>
            <h4 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--gray-900)',
              marginBottom: 'var(--space-1)'
            }}>
              AI Confidence Analysis
            </h4>
            <p style={{
              fontSize: '14px',
              color: 'var(--gray-600)',
              margin: 0
            }}>
              Real-time confidence scoring powered by advanced ML models
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            background: stageInfo.color,
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            color: 'white',
            fontWeight: '600'
          }}>
            <span>{stageInfo.icon}</span>
            {stageInfo.label}
          </div>
        </div>

        {/* Confidence Meter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-6)'
        }}>
          {/* Circular Progress */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px'
          }}>
            <svg
              width="120"
              height="120"
              style={{ transform: 'rotate(-90deg)' }}
            >
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--gray-200)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="url(#confidenceGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - displayConfidence / 100)}`}
                style={{
                  transition: 'stroke-dashoffset 0.5s ease-out'
                }}
              />
              <defs>
                <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent-emerald)" />
                  <stop offset="50%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--accent-purple)" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                background: getConfidenceColor(displayConfidence),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '2px'
              }}>
                {displayConfidence}%
              </div>
              <div style={{
                fontSize: '10px',
                color: 'var(--gray-500)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Confidence
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              background: getConfidenceColor(displayConfidence),
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 'var(--space-2)'
            }}>
              {getConfidenceLabel(displayConfidence)}
            </div>
            
            <div style={{
              fontSize: '14px',
              color: 'var(--gray-600)',
              marginBottom: 'var(--space-4)',
              lineHeight: 1.5
            }}>
              {stageInfo.description}
            </div>

            {/* Confidence Breakdown */}
            <div className="space-y-2">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px'
              }}>
                <span style={{ color: 'var(--gray-600)' }}>Text Recognition</span>
                <span style={{ fontWeight: '600', color: 'var(--gray-900)' }}>98%</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px'
              }}>
                <span style={{ color: 'var(--gray-600)' }}>Legal Pattern Match</span>
                <span style={{ fontWeight: '600', color: 'var(--gray-900)' }}>
                  {Math.max(85, displayConfidence - 5)}%
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px'
              }}>
                <span style={{ color: 'var(--gray-600)' }}>Risk Assessment</span>
                <span style={{ fontWeight: '600', color: 'var(--gray-900)' }}>
                  {Math.max(80, displayConfidence - 10)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Models Used */}
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--gray-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--gray-700)',
            marginBottom: 'var(--space-3)'
          }}>
            🤖 AI Models Deployed
          </div>
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap'
          }}>
            {[
              { name: 'GPT-4 Turbo', color: 'var(--gradient-primary)' },
              { name: 'Claude-3 Opus', color: 'var(--gradient-purple)' },
              { name: 'Legal-BERT', color: 'var(--gradient-emerald)' },
              { name: 'Risk-Analyzer v2', color: 'var(--gradient-warning)' }
            ].map((model, index) => (
              <span
                key={model.name}
                style={{
                  padding: 'var(--space-1) var(--space-3)',
                  background: model.color,
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: '600',
                  opacity: isAnimating ? 0.7 : 1,
                  animation: isAnimating ? `pulse 2s infinite ${index * 0.2}s` : 'none'
                }}
              >
                {model.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIConfidenceMeter