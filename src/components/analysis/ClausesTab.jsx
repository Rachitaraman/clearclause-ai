import { useState } from 'react'
import Card from '../layout/Card.jsx'
import RiskChip from '../ui/RiskChip.jsx'
import ExplainToggle from './ExplainToggle.jsx'
import '../../styles/theme.css'
import '../../styles/animations.css'

const ClausesTab = ({ clauses }) => {
  const [expandedClause, setExpandedClause] = useState(null)

  if (!clauses || clauses.length === 0) {
    return (
      <div className="fade-in">
        <Card title="Document Clauses">
          <p style={{ color: 'var(--slate-500)', textAlign: 'center', padding: 40 }}>
            No clauses found in the analysis.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {clauses.map((clause, index) => (
        <Card key={clause.id} style={{ animationDelay: `${index * 0.1}s` }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16
          }}>
            <h4 style={{
              margin: 0,
              color: 'var(--slate-800)',
              fontSize: 18,
              fontWeight: 600
            }}>
              {clause.title}
            </h4>
            <RiskChip level={clause.riskLevel} />
          </div>

          <p style={{
            color: 'var(--slate-700)',
            lineHeight: 1.6,
            marginBottom: 16,
            padding: 16,
            background: 'var(--slate-50)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--slate-200)',
            fontStyle: 'italic'
          }}>
            "{clause.text}"
          </p>

          <ExplainToggle
            explanation={clause.explanation}
            isExpanded={expandedClause === clause.id}
            onToggle={() => setExpandedClause(
              expandedClause === clause.id ? null : clause.id
            )}
          />
        </Card>
      ))}
    </div>
  )
}

export default ClausesTab