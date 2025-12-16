/**
 * RiskAnalyzer - AI-powered risk assessment for contract analysis
 * 
 * This class provides comprehensive risk analysis capabilities including:
 * - Risk identification and evaluation
 * - Risk level assignment (Low, Medium, High, Critical)
 * - Risk explanation generation
 * - Mitigation recommendation system
 * - Risk prioritization by severity and business impact
 */

export class RiskAnalyzer {
  constructor(modelManager) {
    this.modelManager = modelManager;
    this.riskCategories = [
      'Risk Management',
      'Financial',
      'Legal',
      'Intellectual Property',
      'Information Security',
      'Contract Management',
      'Compliance',
      'Operational'
    ];
    
    this.riskLevels = ['Low', 'Medium', 'High', 'Critical'];
    this.businessImpactLevels = ['Low', 'Medium', 'High', 'Very High'];
  }

  /**
   * Analyze clauses for potential legal and business risks
   * @param {Array} clauses - Array of clause objects to analyze
   * @param {Object} options - Analysis options
   * @returns {Object} Risk analysis results
   */
  async analyzeRisks(clauses, options = {}) {
    if (!clauses) {
      throw new Error('Clauses array is required for risk analysis');
    }

    if (!Array.isArray(clauses)) {
      throw new Error('Clauses must be an array');
    }

    if (clauses.length === 0) {
      return { risks: [] };
    }

    if (!this.modelManager.isLoaded) {
      throw new Error('Model must be loaded before performing risk analysis');
    }

    const prompt = this._buildRiskAnalysisPrompt(clauses, options);
    
    try {
      const response = await this.modelManager.inference(prompt, {
        temperature: 0.1,
        maxTokens: 4000,
        format: 'json'
      });

      const parsedResponse = JSON.parse(response);
      
      // Validate and enhance the response
      const risks = this._validateAndEnhanceRisks(parsedResponse.risks || [], clauses);
      
      return {
        risks: risks,
        summary: {
          totalRisks: risks.length,
          criticalRisks: risks.filter(r => r.severity === 'Critical').length,
          highRisks: risks.filter(r => r.severity === 'High').length,
          mediumRisks: risks.filter(r => r.severity === 'Medium').length,
          lowRisks: risks.filter(r => r.severity === 'Low').length,
          averageConfidence: risks.length > 0 ? 
            risks.reduce((sum, r) => sum + r.confidence, 0) / risks.length : 0
        }
      };
    } catch (error) {
      throw new Error(`Risk analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate actionable mitigation recommendations for identified risks
   * @param {Array} risks - Array of risk objects
   * @param {Object} options - Mitigation options
   * @returns {Object} Mitigation recommendations
   */
  async generateMitigationStrategies(risks, options = {}) {
    if (!risks) {
      throw new Error('Risks array is required for mitigation strategy generation');
    }

    if (!Array.isArray(risks)) {
      throw new Error('Risks must be an array');
    }

    if (risks.length === 0) {
      return { recommendations: [] };
    }

    if (!this.modelManager.isLoaded) {
      throw new Error('Model must be loaded before generating mitigation strategies');
    }

    const prompt = this._buildMitigationPrompt(risks, options);
    
    try {
      const response = await this.modelManager.inference(prompt, {
        temperature: 0.2,
        maxTokens: 3000,
        format: 'json'
      });

      const parsedResponse = JSON.parse(response);
      
      // Validate and enhance the recommendations
      const recommendations = this._validateAndEnhanceRecommendations(
        parsedResponse.recommendations || [], 
        risks
      );
      
      return {
        recommendations: recommendations,
        summary: {
          totalRecommendations: recommendations.length,
          highPriorityActions: recommendations.filter(r => r.priority === 'High').length,
          mediumPriorityActions: recommendations.filter(r => r.priority === 'Medium').length,
          lowPriorityActions: recommendations.filter(r => r.priority === 'Low').length,
          actionRequiredCount: recommendations.filter(r => r.actionRequired).length
        }
      };
    } catch (error) {
      throw new Error(`Mitigation strategy generation failed: ${error.message}`);
    }
  }

  /**
   * Prioritize risks by severity and business impact
   * @param {Array} risks - Array of risk objects
   * @returns {Object} Prioritized risks
   */
  async prioritizeRisks(risks) {
    if (!risks) {
      throw new Error('Risks array is required for prioritization');
    }

    if (!Array.isArray(risks)) {
      throw new Error('Risks must be an array');
    }

    if (risks.length === 0) {
      return { prioritized: [] };
    }

    // Calculate priority scores based on multiple factors
    const prioritizedRisks = risks.map(risk => {
      const severityWeight = this._getSeverityWeight(risk.severity);
      const impactWeight = this._getBusinessImpactWeight(risk.businessImpact);
      const confidenceWeight = risk.confidence || 0.5;
      const riskScoreWeight = risk.riskScore || 0.5;

      // Weighted priority score calculation
      const priorityScore = (
        severityWeight * 0.4 +
        impactWeight * 0.3 +
        confidenceWeight * 0.2 +
        riskScoreWeight * 0.1
      );

      return {
        ...risk,
        priorityScore: Math.min(priorityScore, 1.0),
        priorityRank: 0 // Will be set after sorting
      };
    });

    // Sort by priority score (highest first)
    prioritizedRisks.sort((a, b) => b.priorityScore - a.priorityScore);

    // Assign priority ranks
    prioritizedRisks.forEach((risk, index) => {
      risk.priorityRank = index + 1;
    });

    return {
      prioritized: prioritizedRisks,
      summary: {
        totalRisks: prioritizedRisks.length,
        highestPriorityRisk: prioritizedRisks[0],
        averagePriorityScore: prioritizedRisks.reduce((sum, r) => sum + r.priorityScore, 0) / prioritizedRisks.length
      }
    };
  }

  /**
   * Get supported risk categories
   * @returns {Array} Array of risk category strings
   */
  getRiskCategories() {
    return [...this.riskCategories];
  }

  /**
   * Get supported risk levels
   * @returns {Array} Array of risk level strings
   */
  getRiskLevels() {
    return [...this.riskLevels];
  }

  /**
   * Build risk analysis prompt for AI model
   * @private
   */
  _buildRiskAnalysisPrompt(clauses, options) {
    const clauseTexts = clauses.map((clause, index) => 
      `${index + 1}. [${clause.type || 'unknown'}] ${clause.text}`
    ).join('\n\n');

    return `You are a legal risk analysis expert. Analyze the following contract clauses for potential legal and business risks.

CLAUSES TO ANALYZE:
${clauseTexts}

ANALYSIS REQUIREMENTS:
- Identify specific risks in each clause
- Assign risk levels: Low, Medium, High, or Critical
- Provide detailed explanations for each risk
- Consider business impact and legal exposure
- Focus on actionable risk identification

RISK CATEGORIES: ${this.riskCategories.join(', ')}

Respond with a JSON object containing a "risks" array. Each risk should have:
- id: unique identifier
- title: brief risk title
- description: detailed risk description
- severity: risk level (Low/Medium/High/Critical)
- category: risk category from the list above
- affectedClauses: array of clause IDs or indices
- explanation: specific explanation of why this is a risk
- confidence: confidence score (0.0-1.0)
- riskScore: numerical risk score (0.0-1.0)
- businessImpact: business impact level (Low/Medium/High/Very High)

Example response format:
{
  "risks": [
    {
      "id": "risk_1",
      "title": "Unlimited Liability Exposure",
      "description": "Clause creates unlimited liability exposure for damages",
      "severity": "Critical",
      "category": "Risk Management",
      "affectedClauses": ["1"],
      "explanation": "This clause exposes the party to unlimited financial liability...",
      "confidence": 0.9,
      "riskScore": 0.85,
      "businessImpact": "Very High"
    }
  ]
}`;
  }

  /**
   * Build mitigation recommendation prompt for AI model
   * @private
   */
  _buildMitigationPrompt(risks, options) {
    const riskDescriptions = risks.map((risk, index) => 
      `${index + 1}. [${risk.severity}] ${risk.title}: ${risk.description}`
    ).join('\n\n');

    return `You are a contract negotiation expert. Generate specific, actionable mitigation recommendations for the following identified risks.

IDENTIFIED RISKS:
${riskDescriptions}

MITIGATION REQUIREMENTS:
- Provide specific, actionable recommendations
- Prioritize recommendations by urgency and impact
- Include negotiation strategies where applicable
- Consider practical implementation challenges
- Focus on risk reduction and business protection

Respond with a JSON object containing a "recommendations" array. Each recommendation should have:
- id: unique identifier
- riskId: ID of the risk being addressed
- title: brief recommendation title
- description: detailed mitigation strategy
- priority: priority level (Low/Medium/High)
- category: category matching the risk category
- actionRequired: boolean indicating if immediate action is needed
- estimatedEffort: description of effort required
- timeline: suggested timeline for implementation
- riskReduction: estimated risk reduction (0.0-1.0)

Example response format:
{
  "recommendations": [
    {
      "id": "rec_1",
      "riskId": "risk_1",
      "title": "Add Liability Cap",
      "description": "Negotiate a liability cap equal to the total contract value...",
      "priority": "High",
      "category": "Risk Management",
      "actionRequired": true,
      "estimatedEffort": "Significant negotiation required",
      "timeline": "Before contract execution",
      "riskReduction": 0.8
    }
  ]
}`;
  }

  /**
   * Validate and enhance risk analysis results
   * @private
   */
  _validateAndEnhanceRisks(risks, originalClauses) {
    return risks.map((risk, index) => {
      // Ensure required fields
      const enhancedRisk = {
        id: risk.id || `risk_${index + 1}`,
        title: risk.title || 'Unspecified Risk',
        description: risk.description || 'Risk description not provided',
        severity: this.riskLevels.includes(risk.severity) ? risk.severity : 'Medium',
        category: this.riskCategories.includes(risk.category) ? risk.category : 'Risk Management',
        affectedClauses: Array.isArray(risk.affectedClauses) ? risk.affectedClauses : [],
        explanation: risk.explanation || 'Risk explanation not provided',
        confidence: this._validateConfidence(risk.confidence),
        riskScore: this._validateRiskScore(risk.riskScore),
        businessImpact: this.businessImpactLevels.includes(risk.businessImpact) ? 
          risk.businessImpact : 'Medium'
      };

      return enhancedRisk;
    });
  }

  /**
   * Validate and enhance mitigation recommendations
   * @private
   */
  _validateAndEnhanceRecommendations(recommendations, originalRisks) {
    return recommendations.map((rec, index) => {
      const enhancedRec = {
        id: rec.id || `rec_${index + 1}`,
        riskId: rec.riskId || (originalRisks[index] ? originalRisks[index].id : 'unknown'),
        title: rec.title || 'Mitigation Recommendation',
        description: rec.description || 'Recommendation details not provided',
        priority: ['Low', 'Medium', 'High'].includes(rec.priority) ? rec.priority : 'Medium',
        category: this.riskCategories.includes(rec.category) ? rec.category : 'Risk Management',
        actionRequired: typeof rec.actionRequired === 'boolean' ? rec.actionRequired : true,
        estimatedEffort: rec.estimatedEffort || 'Effort assessment needed',
        timeline: rec.timeline || 'Timeline to be determined',
        riskReduction: this._validateRiskScore(rec.riskReduction)
      };

      return enhancedRec;
    });
  }

  /**
   * Get severity weight for priority calculation
   * @private
   */
  _getSeverityWeight(severity) {
    const weights = {
      'Critical': 1.0,
      'High': 0.8,
      'Medium': 0.6,
      'Low': 0.4
    };
    return weights[severity] || 0.5;
  }

  /**
   * Get business impact weight for priority calculation
   * @private
   */
  _getBusinessImpactWeight(impact) {
    const weights = {
      'Very High': 1.0,
      'High': 0.8,
      'Medium': 0.6,
      'Low': 0.4
    };
    return weights[impact] || 0.5;
  }

  /**
   * Validate confidence score
   * @private
   */
  _validateConfidence(confidence) {
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      return 0.5;
    }
    return Math.max(0.0, Math.min(1.0, confidence));
  }

  /**
   * Validate risk score
   * @private
   */
  _validateRiskScore(score) {
    if (typeof score !== 'number' || isNaN(score)) {
      return 0.5;
    }
    return Math.max(0.0, Math.min(1.0, score));
  }
}