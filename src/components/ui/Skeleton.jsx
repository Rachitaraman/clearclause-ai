import '../../styles/theme.css'
import '../../styles/animations.css'

const Skeleton = ({ width = '100%', height = 20, className = '' }) => {
  return (
    <div
      className={`pulse ${className}`}
      style={{
        width,
        height,
        background: 'var(--slate-200)',
        borderRadius: 'var(--radius)',
        marginBottom: 8
      }}
    />
  )
}

export const SkeletonCard = () => (
  <div style={{
    background: 'var(--white)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
    marginBottom: 20,
    border: '1px solid var(--slate-200)'
  }}>
    <Skeleton width="60%" height={24} />
    <Skeleton width="100%" height={16} />
    <Skeleton width="80%" height={16} />
    <Skeleton width="40%" height={16} />
  </div>
)

export default Skeleton