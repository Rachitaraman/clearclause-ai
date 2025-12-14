import Card from '../layout/Card.jsx'
import '../../styles/theme.css'
import '../../styles/animations.css'

const RiskPieChart = ({ risks }) => {
  if (!risks || risks.length === 0) return null

  const total = risks.reduce((sum, risk) => sum + risk.count, 0)
  
  return (
    <Card title="📈 Interactive Risk Visualization" className="card-info hover-lift">
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
        borderRadius: 'var(--radius-lg)',
        padding: 28,
        border: '1px solid rgba(59, 130, 246, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          flexWrap: 'wrap'
        }}>
          {/* Enhanced bar chart representation */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <h4 style={{
              margin: '0 0 24px 0',
              color: 'var(--slate-800)',
              fontSize: 18,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>📊</span>
              Risk Distribution Analysis
            </h4>
            
            {risks.map((risk, index) => {
              const percentage = (risk.count / total) * 100
              return (
                <div key={risk.level} className={`slide-in stagger-${index + 1} hover-lift`} style={{
                  marginBottom: 20,
                  padding: 16,
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${risk.color}20`,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px) scale(1.02)'
                  e.currentTarget.style.boxShadow = `0 8px 25px ${risk.color}30`
                  e.currentTarget.style.borderColor = `${risk.color}60`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0) scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = `${risk.color}20`
                }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${risk.color}, ${risk.color}dd)`,
                        boxShadow: `0 0 12px ${risk.color}40`,
                        animation: 'glow 3s ease-in-out infinite'
                      }} />
                      <span style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--slate-800)',
                        textTransform: 'capitalize'
                      }}>
                        {risk.level} Risk
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{
                        fontSize: 20,
                        fontWeight: 800,
                        background: `linear-gradient(135deg, ${risk.color}, ${risk.color}dd)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        {risk.count}
                      </span>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--slate-600)',
                        background: `${risk.color}15`,
                        padding: '4px 8px',
                        borderRadius: 'var(--radius)',
                        border: `1px solid ${risk.color}30`
                      }}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    width: '100%',
                    height: 16,
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${risk.color}, ${risk.color}dd, ${risk.color})`,
                      borderRadius: 8,
                      transition: 'width 1s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'slideInRight 2s ease-in-out infinite'
                      }} />
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: 12,
                    color: 'var(--slate-500)',
                    marginTop: 8,
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    {risk.level === 'high' ? '🚨 Immediate attention required' :
                     risk.level === 'medium' ? '⚠️ Review recommended' :
                     '✅ Monitor for changes'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Enhanced Legend with Statistics */}
          <div style={{
            minWidth: 200,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '2px solid rgba(59, 130, 246, 0.1)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.1)'
          }}>
            <h5 style={{
              margin: '0 0 20px 0',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--slate-800)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>🏷️</span>
              Legend & Stats
            </h5>
            
            {risks.map((risk, index) => (
              <div key={risk.level} className={`fade-in stagger-${index + 1} hover-scale`} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 16,
                padding: 12,
                background: `${risk.color}08`,
                borderRadius: 'var(--radius)',
                border: `1px solid ${risk.color}20`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${risk.color}15`
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${risk.color}08`
                e.currentTarget.style.transform = 'scale(1)'
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${risk.color}, ${risk.color}dd)`,
                    boxShadow: `0 0 8px ${risk.color}40`
                  }} />
                  <span style={{
                    fontSize: 13,
                    color: 'var(--slate-700)',
                    textTransform: 'capitalize',
                    fontWeight: 600
                  }}>
                    {risk.level}
                  </span>
                </div>
                <span style={{
                  fontSize: 14,
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${risk.color}, ${risk.color}dd)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {risk.count}
                </span>
              </div>
            ))}
            
            <div style={{
              marginTop: 20,
              padding: 16,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 24,
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 4
              }}>
                {total}
              </div>
              <div style={{
                fontSize: 12,
                color: 'var(--slate-600)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total Items
              </div>
            </div>
          </div>
        </div>
        
        <div style={{
          marginTop: 24,
          padding: 20,
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid rgba(16, 185, 129, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--slate-800)',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <span>💡</span>
            Quick Insights
          </div>
          <div style={{
            fontSize: 14,
            color: 'var(--slate-600)',
            lineHeight: 1.6
          }}>
            Most risks are <strong style={{ color: 'var(--accent-emerald)' }}>low severity</strong> ({Math.round((risks.find(r => r.level === 'low')?.count || 0) / total * 100)}%).
            <br />
            Priority focus: <strong style={{ color: 'var(--accent-rose)' }}>
              {risks.find(r => r.level === 'high')?.count || 0} high-risk items
            </strong> need immediate review.
          </div>
        </div>
      </div>
    </Card>
  )
}

export default RiskPieChart