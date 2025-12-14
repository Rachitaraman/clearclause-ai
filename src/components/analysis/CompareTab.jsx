import Card from '../layout/Card.jsx'
import '../../styles/theme.css'
import '../../styles/layout.css'
import '../../styles/animations.css'

const CompareTab = ({ original, simplified }) => {
  return (
    <div className="fade-in">
      <Card title="Side-by-Side Comparison">
        <div className="grid-2">
          <div>
            <h4 style={{
              color: 'var(--slate-800)',
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#ef4444'
              }} />
              Original Language
            </h4>
            <div style={{
              padding: 20,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius)',
              color: 'var(--slate-700)',
              lineHeight: 1.6,
              fontStyle: 'italic'
            }}>
              "{original}"
            </div>
            <div style={{
              marginTop: 12,
              fontSize: 14,
              color: 'var(--slate-500)'
            }}>
              Complex legal terminology
            </div>
          </div>

          <div>
            <h4 style={{
              color: 'var(--slate-800)',
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#10b981'
              }} />
              Simplified Version
            </h4>
            <div style={{
              padding: 20,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius)',
              color: 'var(--slate-700)',
              lineHeight: 1.6
            }}>
              "{simplified}"
            </div>
            <div style={{
              marginTop: 12,
              fontSize: 14,
              color: 'var(--slate-500)'
            }}>
              Plain English explanation
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 24,
          padding: 16,
          background: 'var(--primary-light)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--primary)'
        }}>
          <h5 style={{
            color: 'var(--primary)',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Key Differences
          </h5>
          <ul style={{
            margin: 0,
            paddingLeft: 20,
            color: 'var(--slate-700)'
          }}>
            <li>Removed legal jargon and complex terminology</li>
            <li>Simplified sentence structure for better readability</li>
            <li>Maintained the core meaning and implications</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default CompareTab