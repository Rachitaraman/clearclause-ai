export const severityMap = {
  high: {
    color: '#f43f5e',
    bgColor: 'linear-gradient(135deg, #fef2f2, #fdf2f8)',
    label: 'High Risk',
    textColor: '#dc2626',
    gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)'
  },
  medium: {
    color: '#f59e0b',
    bgColor: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    label: 'Medium Risk',
    textColor: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)'
  },
  low: {
    color: '#10b981',
    bgColor: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
    label: 'Low Risk',
    textColor: '#059669',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)'
  }
}

export const getSeverityStyle = (level) => {
  return severityMap[level] || severityMap.low
}