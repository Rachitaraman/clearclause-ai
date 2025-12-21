/**
 * Retry Service for ClearClause AI
 * Implements exponential backoff retry logic for AWS Bedrock calls
 */

import { isRetryableError, logDetailedError } from './errorHandler.js';

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    jitterFactor: 0.1 // 10% jitter
};

/**
 * Calculate exponential backoff delay with jitter
 * @param {number} attempt - Current attempt number (0-based)
 * @returns {number} Delay in milliseconds
 */
export function calculateBackoffDelay(attempt) {
    const exponentialDelay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
    const cappedDelay = Math.min(exponentialDelay, RETRY_CONFIG.maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * RETRY_CONFIG.jitterFactor * Math.random();
    
    return Math.floor(cappedDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {string} context - Context for logging
 * @param {Object} options - Retry options
 * @returns {Promise} Result of successful function call
 */
export async function retryWithBackoff(fn, context, options = {}) {
    const config = { ...RETRY_CONFIG, ...options };
    let lastError;
    
    for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
        try {
            console.log(`🔄 [${context}] Attempt ${attempt + 1}/${config.maxAttempts}`);
            
            const result = await fn();
            
            if (attempt > 0) {
                console.log(`✅ [${context}] Succeeded on attempt ${attempt + 1}`);
            }
            
            return result;
            
        } catch (error) {
            lastError = error;
            
            // Log the error
            logDetailedError(context, error, 'retry_attempt', {
                attempt: attempt + 1,
                maxAttempts: config.maxAttempts,
                isRetryable: isRetryableError(error)
            });
            
            // Check if we should retry
            if (!isRetryableError(error)) {
                console.log(`❌ [${context}] Non-retryable error, stopping retries`);
                throw error;
            }
            
            // If this was the last attempt, throw the error
            if (attempt === config.maxAttempts - 1) {
                console.log(`❌ [${context}] All retry attempts exhausted`);
                throw error;
            }
            
            // Calculate delay and wait
            const delay = calculateBackoffDelay(attempt);
            console.log(`⏳ [${context}] Waiting ${delay}ms before retry ${attempt + 2}`);
            await sleep(delay);
        }
    }
    
    throw lastError;
}

/**
 * Retry wrapper specifically for Bedrock API calls
 * @param {Function} bedrockCall - Bedrock API call function
 * @param {string} modelId - Model ID for logging
 * @returns {Promise} Result of successful Bedrock call
 */
export async function retryBedrockCall(bedrockCall, modelId) {
    return retryWithBackoff(
        bedrockCall,
        `Bedrock-${modelId}`,
        {
            maxAttempts: 3,
            baseDelay: 2000, // Slightly longer for Bedrock
            maxDelay: 15000
        }
    );
}