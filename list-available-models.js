/**
 * List available Gemini models using the API
 */

import dotenv from 'dotenv';
dotenv.config();

async function listAvailableModels() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
        console.log('❌ No API key found');
        return;
    }
    
    console.log('🔍 Checking available Gemini models...');
    console.log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    
    try {
        // Use the REST API to list models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ API Error (${response.status}):`, errorText);
            
            if (response.status === 403) {
                console.log('\n🔧 This suggests the API key is invalid or doesn\'t have proper permissions');
                console.log('Solutions:');
                console.log('1. Verify the API key at: https://aistudio.google.com/app/apikey');
                console.log('2. Make sure the API key has Gemini API access enabled');
                console.log('3. Check if the key has been revoked or expired');
            } else if (response.status === 429) {
                console.log('\n🔧 Rate limit exceeded - quota exhausted');
                console.log('Solutions:');
                console.log('1. Wait for quota reset (usually resets daily)');
                console.log('2. Check usage at: https://aistudio.google.com/app/apikey');
                console.log('3. Consider upgrading to paid plan');
            }
            return;
        }
        
        const data = await response.json();
        
        if (data.models && data.models.length > 0) {
            console.log('\n✅ Available models:');
            data.models.forEach(model => {
                console.log(`  - ${model.name.replace('models/', '')}`);
                if (model.displayName) {
                    console.log(`    Display: ${model.displayName}`);
                }
                if (model.description) {
                    console.log(`    Description: ${model.description.substring(0, 100)}...`);
                }
                console.log('');
            });
            
            // Find the best model for our use case
            const textModels = data.models.filter(m => 
                m.name.includes('gemini') && 
                !m.name.includes('vision') && 
                m.supportedGenerationMethods?.includes('generateContent')
            );
            
            if (textModels.length > 0) {
                const bestModel = textModels[0].name.replace('models/', '');
                console.log(`💡 Recommended model for text analysis: ${bestModel}`);
                return bestModel;
            }
            
        } else {
            console.log('❌ No models found in response');
        }
        
    } catch (error) {
        console.log('❌ Error listing models:', error.message);
    }
}

listAvailableModels();