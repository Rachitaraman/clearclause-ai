// Clause Extraction System
// Handles identification, categorization, and grouping of contract clauses

export class ClauseExtractor {
  constructor() {
    this.supportedClauseTypes = [
      'payment_terms',
      'termination_clause',
      'liability_limitation',
      'confidentiality_agreement',
      'intellectual_property',
      'force_majeure',
      'governing_law',
      'dispute_resolution',
      'warranties_representations',
      'indemnification',
      'assignment_rights',
      'amendment_modification',
      'severability_clause',
      'entire_agreement',
      'notice_provisions'
    ];
  }

  /**
   * Identify clauses in contract text
   * @param {string} text - Contract text to analyze
   * @returns {Promise<Array>} - Array of identified clauses
   */
  async identifyClauses(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Valid text string is required for clause identification');
    }

    // Simple clause identification based on common patterns
    // In a real implementation, this would use AI model inference
    const clauses = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 20) { // Only consider substantial sentences
        clauses.push({
          id: `clause_${index}`,
          text: trimmed,
          startPosition: text.indexOf(trimmed),
          endPosition: text.indexOf(trimmed) + trimmed.length
        });
      }
    });

    return clauses;
  }

  /**
   * Categorize clauses into predefined types
   * @param {Array} clauses - Array of clause objects
   * @returns {Promise<Array>} - Array of categorized clauses
   */
  async categorizeClauses(clauses) {
    if (!Array.isArray(clauses)) {
      throw new Error('Clauses must be an array');
    }

    const categorizedClauses = [];

    for (const clause of clauses) {
      const category = await this.determineClauseType(clause.text);
      const confidence = await this.calculateConfidence(clause, category);
      
      categorizedClauses.push({
        ...clause,
        type: category,
        category: category,
        confidence: confidence
      });
    }

    return categorizedClauses;
  }

  /**
   * Group clauses by type while preserving individual text
   * @param {Array} categorizedClauses - Array of categorized clauses
   * @returns {Object} - Grouped clauses with individual text preserved
   */
  groupClausesByType(categorizedClauses) {
    if (!Array.isArray(categorizedClauses)) {
      throw new Error('Categorized clauses must be an array');
    }

    const grouped = {};

    // Initialize groups for all supported types
    this.supportedClauseTypes.forEach(type => {
      grouped[type] = {
        type: type,
        clauses: [],
        count: 0
      };
    });

    // Group clauses by type
    categorizedClauses.forEach(clause => {
      const type = clause.type || 'unknown';
      
      if (!grouped[type]) {
        grouped[type] = {
          type: type,
          clauses: [],
          count: 0
        };
      }

      // Preserve individual clause text and metadata exactly as provided
      grouped[type].clauses.push({
        id: clause.id,
        text: clause.text,
        confidence: clause.confidence,
        startPosition: clause.startPosition,
        endPosition: clause.endPosition
      });
      
      grouped[type].count = grouped[type].clauses.length;
    });

    return grouped;
  }

  /**
   * Calculate confidence score for clause categorization
   * @param {Object} clause - Clause object
   * @param {string} category - Assigned category
   * @returns {Promise<number>} - Confidence score between 0 and 1
   */
  async calculateConfidence(clause, category) {
    if (!clause || !clause.text) {
      return 0;
    }

    // Simple confidence calculation based on keyword matching
    // In a real implementation, this would use AI model confidence scores
    const keywords = this.getKeywordsForCategory(category);
    const text = clause.text.toLowerCase();
    
    let matchCount = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    });

    const confidence = Math.min(matchCount / keywords.length, 1.0);
    return Math.round(confidence * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get supported clause types
   * @returns {Array} - Array of supported clause types
   */
  getSupportedClauseTypes() {
    return [...this.supportedClauseTypes];
  }

  /**
   * Determine clause type based on text content
   * @param {string} text - Clause text
   * @returns {string} - Determined clause type
   * @private
   */
  async determineClauseType(text) {
    if (!text) return 'unknown';

    const lowerText = text.toLowerCase();
    
    // Simple keyword-based categorization
    // In a real implementation, this would use AI model inference
    if (lowerText.includes('payment') || lowerText.includes('pay') || lowerText.includes('invoice')) {
      return 'payment_terms';
    }
    if (lowerText.includes('terminate') || lowerText.includes('termination') || lowerText.includes('end')) {
      return 'termination_clause';
    }
    if (lowerText.includes('liability') || lowerText.includes('liable') || lowerText.includes('damages')) {
      return 'liability_limitation';
    }
    if (lowerText.includes('confidential') || lowerText.includes('non-disclosure') || lowerText.includes('secret')) {
      return 'confidentiality_agreement';
    }
    if (lowerText.includes('intellectual property') || lowerText.includes('copyright') || lowerText.includes('patent')) {
      return 'intellectual_property';
    }
    if (lowerText.includes('force majeure') || lowerText.includes('act of god') || lowerText.includes('unforeseeable')) {
      return 'force_majeure';
    }
    if (lowerText.includes('governing law') || lowerText.includes('jurisdiction') || lowerText.includes('applicable law')) {
      return 'governing_law';
    }
    if (lowerText.includes('dispute') || lowerText.includes('arbitration') || lowerText.includes('mediation')) {
      return 'dispute_resolution';
    }
    if (lowerText.includes('warrant') || lowerText.includes('represent') || lowerText.includes('guarantee')) {
      return 'warranties_representations';
    }
    if (lowerText.includes('indemnif') || lowerText.includes('hold harmless') || lowerText.includes('defend')) {
      return 'indemnification';
    }
    if (lowerText.includes('assign') || lowerText.includes('transfer') || lowerText.includes('delegate')) {
      return 'assignment_rights';
    }
    if (lowerText.includes('amend') || lowerText.includes('modif') || lowerText.includes('change')) {
      return 'amendment_modification';
    }
    if (lowerText.includes('severab') || lowerText.includes('invalid') || lowerText.includes('unenforceable')) {
      return 'severability_clause';
    }
    if (lowerText.includes('entire agreement') || lowerText.includes('complete agreement') || lowerText.includes('supersede')) {
      return 'entire_agreement';
    }
    if (lowerText.includes('notice') || lowerText.includes('notification') || lowerText.includes('inform')) {
      return 'notice_provisions';
    }

    return 'unknown';
  }

  /**
   * Get keywords for a specific category
   * @param {string} category - Clause category
   * @returns {Array} - Array of keywords
   * @private
   */
  getKeywordsForCategory(category) {
    const keywordMap = {
      'payment_terms': ['payment', 'pay', 'invoice', 'billing', 'fee'],
      'termination_clause': ['terminate', 'termination', 'end', 'expire', 'cancel'],
      'liability_limitation': ['liability', 'liable', 'damages', 'loss', 'harm'],
      'confidentiality_agreement': ['confidential', 'non-disclosure', 'secret', 'proprietary'],
      'intellectual_property': ['intellectual property', 'copyright', 'patent', 'trademark'],
      'force_majeure': ['force majeure', 'act of god', 'unforeseeable', 'beyond control'],
      'governing_law': ['governing law', 'jurisdiction', 'applicable law', 'courts'],
      'dispute_resolution': ['dispute', 'arbitration', 'mediation', 'resolution'],
      'warranties_representations': ['warrant', 'represent', 'guarantee', 'assure'],
      'indemnification': ['indemnify', 'hold harmless', 'defend', 'protect'],
      'assignment_rights': ['assign', 'transfer', 'delegate', 'convey'],
      'amendment_modification': ['amend', 'modify', 'change', 'alter'],
      'severability_clause': ['severable', 'invalid', 'unenforceable', 'separate'],
      'entire_agreement': ['entire agreement', 'complete agreement', 'supersede', 'merge'],
      'notice_provisions': ['notice', 'notification', 'inform', 'notify']
    };

    return keywordMap[category] || [];
  }
}

export default ClauseExtractor;