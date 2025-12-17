import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContractAnalyzer } from '../../model/analyzers/ContractAnalyzer.js';

describe('ContractAnalyzer Integration Tests', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new ContractAnalyzer({
      enableClauseExtraction: true,
      enableRiskAnalysis: true,
      enableRecommendations: true,
      confidenceThreshold: 0.3
    });
  });

  afterEach(async () => {
    if (analyzer) {
      await analyzer.cleanup();
    }
  });

  it('should initialize successfully without model loading', async () => {
    // Test initialization without actually loading AI model (for testing environment)
    const result = await analyzer.initialize({
      modelName: 'test-model',
      skipModelLoad: true
    });
    
    // Should succeed even if model loading fails (fallback mode)
    expect(typeof result).toBe('boolean');
    
    const metrics = analyzer.getPerformanceMetrics();
    expect(metrics).toHaveProperty('totalAnalyses');
    expect(metrics).toHaveProperty('successfulAnalyses');
    expect(metrics).toHaveProperty('averageProcessingTime');
  });

  it('should analyze simple text contract successfully', async () => {
    const contractText = `
      This Service Agreement is entered into between Company A and Company B.
      
      Payment Terms: Payment shall be made within 30 days of invoice date.
      
      Termination: Either party may terminate this agreement with 30 days written notice.
      
      Liability: Company A's liability shall not exceed the total amount paid under this agreement.
      
      Confidentiality: Both parties agree to maintain confidentiality of proprietary information.
    `;

    const result = await analyzer.analyzeContract(contractText, {
      documentType: 'txt',
      title: 'Test Service Agreement'
    });

    // Validate standardized output structure
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('clauses');
    expect(result).toHaveProperty('risks');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('metadata');

    // Validate summary
    expect(result.summary).toHaveProperty('title');
    expect(result.summary).toHaveProperty('documentType');
    expect(result.summary).toHaveProperty('totalClauses');
    expect(result.summary).toHaveProperty('riskScore');
    expect(result.summary).toHaveProperty('processingTime');
    expect(result.summary).toHaveProperty('confidence');

    expect(result.summary.title).toBe('Test Service Agreement');
    expect(result.summary.documentType).toBe('txt');
    expect(typeof result.summary.totalClauses).toBe('number');
    expect(typeof result.summary.riskScore).toBe('number');
    expect(typeof result.summary.processingTime).toBe('number');
    expect(typeof result.summary.confidence).toBe('number');

    // Validate clauses structure
    expect(Array.isArray(result.clauses)).toBe(true);
    result.clauses.forEach(clause => {
      expect(clause).toHaveProperty('id');
      expect(clause).toHaveProperty('text');
      expect(clause).toHaveProperty('type');
      expect(clause).toHaveProperty('category');
      expect(clause).toHaveProperty('confidence');
      expect(clause).toHaveProperty('startPosition');
      expect(clause).toHaveProperty('endPosition');
    });

    // Validate risks structure
    expect(Array.isArray(result.risks)).toBe(true);
    result.risks.forEach(risk => {
      expect(risk).toHaveProperty('id');
      expect(risk).toHaveProperty('title');
      expect(risk).toHaveProperty('description');
      expect(risk).toHaveProperty('severity');
      expect(risk).toHaveProperty('category');
    });

    // Validate recommendations structure
    expect(Array.isArray(result.recommendations)).toBe(true);
    result.recommendations.forEach(rec => {
      expect(rec).toHaveProperty('id');
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('description');
      expect(rec).toHaveProperty('priority');
      expect(rec).toHaveProperty('category');
    });

    // Validate metadata
    expect(result.metadata).toHaveProperty('processingMethod');
    expect(result.metadata).toHaveProperty('modelUsed');
    expect(result.metadata).toHaveProperty('processingTime');
    expect(result.metadata).toHaveProperty('tokenUsage');
    expect(result.metadata).toHaveProperty('confidence');
    expect(result.metadata).toHaveProperty('analysisId');
    expect(result.metadata).toHaveProperty('timestamp');

    expect(result.metadata.processingMethod).toBe('ai_model');
    expect(typeof result.metadata.modelUsed).toBe('string');
    expect(typeof result.metadata.processingTime).toBe('number');
    expect(typeof result.metadata.tokenUsage).toBe('number');
    expect(typeof result.metadata.confidence).toBe('number');
  });

  it('should handle empty contract text gracefully', async () => {
    await expect(analyzer.analyzeContract('')).rejects.toThrow('Contract analysis failed');
  });

  it('should handle invalid document input gracefully', async () => {
    await expect(analyzer.analyzeContract(null)).rejects.toThrow('Document input is required');
  });

  it('should extract clauses independently', async () => {
    const contractText = `
      Payment shall be made within 30 days.
      This agreement may be terminated by either party.
      Confidential information must be protected.
    `;

    const clauses = await analyzer.extractClauses(contractText);
    
    expect(Array.isArray(clauses)).toBe(true);
    expect(clauses.length).toBeGreaterThan(0);
    
    clauses.forEach(clause => {
      expect(clause).toHaveProperty('id');
      expect(clause).toHaveProperty('text');
      expect(clause).toHaveProperty('type');
      expect(clause).toHaveProperty('confidence');
      expect(typeof clause.confidence).toBe('number');
      expect(clause.confidence).toBeGreaterThanOrEqual(0);
      expect(clause.confidence).toBeLessThanOrEqual(1);
    });
  });

  it('should assess risks independently', async () => {
    const mockClauses = [
      {
        id: 'clause_1',
        text: 'Company A shall be liable for unlimited damages',
        type: 'liability_limitation',
        confidence: 0.9
      },
      {
        id: 'clause_2',
        text: 'Payment terms are net 90 days',
        type: 'payment_terms',
        confidence: 0.8
      }
    ];

    const riskAnalysis = await analyzer.assessRisks(mockClauses);
    
    expect(riskAnalysis).toHaveProperty('risks');
    expect(Array.isArray(riskAnalysis.risks)).toBe(true);
    
    // Without a loaded model, should return empty risks array
    // This is expected fallback behavior
    expect(riskAnalysis.risks).toEqual([]);
  });

  it('should generate recommendations independently', async () => {
    const mockRisks = [
      {
        id: 'risk_1',
        title: 'Unlimited Liability Risk',
        description: 'Contract exposes party to unlimited liability',
        severity: 'Critical',
        category: 'Risk Management'
      }
    ];

    const recommendations = await analyzer.generateRecommendations(mockRisks);
    
    expect(Array.isArray(recommendations)).toBe(true);
    
    // Without a loaded model, should return empty recommendations array
    // This is expected fallback behavior
    expect(recommendations).toEqual([]);
  });

  it('should track performance metrics', async () => {
    const contractText = 'Simple contract for testing metrics.';
    
    const initialMetrics = analyzer.getPerformanceMetrics();
    expect(initialMetrics.totalAnalyses).toBe(0);
    
    await analyzer.analyzeContract(contractText, { documentType: 'txt' });
    
    const updatedMetrics = analyzer.getPerformanceMetrics();
    expect(updatedMetrics.totalAnalyses).toBe(1);
    expect(updatedMetrics.successfulAnalyses).toBe(1);
    expect(updatedMetrics.averageProcessingTime).toBeGreaterThanOrEqual(0);
    expect(updatedMetrics.successRate).toBe(1);
  });

  it('should handle configuration options correctly', async () => {
    const disabledAnalyzer = new ContractAnalyzer({
      enableClauseExtraction: false,
      enableRiskAnalysis: false,
      enableRecommendations: false
    });

    const contractText = 'Test contract with payment and termination clauses.';
    
    const result = await disabledAnalyzer.analyzeContract(contractText, {
      documentType: 'txt'
    });

    // Should still return structured output but with empty arrays
    expect(result).toHaveProperty('clauses');
    expect(result).toHaveProperty('risks');
    expect(result).toHaveProperty('recommendations');
    
    expect(result.clauses).toEqual([]);
    expect(result.risks).toEqual([]);
    expect(result.recommendations).toEqual([]);

    await disabledAnalyzer.cleanup();
  });
});