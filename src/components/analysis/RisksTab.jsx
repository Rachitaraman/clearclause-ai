import Card from '../layout/Card.jsx'
import RiskChip from '../ui/RiskChip.jsx'
import '../../styles/theme.css'
import '../../styles/animations.css'

const RisksTab = ({ risks }) => {
  if (!risks || risks.length === 0) {
    return (
      <div className="fade-in">
        <Card title="🛡️ Risk Analysis" className="card-info">
          <div style={{
            textAlign: 'center',
            padding: 60,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <p style={{ 
              color: 'var(--slate-600)', 
              fontSize: 18,
              fontWeight: 600,
              margin: 0
            }}>
              No risks identified in the analysis!
            </p>
            <p style={{ 
              color: 'var(--slate-500)', 
              fontSize: 14,
              margin: '8px 0 0 0'
            }}>
              Your document appears to be well-structured and low-risk.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const totalRisks = risks.reduce((sum, risk) => sum + risk.count, 0)

  return (
    <div className="fade-in">
      <Card title="⚠️ Risk Overview Dashboard" className="card-warning hover-lift">
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(249, 115, 22, 0.05))',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid rgba(245, 158, 11, 0.1)',
          marginBottom: 24
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            marginBottom: 24
          }}>
            {risks.map((risk, index) => (
              <div key={risk.level} className={`scale-in stagger-${index + 1} hover-lift`} style={{
                textAlign: 'center',
                padding: 28,
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${risk.color}30`,
                boxShadow: `0 8px 25px ${risk.color}20`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)'
                e.currentTarget.style.boxShadow = `0 15px 35px ${risk.color}40`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = `0 8px 25px ${risk.color}20`
              }}
              >
                {/* Animated background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${risk.color}10, ${risk.color}05)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }} />
                
                <div style={{
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    fontSize: 48,
                    fontWeight: 900,
                    background: `linear-gradient(135deg, ${risk.color}, ${risk.color}dd)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: 12,
                    textShadow: `0 2px 4px ${risk.color}30`,
                    animation: 'pulse 3s ease-in-out infinite'
                  }}>
                    {risk.count}
                  </div>
                  
                  <RiskChip level={risk.level} size="large" />
                  
                  <div style={{
                    fontSize: 13,
                    color: 'var(--slate-500)',
                    marginTop: 12,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${risk.color}15, ${risk.color}05)`,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${risk.color}20`
                  }}>
                    {Math.round((risk.count / totalRisks) * 100)}% of total risks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="📊 Detailed Risk Breakdown" className="card-danger hover-lift">
        <div style={{
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05), rgba(236, 72, 153, 0.05))',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid rgba(244, 63, 94, 0.1)'
        }}>
          {risks.map((risk, index) => (
            <div key={risk.level} className={`slide-in stagger-${index + 1}`} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 0',
              borderBottom: index < risks.length - 1 ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${risk.color}08`
              e.currentTarget.style.borderRadius = 'var(--radius)'
              e.currentTarget.style.padding = '20px 16px'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.padding = '20px 0'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${risk.color}, ${risk.color}dd)`,
                  boxShadow: `0 0 12px ${risk.color}60`,
                  animation: 'glow 2s ease-in-out infinite'
                }} />
                <div>
                  <span style={{ 
                    fontWeight: 700, 
                    color: 'var(--slate-800)',
                    textTransform: 'capitalize',
                    fontSize: 16
                  }}>
                    {risk.level} Risk Items
                  </span>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--slate-500)',
                    marginTop: 2,
                    fontStyle: 'italic'
                  }}>
                    {risk.level === 'high' ? 'Requires immediate attention' : 
                     risk.level === 'medium' ? 'Should be reviewed soon' : 
                     'Monitor for changes'}
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20
              }}>
                <span style={{ 
                  fontSize: 24, 
                  fontWeight: 800, 
                  background: `linear-gradient(135deg, ${risk.color}, ${risk.color}dd)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {risk.count}
                </span>
                
                <div style={{
                  width: 120,
                  height: 12,
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: `${(risk.count / totalRisks) * 100}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${risk.color}, ${risk.color}dd)`,
                    borderRadius: 6,
                    transition: 'width 0.8s ease',
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
              </div>
            </div>
          ))}
          
          <div style={{
            textAlign: 'center',
            marginTop: 24,
            padding: 20,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid rgba(244, 63, 94, 0.1)'
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
              <span>🎯</span>
              Risk Assessment Summary
            </div>
            <div style={{
              fontSize: 14,
              color: 'var(--slate-600)',
              lineHeight: 1.6
            }}>
              <strong>{totalRisks}</strong> total risk items identified across your document.
              <br />
              Focus on the <strong style={{ color: 'var(--accent-rose)' }}>
                {risks.find(r => r.level === 'high')?.count || 0} high-risk items
              </strong> first for maximum impact.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default RisksTab