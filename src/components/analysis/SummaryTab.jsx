import Card from '../layout/Card.jsx'
import RiskChip from '../ui/RiskChip.jsx'
import '../../styles/theme.css'
import '../../styles/cards.css'
import '../../styles/animations.css'

const SummaryTab = ({ data }) => {
  if (!data) return null

  return (
    <div className="fade-in">
      <div className="card-grid">
        <Card className="stat-card card-floating hover-lift glow-primary">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div className="stat-number rainbow">{data.totalClauses}</div>
          <div className="stat-label">Total Clauses Analyzed</div>
          <div style={{ 
            marginTop: 12, 
            fontSize: 12, 
            color: 'var(--slate-500)',
            fontStyle: 'italic'
          }}>
            Comprehensive document scan
          </div>
        </Card>
        
        <Card className="stat-card card-floating hover-lift glow-warning" style={{ animationDelay: '0.2s' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <div className="stat-number" style={{ 
            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {data.riskScore}/10
          </div>
          <div className="stat-label">Overall Risk Score</div>
          <div style={{ 
            marginTop: 12, 
            fontSize: 12, 
            color: data.riskScore > 7 ? 'var(--accent-rose)' : data.riskScore > 4 ? 'var(--accent-yellow)' : 'var(--accent-emerald)',
            fontWeight: 600
          }}>
            {data.riskScore > 7 ? '🔴 High Risk' : data.riskScore > 4 ? '🟡 Medium Risk' : '🟢 Low Risk'}
          </div>
        </Card>
      </div>

      <Card title="🔍 Key Findings" className="card-info hover-lift">
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0 
          }}>
            {data.keyFindings?.map((finding, index) => (
              <li key={index} className={`slide-in stagger-${index + 1}`} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '16px 0',
                borderBottom: index < data.keyFindings.length - 1 ? '1px solid rgba(59, 130, 246, 0.1)' : 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'
                e.currentTarget.style.borderRadius = 'var(--radius)'
                e.currentTarget.style.transform = 'translateX(8px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
              >
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, var(--accent-blue), var(--accent-purple))`,
                  marginTop: 6,
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                  animation: 'glow 3s ease-in-out infinite'
                }} />
                <div>
                  <span style={{ 
                    color: 'var(--slate-700)', 
                    fontWeight: 500,
                    lineHeight: 1.6
                  }}>
                    {finding}
                  </span>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--slate-500)',
                    marginTop: 4,
                    fontStyle: 'italic'
                  }}>
                    AI-detected pattern #{index + 1}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card title="📈 Risk Distribution Overview" className="card-success hover-lift">
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05))',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20
          }}>
            <RiskChip level="high" count={3} size="large" />
            <RiskChip level="medium" count={8} size="large" />
            <RiskChip level="low" count={13} size="large" />
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: 16,
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{
              fontSize: 14,
              color: 'var(--slate-600)',
              marginBottom: 8,
              fontWeight: 500
            }}>
              🎯 Risk Analysis Complete
            </div>
            <div style={{
              fontSize: 12,
              color: 'var(--slate-500)',
              lineHeight: 1.5
            }}>
              24 total clauses analyzed • 3 high-priority items need attention • 
              <br />
              <strong style={{ color: 'var(--accent-emerald)' }}>54% of clauses are low risk</strong>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SummaryTab