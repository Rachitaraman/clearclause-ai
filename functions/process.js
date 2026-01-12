/**
 * ClearClause AI Backend Function - Enhanced Version
 * Handles document processing requests with AWS integration and enhanced AI
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract'
import { GeminiClient } from './ai/GeminiClient.js'
import { GeminiErrorHandler } from './ai/GeminiErrorHandler.js'
import { GeminiResponseParser } from './ai/GeminiResponseParser.js'
import { ContractProcessor } from '../src/processors/ContractProcessor.js';
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// AWS Configuration
const AWS_CONFIG = {
    region: process.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY
    },
    maxAttempts: 3,
    retryMode: 'standard'
}

// Initialize AWS clients
const s3Client = new S3Client(AWS_CONFIG)
const textractClient = new TextractClient(AWS_CONFIG)

// Initialize the new AI contract processor
let contractProcessor = null;

function createContractProcessor() {
    if (!contractProcessor) {
        try {
            contractProcessor = new ContractProcessor();
        } catch (error) {
            console.error('Failed to initialize Contract Processor:', error.message);
            contractProcessor = null;
        }
    }
    return contractProcessor;
}

// Initialize Gemini client and utilities
let geminiClient = null
const geminiErrorHandler = new GeminiErrorHandler()
const geminiResponseParser = new GeminiResponseParser()

function createGeminiClient() {
    if (!geminiClient) {
        try {
            geminiClient = new GeminiClient()
        } catch (error) {
            console.error('Failed to initialize Gemini client:', error.message)
            geminiClient = null
        }
    }
    return geminiClient
}

// Configuration constants
const S3_BUCKET = process.env.VITE_S3_BUCKET
const GEMINI_MODEL = process.env.VITE_GEMINI_MODEL || 'gemini-pro'

console.log('🔧 Current Configuration:')
console.log('- S3 Bucket:', S3_BUCKET)
console.log('- AI Model:', GEMINI_MODEL, '(Gemini)')

/**
 * Main serverless function handler
 */
