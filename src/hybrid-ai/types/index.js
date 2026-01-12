/**
 * Core type definitions for the Hybrid AWS-Gemini AI Model system
 */

/**
 * Document processing status enumeration
 */
export const DocumentStatus = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  ANALYZED: 'analyzed',
  ERROR: 'error'
};

/**
 * Document type enumeration
 */
export const DocumentType = {
  PDF: 'pdf',
  DOCX: 'docx',
  TXT: 'txt',
  URL: 'url'
};

/**
 * Risk severity levels
 */
export const RiskSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Risk categories
 */
export const RiskCategory = {
  LEGAL: 'legal',
  FINANCIAL: 'financial',
  OPERATIONAL: 'operational'
};

/**
 * Clause types for contract analysis
 */
export const ClauseType = {
  PAYMENT: 'payment',
  TERMINATION: 'termination',
  LIABILITY: 'liability',
  CONFIDENTIALITY: 'confidentiality',
  INTELLECTUAL_PROPERTY: 'intellectual_property',
  INDEMNIFICATION: 'indemnification',
  FORCE_MAJEURE: 'force_majeure',
  GOVERNING_LAW: 'governing_law',
  DISPUTE_RESOLUTION: 'dispute_resolution',
  WARRANTY: 'warranty',
  LIMITATION_OF_LIABILITY: 'limitation_of_liability',
  DATA_PROTECTION: 'data_protection',
  NON_COMPETE: 'non_compete',
  ASSIGNMENT: 'assignment',
  AMENDMENT: 'amendment'
};

/**
 * Validation functions for data integrity
 */
export const validators = {
  /**
   * Validates document object structure
   * @param {Object} document - Document object to validate
   * @returns {boolean} - True if valid
   */
  validateDocument(document) {
    if (!document || typeof document !== 'object') return false;
    
    const requiredFields = ['id', 'filename', 'type', 'uploadTimestamp', 'status'];
    const hasRequiredFields = requiredFields.every(field => document.hasOwnProperty(field));
    
    const validType = Object.values(DocumentType).includes(document.type);
    const validStatus = Object.values(DocumentStatus).includes(document.status);
    
    return hasRequiredFields && validType && validStatus;
  },

  /**
   * Validates analysis result object structure
   * @param {Object} result - Analysis result object to validate
   * @returns {boolean} - True if valid
   */
  validateAnalysisResult(result) {
    if (!result || typeof result !== 'object') return false;
    
    const requiredFields = ['documentId', 'analysisTimestamp', 'processingTime', 'confidence'];
    const hasRequiredFields = requiredFields.every(field => result.hasOwnProperty(field));
    
    const hasValidStructure = result.summary && result.clauses && result.risks;
    const validConfidence = typeof result.confidence === 'number' && result.confidence >= 0 && result.confidence <= 1;
    
    return hasRequiredFields && hasValidStructure && validConfidence;
  },

  /**
   * Validates configuration object structure
   * @param {Object} config - Configuration object to validate
   * @returns {boolean} - True if valid
   */
  validateConfiguration(config) {
    if (!config || typeof config !== 'object') return false;
    
    const hasAWSConfig = config.aws && 
      config.aws.accessKeyId && 
      config.aws.secretAccessKey && 
      config.aws.region;
    
    const hasGeminiConfig = config.gemini && 
      config.gemini.apiKey && 
      config.gemini.model && 
      config.gemini.endpoint;
    
    return hasAWSConfig && hasGeminiConfig;
  },

  /**
   * Validates clause object structure
   * @param {Object} clause - Clause object to validate
   * @returns {boolean} - True if valid
   */
  validateClause(clause) {
    if (!clause || typeof clause !== 'object') return false;
    
    const requiredFields = ['id', 'type', 'text', 'confidence'];
    const hasRequiredFields = requiredFields.every(field => clause.hasOwnProperty(field));
    
    const validType = Object.values(ClauseType).includes(clause.type);
    const validConfidence = typeof clause.confidence === 'number' && clause.confidence >= 0 && clause.confidence <= 1;
    
    return hasRequiredFields && validType && validConfidence;
  },

  /**
   * Validates risk object structure
   * @param {Object} risk - Risk object to validate
   * @returns {boolean} - True if valid
   */
  validateRisk(risk) {
    if (!risk || typeof risk !== 'object') return false;
    
    const requiredFields = ['id', 'severity', 'category', 'description'];
    const hasRequiredFields = requiredFields.every(field => risk.hasOwnProperty(field));
    
    const validSeverity = Object.values(RiskSeverity).includes(risk.severity);
    const validCategory = Object.values(RiskCategory).includes(risk.category);
    
    return hasRequiredFields && validSeverity && validCategory;
  }
};