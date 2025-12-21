import React, { useState, useEffect } from 'react'

import HomePage from '../routes/index.jsx'

// UI Components
import Header from './components/layout/Header.jsx'
import Tabs from './components/layout/Tabs.jsx'
import Login from './components/auth/Login.jsx'
import Loader from './components/ui/Loader.jsx'
import ProgressBar from './components/ui/ProgressBar.jsx'
import HistoryPanel from './components/history/HistoryPanel.jsx'
import AIConfidenceMeter from './components/ui/AIConfidenceMeter.jsx'
import DocumentPreview from './components/ui/DocumentPreview.jsx'
import UserProfile from './components/profile/UserProfile.jsx'
import AnalysisSourceIndicator from './components/ui/AnalysisSourceIndicator.jsx'

// Analysis Tabs
import SummaryTab from './components/analysis/SummaryTab.jsx'
import ClausesTab from './components/analysis/ClausesTab.jsx'
import RisksTab from './components/analysis/RisksTab.jsx'
import CompareTab from './components/analysis/CompareTab.jsx'
import ComparisonResults from './components/analysis/ComparisonResults.jsx'

// Charts
import RiskPieChart from './components/charts/RiskPieChart.jsx'

// Client-side document processing (fixed to avoid server imports)
import { 
    processDocument, 
    processImageDocument, 
    processTextInput, 
    processURLContent, 
    compareDocuments,
    transformAnalysisForUI 
} from './utils/documentProcessor.js'

// Mock data (fallback)
import { mockData } from './utils/mockData.js'

