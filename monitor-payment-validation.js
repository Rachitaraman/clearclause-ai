/**
 * Monitor AWS Payment Validation for Bedrock
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AWS_CONFIG = {
    region: process.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY
    }
};

const BEDROCK_MODEL = process.env.VITE_BEDROCK_MODEL;

console.log('\n🔄 Monitoring AWS Payment Validation for Bedrock\n');
console.log(`Model: ${BEDROCK_MODEL}`);
console.log(`Region: ${AWS_CONFIG.region}`);
console.log('\n' + '='.repeat(60) + '\n');

async function checkBedrock() {
    try {
        const bedrockClient = new BedrockRuntimeClient(AWS_CONFIG);
        
        const params = {
            modelId: BEDROCK_MODEL,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 50,
                messages: [
                    {
                        role: 'user',
                        content: 'Say "Payment validation complete!" if you can read this.'
                    }
                ]
            })
        };

        const command = new InvokeModelCommand(params);
        const result = await bedrockClient.send(command);
        
        const responseBody = JSON.parse(new TextDecoder().decode(result.body));
        const aiResponse = responseBody.content[0].text;
        
        return {
            success: true,
            response: aiResponse
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function monitorPaymentValidation() {
    let attempt = 1;
    const maxAttempts = 20; // Monitor for up to 20 minutes
    
    console.log('🕐 Starting payment validation monitoring...');
    console.log('   Checking every 60 seconds for up to 20 minutes\n');
    
    while (attempt <= maxAttempts) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Attempt ${attempt}/${maxAttempts}: Testing Bedrock connection...`);
        
        const result = await checkBedrock();
        
        if (result.success) {
            console.log(`\n🎉 SUCCESS! Payment validation complete!`);
            console.log(`✅ Claude AI Response: "${result.response}"`);
            console.log(`\n🚀 Your ClearClause AI now has REAL AI!`);
            console.log(`   Open http://localhost:3001 to try it with real Claude analysis!`);
            console.log('\n' + '='.repeat(60));
            return true;
        } else {
            if (result.error.includes('INVALID_PAYMENT_INSTRUMENT')) {
                console.log(`   ⏳ Still processing payment validation...`);
            } else if (result.error.includes('Could not resolve')) {
                console.log(`   ❌ Model not available: ${result.error}`);
                break;
            } else {
                console.log(`   ⚠️  Error: ${result.error.substring(0, 80)}...`);
            }
        }
        
        if (attempt < maxAttempts) {
            console.log(`   💤 Waiting 60 seconds before next check...\n`);
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
        }
        
        attempt++;
    }
    
    console.log(`\n⏰ Monitoring completed after ${maxAttempts} attempts.`);
    console.log(`   Payment validation is taking longer than expected.`);
    console.log(`   Your app is fully functional with mock data in the meantime!`);
    console.log('\n' + '='.repeat(60));
    return false;
}

// Start monitoring
monitorPaymentValidation().catch(console.error);