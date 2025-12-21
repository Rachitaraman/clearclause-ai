// Bedrock Monitoring Script - Check every few minutes until it's ready
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';

dotenv.config();

const AWS_ACCESS_KEY_ID = process.env.VITE_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.VITE_AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.VITE_AWS_REGION || 'us-east-1';

console.log('🔄 BEDROCK MONITORING - Checking every 2 minutes until ready...\n');

let checkCount = 0;
const maxChecks = 15; // Check for 30 minutes max

async function checkBedrock() {
    checkCount++;
    const timestamp = new Date().toLocaleTimeString();
    
    try {
        console.log(`[${timestamp}] Check ${checkCount}/${maxChecks} - Testing Bedrock...`);
        
        const bedrockClient = new BedrockRuntimeClient({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        });
        
        const command = new InvokeModelCommand({
            modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 50,
                messages: [{ role: 'user', content: 'Test successful!' }]
            })
        });
        
        const result = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(result.body));
        
        console.log('🎉🎉🎉 BEDROCK IS NOW WORKING! 🎉🎉🎉');
        console.log(`✅ Success at: ${timestamp}`);
        console.log(`✅ Response: ${responseBody.content[0].text}`);
        console.log('\n🚀 Your ClearClause AI will now use real Claude 3 Sonnet!');
        console.log('💡 Restart your development server to activate real AI in your app');
        
        process.exit(0);
        
    } catch (error) {
        if (error.message.includes('INVALID_PAYMENT_INSTRUMENT')) {
            console.log(`   ⏳ Still processing payment method... (${checkCount * 2} minutes elapsed)`);
        } else {
            console.log(`   ❌ Error: ${error.message.substring(0, 60)}...`);
        }
        
        if (checkCount >= maxChecks) {
            console.log('\n⚠️  Reached maximum check time (30 minutes)');
            console.log('💡 Payment processing may take longer than usual');
            console.log('💡 Try running this script again later or contact AWS support');
            process.exit(1);
        }
        
        console.log(`   ⏰ Next check in 2 minutes... (${maxChecks - checkCount} checks remaining)`);
        setTimeout(checkBedrock, 120000); // Check every 2 minutes
    }
}

console.log('Starting monitoring...');
console.log('💡 This will check every 2 minutes until Bedrock is ready');
console.log('💡 Press Ctrl+C to stop monitoring\n');

checkBedrock();