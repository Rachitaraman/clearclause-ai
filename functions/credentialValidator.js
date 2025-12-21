/**
 * Credential Validation Service for ClearClause AI
 * Validates AWS credentials and Bedrock access permissions
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { logDetailedError, categorizeError } from './errorHandler.js';

/**
 * Validate AWS credentials and Bedrock access
 * @param {Object} awsConfig - AWS configuration object
 * @param {string} modelId - Bedrock model ID to test
 * @returns {Promise<Object>} Validation results
 */
export async function validateCredentials(awsConfig, modelId) {
    const results = {
        valid: false,
        details: {
            accessKeyValid: false,
            secretKeyValid: false,
            regionValid: false,
            bedrockAccess: false,
            modelAccess: false
        },
        errors: [],
        recommendations: []
    };

    try {
        // Basic credential validation
        if (!awsConfig.credentials?.accessKeyId) {
            results.errors.push('AWS Access Key ID is missing');
            results.recommendations.push('Set VITE_AWS_ACCESS_KEY_ID in your .env file');
        } else {
            results.details.accessKeyValid = true;
        }

        if (!awsConfig.credentials?.secretAccessKey) {
            results.errors.push('AWS Secret Access Key is missing');
            results.recommendations.push('Set VITE_AWS_SECRET_ACCESS_KEY in your .env file');
        } else {
            results.details.secretKeyValid = true;
        }

        if (!awsConfig.region) {
            results.errors.push('AWS Region is missing');
            results.recommendations.push('Set VITE_AWS_REGION in your .env file');
        } else {
            results.details.regionValid = true;
        }

        // If basic credentials are missing, return early
        if (!results.details.accessKeyValid || !results.details.secretKeyValid || !results.details.regionValid) {
            return results;
        }

        // Test Bedrock access with a minimal request
        try {
            const bedrockClient = new BedrockRuntimeClient(awsConfig);
            
            // Test with a minimal prompt to check model access
            const testParams = {
                modelId: modelId,
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify({
                    anthropic_version: 'bedrock-2023-05-31',
                    max_tokens: 10,
                    messages: [
                        {
                            role: 'user',
                            content: 'Hello'
                        }
                    ]
                })
            };

            const command = new InvokeModelCommand(testParams);
            await bedrockClient.send(command);
            
            results.details.bedrockAccess = true;
            results.details.modelAccess = true;
            results.valid = true;
            
            console.log('✅ Credential validation successful - Bedrock access confirmed');
            
        } catch (error) {
            const category = categorizeError(error);
            
            logDetailedError('credential_validation', error, category);
            
            if (category === 'billing') {
                results.errors.push('AWS Bedrock requires a valid payment method');
                results.recommendations.push('Add a payment method to your AWS account and enable Bedrock model access in AWS Console');
            } else if (category === 'permissions') {
                results.errors.push('Insufficient Bedrock permissions');
                results.recommendations.push('Grant bedrock:InvokeModel permission to your AWS credentials');
            } else if (category === 'model') {
                results.errors.push(`Model ${modelId} not accessible`);
                results.recommendations.push('Check if the Claude model is available in your AWS region and account');
            } else {
                results.errors.push(`Bedrock access test failed: ${error.message}`);
                results.recommendations.push('Check AWS credentials and Bedrock service availability');
            }
        }

    } catch (error) {
        logDetailedError('credential_validation', error, 'validation_error');
        results.errors.push(`Validation failed: ${error.message}`);
    }

    return results;
}

/**
 * Test model invocation with detailed error reporting
 * @param {BedrockRuntimeClient} bedrockClient - Bedrock client
 * @param {string} modelId - Model ID to test
 * @returns {Promise<Object>} Test results
 */
export async function testModelInvocation(bedrockClient, modelId) {
    try {
        const params = {
            modelId: modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 50,
                messages: [
                    {
                        role: 'user',
                        content: 'Test connection - respond with "OK"'
                    }
                ]
            })
        };

        console.log(`🧪 Testing model invocation: ${modelId}`);
        const command = new InvokeModelCommand(params);
        const result = await bedrockClient.send(command);
        
        const responseBody = JSON.parse(new TextDecoder().decode(result.body));
        console.log('✅ Model test successful:', responseBody.content[0].text);
        
        return {
            success: true,
            response: responseBody.content[0].text,
            modelId: modelId
        };
        
    } catch (error) {
        logDetailedError('model_test', error, categorizeError(error), { modelId });
        
        return {
            success: false,
            error: error.message,
            modelId: modelId
        };
    }
}