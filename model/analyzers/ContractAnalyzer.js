/**
 * ContractAnalyzer - Main orchestrator for AI-powered contract analysis
 * 
 * This class coordinates all analysis components to provide comprehensive contract analysis:
 * - Document parsing and preprocessing
 * - Clause extraction and categorization
 * - Risk analysis and assessment
 * - Result aggregation and formatting
 * - Structured prompting for consistent AI outputs
 */

import { ModelManager } from '../core/ModelManager.js';
import { DocumentParser } from '../parsers/DocumentParser.js';
import { ClauseExtractor } from '../extractors/ClauseExtractor.js';
import { RiskAnalyzer } from './RiskAnalyzer.js';
import { TextPreprocessor } from '../preprocessing/TextPreprocessor.js';
import winston from 'winston';

// Configure logger for contract analysis
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'contract-analyzer.log' })
  ]
});

export class ContractAnalyzer {
  constructor(config = {}) {
    // Initialize core components
    this.modelManager = new ModelManager(config.model || {});
    this.documentParser = new DocumentParser();
    this.clauseExtractor = new ClauseExtractor();
    this.riskAnalyzer = new RiskAnalyzer(this.modelManager);
    this.textPreprocessor = new TextPreprocessor();
    
    // Analysis configuration
    this.config = {
      enableClauseExtraction: config.enableClauseExtraction !== false,
      enableRiskAnalysis: config.enableRiskAnalysis !== false,
      enableRecommendations: config.enableRecommendations !== false,
      confidenceThreshold: config.confidenceThreshold || 0.5,
      maxProcessingTime: config.maxProcessingTime || 30000, // 30 seconds
      ...config
    };
    
    // Structured prompting templates
    this.promptTemplates = {
      clauseExtraction: this._buildClauseExtractionTemplate(),
      riskAnalysis: this._buildRiskAnalysisTemplate(),
      recommendations: this._buildRecommendationsTemplate()
    };
    
    // Performance tracking
    this.performanceMetrics = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      averageProcessingTime: 0,
      totalProcessingTime: 0
    };
  }

  /**
   * Analyze a complete contract document
   * @param {Buffer|string} documentInput - Document content (buffer for files, string for text)
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Complete analysis results in standardized format
   */
  async analyzeContract(documentInput, options = {}) {
    const startTime = Date.now();
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      logger.info('Starting contract analysis', {
        analysisId,
        documentType: options.documentType || 'unknown',
        enabledFeatures: {
          clauseExtraction: this.config.enableClauseExtraction,
          riskAnalysis: this.config.enableRiskAnalysis,
          recommendations: this.config.enableRecommendations
        }
      });

      // Validate inputs
      this._validateAnalysisInputs(documentInput, options);

      // Step 1: Document parsing and preprocessing
      const parsedDocument = await this._parseAndPreprocessDocument(documentInput, options);
      
      // Step 2: Clause extraction and categorization
      const clauses = await this._extractAndCategorizeClauses(parsedDocument.text, options);
      
      // Step 3: Risk analysis
      const riskAnalysis = await this._performRiskAnalysis(clauses, options);
      
      // Step 4: Generate recommendations
      const recommendations = await this._generateRecommendations(riskAnalysis.risks, options);
      
      // Step 5: Aggregate and format results
      const results = await this._aggregateResults({
        analysisId,
        parsedDocument,
        clauses,
        riskAnalysis,
        recommendations,
        startTime,
        options
      });

      // Update performance metrics
      this._updatePerformanceMetrics(startTime, true);

      logger.info('Contract analysis completed successfully', {
        analysisId,
        processingTime: Date.now() - startTime,
        totalClauses: results.summary.totalClauses,
        totalRisks: results.risks.length,
        totalRecommendations: results.recommendations.length
      });

      return results;
    } catch (error) {
      this._updatePerformanceMetrics(startTime, false);
      
      logger.error('Contract analysis failed', {
        analysisId,
        error: error.message,
        processingTime: Date.now() - startTime
      });
      
      throw new Error(`Contract analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract clauses from contract text using structured prompting
   * @param {string} text - Contract text
   * @param {Object} options - Extraction options
   * @returns {Promise<Array>} Extracted and categorized clauses
   */
  async extractClauses(text, options = {}) {
    if (!this.config.enableClauseExtraction) {
      return [];
    }

    try {
      logger.debug('Starting clause extraction', { textLength: text.length });

      // Use AI model for intelligent clause extraction if available
      if (this.modelManager.isLoaded) {
        return await this._extractClausesWithAI(text, options);
      } else {
        // Fallback to rule-based extraction
        return await this._extractClausesRuleBased(text, options);
      }
    } catch (error) {
      logger.error('Clause extraction failed', { error: error.message });
      throw new Error(`Clause extraction failed: ${error.message}`);
    }
  }

  /**
   * Assess risks in contract clauses using structured prompting
   * @param {Array} clauses - Array of clause objects
   * @param {Object} options - Risk assessment options
   * @returns {Promise<Object>} Risk analysis results
   */
  async assessRisks(clauses, options = {}) {
    if (!this.config.enableRiskAnalysis || !clauses || clauses.length === 0) {
      return { risks: [] };
    }

    try {
      logger.debug('Starting risk assessment', { clauseCount: clauses.length });

      return await this.riskAnalyzer.analyzeRisks(clauses, options);
    } catch (error) {
      // If model is not loaded, return empty risks but don't fail
      if (error.message.includes('Model must be loaded')) {
        logger.warn('Risk assessment skipped due to model not being loaded');
        return { risks: [] };
      }
      
      logger.error('Risk assessment failed', { error: error.message });
      throw new Error(`Risk assessment failed: ${error.message}`);
    }
  }

  /**
   * Generate actionable recommendations based on analysis
   * @param {Array} risks - Array of identified risks
   * @param {Object} options - Recommendation options
   * @returns {Promise<Array>} Generated recommendations
   */
  async generateRecommendations(risks, options = {}) {
    if (!this.config.enableRecommendations || !risks || risks.length === 0) {
      return [];
    }

    try {
      logger.debug('Starting recommendation generation', { riskCount: risks.length });

      const mitigationResult = await this.riskAnalyzer.generateMitigationStrategies(risks, options);
      return mitigationResult.recommendations || [];
    } catch (error) {
      // If model is not loaded, return empty recommendations but don't fail
      if (error.message.includes('Model must be loaded')) {
        logger.warn('Recommendation generation skipped due to model not being loaded');
        return [];
      }
      
      logger.error('Recommendation generation failed', { error: error.message });
      throw new Error(`Recommendation generation failed: ${error.message}`);
    }
  }

  /**
   * Get analysis performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      modelStatus: this.modelManager.getModelStatus(),
      successRate: this.performanceMetrics.totalAnalyses > 0 ? 
        this.performanceMetrics.successfulAnalyses / this.performanceMetrics.totalAnalyses : 0
    };
  }

  /**
   * Initialize the analyzer (load model, etc.)
   * @param {Object} modelConfig - Model configuration
   * @returns {Promise<boolean>} Initialization success
   */
  async initialize(modelConfig = {}) {
    try {
      logger.info('Initializing ContractAnalyzer');
      
      const success = await this.modelManager.loadModel(modelConfig);
      if (!success) {
        logger.warn('Model loading failed, analyzer will use fallback methods');
      }
      
      logger.info('ContractAnalyzer initialized successfully', {
        modelLoaded: success,
        modelName: this.modelManager.modelConfig?.modelName
      });
      
      return true;
    } catch (error) {
      logger.error('ContractAnalyzer initialization failed', { error: error.message });
      return false;
    }
  }

  /**
   * Cleanup resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      logger.info('Cleaning up ContractAnalyzer resources');
      await this.modelManager.unloadModel();
      logger.info('ContractAnalyzer cleanup completed');
    } catch (error) {
      logger.error('ContractAnalyzer cleanup failed', { error: error.message });
    }
  }

  // Private methods

  /**
   * Parse and preprocess document
   * @private
   */
  async _parseAndPreprocessDocument(documentInput, options) {
    const documentType = options.documentType || this._detectDocumentType(documentInput);
    
    // Parse document based on type
    const parsedDocument = await this.documentParser.parseDocument(
      documentInput, 
      documentType, 
      options.parseOptions || {}
    );

    // Preprocess text for AI analysis
    const preprocessResult = await this.textPreprocessor.preprocessForModel(
      parsedDocument.text,
      options.preprocessOptions || {}
    );

    return {
      ...parsedDocument,
      text: preprocessResult.processedText,
      originalText: parsedDocument.text,
      preprocessingMetadata: preprocessResult.metadata
    };
  }

  /**
   * Extract and categorize clauses
   * @private
   */
  async _extractAndCategorizeClauses(text, options) {
    if (!this.config.enableClauseExtraction) {
      return [];
    }

    // Identify clauses
    const identifiedClauses = await this.clauseExtractor.identifyClauses(text);
    
    // Categorize clauses
    const categorizedClauses = await this.clauseExtractor.categorizeClauses(identifiedClauses);
    
    // Filter by confidence threshold
    const filteredClauses = categorizedClauses.filter(
      clause => clause.confidence >= this.config.confidenceThreshold
    );

    return filteredClauses;
  }

  /**
   * Perform risk analysis
   * @private
   */
  async _performRiskAnalysis(clauses, options) {
    if (!this.config.enableRiskAnalysis || clauses.length === 0) {
      return { risks: [] };
    }

    try {
      return await this.riskAnalyzer.analyzeRisks(clauses, options.riskOptions || {});
    } catch (error) {
      // If model is not loaded, return empty risks but don't fail the analysis
      if (error.message.includes('Model must be loaded')) {
        logger.warn('Risk analysis skipped due to model not being loaded');
        return { risks: [] };
      }
      throw error;
    }
  }

  /**
   * Generate recommendations
   * @private
   */
  async _generateRecommendations(risks, options) {
    if (!this.config.enableRecommendations || risks.length === 0) {
      return [];
    }

    try {
      const mitigationResult = await this.riskAnalyzer.generateMitigationStrategies(
        risks, 
        options.recommendationOptions || {}
      );
      
      return mitigationResult.recommendations || [];
    } catch (error) {
      // If model is not loaded, return empty recommendations but don't fail the analysis
      if (error.message.includes('Model must be loaded')) {
        logger.warn('Recommendation generation skipped due to model not being loaded');
        return [];
      }
      throw error;
    }
  }

  /**
   * Aggregate all analysis results into standardized format
   * @private
   */
  async _aggregateResults(data) {
    const { analysisId, parsedDocument, clauses, riskAnalysis, recommendations, startTime, options } = data;
    const processingTime = Date.now() - startTime;

    // Calculate summary statistics
    const clauseGroups = this.clauseExtractor.groupClausesByType(clauses);
    const clauseTypeCounts = Object.keys(clauseGroups).reduce((counts, type) => {
      counts[type] = clauseGroups[type].count;
      return counts;
    }, {});

    // Calculate overall risk score
    const riskScore = this._calculateOverallRiskScore(riskAnalysis.risks);

    // Calculate confidence score
    const overallConfidence = this._calculateOverallConfidence(clauses, riskAnalysis.risks);

    return {
      summary: {
        title: options.title || parsedDocument.metadata?.info?.Title || "Contract Analysis",
        documentType: parsedDocument.metadata.format,
        totalClauses: clauses.length,
        riskScore: riskScore,
        processingTime: processingTime,
        confidence: overallConfidence,
        clauseTypeCounts: clauseTypeCounts
      },
      clauses: clauses.map(clause => ({
        id: clause.id,
        text: clause.text,
        type: clause.type,
        category: clause.category || clause.type,
        confidence: clause.confidence,
        startPosition: clause.startPosition,
        endPosition: clause.endPosition
      })),
      risks: riskAnalysis.risks || [],
      recommendations: recommendations || [],
      metadata: {
        processingMethod: "ai_model",
        modelUsed: this.modelManager.modelConfig?.modelName || "fallback",
        processingTime: processingTime,
        tokenUsage: this._estimateTokenUsage(parsedDocument.text),
        confidence: overallConfidence,
        analysisId: analysisId,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }
    };
  }

  /**
   * Extract clauses using AI model with structured prompting
   * @private
   */
  async _extractClausesWithAI(text, options) {
    const prompt = this._generateStructuredPrompt('clauseExtraction', { text, options });
    
    try {
      const response = await this.modelManager.inference(prompt, {
        temperature: 0.1,
        maxTokens: 4000,
        format: 'json'
      });

      const parsedResponse = JSON.parse(response);
      return this._validateClauseExtractionResponse(parsedResponse);
    } catch (error) {
      logger.warn('AI clause extraction failed, falling back to rule-based', { error: error.message });
      return await this._extractClausesRuleBased(text, options);
    }
  }

  /**
   * Extract clauses using rule-based approach (fallback)
   * @private
   */
  async _extractClausesRuleBased(text, options) {
    const identifiedClauses = await this.clauseExtractor.identifyClauses(text);
    return await this.clauseExtractor.categorizeClauses(identifiedClauses);
  }

  /**
   * Generate structured prompt for consistent AI outputs
   * @private
   */
  _generateStructuredPrompt(templateName, variables) {
    const template = this.promptTemplates[templateName];
    if (!template) {
      throw new Error(`Unknown prompt template: ${templateName}`);
    }

    let prompt = template;
    
    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key.toUpperCase()}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), JSON.stringify(value));
    });

    return prompt;
  }

  /**
   * Build clause extraction prompt template
   * @private
   */
  _buildClauseExtractionTemplate() {
    return `You are a legal document analysis expert. Extract and categorize clauses from the following contract text.

CONTRACT TEXT:
{{TEXT}}

INSTRUCTIONS:
- Identify individual clauses and their boundaries
- Categorize each clause into one of these types: payment_terms, termination_clause, liability_limitation, confidentiality_agreement, intellectual_property, force_majeure, governing_law, dispute_resolution, warranties_representations, indemnification, assignment_rights, amendment_modification, severability_clause, entire_agreement, notice_provisions
- Assign confidence scores (0.0-1.0) for each categorization
- Preserve exact clause text

Respond with JSON format:
{
  "clauses": [
    {
      "id": "clause_1",
      "text": "exact clause text",
      "type": "clause_type",
      "category": "clause_type",
      "confidence": 0.9,
      "startPosition": 100,
      "endPosition": 200
    }
  ]
}`;
  }

  /**
   * Build risk analysis prompt template
   * @private
   */
  _buildRiskAnalysisTemplate() {
    return `You are a legal risk assessment expert. Analyze the provided clauses for potential risks.

CLAUSES:
{{CLAUSES}}

INSTRUCTIONS:
- Identify specific legal and business risks
- Assign severity levels: Low, Medium, High, Critical
- Provide detailed explanations
- Consider business impact

Respond with JSON format:
{
  "risks": [
    {
      "id": "risk_1",
      "title": "Risk Title",
      "description": "Detailed risk description",
      "severity": "High",
      "category": "Risk Management",
      "affectedClauses": ["clause_1"],
      "explanation": "Why this is a risk",
      "confidence": 0.8
    }
  ]
}`;
  }

  /**
   * Build recommendations prompt template
   * @private
   */
  _buildRecommendationsTemplate() {
    return `You are a contract negotiation expert. Generate mitigation recommendations for the identified risks.

RISKS:
{{RISKS}}

INSTRUCTIONS:
- Provide specific, actionable recommendations
- Prioritize by urgency and impact
- Include practical implementation guidance

Respond with JSON format:
{
  "recommendations": [
    {
      "id": "rec_1",
      "title": "Recommendation Title",
      "description": "Detailed recommendation",
      "priority": "High",
      "category": "Risk Management",
      "actionRequired": true
    }
  ]
}`;
  }

  /**
   * Validate analysis inputs
   * @private
   */
  _validateAnalysisInputs(documentInput, options) {
    if (!documentInput) {
      throw new Error('Document input is required');
    }

    if (Buffer.isBuffer(documentInput) && documentInput.length === 0) {
      throw new Error('Document buffer is empty');
    }

    if (typeof documentInput === 'string' && documentInput.trim().length === 0) {
      throw new Error('Document text is empty');
    }

    if (options.maxProcessingTime && options.maxProcessingTime > this.config.maxProcessingTime) {
      throw new Error(`Processing time limit (${options.maxProcessingTime}ms) exceeds maximum allowed (${this.config.maxProcessingTime}ms)`);
    }
  }

  /**
   * Detect document type from input
   * @private
   */
  _detectDocumentType(input) {
    if (typeof input === 'string') {
      return 'txt';
    }
    
    if (Buffer.isBuffer(input)) {
      // Simple magic number detection
      const header = input.slice(0, 8);
      
      if (header.includes(Buffer.from('PDF'))) {
        return 'pdf';
      }
      
      if (header.includes(Buffer.from('PK'))) {
        return 'docx';
      }
    }
    
    return 'txt';
  }

  /**
   * Calculate overall risk score
   * @private
   */
  _calculateOverallRiskScore(risks) {
    if (!risks || risks.length === 0) return 0;

    const severityWeights = { 'Critical': 1.0, 'High': 0.8, 'Medium': 0.6, 'Low': 0.4 };
    const totalWeight = risks.reduce((sum, risk) => {
      return sum + (severityWeights[risk.severity] || 0.5);
    }, 0);

    return Math.min(totalWeight / risks.length, 1.0);
  }

  /**
   * Calculate overall confidence score
   * @private
   */
  _calculateOverallConfidence(clauses, risks) {
    const allConfidences = [
      ...(clauses || []).map(c => c.confidence || 0.5),
      ...(risks || []).map(r => r.confidence || 0.5)
    ];

    if (allConfidences.length === 0) return 0.5;

    return allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length;
  }

  /**
   * Estimate token usage for processing
   * @private
   */
  _estimateTokenUsage(text) {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Validate clause extraction response from AI
   * @private
   */
  _validateClauseExtractionResponse(response) {
    if (!response || !Array.isArray(response.clauses)) {
      throw new Error('Invalid clause extraction response format');
    }

    return response.clauses.map((clause, index) => ({
      id: clause.id || `clause_${index + 1}`,
      text: clause.text || '',
      type: clause.type || 'unknown',
      category: clause.category || clause.type || 'unknown',
      confidence: typeof clause.confidence === 'number' ? clause.confidence : 0.5,
      startPosition: clause.startPosition || 0,
      endPosition: clause.endPosition || clause.text?.length || 0
    }));
  }

  /**
   * Update performance metrics
   * @private
   */
  _updatePerformanceMetrics(startTime, success) {
    const processingTime = Date.now() - startTime;
    
    this.performanceMetrics.totalAnalyses++;
    this.performanceMetrics.totalProcessingTime += processingTime;
    this.performanceMetrics.averageProcessingTime = 
      this.performanceMetrics.totalProcessingTime / this.performanceMetrics.totalAnalyses;
    
    if (success) {
      this.performanceMetrics.successfulAnalyses++;
    }
  }
}

export default ContractAnalyzer;