/**
 * Debug script to check why Gemini is falling back to mock data
 */

const testText = `
EMPLOYMENT AGREEMENT

This Employment Agreement is entered into on January 1, 2024, between TechCorp Inc. and John Smith.

1. POSITION: Employee shall serve as Software Engineer.
2. COMPENSATION: $100,000 per year.
3. TERMINATION: Either party may terminate with 30 days notice.
4. CONFIDENTIALITY: Employee agrees to maintain confidentiality.
`;

async function debugGeminiIssue() {
    try {
        console.log('🔍 Debugging Gemini API issue...');
        console.log('Testing with sample employment agreement text');
        
        const response = await fetch('http://localhost:3002/api/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'analyze',
                documentText: testText,
                documentType: 'text/plain',
                filename: 'Test Employment Agreement'
            })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ HTTP Error:', response.status, errorText);
            return;
        }

        const result = await response.json();
        
        console.log('\n📊 ANALYSIS RESULT:');
        console.log('- Using Real AI:', result.usingRealAI);
        console.log('- Model:', result.model);
        console.log('- Confidence:', result.confidence);
        console.log('- Clauses found:', result.analysis?.clauses?.length || 0);
        console.log('- Risks found:', result.analysis?.risks?.length || 0);
        
        if (result.errorDetails) {
            console.log('\n❌ ERROR DETAILS:', result.errorDetails);
        }
        
        if (!result.usingRealAI) {
            console.log('\n🔄 FALLBACK REASON: Real AI failed, using mock data');
        } else {
            console.log('\n✅ SUCCESS: Real Gemini AI working correctly!');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the debug test
debugGeminiIssue();