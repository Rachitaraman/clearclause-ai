/**
 * Serverless function template for ClearClause AI
 * Handles HTTP requests with proper error handling and status codes
 */

/**
 * Main serverless function handler
 * @param {Object} request - HTTP request object
 * @param {string} request.method - HTTP method (GET, POST, etc.)
 * @param {Object} request.headers - Request headers
 * @param {string|Object} request.body - Request body
 * @param {Object} request.query - Query parameters
 * @returns {Object} HTTP response object
 */
export async function handler(request) {
    try {
        // Extract request information
        const { method, headers, body, query } = request;

        // Log request for debugging (in development)
        console.log(`Processing ${method} request`);

        // Handle different HTTP methods
        switch (method) {
            case 'GET':
                return handleGet(query);

            case 'POST':
                return handlePost(body, headers);

            case 'PUT':
                return handlePut(body, headers);

            case 'DELETE':
                return handleDelete(query);

            default:
                return createErrorResponse(405, 'Method Not Allowed', `Method ${method} is not supported`);
        }
    } catch (error) {
        console.error('Function execution error:', error);
        return createErrorResponse(500, 'Internal Server Error', 'An unexpected error occurred');
    }
}

/**
 * Handle GET requests
 * @param {Object} query - Query parameters
 * @returns {Object} HTTP response
 */
function handleGet(query) {
    return createSuccessResponse(200, {
        message: 'GET request processed successfully',
        timestamp: new Date().toISOString(),
        query: query || {}
    });
}

/**
 * Handle POST requests
 * @param {string|Object} body - Request body
 * @param {Object} headers - Request headers
 * @returns {Object} HTTP response
 */
function handlePost(body, headers) {
    // Validate content type for POST requests
    const contentType = headers['content-type'] || headers['Content-Type'];

    if (contentType && !contentType.includes('application/json')) {
        return createErrorResponse(400, 'Bad Request', 'Content-Type must be application/json');
    }

    // Check if this is a connectivity test request
    const isConnectivityTest = body && body.test === 'hello backend';

    return createSuccessResponse(201, {
        message: isConnectivityTest ? 'Backend is working' : 'POST request processed successfully',
        timestamp: new Date().toISOString(),
        received: body || {}
    });
}

/**
 * Handle PUT requests
 * @param {string|Object} body - Request body
 * @param {Object} headers - Request headers
 * @returns {Object} HTTP response
 */
function handlePut(body, headers) {
    return createSuccessResponse(200, {
        message: 'PUT request processed successfully',
        timestamp: new Date().toISOString(),
        updated: body || {}
    });
}

/**
 * Handle DELETE requests
 * @param {Object} query - Query parameters
 * @returns {Object} HTTP response
 */
function handleDelete(query) {
    const id = query?.id;

    if (!id) {
        return createErrorResponse(400, 'Bad Request', 'ID parameter is required for DELETE requests');
    }

    return createSuccessResponse(200, {
        message: 'DELETE request processed successfully',
        timestamp: new Date().toISOString(),
        deleted: { id }
    });
}

/**
 * Create a success response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @returns {Object} HTTP response object
 */
function createSuccessResponse(statusCode, data) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify(data)
    };
}

/**
 * Create an error response object
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error type
 * @param {string} message - Error message
 * @returns {Object} HTTP response object
 */
function createErrorResponse(statusCode, error, message) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
            error,
            message,
            timestamp: new Date().toISOString()
        })
    };
}

// Default export for compatibility
export default handler;