function App() {
    // ---------------- ROUTING ----------------
    const [currentPath, setCurrentPath] = useState(window.location.pathname)

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(window.location.pathname)
        }
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    const navigate = (path) => {
        window.history.pushState({}, '', path)
        setCurrentPath(path)
    }

    // ---------------- CLEARCLAUSE UI STATE ----------------
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('userProfile')
        return saved ? JSON.parse(saved) : null
    })
    const [showProfile, setShowProfile] = useState(false)
    const [activeTab, setActiveTab] = useState('Summary')
    const [loading, setLoading] = useState(false)
    const [stage, setStage] = useState(null)

    const [result, setResult] = useState(null)
    const [isComparison, setIsComparison] = useState(false)
    const [comparisonDocuments, setComparisonDocuments] = useState([])
    const [history, setHistory] = useState(() => {
        return JSON.parse(localStorage.getItem('history')) || []
    })

    // Initialize theme on app load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', savedTheme)
    }, [])

    // Handle user updates
    const handleUserUpdate = (updatedUser) => {
        if (updatedUser.showProfile) {
            setShowProfile(true)
            delete updatedUser.showProfile
        } else {
            setUser(updatedUser)
            localStorage.setItem('userProfile', JSON.stringify(updatedUser))
        }
    }

    // ---------------- ANALYSIS FLOW (CLIENT-SIDE ONLY) ----------------
    const runAnalysis = async (analysisType = 'single', documents = []) => {
        setLoading(true)
        setStage('textract')
        
        // Set comparison mode if multiple documents
        if (analysisType === 'comparison' || documents.length > 1) {
            setIsComparison(true)
            setComparisonDocuments(documents)
        } else {
            setIsComparison(false)
            setComparisonDocuments([])
        }

        try {
            let analysisResult

            if (analysisType === 'comparison' || documents.length > 1) {
                // Multi-document comparison
                analysisResult = await compareDocuments(documents)
                
                if (analysisResult.error) {
                    throw new Error(analysisResult.error)
                }

                // For comparison, we'll use the comparison data directly
                setResult({
                    comparison: analysisResult.data.comparison,
                    documents: analysisResult.data.documents,
                    metadata: analysisResult.data.metadata
                })
            } else {
                // Single document analysis
                const document = documents[0]
                
                if (document instanceof File) {
                    // Determine processing method based on file type
                    if (document.type.startsWith('image/')) {
                        analysisResult = await processImageDocument(document)
                    } else {
                        analysisResult = await processDocument(document)
                    }
                } else if (typeof document === 'string') {
                    // Check if it's a URL or text
                    if (document.startsWith('http://') || document.startsWith('https://')) {
                        analysisResult = await processURLContent(document)
                    } else {
                        analysisResult = await processTextInput(document)
                    }
                }

                // Update stage based on processing progress
                if (analysisResult.stage === 'bedrock') {
                    setStage('bedrock')
                }

                if (analysisResult.error) {
                    throw new Error(analysisResult.error)
                }

                // Transform results to UI format
                console.log('App: About to transform data:', analysisResult.data)
                const transformedData = transformAnalysisForUI(analysisResult.data)
                console.log('App: Transformed data:', transformedData)
                setResult(transformedData)
            }

            setLoading(false)
            setStage(null)

            // Add to history
            const newItem = isComparison ? 
                `Comparison Analysis – ${documents.length} documents – ${new Date().toLocaleString()}` :
                `Analysis – ${analysisResult.data?.document?.name || 'Document'} – ${new Date().toLocaleString()}`
            const updated = [newItem, ...history]
            setHistory(updated)
            localStorage.setItem('history', JSON.stringify(updated))

        } catch (error) {
            console.error('Analysis failed:', error)
            console.error('Error details:', error.stack)
            
            // Fallback to mock data on error
            console.log('Falling back to mock data due to error:', error.message)
            setStage('bedrock')
            
            setTimeout(() => {
                setResult(mockData)
                setLoading(false)
                setStage(null)

                const newItem = `Analysis (Mock) – ${new Date().toLocaleString()}`
                const updated = [newItem, ...history]
                setHistory(updated)
                localStorage.setItem('history', JSON.stringify(updated))
            }, 1500)
        }
    }

    // ---------------- ROUTES ----------------
    const renderRoute = () => {
        switch (currentPath) {
            case '/':
                return (
                    <div>
                        <HomePage />
                        <div style={{
                            textAlign: 'center',
                            margin: '40px auto',
                            padding: '48px 32px',
                            maxWidth: '600px',
                            background: 'white',
                            borderRadius: 'var(--radius-2xl)',
                            border: '1px solid var(--gray-200)',
                            boxShadow: 'var(--shadow-xl)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'var(--gradient-primary)',
                                borderRadius: 'var(--radius-2xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                fontSize: '32px',
                                color: 'white'
                            }}>
                                🚀
                            </div>
                            <h3 style={{
                                margin: '0 0 16px 0',
                                color: 'var(--gray-900)',
                                fontSize: '28px',
                                fontWeight: '700'
                            }}>
                                Ready to Experience ClearClause AI?
                            </h3>
                            <p style={{
                                color: 'var(--gray-600)',
                                marginBottom: '32px',
                                fontSize: '16px',
                                lineHeight: '1.6'
                            }}>
                                Transform your legal document analysis with enterprise-grade AI technology. 
                                Get instant insights, risk assessments, and simplified explanations.
                            </p>
                            <button
                                onClick={() => navigate('/clearclause')}
                                className="btn btn-primary btn-lg"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            >
                                Launch Application →
                            </button>
                            <div style={{
                                marginTop: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '24px',
                                flexWrap: 'wrap',
                                fontSize: '14px',
                                color: 'var(--gray-500)'
                            }}>
                                <span>✓ No signup required</span>
                                <span>✓ Instant results</span>
                                <span>✓ Enterprise security</span>
                            </div>
                        </div>
                    </div>
                )

            case '/test':
                // Simple test component
                const SimpleTest = React.lazy(() => import('./components/SimpleTest.jsx'));
                return (
                    <React.Suspense fallback={<div>Loading...</div>}>
                        <SimpleTest />
                    </React.Suspense>
                );

            case '/clearclause':
                // ---------- LOGIN GATE ----------
                if (!user) {
                    return <Login onLogin={setUser} />
                }

                return (
                    <>
                        <Header user={user} onUpdateUser={handleUserUpdate} />

                        <div className="main-content">
                            {/* Document Upload & Analysis */}
                            {!result && !loading && (
                                <DocumentPreview onAnalyze={runAnalysis} />
                            )}

                            {/* Progress */}
                            {loading && (
                                <>
                                    <ProgressBar stage={stage} />
                                    <AIConfidenceMeter 
                                        confidence={stage === 'textract' ? 45 : stage === 'bedrock' ? 85 : 97} 
                                        stage={stage} 
                                    />
                                    <Loader stage={stage} />
                                </>
                            )}

                            {/* Show final confidence when complete */}
                            {result && !loading && (
                                <>
                                    <AIConfidenceMeter confidence={97} />
                                    <AnalysisSourceIndicator 
                                        metadata={result.metadata} 
                                        errorDetails={result.errorDetails}
                                    />
                                </>
                            )}

                            {/* RESULTS */}
                            {result && !loading && (
                                <>
                                    {isComparison ? (
                                        <ComparisonResults documents={comparisonDocuments} />
                                    ) : (
                                        <>
                                            <Tabs active={activeTab} setActive={setActiveTab} />

                                            {activeTab === 'Summary' && (
                                                <>
                                                    <SummaryTab data={result.summary} />
                                                    <RiskPieChart risks={result.risks} />
                                                </>
                                            )}

                                            {activeTab === 'Clauses' && (
                                                <ClausesTab clauses={result.clauses} />
                                            )}

                                            {activeTab === 'Risks' && (
                                                <RisksTab risks={result.risks} />
                                            )}

                                            {activeTab === 'Compare' && (
                                                <CompareTab
                                                    original="Company may terminate services at any time."
                                                    simplified="They can stop your service whenever they want."
                                                />
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {/* HISTORY */}
                            {history.length > 0 && (
                                <HistoryPanel items={history} />
                            )}

                            {/* NAV BACK */}
                            <div style={{
                                textAlign: 'center',
                                marginTop: 'var(--space-12)',
                                padding: 'var(--space-6)',
                                background: 'white',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--gray-200)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <button
                                    onClick={() => navigate('/')}
                                    className="btn btn-secondary"
                                >
                                    ← Back to Home
                                </button>
                            </div>
                        </div>

                        {/* User Profile Modal */}
                        {showProfile && (
                            <UserProfile
                                user={user}
                                onUpdateUser={(updatedUser) => {
                                    setUser(updatedUser)
                                    localStorage.setItem('userProfile', JSON.stringify(updatedUser))
                                }}
                                onClose={() => setShowProfile(false)}
                            />
                        )}
                    </>
                )

            default:
                return <div className="p-6">404 – Page not found</div>
        }
    }

    return <div>{renderRoute()}</div>
}

export default App