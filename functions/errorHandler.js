/**
 * Enhanced Error Handler for ClearClause AI
 * Provides detailed error categorization, logging, and user-friendly messages
 */

/**
 * Error categories for classification
 */
export const ERROR_CATEGORIES = {
    CREDENTIALS: 'credentials',
    PERMISSIONS: 'permissions', 
    NETWORK: 'network',
    QUOTA: 'quota',
    MODEL: 'model',
    VALIDATION: 'validation',
    BILLING: 'billing',
    UNKNOWN: 'unknown'
};

/**
 * Categorize AWS/Bedrock errors based on error details
 * @param {Error} error - The error object
 * @returns {string} Error category
 */
export function categorizeError(error) {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || error.name || '';

    // Payment/Billing errors (specific to Bedrock)
    if (errorMessage.includes('invalid_payment_instrument') ||
        errorMessage.includes('payment instrument') ||
        errorMessage.includes('marketplace subscription')) {
        return 'billing';
    }

    // Credential-related errors
    if (errorMessage.includes('credentials') || 
        errorMessage.includes('access denied') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('invalid access key') ||
        errorMessage.includes('signature') ||
        errorCode.includes('CredentialsError') ||
        errorCode.includes('UnauthorizedOperation')) {
        return ERROR_CATEGORIES.CREDENTIALS;
    }

    // Permission-related errors
    if (errorMessage.includes('permission') ||
        errorMessage.includes('forbidden') ||
        errorMessage.includes('access denied') ||
        errorMessage.includes('not authorized') ||
        errorCode.includes('AccessDenied') ||
        errorCode.includes('Forbidden')) {
        return ERROR_CATEGORIES.PERMISSIONS;
    }

    // Network-related errors
    if (errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('dns') ||
        errorMessage.includes('unreachable') ||
        errorCode.includes('NetworkError') ||
        errorCode.includes('TimeoutError')) {
        return ERROR_CATEGORIES.NETWORK;
    }

    // Quota/Rate limiting errors
    if (errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('throttl') ||
        errorMessage.includes('too many requests') ||
        errorCode.includes('ThrottlingException') ||
        errorCode.includes('QuotaExceeded')) {
        return ERROR_CATEGORIES.QUOTA;
    }

    // Model-related errors
    if (errorMessage.includes('model') ||
        errorMessage.includes('bedrock') ||
        errorMessage.includes('anthropic') ||
        errorMessage.includes('claude') ||
        errorCode.includes('ModelError') ||
        errorCode.includes('ValidationException')) {
        return ERROR_CATEGORIES.MODEL;
    }

    // Validation errors
    if (errorMessage.includes('validation') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('malformed') ||
        errorCode.includes('ValidationError')) {
        return ERROR_CATEGORIES.VALIDATION;
    }

    return ERROR_CATEGORIES.UNKNOWN;
}

/**
 * Generate user-friendly error messages with resolution steps
 * @param {string} category - Error category
 * @param {Error} error - Original error object
 * @returns {Object} User-friendly error details
 */
export function generateUserMessage(category, error) {
    const errorMessages = {
        [ERROR_CATEGORIES.BILLING]: {
            message: "AWS Bedrock requires a valid payment method",
            resolution: "Add a valid payment method to your AWS account, then enable Bedrock model access in the AWS Console (Bedrock → Model Access → Request Access for Claude models).",
            technical: `Billing error: ${error.message}`
        },
        [ERROR_CATEGORIES.CREDENTIALS]: {
            message: "AWS credentials are invalid or expired",
            resolution: "Please check your AWS access key ID and secret access key in the .env file. Ensure they are valid and not expired.",
            technical: `Credential error: ${error.message}`
        },
        [ERROR_CATEGORIES.PERMISSIONS]: {
            message: "Insufficient AWS permissions for Bedrock access",
            resolution: "Your AWS credentials need Bedrock permissions. Contact your AWS administrator to grant 'bedrock:InvokeModel' permissions.",
            technical: `Permission error: ${error.message}`
        },
        [ERROR_CATEGORIES.NETWORK]: {
            message: "Network connectivity issue with AWS services",
            resolution: "Check your internet connection and ensure AWS services are accessible. Try again in a few moments.",
            technical: `Network error: ${error.message}`
        },
        [ERROR_CATEGORIES.QUOTA]: {
            message: "AWS service quota or rate limit exceeded",
            resolution: "You've hit AWS usage limits. Wait a few minutes before trying again, or contact AWS support to increase your quotas.",
            technical: `Quota error: ${error.message}`
        },
        [ERROR_CATEGORIES.MODEL]: {
            message: "AI model access or configuration issue",
            resolution: "The Claude AI model may not be available in your AWS region or account. Check your Bedrock model access in the AWS console.",
            technical: `Model error: ${error.message}`
        },
        [ERROR_CATEGORIES.VALIDATION]: {
            message: "Invalid request format or parameters",
            resolution: "There's an issue with the request format. This is likely a system configuration problem.",
            technical: `Validation error: ${error.message}`
        },
        [ERROR_CATEGORIES.UNKNOWN]: {
            message: "An unexpected error occurred",
            resolution: "Please try again. If the problem persists, check your AWS configuration and network connectivity.",
            technical: `Unknown error: ${error.message}`
        }
    };

    return errorMessages[category] || errorMessages[ERROR_CATEGORIES.UNKNOWN];
}

/**
 * Log detailed error information for debugging
 * @param {string} context - Context where error occurred
 * @param {Error} error - Error object
 * @param {string} category - Error category
 * @param {Object} additionalInfo - Additional debugging info
 */
export function logDetailedError(context, error, category, additionalInfo = {}) {
    const errorDetails = {
        timestamp: new Date().toISOString(),
        context: context,
        category: category,
        error: {
            message: error.message,
            code: error.code || error.name,
            stack: error.stack
        },
        additionalInfo: additionalInfo
    };

    console.error(`🚨 [${context}] ${category.toUpperCase()} ERROR:`, errorDetails);
    
    // Log specific AWS error details if available
    if (error.$metadata) {
        console.error('AWS Error Metadata:', error.$metadata);
    }
    
    if (error.$response) {
        console.error('AWS Response Details:', {
            statusCode: error.$response.statusCode,
            headers: error.$response.headers
        });
    }
}

/**
 * Create a detailed error response for API responses
 * @param {Error} error - Original error
 * @param {string} context - Context where error occurred
 * @returns {Object} Detailed error response
 */
export function createDetailedErrorResponse(error, context) {
    const category = categorizeError(error);
    const userMessage = generateUserMessage(category, error);
    
    logDetailedError(context, error, category);
    
    return {
        success: false,
        error: {
            category: category,
            message: userMessage.message,
            resolution: userMessage.resolution,
            technical: userMessage.technical,
            context: context,
            timestamp: new Date().toISOString()
        }
    };
}

/**
 * Determine if an error is retryable
 * @param {Error} error - Error object
 * @returns {boolean} Whether the error should be retried
 */
export function isRetryableError(error) {
    const category = categorizeError(error);
    
    // Retryable error categories
    const retryableCategories = [
        ERROR_CATEGORIES.NETWORK,
        ERROR_CATEGORIES.QUOTA
    ];
    
    return retryableCategories.includes(category);
}