/**
 * Check what models are available with the current API key
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCNtkTj8TgMBjS9O3nG9oRGg1Qnln6Eqro';

async function checkAvailableModels() {
    try {
        console.log('🔍 Checking available models...');
        
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // List available models
        const models = await genAI.listModels();
        
        console.log('✅ Available models:');
        models.forEach(model => {
            console.log(`- ${model.name}`);
            console.log(`  Display Name: ${model.displayName}`);
            console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
            console.log('');
        });
        
        // Test with the first available model that supports generateContent
        const availableModel = models.find(model => 
            model.supportedGenerationMethods?.includes('generateContent')
        );
        
        if (availableModel) {
            console.log(`🧪 Testing with model: ${availableModel.name}`);
            
            const model = genAI.getGenerativeModel({ 
                model: availableModel.name.replace('models/', ''),
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 100,
                }
            });
            
            const result = await model.generateContent({
                contents: [{
                    parts: [{ text: "Hello, please respond with 'Model works'" }]
                }]
            });
            
            const response = result.response;
            const text = response.text();
            
            console.log('✅ Model test SUCCESS! Response:', text);
        }
        
    } catch (error) {
        console.error('❌ Model check failed:', error.message);
    }
}

checkAvailableModels();