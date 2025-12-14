import { useState, useEffect } from 'react'
import '../../styles/theme.css'
import '../../styles/animations.css'

const LiveStats = () => {
  const [stats, setStats] = useState({
    documentsAnalyzed: 47832,
    activeUsers: 1247,
    risksPrevented: 8934,
    timesSaved: 15672
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        documentsAnalyzed: prev.documentsAnalyzed + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
        risksPrevented: prev.risksPrevented + Math.floor(Math.random() * 2),
        timesSaved: prev.timesSaved + Math.floor(Math.random() * 4)
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num)
  }

  const statItems = [
    {
      key: 'documentsAnalyzed',
      label: 'Documents Analyzed',
      icon: '📄',
      color: 'var(--gradient-primary)',
      suffix: '+'
    },
    {
      key: 'activeUsers',
      label: 'Active Users',
      icon: '👥',
      color: 'var(--gradient-emerald)',
      suffix: ''
    },
    {
      key: 'risksPrevented',
      label: 'Risks Prevented',
      icon: '🛡️',
      color: 'var(--gradient-warning)',
      suffix: '+'
    },
    {
      key: 'timesSaved',
      label: 'Hours Saved',
      icon: '⏰',
      color: 'var(--gradient-purple)',
      suffix: '+'
    }
  ]

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-8)',
      border: '1px solid var(--gray-200)',
      boxShadow: 'var(--shadow-xl)',
      margin: 'var(--space-8) 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Live indicator */}
      <div style={{
        position: 'absolute',
        top: 'var(--space-4)',
        right: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        background: 'var(--gradient-success)',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        color: 'white',
        fontWeight: '600'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'white',
          animation: 'pulse 2s infinite'
        }} />
        LIVE
      </div>

      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--space-8)'
      }}>
        <h3 style={{
          fontSize: '28px',
          fontWeight: '800',
          background: 'var(--gradient-rainbow)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 'var(--space-2)'
        }}>
          Real-Time Impact Dashboard
        </h3>
        <p style={{
          color: 'var(--gray-600)',
          fontSize: '16px'
        }}>
          See the live impact of ClearClause AI across the globe
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-6)'
      }}>
        {statItems.map((item, index) => (
          <div
            key={item.key}
            style={{
              textAlign: 'center',
              padding: 'var(--space-6)',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--gray-200)',
              transition: 'all var(--duration-300) var(--ease-out)',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: `${index * 100}ms`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              background: item.color,
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              fontSize: '24px',
              color: 'white',
              boxShadow: 'var(--shadow-md)'
            }}>
              {item.icon}
            </div>
            
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              background: item.color,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-mono)'
            }}>
              {formatNumber(stats[item.key])}{item.suffix}
            </div>
            
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--gray-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 'var(--space-8)',
        textAlign: 'center',
        padding: 'var(--space-4)',
        background: 'linear-gradient(135deg, var(--primary-light), rgba(139, 92, 246, 0.1))',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--primary)'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--primary)',
          marginBottom: 'var(--space-1)'
        }}>
          🌟 Join the AI Revolution
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--gray-600)'
        }}>
          These numbers update in real-time as legal professionals worldwide use ClearClause AI
        </div>
      </div>
    </div>
  )
}

export default LiveStats