import React from 'react'

/**
 * Analysis Source Indicator Component
 * Shows whether real AI or mock data was used for analysis
 */
function AnalysisSourceIndicator({ metadata, errorDetails }) {
    if (!metadata) return null

    const isRealAI = metadata.usingRealAI || metadata.processingDetails?.source === 'real-ai'
    const credentialStatus = metadata.processingDetails?.credentialStatus

    return (
        <div style={{
            margin: '16px 0',
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${isRealAI ? 'var(--green-200)' : 'var(--orange-200)'}`,
            background: isRealAI ? 'var(--green-50)' : 'var(--orange-50)',
            fontSize: '14px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: errorDetails ? '8px' : '0'
            }}>
                <span style={{ fontSize: '16px' }}>
                    {isRealAI ? '🤖' : '📋'}
                </span>
                <span style={{
                    fontWeight: '600',
                    color: isRealAI ? 'var(--green-800)' : 'var(--orange-800)'
                }}>
                    {isRealAI ? 'Real AI Analysis' : 'Mock Data Fallback'}
                </span>
                {metadata.model && (
                    <span style={{
                        fontSize: '12px',
                        color: 'var(--gray-600)',
                        background: 'var(--gray-100)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                    }}>
                        {metadata.model}
                    </span>
                )}
            </div>

            {/* Show processing details */}
            {metadata.processingDetails && (
                <div style={{
                    fontSize: '12px',
                    color: 'var(--gray-600)',
                    marginBottom: errorDetails ? '8px' : '0'
                }}>
                    Credentials: {credentialStatus || 'unknown'} • 
                    Processing time: {metadata.processingDetails.processingTime || 0}ms
                </div>
            )}

            {/* Show error details if AI failed */}
            {errorDetails && !isRealAI && (
                <div style={{
                    padding: '8px 12px',
                    background: 'var(--red-50)',
                    border: '1px solid var(--red-200)',
                    borderRadius: '6px',
                    marginTop: '8px'
                }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'var(--red-800)',
                        marginBottom: '4px'
                    }}>
                        AI Analysis Failed: {errorDetails.message}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--red-700)',
                        marginBottom: '6px'
                    }}>
                        {errorDetails.resolution}
                    </div>
                    {errorDetails.technical && (
                        <details style={{ fontSize: '11px', color: 'var(--red-600)' }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '4px' }}>
                                Technical Details
                            </summary>
                            <code style={{
                                display: 'block',
                                padding: '4px',
                                background: 'var(--red-100)',
                                borderRadius: '3px',
                                wordBreak: 'break-all'
                            }}>
                                {errorDetails.technical}
                            </code>
                        </details>
                    )}
                </div>
            )}

            {/* Success message for real AI */}
            {isRealAI && (
                <div style={{
                    fontSize: '12px',
                    color: 'var(--green-700)',
                    marginTop: '4px'
                }}>
                    ✓ Analysis powered by Claude AI with {metadata.confidence || 95}% confidence
                </div>
            )}
        </div>
    )
}

export default AnalysisSourceIndicator