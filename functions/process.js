/**
 * ClearClause AI Backend Function - Modular Extraction Services
 * Handles document processing with specialized extractors for each input type
 */

import { ExtractionOrchestrator } from '../model/extractors/ExtractionOrchestrator.js'
import { GeminiAnalyzer } from '../model/analyzers/GeminiAnalyzer.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize services
let extractionOrchestrator = null
let geminiAnalyzer = null

function createExtractionOrchestrator() {
    if (!extractionOrchestrator) {
        try {
            extractionOrchestrator = new ExtractionOrchestrator()
        } catch (error) {
            console.error('Failed to initialize Extraction Orchestrator:', error.message)
            extractionOrchestrator = null
        }
    }
    return extractionOrchestrator
}

function createGeminiAnalyzer() {
    if (!geminiAnalyzer) {
        try {
            geminiAnalyzer = new GeminiAnalyzer()
        } catch (error) {
            console.error('Failed to initialize Gemini Analyzer:', error.message)
            geminiAnalyzer = null
        }
    }
    return geminiAnalyzer
}

// Configuration constants
const GEMINI_MODEL = process.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'

console.log('🔧 Modular Extraction Configuration:')
console.log('- Text Extraction: TextExtractor')
console.log('- PDF Extraction: AWS Textract')
console.log('- Image Extraction: AWS Textract OCR')
console.log('- URL Extraction: URLExtractor')
console.log('- Analysis Service: Google Gemini')
console.log('- AI Model:', GEMINI_MODEL)


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
                message: 'ClearClause AI Hybrid Backend is working',
                timestamp: new Date().toISOString(),
                services: {
                    extraction: 'AWS (S3 + Textract)',
                    analysis: 'Google Gemini',
                    status: 'connected'
                }
            });
        }

        // Handle document analysis requests
        if (body && body.action === 'analyze') {
            return await processDocumentAnalysis(body);
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
 * Process document analysis request using modular extraction services
 */
async function processDocumentAnalysis(requestBody) {
    try {
        const { documentText, documentType, filename, s3Key, fileBuffer, isImage, isPDF, url } = requestBody;
        
        console.log('🚀 Starting modular document analysis...');
        
        const orchestrator = createExtractionOrchestrator();
        if (!orchestrator) {
            throw new Error('Extraction orchestrator not available');
        }

        let extractionResult;
        let analysisResult;
        let usingRealAI = false;
        let errorDetails = null;
        
        try {
            // Step 1: Extract text using appropriate service
            console.log('📋 Step 1: Extracting text...');
            
            let input;
            let inputFilename;

            if (url) {
                // URL input
                input = url;
                inputFilename = null;
            } else if (fileBuffer) {
                // File buffer input
                input = Buffer.from(fileBuffer, 'base64');
                inputFilename = filename;
            } else if (documentText) {
                // Raw text input
                input = documentText;
                inputFilename = null;
            } else {
                throw new Error('No valid document input provided');
            }

            // Use orchestrator to route to appropriate extractor
            extractionResult = await orchestrator.extract(input, inputFilename);

            if (!extractionResult.success) {
                throw new Error(`Extraction failed: ${extractionResult.error}`);
            }

            console.log('✅ Text extraction successful');
            console.log('   - Method:', extractionResult.metadata.extractionMethod);
            console.log('   - Service:', extractionResult.metadata.extractionService);
            console.log('   - Text length:', extractionResult.metadata.textLength);

            // Step 2: Analyze extracted text with Gemini
            console.log('📋 Step 2: Analyzing with Gemini...');
            
            const analyzer = createGeminiAnalyzer();
            if (!analyzer) {
                throw new Error('Gemini analyzer not available');
            }

            const analysisData = await analyzer.analyze(extractionResult.text, {
                documentType: documentType || extractionResult.metadata.inputType,
                filename: filename || 'document'
            });

            if (!analysisData.success) {
                throw new Error(`Analysis failed: ${analysisData.error}`);
            }

            console.log('✅ Analysis successful');
            console.log('   - Clauses found:', analysisData.analysis.clauses?.length || 0);
            console.log('   - Risks found:', analysisData.analysis.risks?.length || 0);

            analysisResult = {
                success: true,
                analysis: analysisData.analysis,
                confidence: analysisData.confidence,
                processingTime: analysisData.processingTime,
                extractionMethod: extractionResult.metadata.extractionMethod,
                extractionService: extractionResult.metadata.extractionService,
                analysisService: 'Google Gemini'
            };
            usingRealAI = true;
            
        } catch (error) {
            errorDetails = error.message;
            console.log('❌ Processing failed:', errorDetails);
            
            // Fallback to mock data
            console.log('🔄 Falling back to enhanced mock analysis...');
            analysisResult = {
                success: true,
                analysis: generateMockAnalysis(documentText || 'Sample document text'),
                confidence: 85,
                extractionMethod: 'fallback',
                extractionService: 'Mock',
                analysisService: 'Mock'
            };
            usingRealAI = false;
        }

        // Enhanced response with modular extraction details
        const response = {
            analysis: analysisResult.analysis,
            confidence: analysisResult.confidence,
            processedAt: new Date().toISOString(),
            model: usingRealAI ? GEMINI_MODEL : 'mock-analysis-enhanced',
            usingRealAI: usingRealAI,
            processingDetails: {
                source: usingRealAI ? 'modular-extraction' : 'mock-fallback',
                extractionService: analysisResult.extractionService || 'Unknown',
                analysisService: analysisResult.analysisService || 'Unknown',
                extractionMethod: analysisResult.extractionMethod || 'unknown',
                processingTime: analysisResult.processingTime || 0,
                modular: usingRealAI
            }
        };

        // DEBUG: Log the actual response being sent to frontend
        console.log('📤 MODULAR RESPONSE TO FRONTEND:');
        console.log('- Using Real AI:', response.usingRealAI);
        console.log('- Extraction Service:', response.processingDetails.extractionService);
        console.log('- Analysis Service:', response.processingDetails.analysisService);
        console.log('- Extraction Method:', response.processingDetails.extractionMethod);
        console.log('- Clauses found:', response.analysis?.clauses?.length || 0);
        console.log('- Risks found:', response.analysis?.risks?.length || 0);

        // Include error details if processing failed
        if (errorDetails && !usingRealAI) {
            response.errorDetails = errorDetails;
        }

        return createSuccessResponse(200, response);

    } catch (error) {
        console.error('Document analysis error:', error);
        return createErrorResponse(500, 'Analysis Failed', error.message);
    }
}

// Legacy functions removed - now using HybridDocumentProcessor

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
 * Calculate analysis confidence score
 */
function calculateAnalysisConfidence(analysis) {
    let score = 0;
    if (analysis.summary?.documentType) score += 20;
    if (analysis.clauses?.length >= 3) score += 30;
    if (analysis.risks?.length >= 2) score += 25;
    if (analysis.recommendations?.length >= 2) score += 15;
    if (analysis.keyTerms?.length >= 2) score += 10;
    return Math.min(score, 100);
}

/**
 * Generate mock analysis for fallback
 */
function generateMockAnalysis(documentText) {
    const documentType = detectDocumentType(documentText);
    
    return {
        summary: {
            documentType: documentType,
            keyPurpose: "Document analysis and risk assessment",
            mainParties: ["Party A", "Party B"],
            effectiveDate: new Date().toISOString().split('T')[0],
            expirationDate: null,
            totalClausesIdentified: 8,
            completenessScore: 85
        },
        clauses: [
            {
                id: "clause_1",
                title: "Main Terms and Conditions",
                content: documentText.substring(0, Math.min(200, documentText.length)),
                category: "general",
                riskLevel: "medium",
                explanation: "Primary terms and conditions of the agreement",
                sourceLocation: "Document body",
                keyTerms: ["terms", "conditions", "agreement"]
            },
            {
                id: "clause_2",
                title: "Payment and Compensation",
                content: "Payment terms and compensation details as specified in the agreement",
                category: "financial",
                riskLevel: "high",
                explanation: "Defines payment obligations and compensation structure",
                sourceLocation: "Payment section",
                keyTerms: ["payment", "compensation", "fees"]
            },
            {
                id: "clause_3",
                title: "Termination Provisions",
                content: "Conditions under which the agreement may be terminated",
                category: "termination",
                riskLevel: "medium",
                explanation: "Specifies termination rights and procedures",
                sourceLocation: "Termination clause",
                keyTerms: ["termination", "end", "cancel"]
            },
            {
                id: "clause_4",
                title: "Confidentiality Agreement",
                content: "Obligations to maintain confidentiality of proprietary information",
                category: "confidentiality",
                riskLevel: "high",
                explanation: "Protects sensitive business information",
                sourceLocation: "Confidentiality section",
                keyTerms: ["confidential", "proprietary", "non-disclosure"]
            },
            {
                id: "clause_5",
                title: "Intellectual Property Rights",
                content: "Ownership and usage rights for intellectual property",
                category: "intellectual_property",
                riskLevel: "critical",
                explanation: "Defines IP ownership and licensing terms",
                sourceLocation: "IP section",
                keyTerms: ["intellectual property", "copyright", "ownership"]
            },
            {
                id: "clause_6",
                title: "Limitation of Liability",
                content: "Limits on liability and damages for each party",
                category: "liability",
                riskLevel: "high",
                explanation: "Restricts potential liability exposure",
                sourceLocation: "Liability section",
                keyTerms: ["liability", "damages", "limitation"]
            },
            {
                id: "clause_7",
                title: "Governing Law",
                content: "Jurisdiction and applicable law for the agreement",
                category: "legal",
                riskLevel: "low",
                explanation: "Specifies legal jurisdiction and governing law",
                sourceLocation: "Legal provisions",
                keyTerms: ["governing law", "jurisdiction", "legal"]
            },
            {
                id: "clause_8",
                title: "Dispute Resolution",
                content: "Process for resolving disputes between parties",
                category: "dispute_resolution",
                riskLevel: "medium",
                explanation: "Defines how conflicts will be resolved",
                sourceLocation: "Dispute section",
                keyTerms: ["dispute", "arbitration", "resolution"]
            }
        ],
        risks: [
            {
                id: "risk_1",
                title: "High Liability Exposure",
                description: "Agreement may expose parties to significant financial liability",
                severity: "high",
                category: "financial",
                recommendation: "Review liability limitations and consider additional insurance",
                clauseReference: "clause_6",
                supportingText: "Liability provisions may be insufficient"
            },
            {
                id: "risk_2",
                title: "Intellectual Property Disputes",
                description: "Unclear IP ownership could lead to future disputes",
                severity: "critical",
                category: "legal",
                recommendation: "Clarify IP ownership and licensing terms",
                clauseReference: "clause_5",
                supportingText: "IP rights not clearly defined"
            },
            {
                id: "risk_3",
                title: "Confidentiality Breach Risk",
                description: "Inadequate confidentiality protections for sensitive information",
                severity: "medium",
                category: "operational",
                recommendation: "Strengthen confidentiality provisions and add penalties",
                clauseReference: "clause_4",
                supportingText: "Confidentiality terms may be too broad"
            },
            {
                id: "risk_4",
                title: "Payment Default Risk",
                description: "Payment terms may not adequately protect against defaults",
                severity: "high",
                category: "financial",
                recommendation: "Add payment guarantees and late payment penalties",
                clauseReference: "clause_2",
                supportingText: "Payment security measures insufficient"
            },
            {
                id: "risk_5",
                title: "Termination Complications",
                description: "Termination procedures may be unclear or inadequate",
                severity: "medium",
                category: "operational",
                recommendation: "Clarify termination procedures and notice requirements",
                clauseReference: "clause_3",
                supportingText: "Termination process needs clarification"
            }
        ],
        keyTerms: [
            {
                term: "Agreement",
                definition: "The legal contract between the parties",
                importance: "high",
                context: "Throughout the document"
            },
            {
                term: "Confidential Information",
                definition: "Proprietary or sensitive business information",
                importance: "high",
                context: "Confidentiality provisions"
            },
            {
                term: "Intellectual Property",
                definition: "Patents, copyrights, trademarks, and trade secrets",
                importance: "critical",
                context: "IP ownership clauses"
            },
            {
                term: "Liability",
                definition: "Legal responsibility for damages or losses",
                importance: "high",
                context: "Liability limitation clauses"
            }
        ],
        recommendations: [
            {
                priority: "critical",
                action: "Clarify intellectual property ownership and licensing terms",
                rationale: "Prevent future IP disputes and ensure clear ownership",
                affectedClauses: ["clause_5"]
            },
            {
                priority: "high",
                action: "Review and strengthen liability limitations",
                rationale: "Protect against excessive financial exposure",
                affectedClauses: ["clause_6"]
            },
            {
                priority: "high",
                action: "Add payment security measures and penalties",
                rationale: "Reduce payment default risk",
                affectedClauses: ["clause_2"]
            },
            {
                priority: "medium",
                action: "Enhance confidentiality provisions",
                rationale: "Better protect sensitive business information",
                affectedClauses: ["clause_4"]
            },
            {
                priority: "medium",
                action: "Clarify termination procedures and requirements",
                rationale: "Avoid complications during contract termination",
                affectedClauses: ["clause_3"]
            }
        ],
        qualityMetrics: {
            clauseDetectionConfidence: 75,
            analysisCompleteness: 85,
            potentialMissedClauses: ["warranties", "indemnification", "force_majeure"]
        }
    };
}

// Legacy functions removed - now using HybridDocumentProcessor

/**
 * Process document comparison request
 */
async function processDocumentComparison(requestBody) {
    try {
        const { documents } = requestBody;

        if (!documents || documents.length < 2) {
            return createErrorResponse(400, 'Invalid Request', 'At least 2 documents required for comparison');
        }

        // For now, return a basic comparison response
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