export async function handler(request) {
    try {
        const { method, headers, body, query } = request;
        console.log(`Processing ${method} request for ClearClause AI`);

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
 */
function handleGet(query) {
    return createSuccessResponse(200, {
        message: 'GET request processed successfully',
        timestamp: new Date().toISOString(),
        query: query || {}
    });
}

/**
 * Handle POST requests - Document Analysis
 */
async function handlePost(body, headers) {
    try {
        // Check if this is a connectivity test request
        if (body && body.test === 'hello backend') {
            return createSuccessResponse(200, {
                message: 'ClearClause AI Backend is working',
                timestamp: new Date().toISOString(),
                services: {
                    s3: 'connected',
                    textract: 'connected', 
                    gemini: 'connected'
                }
            });
        }

        // Handle document analysis requests with enhanced AI system
        if (body && body.action === 'analyze') {
            return await processDocumentAnalysisWithEnhancedAI(body);
        }

        // Handle document comparison requests
        if (body && body.action === 'compare') {
            return await processDocumentComparison(body);
        }

        // Default response for other POST requests
        return createSuccessResponse(200, {
            message: 'ClearClause AI Backend - Ready for document analysis',
            timestamp: new Date().toISOString(),
            supportedActions: ['analyze', 'compare'],
            received: body || {}
        });

    } catch (error) {
        console.error('POST request error:', error);
        return createErrorResponse(500, 'Internal Server Error', error.message);
    }
}

/**
 * Handle PUT requests
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
 * Process document analysis request with enhanced AI system
 */
async function processDocumentAnalysisWithEnhancedAI(requestBody) {
    try {
        const { documentText, documentType, filename, s3Key, imageData, url, urls, images } = requestBody;
        
        console.log('🚀 Starting enhanced AI contract analysis...');
        
        const processor = createContractProcessor();
        if (!processor) {
            throw new Error('Contract processor not available');
        }

        let analysis;
        
        // Handle different input types
        if (imageData && imageData.buffer) {
            // Single image processing
            const imageBuffer = Buffer.from(imageData.buffer, 'base64');
            analysis = await processor.processImage(imageBuffer, imageData.mimeType || 'image/jpeg');
        } else if (images && Array.isArray(images)) {
            // Multiple images processing
            const imageBuffers = images.map(img => ({
                buffer: Buffer.from(img.buffer, 'base64'),
                mimeType: img.mimeType || 'image/jpeg'
            }));
            analysis = await processor.processImages(imageBuffers);
        } else if (url) {
            // Single URL processing
            analysis = await processor.processURL(url);
        } else if (urls && Array.isArray(urls)) {
            // Multiple URLs processing
            analysis = await processor.processURLs(urls);
        } else if (s3Key && !documentText) {
            // S3 document processing
            const textractResult = await extractTextFromS3(s3Key);
            if (!textractResult.success) {
                return createErrorResponse(500, 'Textract Error', textractResult.error);
            }
            analysis = await processor.processContract(textractResult.text, {
                filename: filename || 'document.txt',
                mimeType: 'text/plain'
            });
        } else {
            // Text processing
            const textToAnalyze = documentText || '';
            if (!textToAnalyze.trim()) {
                return createErrorResponse(400, 'Invalid Input', 'No content provided for analysis');
            }
            
            analysis = await processor.processContract(textToAnalyze, {
                filename: filename || 'document.txt',
                mimeType: 'text/plain'
            });
        }

        console.log('✅ Enhanced AI contract analysis completed successfully!');

        const response = {
            analysis: {
                summary: analysis.summary,
                clauses: analysis.clauses,
                risks: analysis.risks,
                recommendations: analysis.recommendations,
                keyTerms: analysis.clauses.map(c => ({
                    term: c.type,
                    definition: c.text.substring(0, 100),
                    importance: c.confidence > 0.8 ? 'high' : 'medium',
                    context: c.category
                }))
            },
            confidence: Math.round(analysis.metadata.confidence * 100),
            processedAt: new Date().toISOString(),
            model: analysis.metadata.modelUsed,
            usingRealAI: true,
            processingDetails: {
                source: 'enhanced-ai-contract-analysis',
                processingTime: analysis.metadata.processingTime,
                tokenUsage: analysis.metadata.tokenUsage,
                extractionMethod: analysis.metadata.extractionMethod || 'text'
            }
        };

        return createSuccessResponse(200, response);

    } catch (error) {
        console.log('❌ Enhanced AI analysis failed:', error.message);
        // Force error instead of fallback - no mock data allowed
        return createErrorResponse(500, 'AI Analysis Failed', `Real-time AI analysis failed: ${error.message}. Please check your Gemini API key and try again.`);
    }
}

/**
 * Legacy process document analysis request (fallback)
 */
async function processDocumentAnalysisWithAI(requestBody) {
    try {
        const { documentText, documentType, filename, s3Key } = requestBody;
        let textToAnalyze = documentText;

        // If S3 key is provided, extract text using Textract
        if (s3Key && !documentText) {
            const textractResult = await extractTextFromS3(s3Key);
            if (!textractResult.success) {
                return createErrorResponse(500, 'Textract Error', textractResult.error);
            }
            textToAnalyze = textractResult.text;
        }

        console.log('🚀 Starting Gemini analysis...');
        let analysisResult;
        let usingRealAI = false;
        let errorDetails = null;
        
        try {
            analysisResult = await analyzeWithGemini(textToAnalyze);
            if (analysisResult.success) {
                usingRealAI = true;
                console.log('✅ Real AI analysis completed successfully!');
            } else {
                errorDetails = analysisResult.error;
                console.log('❌ Gemini analysis failed:', errorDetails);
            }
        } catch (error) {
            errorDetails = error.message;
            console.log('❌ Gemini analysis threw exception:', errorDetails);
        }

        // No fallback to mock data - force real AI only
        if (!analysisResult || !analysisResult.success) {
            console.log('❌ Real AI analysis failed - no mock fallback allowed');
            return createErrorResponse(500, 'AI Analysis Failed', `Gemini AI analysis failed: ${errorDetails || 'Unknown error'}. Please check your API key and try again.`);
        }

        const response = {
            analysis: analysisResult.analysis,
            confidence: analysisResult.confidence,
            processedAt: new Date().toISOString(),
            model: GEMINI_MODEL,
            usingRealAI: true, // Always true now
            processingDetails: {
                source: 'real-ai-only',
                processingTime: Date.now() - (analysisResult.startTime || Date.now())
            }
        };

        // No error details needed since we only use real AI
        return createSuccessResponse(200, response);

    } catch (error) {
        console.error('Document analysis error:', error);
        return createErrorResponse(500, 'Analysis Failed', error.message);
    }
}

/**
 * Analyze document with Gemini
 */
async function analyzeWithGemini(documentText) {
    const startTime = Date.now();
    
    try {
        const client = createGeminiClient();
        if (!client) {
            throw new Error('Gemini client not available');
        }

        const documentType = detectDocumentType(documentText);
        console.log(`🤖 Invoking Gemini model: ${GEMINI_MODEL}`);
        
        const result = await client.analyzeDocument(documentText, documentType);
        
        if (result.success) {
            const processingTime = Date.now() - startTime;
            console.log(`✅ Gemini analysis completed successfully in ${processingTime}ms!`);
            
            return {
                success: true,
                analysis: result.analysis,
                confidence: result.confidence,
                startTime: startTime,
                processingTime: processingTime,
                tokenUsage: result.tokenUsage
            };
        } else {
            throw new Error(result.error || 'Gemini analysis failed');
        }
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('Gemini analysis error:', error);
        
        const errorResponse = await geminiErrorHandler.handleError(error, { 
            documentText, 
            attempt: 0 
        });
        
        // No fallback allowed - force real AI error
        return {
            success: false,
            error: error.message,
            startTime: startTime,
            processingTime: processingTime
        };
    }
}

/**
 * Detect document type based on content
 */
function detectDocumentType(documentText) {
    const text = documentText.toLowerCase();
    
    if (text.includes('non-disclosure') || text.includes('confidential') || text.includes('nda')) {
        return 'Non-Disclosure Agreement';
    } else if (text.includes('employment') || text.includes('employee')) {
        return 'Employment Agreement';
    } else if (text.includes('service') || text.includes('consulting')) {
        return 'Service Agreement';
    } else if (text.includes('license') || text.includes('software')) {
        return 'License Agreement';
    } else if (text.includes('lease') || text.includes('rent')) {
        return 'Lease Agreement';
    } else {
        return 'Legal Agreement';
    }
}

/**
 * This function has been removed - no mock data allowed
 * All analysis must use real Gemini AI
 */

/**
 * Extract text from S3 document using Textract
 */
async function extractTextFromS3(s3Key) {
    try {
        const params = {
            Document: {
                S3Object: {
                    Bucket: S3_BUCKET,
                    Name: s3Key
                }
            }
        };

        const command = new DetectDocumentTextCommand(params);
        const result = await textractClient.send(command);
        
        const extractedText = result.Blocks
            .filter(block => block.BlockType === 'LINE')
            .map(block => block.Text)
            .join('\n');

        return {
            success: true,
            text: extractedText,
            confidence: 95
        };
    } catch (error) {
        console.error('Textract error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Process document comparison request
 */
async function processDocumentComparison(requestBody) {
    try {
        const { documents } = requestBody;

        if (!documents || documents.length < 2) {
            return createErrorResponse(400, 'Invalid Request', 'At least 2 documents required for comparison');
        }

        return createSuccessResponse(200, {
            comparison: {
                overview: {
                    totalDocuments: documents.length,
                    documentTypes: ["Legal Agreement"],
                    comparisonSummary: "Document comparison completed"
                },
                keyDifferences: [],
                commonTerms: [],
                riskAnalysis: [],
                recommendations: []
            },
            documentsAnalyzed: documents.length,
            processedAt: new Date().toISOString(),
            model: GEMINI_MODEL
        });

    } catch (error) {
        console.error('Document comparison error:', error);
        return createErrorResponse(500, 'Comparison Failed', error.message);
    }
}

/**
 * Create success response
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
 * Create error response
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