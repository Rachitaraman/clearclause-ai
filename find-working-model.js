/**
 * Find a working Gemini model
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCNtkTj8TgMBjS9O3nG9oRGg1Qnln6Eqro';

const modelsToTry = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-pro',
    'gemini-pro-vision',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash',
    'models/gemini-pro',
    'models/gemini-pro-vision'
];

async function findWorkingModel() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    for (const modelName of modelsToTry) {
        try {
            console.log(`🧪 Testing model: ${modelName}`);
            
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 50,
                }
            });
            
            const result = await model.generateContent({
                contents: [{
                    parts: [{ text: "Hello" }]
                }]
            });
            
            const response = result.response;
            const text = response.text();
            
            console.log(`✅ SUCCESS with ${modelName}! Response: ${text.substring(0, 100)}`);
            return modelName;
            
        } catch (error) {
            console.log(`❌ Failed with ${modelName}: ${error.message.substring(0, 100)}...`);
        }
    }
    
    console.log('❌ No working models found');
    return null;
}

findWorkingModel();