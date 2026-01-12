/**
 * Check Gemini API quota and usage status
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function checkAPIQuota(apiKey, keyName) {
    console.log(`\n🔍 Checking ${keyName}:`);
    console.log(`Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try the most basic model first
        const modelsToTest = [
            'gemini-1.5-flash-8b',
            'gemini-1.5-flash',
            'gemini-1.0-pro',
            'gemini-pro'
        ];
        
        for (const modelName of modelsToTest) {
            try {
                console.log(`  Testing ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const result = await model.generateContent({
                    contents: [{ parts: [{ text: "Say 'OK'" }] }],
                    generationConfig: {
                        maxOutputTokens: 5,
                        temperature: 0
                    }
                });
                
                const response = await result.response;
                const text = response.text();
                
                console.log(`  ✅ ${modelName}: Working! Response: "${text.trim()}"`);
                
                // Check usage metadata if available
                if (result.response.usageMetadata) {
                    const usage = result.response.usageMetadata;
                    console.log(`     Token usage: ${usage.promptTokenCount || 0} prompt + ${usage.candidatesTokenCount || 0} completion = ${usage.totalTokenCount || 0} total`);
                }
                
                return { working: true, model: modelName, key: keyName };
                
            } catch (error) {
                if (error.message.includes('quota') || error.message.includes('limit')) {
                    console.log(`  ❌ ${modelName}: QUOTA EXCEEDED`);
                    console.log(`     Error: ${error.message.split('\n')[0]}`);
                } else if (error.message.includes('404') || error.message.includes('not found')) {
                    console.log(`  ⚠️  ${modelName}: Model not available`);
                } else {
                    console.log(`  ❌ ${modelName}: ${error.message.split('\n')[0]}`);
                }
            }
        }
        
        return { working: false, key: keyName };
        
    } catch (error) {
        console.log(`  ❌ API Key Error: ${error.message}`);
        return { working: false, key: keyName, error: error.message };
    }
}

async function main() {
    console.log('🔑 Checking Gemini API Keys and Quota Status...\n');
    
    const key1 = process.env.VITE_GOOGLE_AI_API_KEY;
    const key2 = process.env.GEMINI_API_KEY;
    
    if (!key1 && !key2) {
        console.log('❌ No API keys found in .env file');
        return;
    }
    
    const results = [];
    
    if (key1) {
        const result1 = await checkAPIQuota(key1, 'VITE_GOOGLE_AI_API_KEY');
        results.push(result1);
    }
    
    if (key2 && key2 !== key1) {
        const result2 = await checkAPIQuota(key2, 'GEMINI_API_KEY');
        results.push(result2);
    }
    
    console.log('\n📊 Summary:');
    const workingKeys = results.filter(r => r.working);
    
    if (workingKeys.length > 0) {
        console.log('✅ Working API keys:');
        workingKeys.forEach(key => {
            console.log(`   - ${key.key}: ${key.model}`);
        });
        
        // Update .env with working configuration
        const bestKey = workingKeys[0];
        console.log(`\n💡 Recommendation: Use ${bestKey.key} with model ${bestKey.model}`);
        
    } else {
        console.log('❌ No working API keys found');
        console.log('\n🔧 Solutions:');
        console.log('1. Check your quota at: https://aistudio.google.com/app/apikey');
        console.log('2. Wait for quota reset (usually daily)');
        console.log('3. Upgrade to paid plan for higher limits');
        console.log('4. Create a new API key if current one is exhausted');
    }
}

main().catch(console.error);