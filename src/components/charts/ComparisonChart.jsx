import Card from '../layout/Card.jsx'
import '../../styles/theme.css'

const ComparisonChart = ({ data }) => {
  // Placeholder component for future chart implementation
  return (
    <Card title="Comparison Chart">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        background: 'var(--slate-50)',
        borderRadius: 'var(--radius)',
        border: '2px dashed var(--slate-300)',
        color: 'var(--slate-500)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <p style={{ margin: 0, fontWeight: 500 }}>
            Comparison Chart Placeholder
          </p>
          <p style={{ margin: 0, fontSize: 14 }}>
            Chart visualization will be implemented here
          </p>
        </div>
      </div>
    </Card>
  )
}

export default ComparisonChart