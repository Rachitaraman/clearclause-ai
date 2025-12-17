// Unified Contract Processor
// Single entry point managing both AI model and API fallback processing

import ModelManager from '../../model/core/ModelManager.js';
import APIClient from '../../api/clients/APIClient.js';
import ResponseNormalizer from '../../api/normalizers/ResponseNormalizer.js';
import ModelConfig from '../../model/config/ModelConfig.js';

export class ContractProcessor {
  constructor(config = {}) {
    this.modelManager = new ModelManager();
    this.apiClient = new APIClient(config.api);
    this.responseNormalizer = new ResponseNormalizer();
    
    this.config = {
      preferAIModel: true,
      fallbackToAPI: true,
      maxRetries: 3,
      timeout: 30000,
      ...config
    };

    this.processingStats = {
      totalRequests: 0,
      aiModelRequests: 0,
      apiRequests: 0,
      failures: 0
    };
  }

  /**
   * Process contract document using AI model or API fallback
   * @param {Object} document - Document to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Standardized analysis results
   */
  async processContract(document, options = {}) {
    const startTime = Date.now();
    this.processingStats.totalRequests++;

    try {
      // Validate input
      this.validateInput(document);

      // Determine processing method
      const method = await this.determineProcessingMethod();
      
      let result;
      
      if (method === 'ai_model') {
        result = await this.tryAIModel(document, options);
      } else {
        result = await this.fallbackToAPI(document, options);
      }

      // Validate and return results
      const validatedResult = this.validateResults(result);
      validatedResult.metadata.processingTime = Date.now() - startTime;
      
      return validatedResult;
    } catch (error) {
      this.processingStats.failures++;
      console.error('Contract processing failed:', error);
      
      // Try fallback if primary method failed
      if (this.config.fallbackToAPI && !error.message.includes('api_fallback')) {
        try {
          console.log('Attempting API fallback after AI model failure');
          const fallbackResult = await this.fallbackToAPI(document, options);
          fallbackResult.metadata.processingTime = Date.now() - startTime;
          fallbackResult.metadata.fallbackReason = error.message;
          
          return this.validateResults(fallbackResult);
        } catch (fallbackError) {
          console.error('API fallback also failed:', fallbackError);
          throw new Error(`Both AI model and API fallback failed: ${error.message}`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Try processing with AI model
   * @param {Object} document - Document to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - AI model results
   */
  async tryAIModel(document, options = {}) {
    try {
      this.processingStats.aiModelRequests++;
      
      // Ensure model is loaded
      if (!this.modelManager.getModelStatus().isLoaded) {
        const loadSuccess = await this.modelManager.loadModel(ModelConfig.primary);
        if (!loadSuccess) {
          throw new Error('Failed to load AI model');
        }
      }

      // TODO: Implement actual AI model processing
      // This is a placeholder that will be replaced with real AI analysis
      console.log('Processing with AI model...');
      
      const mockResult = {
        summary: {
          title: document.filename || "AI Analyzed Contract",
          documentType: "contract",
          totalClauses: 12,
          riskScore: 72,
          processingTime: 0,
          confidence: 0.91
        },
        clauses: [
          {
            id: "ai_clause_1",
            text: "This Agreement shall commence on the Effective Date and continue for a period of twelve (12) months.",
            type: "termination_clause",
            category: "Termination",
            confidence: 0.94,
            startPosition: 0,
            endPosition: 95
          },
          {
            id: "ai_clause_2",
            text: "Payment shall be due within thirty (30) days of invoice receipt.",
            type: "payment_terms",
            category: "Payment",
            confidence: 0.97,
            startPosition: 96,
            endPosition: 160
          }
        ],
        risks: [
          {
            id: "ai_risk_1",
            title: "Extended Payment Terms",
            description: "30-day payment terms may impact cash flow and increase collection risk",
            severity: "Medium",
            category: "financial",
            affectedClauses: ["ai_clause_2"],
            mitigation: "Consider negotiating shorter payment terms or requiring deposits",
            confidence: 0.85
          }
        ],
        recommendations: [
          {
            id: "ai_rec_1",
            title: "Optimize Payment Terms",
            description: "Negotiate shorter payment terms to improve cash flow",
            priority: "Medium",
            category: "financial_optimization",
            actionRequired: true
          }
        ],
        metadata: {
          processingMethod: "ai_model",
          modelUsed: this.modelManager.modelConfig?.modelName || "llama-3.1-8b-instruct",
          processingTime: 0,
          tokenUsage: 2847,
          confidence: 0.91
        }
      };

      return mockResult;
    } catch (error) {
      console.error('AI model processing failed:', error);
      throw new Error(`AI model processing failed: ${error.message}`);
    }
  }

  /**
   * Fallback to API processing
   * @param {Object} document - Document to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - API results (normalized)
   */
  async fallbackToAPI(document, options = {}) {
    try {
      this.processingStats.apiRequests++;
      console.log('Processing with API fallback...');
      
      const apiResult = await this.apiClient.analyzeContract(
        document.text || document.content,
        options
      );
      
      // Normalize API response to match AI model format
      return this.responseNormalizer.normalizeToStandardFormat(apiResult);
    } catch (error) {
      console.error('API fallback processing failed:', error);
      throw new Error(`API fallback processing failed: ${error.message}`);
    }
  }

  /**
   * Determine which processing method to use
   * @returns {Promise<string>} - Processing method ('ai_model' or 'api_fallback')
   */
  async determineProcessingMethod() {
    if (!this.config.preferAIModel) {
      return 'api_fallback';
    }

    try {
      // Check if AI model is available and healthy
      const modelStatus = this.modelManager.getModelStatus();
      
      if (modelStatus.isLoaded) {
        return 'ai_model';
      }

      // Try to load the model
      const loadSuccess = await this.modelManager.loadModel(ModelConfig.primary);
      
      if (loadSuccess) {
        return 'ai_model';
      } else {
        console.log('AI model unavailable, using API fallback');
        return 'api_fallback';
      }
    } catch (error) {
      console.warn('AI model check failed, using API fallback:', error.message);
      return 'api_fallback';
    }
  }

  /**
   * Validate input document
   * @param {Object} document - Document to validate
   * @throws {Error} - If validation fails
   * @private
   */
  validateInput(document) {
    if (!document) {
      throw new Error('Document is required');
    }

    if (!document.text && !document.content) {
      throw new Error('Document must contain text or content');
    }

    const text = document.text || document.content;
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Document text must be a non-empty string');
    }

    // Check document size (50,000 tokens ≈ 200,000 characters)
    if (text.length > 200000) {
      throw new Error('Document too large. Maximum size is approximately 50,000 tokens.');
    }
  }

  /**
   * Validate processing results
   * @param {Object} results - Results to validate
   * @returns {Object} - Validated results
   * @private
   */
  validateResults(results) {
    if (!results || typeof results !== 'object') {
      throw new Error('Invalid processing results');
    }

    const required = ['summary', 'clauses', 'risks', 'recommendations', 'metadata'];
    const missing = required.filter(field => !results.hasOwnProperty(field));
    
    if (missing.length > 0) {
      throw new Error(`Processing results missing required fields: ${missing.join(', ')}`);
    }

    // Ensure arrays are actually arrays
    ['clauses', 'risks', 'recommendations'].forEach(field => {
      if (!Array.isArray(results[field])) {
        results[field] = [];
      }
    });

    return results;
  }

  /**
   * Get processing statistics
   * @returns {Object} - Processing statistics
   */
  getProcessingStats() {
    return {
      ...this.processingStats,
      aiModelSuccessRate: this.processingStats.aiModelRequests > 0 
        ? (this.processingStats.aiModelRequests - this.processingStats.failures) / this.processingStats.aiModelRequests 
        : 0,
      totalSuccessRate: this.processingStats.totalRequests > 0
        ? (this.processingStats.totalRequests - this.processingStats.failures) / this.processingStats.totalRequests
        : 0
    };
  }

  /**
   * Reset processing statistics
   */
  resetStats() {
    this.processingStats = {
      totalRequests: 0,
      aiModelRequests: 0,
      apiRequests: 0,
      failures: 0
    };
  }

  /**
   * Cleanup resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      await this.modelManager.unloadModel();
      console.log('ContractProcessor cleanup completed');
    } catch (error) {
      console.error('ContractProcessor cleanup failed:', error);
    }
  }
}

export default ContractProcessor;