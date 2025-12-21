/**
 * Enable Bedrock Model Access Programmatically
 */

import { BedrockClient, PutModelInvocationLoggingConfigurationCommand, GetModelInvocationLoggingConfigurationCommand } from '@aws-sdk/client-bedrock';
import dotenv from 'dotenv';

dotenv.config();

const AWS_CONFIG = {
    region: process.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY
    }
};

console.log('\n🔧 Attempting to Enable Bedrock Model Access...\n');

async function enableBedrockAccess() {
    try {
        const bedrockClient = new BedrockClient(AWS_CONFIG);
        
        // Try to get current configuration to test access
        const getCommand = new GetModelInvocationLoggingConfigurationCommand({});
        const result = await bedrockClient.send(getCommand);
        
        console.log('✅ Bedrock service is accessible!');
        console.log('Current logging config:', result);
        
        return true;
    } catch (error) {
        console.log('❌ Bedrock access issue:', error.message);
        
        if (error.message.includes('INVALID_PAYMENT_INSTRUMENT')) {
            console.log('\n💡 Payment method needs to be validated by AWS');
            console.log('   This usually takes 5-15 minutes for new accounts');
        }
        
        return false;
    }
}

enableBedrockAccess().catch(console.error);