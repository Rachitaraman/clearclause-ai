// Enhanced contract processor with performance optimization and monitoring
// Integrates ModelManager with ResourceManager for optimal performance

import { ModelManager } from './ModelManager.js';
import { ResourceManager } from './ResourceManager.js';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'contract-processor-performance.log' })
  ]
});

/**
 * Enhanced contract processor with performance optimization
 */
export class ContractProcessorWithPerformance {
  constructor(options = {}) {
    this.options = {
      maxMemoryUsage: options.maxMemoryUsage || 16000, // MB
      maxConcurrentRequests: options.maxConcurrentRequests || 3,
      maxProcessingTime: options.maxProcessingTime || 30000, // ms
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      enableResourceManagement: options.enableResourceManagement !== false,
      ...options
    };

    // Initialize resource manager
    this.resourceManager = new ResourceManager({
      maxMemoryUsage: this.options.maxMemoryUsage,
      maxConcurrentRequests: this.options.maxConcurrentRequests,
      maxProcessingTime: this.options.maxProcessingTime,
      monitoringInterval: this.options.monitoringInterval || 5000
    });

    // Initialize model manager
    this.modelManager = new ModelManager({
      maxMemoryUsage: this.options.maxMemoryUsage,
      maxProcessingTime: this.options.maxProcessingTime
    });

    // Register model manager with resource manager
    this.resourceManager.registerModelManager(this.modelManager);

    // State tracking
    this.isInitialized = false;
    this.isProcessing = false;
  }

  /**
   * Initialize the contract processor
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('Initializing contract processor with performance optimization');

      // Start resource management
      if (this.options.enableResourceManagement) {
        this.resourceManager.start();
      }

      // Load the AI model
      const modelLoaded = await this.modelManager.loadModel();
      if (!modelLoaded) {
        throw new Error('Failed to load AI model');
      }

      this.isInitialized = true;

      logger.info('Contract processor initialized successfully', {
        modelLoaded: true,
        resourceManagementEnabled: this.options.enableResourceManagement,
        performanceMonitoringEnabled: this.options.enablePerformanceMonitoring
      });

    } catch (error) {
      logger.error('Failed to initialize contract processor', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Process a contract with performance optimization
   * @param {string} contractText - Contract text to analyze
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Analysis results
   */
  async processContract(contractText, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!contractText || typeof contractText !== 'string') {
      throw new Error('Valid contract text is required');
    }

    const processingOptions = {
      extractClauses: true,
      assessRisks: true,
      generateRecommendations: true,
      ...options
    };

