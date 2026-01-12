import { OptimizedContractAnalyzer } from '../../model/analyzers/OptimizedContractAnalyzer.js';
import { ClauseSummaryGenerator } from '../../model/utils/ClauseSummaryGenerator.js';
import winston from 'winston';

/**
 * ContractProcessor - Main entry point for contract analysis
 * Integrates AWS document processing with Gemini AI analysis
 */
export class ContractProcessor {
  constructor(config = {}) {
    this.contractAnalyzer = new OptimizedContractAnalyzer(config);
    this.summaryGenerator = new ClauseSummaryGenerator();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });
    
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      supportedMimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ],
      ...config
    };
  }

  /**
   * Process contract document with full analysis
   * @param {Buffer|string|Object} document - Document buffer, text, or analysis request
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Complete analysis results
   */
  async processContract(document, options = {}) {
    try {
      // Validate input
      this.validateInput(document, options);
      
      // Perform analysis with new multi-format support
      const analysis = await this.contractAnalyzer.analyzeContract(document, options);
      
      // Generate enhanced summary
      const enhancedSummary = this.summaryGenerator.generateSummary(analysis.clauses);
      
      // Combine results
      const result = {
        ...analysis,
        summary: {
          ...analysis.summary,
          ...enhancedSummary
        },
        clauseSummary: this.summaryGenerator.generateDisplaySummary(analysis.clauses)
      };
      
      // Validate results
      this.validateResults(result);
      
      return result;
    } catch (error) {
      this.logger.error('Contract processing failed:', error);
      throw new Error(`Contract processing failed: ${error.message}`);
    }
  }

  /**
   * Process image document
   * @param {Buffer} imageBuffer - Image buffer
   * @param {string} mimeType - Image MIME type
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Analysis results
   */
  async processImage(imageBuffer, mimeType, options = {}) {
    const imageRequest = {
      type: 'image',
      buffer: imageBuffer,
      mimeType: mimeType
    };
    
    return await this.processContract(imageRequest, options);
  }

  /**
   * Process URL content
   * @param {string} url - URL to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Analysis results
   */
  async processURL(url, options = {}) {
    const urlRequest = {
      type: 'url',
      url: url
    };
    
    return await this.processContract(urlRequest, options);
  }

  /**
   * Process multiple images
   * @param {Array} images - Array of {buffer, mimeType} objects
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Analysis results
   */
  async processImages(images, options = {}) {
    const imagesRequest = {
      type: 'images',
      images: images
    };
    
    return await this.processContract(imagesRequest, options);
  }

  /**
   * Process multiple URLs
   * @param {Array<string>} urls - Array of URLs
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Analysis results
   */
  async processURLs(urls, options = {}) {
    const urlsRequest = {
      type: 'urls',
      urls: urls
    };
    
    return await this.processContract(urlsRequest, options);
  }

  /**
   * Process multiple contracts in batch
   * @param {Array} documents - Array of document objects
   * @param {Object} options - Batch processing options
   * @returns {Promise<Array>} Array of analysis results
   */
  async processBatch(documents, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 5;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchPromises = batch.map(doc => 
        this.processContract(doc.buffer, {
          filename: doc.filename,
          mimeType: doc.mimeType,
          ...options
        }).catch(error => ({
          error: error.message,
          filename: doc.filename
        }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < documents.length) {
        await this.sleep(1000);
      }
    }
    
    return results;
  }

  /**
   * Get clause extraction summary only
   * @param {Buffer|string} document - Document to analyze
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Clause summary only
   */
  async getClauseSummary(document, options = {}) {
    try {
      const clauses = await this.contractAnalyzer.extractClauses(
        typeof document === 'string' ? document : await this.extractText(document, options)
      );
      
      return {
        clauses,
        summary: this.summaryGenerator.generateSummary(clauses),
        displaySummary: this.summaryGenerator.generateDisplaySummary(clauses)
      };
    } catch (error) {
      this.logger.error('Clause summary extraction failed:', error);
      throw error;
    }
  }

  /**
   * Validate input parameters
   * @param {Buffer|string|Object} document - Document to validate
   * @param {Object} options - Options to validate
   */
  validateInput(document, options) {
    if (!document) {
      throw new Error('Document is required');
    }
    
    if (Buffer.isBuffer(document)) {
      if (document.length > this.config.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`);
      }
      
      if (options.mimeType && !this.config.supportedMimeTypes.includes(options.mimeType)) {
        throw new Error(`Unsupported file type: ${options.mimeType}`);
      }
    } else if (typeof document === 'string') {
      if (document.length === 0) {
        throw new Error('Document text cannot be empty');
      }
    } else if (typeof document === 'object') {
      // Validate structured requests (image, url, etc.)
      if (!document.type) {
        throw new Error('Document type is required for structured requests');
      }
      
      if (document.type === 'image' && (!document.buffer || !document.mimeType)) {
        throw new Error('Image requests require buffer and mimeType');
      }
      
      if (document.type === 'url' && !document.url) {
        throw new Error('URL requests require url field');
      }
      
      if (document.type === 'images' && (!document.images || !Array.isArray(document.images))) {
        throw new Error('Images requests require images array');
      }
      
      if (document.type === 'urls' && (!document.urls || !Array.isArray(document.urls))) {
        throw new Error('URLs requests require urls array');
      }
    } else {
      throw new Error('Document must be a Buffer, string, or structured request object');
    }
  }

  /**
   * Validate analysis results
   * @param {Object} results - Results to validate
   */
  validateResults(results) {
    const requiredFields = ['analysisId', 'summary', 'clauses', 'risks', 'recommendations', 'metadata'];
    
    for (const field of requiredFields) {
      if (!(field in results)) {
        throw new Error(`Missing required field in results: ${field}`);
      }
    }
    
    if (!Array.isArray(results.clauses)) {
      throw new Error('Clauses must be an array');
    }
    
    if (!Array.isArray(results.risks)) {
      throw new Error('Risks must be an array');
    }
    
    if (!Array.isArray(results.recommendations)) {
      throw new Error('Recommendations must be an array');
    }
    
    // Validate summary
    if (!this.summaryGenerator.validateSummary(results.summary)) {
      throw new Error('Invalid summary data');
    }
  }

  /**
   * Extract text from document buffer
   * @param {Buffer} document - Document buffer
   * @param {Object} options - Extraction options
   * @returns {Promise<string>} Extracted text
   */
  async extractText(document, options) {
    const { AWSDocumentProcessor } = await import('../../model/processors/AWSDocumentProcessor.js');
    const processor = new AWSDocumentProcessor();
    
    const result = await processor.processDocument(
      document,
      options.filename || 'document',
      options.mimeType || 'application/pdf'
    );
    
    return result.extractedText;
  }

  /**
   * Get processing statistics
   * @returns {Object} Processing statistics
   */
  getProcessingStats() {
    return {
      supportedFormats: this.config.supportedMimeTypes,
      maxFileSize: this.config.maxFileSize,
      version: '1.0.0',
      capabilities: [
        'clause_extraction',
        'risk_assessment',
        'recommendation_generation',
        'aws_integration',
        'gemini_ai_analysis'
      ]
    };
  }

  /**
   * Sleep utility for batch processing
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check for all components
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      components: {},
      timestamp: new Date().toISOString()
    };
    
    try {
      // Check Gemini API
      health.components.gemini = await this.checkGeminiHealth();
      
      // Check AWS services
      health.components.aws = await this.checkAWSHealth();
      
      // Overall status
      const componentStatuses = Object.values(health.components).map(c => c.status);
      if (componentStatuses.includes('unhealthy')) {
        health.status = 'degraded';
      }
      
    } catch (error) {
      health.status = 'unhealthy';
      health.error = error.message;
    }
    
    return health;
  }

  /**
   * Check Gemini API health
   * @returns {Promise<Object>} Gemini health status
   */
  async checkGeminiHealth() {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const result = await model.generateContent('Health check test');
      const response = await result.response;
      
      return {
        status: response.text() ? 'healthy' : 'unhealthy',
        service: 'gemini-api',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'gemini-api',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Check AWS services health
   * @returns {Promise<Object>} AWS health status
   */
  async checkAWSHealth() {
    try {
      const { S3Client, ListBucketsCommand } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({ 
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      
      await s3Client.send(new ListBucketsCommand({}));
      
      return {
        status: 'healthy',
        service: 'aws-services',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'aws-services',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }
}