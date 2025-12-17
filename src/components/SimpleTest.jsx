import { useState } from 'react';

const SimpleTest = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testDirectBackend = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('Testing direct backend call...');
            
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'analyze',
                    documentText: 'This is a test legal contract with liability clauses and termination conditions.',
                    documentType: 'text'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Direct backend response:', data);
            setResult(data);
        } catch (err) {
            console.error('Direct backend test error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testDocumentProcessor = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('Testing document processor...');
            
            // Import the document processor
            const { processTextInput } = await import('../utils/documentProcessor.js');
            
            const processorResult = await processTextInput('This is a test legal contract with liability clauses and termination conditions.');
            console.log('Document processor result:', processorResult);
            
            if (processorResult.error) {
                throw new Error(processorResult.error);
            }
            
            setResult(processorResult.data);
        } catch (err) {
            console.error('Document processor test error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Backend Integration Test</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={testDirectBackend}
                    disabled={loading}
                    style={{ 
                        padding: '10px 20px', 
                        marginRight: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Testing...' : 'Test Direct Backend'}
                </button>
                
                <button 
                    onClick={testDocumentProcessor}
                    disabled={loading}
                    style={{ 
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Testing...' : 'Test Document Processor'}
                </button>
            </div>

            {error && (
                <div style={{ 
                    padding: '15px', 
                    backgroundColor: '#f8d7da', 
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    color: '#721c24',
                    marginBottom: '20px'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div style={{ 
                    padding: '15px', 
                    backgroundColor: '#d4edda', 
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px',
                    color: '#155724',
                    marginBottom: '20px'
                }}>
                    <h3>Result:</h3>
                    <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        fontSize: '12px',
                        maxHeight: '400px',
                        overflow: 'auto',
                        backgroundColor: 'white',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default SimpleTest;