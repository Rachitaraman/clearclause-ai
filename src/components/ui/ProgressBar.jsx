import '../../styles/theme.css'
import '../../styles/cards.css'

const ProgressBar = ({ stage }) => {
  const stages = [
    {
      key: 'textract',
      label: 'Text Extraction',
      icon: '📄',
      description: 'Reading document content...'
    },
    {
      key: 'bedrock',
      label: 'AI Analysis',
      icon: '🧠',
      description: 'Analyzing clauses and risks...'
    }
  ]

  const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.key === stage)
  }

  const currentIndex = getCurrentStageIndex()
  const progress = ((currentIndex + 1) / stages.length) * 100

  return (
    <div className="progress-card">
      <div className="progress-header">
        <h3 className="progress-title">Processing Your Document</h3>
        <p className="progress-subtitle">
          Our AI is analyzing your legal document for risks and insights
        </p>
      </div>

      <div className="progress-steps">
        <div className="progress-connector">
          <div 
            className="progress-connector-fill" 
            style={{ width: `${Math.max(0, (currentIndex / (stages.length - 1)) * 100)}%` }}
          />
        </div>
        
        {stages.map((stageItem, index) => (
          <div
            key={stageItem.key}
            className={`progress-step ${
              index < currentIndex ? 'completed' : 
              index === currentIndex ? 'active' : 'pending'
            }`}
          >
            <div className="progress-step-icon">
              {index < currentIndex ? '✓' : stageItem.icon}
            </div>
            <div className="progress-step-label">{stageItem.label}</div>
            <div className="progress-step-description">
              {index === currentIndex ? stageItem.description : 
               index < currentIndex ? 'Completed' : 'Waiting...'}
            </div>
          </div>
        ))}
      </div>

      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: 'var(--space-6)',
        color: 'var(--gray-600)',
        fontSize: '14px'
      }}>
        Step {currentIndex + 1} of {stages.length} • Estimated time: 10-15 seconds
      </div>
    </div>
  )
}

export default ProgressBar