    // Use resource manager to handle the request with queuing and monitoring
    return await this.resourceManager.processRequest(async () => {
      return await this.performContractAnalysis(contractText, processingOptions);
    });
  }

  /**
   * Perform the actual contract analysis
   * @param {string} contractText - Contract text to analyze
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Analysis results
   * @private
   */
  async performContractAnalysis(contractText, options) {
    const startTime = Date.now();
    
    try {
      logger.info('Starting contract analysis', {
        textLength: contractText.length,
        options
      });

      // Create analysis prompt
      const analysisPrompt = this.createAnalysisPrompt(contractText, options);

      // Perform AI inference
      const response = await this.modelManager.inference(analysisPrompt, {
        maxTokens: Math.min(4000, this.modelManager.modelConfig.maxTokens),
        temperature: 0.1
      });

      // Parse and structure the response
      const analysisResult = this.parseAnalysisResponse(response, options);

      // Add metadata
      analysisResult.metadata = {
        processingMethod: 'ai_model',
        modelUsed: this.modelManager.modelConfig.modelName,
        processingTime: Date.now() - startTime,
        tokenUsage: response.length,
        confidence: this.calculateConfidence(analysisResult),
        resourceStatus: this.resourceManager.getStatus()
      };

      logger.info('Contract analysis completed successfully', {
        processingTime: analysisResult.metadata.processingTime,
        clausesFound: analysisResult.clauses?.length || 0,
        risksFound: analysisResult.risks?.length || 0
      });

      return analysisResult;

    } catch (error) {
      logger.error('Contract analysis failed', {
        error: error.message,
        processingTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Create analysis prompt for the AI model
   * @param {string} contractText - Contract text
   * @param {Object} options - Processing options
   * @returns {string} - Formatted prompt
   * @private
   */
  createAnalysisPrompt(contractText, options) {
    let prompt = `Analyze the following contract and provide a structured analysis:\n\n${contractText}\n\n`;

    if (options.extractClauses) {
      prompt += `Please identify and extract key clauses, categorizing them by type (e.g., payment, termination, liability, confidentiality, etc.).\n`;
    }

    if (options.assessRisks) {
      prompt += `Assess potential legal and business risks, assigning risk levels (Low, Medium, High, Critical) with explanations.\n`;
    }

    if (options.generateRecommendations) {
      prompt += `Provide actionable recommendations for risk mitigation and contract improvement.\n`;
    }

    prompt += `\nPlease format your response as a structured JSON object with the following format:
{
  "summary": {
    "title": "Contract title or type",
    "documentType": "contract type",
    "totalClauses": number,
    "riskScore": number (0-100),
    "confidence": number (0-1)
  },
  "clauses": [
    {
      "id": "unique_id",
      "text": "clause text",
      "type": "clause_type",
      "category": "category",
      "confidence": number (0-1)
    }
  ],
  "risks": [
    {
      "id": "unique_id",
      "title": "risk title",
      "description": "risk description",
      "severity": "Low|Medium|High|Critical",
      "category": "risk category",
      "mitigation": "mitigation strategy",
      "confidence": number (0-1)
    }
  ],
  "recommendations": [
    {
      "id": "unique_id",
      "title": "recommendation title",
      "description": "recommendation description",
      "priority": "Low|Medium|High",
      "category": "recommendation category"
    }
  ]
}`;

    return prompt;
  }

  /**
   * Parse AI model response into structured format
   * @param {string} response - AI model response
   * @param {Object} options - Processing options
   * @returns {Object} - Structured analysis result
   * @private
   */
  parseAnalysisResponse(response, options) {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndNormalizeResult(parsed);
      }
    } catch (error) {
      logger.warn('Failed to parse JSON response, using fallback parsing', {
        error: error.message
      });
    }

    // Fallback to text parsing
    return this.parseTextResponse(response, options);
  }

  /**
   * Parse text response when JSON parsing fails
   * @param {string} response - AI model response
   * @param {Object} options - Processing options
   * @returns {Object} - Structured analysis result
   * @private
   */
  parseTextResponse(response, options) {
    // Basic text parsing implementation
    const result = {
      summary: {
        title: "Contract Analysis",
        documentType: "contract",
        totalClauses: 0,
        riskScore: 50,
        confidence: 0.7
      },
      clauses: [],
      risks: [],
      recommendations: []
    };

    // Extract clauses (simplified)
    if (options.extractClauses) {
      const clauseMatches = response.match(/clause[s]?:?\s*(.+?)(?=risk|recommendation|$)/gis);
      if (clauseMatches) {
        clauseMatches.forEach((match, index) => {
          result.clauses.push({
            id: `clause_${index + 1}`,
            text: match.trim(),
            type: "general",
            category: "contract_term",
            confidence: 0.6
          });
        });
      }
    }

    // Extract risks (simplified)
    if (options.assessRisks) {
      const riskMatches = response.match(/risk[s]?:?\s*(.+?)(?=recommendation|clause|$)/gis);
      if (riskMatches) {
        riskMatches.forEach((match, index) => {
          result.risks.push({
            id: `risk_${index + 1}`,
            title: `Risk ${index + 1}`,
            description: match.trim(),
            severity: "Medium",
            category: "general",
            mitigation: "Review and assess",
            confidence: 0.6
          });
        });
      }
    }

    result.summary.totalClauses = result.clauses.length;
    return result;
  }

  /**
   * Validate and normalize analysis result
   * @param {Object} result - Raw analysis result
   * @returns {Object} - Validated and normalized result
   * @private
   */
  validateAndNormalizeResult(result) {
    // Ensure required structure
    const normalized = {
      summary: result.summary || {},
      clauses: Array.isArray(result.clauses) ? result.clauses : [],
      risks: Array.isArray(result.risks) ? result.risks : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };

    // Validate summary
    normalized.summary = {
      title: normalized.summary.title || "Contract Analysis",
      documentType: normalized.summary.documentType || "contract",
      totalClauses: normalized.clauses.length,
      riskScore: Math.min(100, Math.max(0, normalized.summary.riskScore || 50)),
      confidence: Math.min(1, Math.max(0, normalized.summary.confidence || 0.7))
    };

    return normalized;
  }

  /**
   * Calculate overall confidence score
   * @param {Object} result - Analysis result
   * @returns {number} - Confidence score (0-1)
   * @private
   */
  calculateConfidence(result) {
    const confidenceScores = [];

    // Collect confidence scores from clauses
    if (result.clauses) {
      result.clauses.forEach(clause => {
        if (clause.confidence) {
          confidenceScores.push(clause.confidence);
        }
      });
    }

    // Collect confidence scores from risks
    if (result.risks) {
      result.risks.forEach(risk => {
        if (risk.confidence) {
          confidenceScores.push(risk.confidence);
        }
      });
    }

    // Calculate average confidence
    if (confidenceScores.length > 0) {
      return confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
    }

    return 0.7; // Default confidence
  }

  /**
   * Get system status including performance metrics
   * @returns {Object} - System status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isProcessing: this.isProcessing,
      modelStatus: this.modelManager.getModelStatus(),
      resourceStatus: this.resourceManager.getStatus(),
      performanceSummary: this.resourceManager.getPerformanceSummary(),
      isHealthy: this.resourceManager.isHealthy()
    };
  }

  /**
   * Get performance metrics
   * @returns {Object} - Performance metrics
   */
  getPerformanceMetrics() {
    return this.resourceManager.getPerformanceSummary();
  }

  /**
   * Optimize system resources
   */
  async optimizeResources() {
    await this.resourceManager.optimizeResources();
  }

  /**
   * Shutdown the contract processor
   */
  async shutdown() {
    logger.info('Shutting down contract processor');

    try {
      // Stop resource management
      this.resourceManager.stop();

      // Unload model
      await this.modelManager.unloadModel();

      // Unregister model manager
      this.resourceManager.unregisterModelManager(this.modelManager);

      this.isInitialized = false;

      logger.info('Contract processor shutdown completed');

    } catch (error) {
      logger.error('Error during shutdown', {
        error: error.message
      });
    }
  }
}

export default ContractProcessorWithPerformance;