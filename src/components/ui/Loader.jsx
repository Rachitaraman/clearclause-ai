import '../../styles/theme.css'
import '../../styles/animations.css'

const Loader = ({ stage }) => {
  const getStageMessage = () => {
    switch (stage) {
      case 'textract':
        return 'Extracting text from document...'
      case 'bedrock':
        return 'Analyzing clauses with AI...'
      default:
        return 'Processing...'
    }
  }

  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid var(--slate-200)',
        borderTop: '4px solid var(--primary)',
        borderRadius: '50%',
        marginBottom: 20
      }} className="spin" />
      
      <p style={{
        color: 'var(--slate-600)',
        fontSize: 16,
        margin: 0,
        fontWeight: 500
      }}>
        {getStageMessage()}
      </p>
      
      <div style={{
        display: 'flex',
        gap: 4,
        marginTop: 16
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--primary)',
              animationDelay: `${i * 0.2}s`
            }}
            className="pulse"
          />
        ))}
      </div>
    </div>
  )
}

export default Loader