import '../../styles/theme.css'
import '../../styles/cards.css'
import '../../styles/animations.css'

const Card = ({ title, children, className = '', ...props }) => {
  return (
    <div className={`card fade-in ${className}`} {...props}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}

export default Card