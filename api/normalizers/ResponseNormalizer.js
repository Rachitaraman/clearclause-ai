// API Response Normalizer
// Standardizes API responses to match AI model output format

export class ResponseNormalizer {
  constructor() {
    this.clauseTypeMapping = {
      // External API mappings to internal clause types
      'payment': 'payment_terms',
      'termination': 'termination_clause',
      'liability': 'liability_limitation',
      'confidential': 'confidentiality_agreement',
      'ip': 'ip_rights',
      'force_majeure': 'force_majeure',
      'governing': 'governing_law',
      'dispute': 'dispute_resolution',
      'warranty': 'warranties_representations',
      'indemnity': 'indemnification',
      'assignment': 'assignment_rights',
      'amendment': 'amendment_modification',
      'severability': 'severability_clause',
      'entire': 'entire_agreement',
      'notice': 'notice_provisions'
    };

    this.riskLevelMapping = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical',
      'minor': 'Low',
      'major': 'High',
      'severe': 'Critical'
    };
  }

  /**
   * Normalize API response to standard format
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} - Normalized response matching AI model format
   */
  normalizeToStandardFormat(apiResponse) {
    try {
      const normalized = {
        summary: this.normalizeSummary(apiResponse.summary || {}),
        clauses: this.normalizeClauses(apiResponse.clauses || []),
        risks: this.normalizeRisks(apiResponse.risks || []),
        recommendations: this.normalizeRecommendations(apiResponse.recommendations || []),
        metadata: this.normalizeMetadata(apiResponse.metadata || {})
      };

      return this.validateNormalizedResponse(normalized);
    } catch (error) {
      console.error('Response normalization failed:', error);
      throw new Error(`Failed to normalize API response: ${error.message}`);
    }
  }

  /**
   * Normalize summary section
   * @param {Object} summary - Raw summary data
   * @returns {Object} - Normalized summary
   * @private
   */
  normalizeSummary(summary) {
    return {
      title: summary.title || summary.document_title || "Analyzed Contract",
      documentType: summary.documentType || summary.type || "contract",
      totalClauses: parseInt(summary.totalClauses || summary.clause_count || 0),
      riskScore: parseFloat(summary.riskScore || summary.risk_score || 0),
      processingTime: parseInt(summary.processingTime || summary.processing_ms || 0),
      confidence: parseFloat(summary.confidence || summary.confidence_score || 0)
    };
  }

  /**
   * Normalize clauses array
   * @param {Array} clauses - Raw clauses data
   * @returns {Array} - Normalized clauses
   * @private
   */
  normalizeClauses(clauses) {
    // Ensure clauses is an array
    if (!Array.isArray(clauses)) {
      return [];
    }
    
    return clauses.map((clause, index) => ({
      id: clause.id || clause.clause_id || `normalized_clause_${index}`,
      text: clause.text || clause.content || clause.clause_text || "",
      type: this.mapClauseTypes(clause.type || clause.clause_type || "unknown"),
      category: clause.category || this.getCategoryFromType(clause.type),
      confidence: parseFloat(clause.confidence || clause.confidence_score || 0),
      startPosition: parseInt(clause.startPosition || clause.start_pos || 0),
      endPosition: parseInt(clause.endPosition || clause.end_pos || 0)
    }));
  }

  /**
   * Normalize risks array
   * @param {Array} risks - Raw risks data
   * @returns {Array} - Normalized risks
   * @private
   */
  normalizeRisks(risks) {
    // Ensure risks is an array
    if (!Array.isArray(risks)) {
      return [];
    }
    
    return risks.map((risk, index) => ({
      id: risk.id || risk.risk_id || `normalized_risk_${index}`,
      title: risk.title || risk.name || risk.risk_title || "Identified Risk",
      description: risk.description || risk.details || risk.risk_description || "",
      severity: this.standardizeRiskLevels(risk.severity || risk.level || "Medium"),
      category: risk.category || risk.risk_category || "general",
      affectedClauses: Array.isArray(risk.affectedClauses) 
        ? risk.affectedClauses 
        : (risk.affected_clauses || risk.clause_ids || []),
      mitigation: risk.mitigation || risk.recommendation || risk.mitigation_strategy || "",
      confidence: parseFloat(risk.confidence || risk.confidence_score || 0)
    }));
  }

  /**
   * Normalize recommendations array
   * @param {Array} recommendations - Raw recommendations data
   * @returns {Array} - Normalized recommendations
   * @private
   */
  normalizeRecommendations(recommendations) {
    // Ensure recommendations is an array
    if (!Array.isArray(recommendations)) {
      return [];
    }
    
    return recommendations.map((rec, index) => ({
      id: rec.id || rec.recommendation_id || `normalized_rec_${index}`,
      title: rec.title || rec.name || rec.recommendation_title || "Recommendation",
      description: rec.description || rec.details || rec.recommendation_text || "",
      priority: rec.priority || rec.importance || "Medium",
      category: rec.category || rec.rec_category || "general",
      actionRequired: Boolean(rec.actionRequired || rec.action_required || rec.requires_action)
    }));
  }

  /**
   * Normalize metadata section
   * @param {Object} metadata - Raw metadata
   * @returns {Object} - Normalized metadata
   * @private
   */
  normalizeMetadata(metadata) {
    return {
      processingMethod: "api_fallback",
      modelUsed: metadata.modelUsed || metadata.model || metadata.api_service || "external_api",
      processingTime: parseInt(metadata.processingTime || metadata.processing_ms || 0),
      tokenUsage: parseInt(metadata.tokenUsage || metadata.tokens || 0),
      confidence: parseFloat(metadata.confidence || metadata.overall_confidence || 0)
    };
  }

  /**
   * Map external clause types to internal types
   * @param {string} externalType - External clause type
   * @returns {string} - Internal clause type
   */
  mapClauseTypes(externalType) {
    if (!externalType) return "unknown";
    
    const normalized = externalType.toLowerCase().trim();
    
    // Direct mapping
    if (this.clauseTypeMapping[normalized]) {
      return this.clauseTypeMapping[normalized];
    }

    // Partial matching
    for (const [external, internal] of Object.entries(this.clauseTypeMapping)) {
      if (normalized.includes(external) || external.includes(normalized)) {
        return internal;
      }
    }

    return "unknown";
  }

  /**
   * Standardize risk levels to consistent format
   * @param {string} riskLevel - External risk level
   * @returns {string} - Standardized risk level
   */
  standardizeRiskLevels(riskLevel) {
    if (!riskLevel) return "Medium";
    
    const normalized = riskLevel.toLowerCase().trim();
    
    return this.riskLevelMapping[normalized] || "Medium";
  }

  /**
   * Get category name from clause type
   * @param {string} clauseType - Clause type
   * @returns {string} - Category name
   * @private
   */
  getCategoryFromType(clauseType) {
    const typeToCategory = {
      'payment_terms': 'Payment',
      'termination_clause': 'Termination',
      'liability_limitation': 'Liability',
      'confidentiality_agreement': 'Confidentiality',
      'ip_rights': 'Intellectual Property',
      'force_majeure': 'Force Majeure',
      'governing_law': 'Legal',
      'dispute_resolution': 'Legal',
      'warranties_representations': 'Warranties',
      'indemnification': 'Liability',
      'assignment_rights': 'Rights',
      'amendment_modification': 'Modifications',
      'severability_clause': 'Legal',
      'entire_agreement': 'Legal',
      'notice_provisions': 'Communications'
    };

    return typeToCategory[clauseType] || 'General';
  }

  /**
   * Validate normalized response structure
   * @param {Object} response - Normalized response
   * @returns {Object} - Validated response
   * @private
   */
  validateNormalizedResponse(response) {
    const required = ['summary', 'clauses', 'risks', 'recommendations', 'metadata'];
    const missing = required.filter(field => !response.hasOwnProperty(field));
    
    if (missing.length > 0) {
      throw new Error(`Normalized response missing required fields: ${missing.join(', ')}`);
    }

    // Ensure arrays are actually arrays
    ['clauses', 'risks', 'recommendations'].forEach(field => {
      if (!Array.isArray(response[field])) {
        response[field] = [];
      }
    });

    // Validate summary structure
    this.validateSummaryStructure(response.summary);
    
    // Validate array elements
    this.validateClausesStructure(response.clauses);
    this.validateRisksStructure(response.risks);
    this.validateRecommendationsStructure(response.recommendations);
    this.validateMetadataStructure(response.metadata);

    return response;
  }

  /**
   * Validate summary structure
   * @param {Object} summary - Summary object
   * @private
   */
  validateSummaryStructure(summary) {
    const requiredFields = ['title', 'documentType', 'totalClauses', 'riskScore', 'processingTime', 'confidence'];
    const missing = requiredFields.filter(field => summary[field] === undefined || summary[field] === null);
    
    if (missing.length > 0) {
      throw new Error(`Summary missing required fields: ${missing.join(', ')}`);
    }

    // Validate numeric fields
    if (typeof summary.totalClauses !== 'number' || isNaN(summary.totalClauses) || summary.totalClauses < 0) {
      const parsed = parseInt(summary.totalClauses);
      summary.totalClauses = isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    
    if (typeof summary.riskScore !== 'number' || isNaN(summary.riskScore) || summary.riskScore < 0 || summary.riskScore > 100) {
      const parsed = parseFloat(summary.riskScore);
      summary.riskScore = isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed));
    }
    
    if (typeof summary.confidence !== 'number' || isNaN(summary.confidence) || summary.confidence < 0 || summary.confidence > 1) {
      const parsed = parseFloat(summary.confidence);
      summary.confidence = isNaN(parsed) ? 0 : Math.max(0, Math.min(1, parsed));
    }
  }

  /**
   * Validate clauses structure
   * @param {Array} clauses - Clauses array
   * @private
   */
  validateClausesStructure(clauses) {
    clauses.forEach((clause, index) => {
      if (!clause.id) clause.id = `clause_${index}`;
      if (!clause.text) clause.text = '';
      if (!clause.type) clause.type = 'unknown';
      if (!clause.category) clause.category = 'General';
      if (typeof clause.confidence !== 'number' || isNaN(clause.confidence) || clause.confidence < 0 || clause.confidence > 1) {
        const parsed = parseFloat(clause.confidence);
        clause.confidence = isNaN(parsed) ? 0.5 : Math.max(0, Math.min(1, parsed));
      }
      if (typeof clause.startPosition !== 'number' || isNaN(clause.startPosition)) {
        const parsed = parseInt(clause.startPosition);
        clause.startPosition = isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
      if (typeof clause.endPosition !== 'number' || isNaN(clause.endPosition)) {
        const parsed = parseInt(clause.endPosition);
        clause.endPosition = isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    });
  }

  /**
   * Validate risks structure
   * @param {Array} risks - Risks array
   * @private
   */
  validateRisksStructure(risks) {
    const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
    
    risks.forEach((risk, index) => {
      if (!risk.id) risk.id = `risk_${index}`;
      if (!risk.title) risk.title = 'Identified Risk';
      if (!risk.description) risk.description = '';
      if (!validSeverities.includes(risk.severity)) risk.severity = 'Medium';
      if (!risk.category) risk.category = 'general';
      if (!Array.isArray(risk.affectedClauses)) risk.affectedClauses = [];
      if (!risk.mitigation) risk.mitigation = '';
      if (typeof risk.confidence !== 'number' || isNaN(risk.confidence) || risk.confidence < 0 || risk.confidence > 1) {
        const parsed = parseFloat(risk.confidence);
        risk.confidence = isNaN(parsed) ? 0.5 : Math.max(0, Math.min(1, parsed));
      }
    });
  }

  /**
   * Validate recommendations structure
   * @param {Array} recommendations - Recommendations array
   * @private
   */
  validateRecommendationsStructure(recommendations) {
    const validPriorities = ['Low', 'Medium', 'High'];
    
    recommendations.forEach((rec, index) => {
      if (!rec.id) rec.id = `recommendation_${index}`;
      if (!rec.title) rec.title = 'Recommendation';
      if (!rec.description) rec.description = '';
      if (!validPriorities.includes(rec.priority)) rec.priority = 'Medium';
      if (!rec.category) rec.category = 'general';
      if (typeof rec.actionRequired !== 'boolean') rec.actionRequired = false;
    });
  }

  /**
   * Validate metadata structure
   * @param {Object} metadata - Metadata object
   * @private
   */
  validateMetadataStructure(metadata) {
    if (!metadata.processingMethod) metadata.processingMethod = 'api_fallback';
    if (!metadata.modelUsed) metadata.modelUsed = 'external_api';
    if (typeof metadata.processingTime !== 'number' || isNaN(metadata.processingTime)) {
      const parsed = parseInt(metadata.processingTime);
      metadata.processingTime = isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    if (typeof metadata.tokenUsage !== 'number' || isNaN(metadata.tokenUsage)) {
      const parsed = parseInt(metadata.tokenUsage);
      metadata.tokenUsage = isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    if (typeof metadata.confidence !== 'number' || isNaN(metadata.confidence) || metadata.confidence < 0 || metadata.confidence > 1) {
      const parsed = parseFloat(metadata.confidence);
      metadata.confidence = isNaN(parsed) ? 0.5 : Math.max(0, Math.min(1, parsed));
    }
  }

  /**
   * Get supported clause types
   * @returns {Array} - Array of supported clause types
   */
  getSupportedClauseTypes() {
    return Object.values(this.clauseTypeMapping);
  }

  /**
   * Get supported risk levels
   * @returns {Array} - Array of supported risk levels
   */
  getSupportedRiskLevels() {
    return Object.values(this.riskLevelMapping);
  }

  /**
   * Normalize response with error recovery
   * @param {Object} apiResponse - Raw API response
   * @param {Object} options - Normalization options
   * @returns {Object} - Normalized response with error recovery
   */
  normalizeWithErrorRecovery(apiResponse, options = {}) {
    try {
      return this.normalizeToStandardFormat(apiResponse);
    } catch (error) {
      console.warn('Primary normalization failed, attempting error recovery:', error.message);
      
      // Attempt to create a minimal valid response
      return this.createMinimalResponse(apiResponse, error);
    }
  }

  /**
   * Create minimal valid response when normalization fails
   * @param {Object} apiResponse - Original API response
   * @param {Error} originalError - Original normalization error
   * @returns {Object} - Minimal valid response
   * @private
   */
  createMinimalResponse(apiResponse, originalError) {
    return {
      summary: {
        title: "API Analysis (Partial)",
        documentType: "contract",
        totalClauses: 0,
        riskScore: 0,
        processingTime: 0,
        confidence: 0
      },
      clauses: [],
      risks: [{
        id: "normalization_error",
        title: "Response Processing Error",
        description: `Failed to normalize API response: ${originalError.message}`,
        severity: "Medium",
        category: "system",
        affectedClauses: [],
        mitigation: "Review API response format and update normalization logic",
        confidence: 1.0
      }],
      recommendations: [{
        id: "check_api_format",
        title: "Check API Response Format",
        description: "The API response format may have changed and requires attention",
        priority: "High",
        category: "system_maintenance",
        actionRequired: true
      }],
      metadata: {
        processingMethod: "api_fallback",
        modelUsed: "external_api",
        processingTime: 0,
        tokenUsage: 0,
        confidence: 0,
        normalizationError: originalError.message,
        originalResponse: apiResponse
      }
    };
  }
}

export default ResponseNormalizer;