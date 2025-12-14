import { getSeverityStyle } from '../../utils/severityMap.js'
import '../../styles/theme.css'

const RiskChip = ({ level, count, size = 'normal' }) => {
  const style = getSeverityStyle(level)
  
  const sizes = {
    small: { padding: 'var(--space-1) var(--space-2)', fontSize: '12px' },
    normal: { padding: 'var(--space-2) var(--space-3)', fontSize: '14px' },
    large: { padding: 'var(--space-3) var(--space-4)', fontSize: '16px' }
  }
  
  const currentSize = sizes[size]

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: currentSize.padding,
      borderRadius: 'var(--radius-full)',
      background: style.bgColor,
      color: style.textColor,
      fontSize: currentSize.fontSize,
      fontWeight: '600',
      border: `1px solid ${style.color}30`,
      transition: 'all 0.2s ease'
    }}>
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: style.color
      }} />
      
      <span style={{ textTransform: 'capitalize' }}>
        {style.label}
      </span>
      
      {count && (
        <span style={{
          background: style.color,
          color: 'white',
          borderRadius: 'var(--radius-full)',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '700'
        }}>
          {count}
        </span>
      )}
    </span>
  )
}

export default RiskChip