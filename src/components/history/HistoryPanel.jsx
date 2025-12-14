import Card from '../layout/Card.jsx'
import '../../styles/theme.css'
import '../../styles/animations.css'

const HistoryPanel = ({ items }) => {
  if (!items || items.length === 0) return null

  return (
    <Card title="Analysis History" className="fade-in">
      <div style={{
        maxHeight: 300,
        overflowY: 'auto',
        marginTop: 16
      }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: index % 2 === 0 ? 'var(--slate-50)' : 'transparent',
              borderRadius: 'var(--radius)',
              marginBottom: 8,
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              animationDelay: `${index * 0.1}s`
            }}
            className="slide-in"
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--primary-light)'
              e.target.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = index % 2 === 0 ? 'var(--slate-50)' : 'transparent'
              e.target.style.transform = 'translateX(0)'
            }}
          >
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--primary)',
              flexShrink: 0
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--slate-700)',
                marginBottom: 2
              }}>
                {item}
              </div>
            </div>
            <div style={{
              fontSize: 12,
              color: 'var(--slate-500)',
              opacity: 0.7
            }}>
              📄
            </div>
          </div>
        ))}
      </div>

      {items.length > 5 && (
        <div style={{
          textAlign: 'center',
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid var(--slate-200)'
        }}>
          <button
            style={{
              background: 'transparent',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--primary)'
              e.target.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = 'var(--primary)'
            }}
          >
            View All History
          </button>
        </div>
      )}
    </Card>
  )
}

export default HistoryPanel