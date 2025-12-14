import '../../styles/theme.css'
import '../../styles/animations.css'

const ExplainToggle = ({ explanation, isExpanded, onToggle }) => {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: 'none',
          color: 'var(--primary)',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          padding: '8px 0',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--primary-hover)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--primary)'}
      >
        <span style={{
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▶
        </span>
        {isExpanded ? 'Hide explanation' : 'Explain more'}
      </button>

      {isExpanded && (
        <div className="fade-in" style={{
          marginTop: 12,
          padding: 16,
          background: 'var(--primary-light)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--primary)',
          color: 'var(--slate-700)',
          lineHeight: 1.6
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
              marginTop: 2
            }}>
              i
            </div>
            <p style={{ margin: 0 }}>
              {explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExplainToggle