import '../../styles/theme.css'
import '../../styles/layout.css'

const Tabs = ({ active, setActive }) => {
  const tabs = [
    { name: 'Summary', icon: '📊' },
    { name: 'Clauses', icon: '📋' },
    { name: 'Risks', icon: '⚠️' },
    { name: 'Compare', icon: '🔄' }
  ]

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          className={`tab ${active === tab.name ? 'active' : ''}`}
          onClick={() => setActive(tab.name)}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.name}
        </button>
      ))}
    </div>
  )
}

export default Tabs