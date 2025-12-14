import { useState } from 'react';

const ClearClausePage = () => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testBackend = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ test: 'hello backend' })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResponse(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">ClearClause Connectivity Test</h1>

            <div className="mb-6">
                <p className="text-gray-600 mb-4">
                    Test the connection between frontend and backend by clicking the button below.
                </p>

                <button
                    onClick={testBackend}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                    {loading ? 'Testing...' : 'Test Backend'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {response && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    <h3 className="font-bold mb-2">Backend Response:</h3>
                    <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default ClearClausePage;