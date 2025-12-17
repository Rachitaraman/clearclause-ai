// Property-based test for analysis consistency
// **Feature: ai-contract-analysis, Property 18: Analysis consistency**
// **Validates: Requirements 9.1**

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { ContractAnalyzer } from '../../model/analyzers/ContractAnalyzer.js';
import { ModelManager } from '../../model/core/ModelManager.js';

describe('Analysis Consistency Property Tests', () => {
  let contractAnalyzer;
  let modelManager;

  beforeEach(() => {
    modelManager = new ModelManager();
    contractAnalyzer = new ContractAnalyzer({ model: { modelManager } });
  });

  afterEach(async () => {
    if (contractAnalyzer) {
      await contractAnalyzer.cleanup();
    }
  });

  it('Property 18: Analysis consistency - same contract analyzed multiple times produces consistent results', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate contract text that should produce deterministic results
        fc.record({
          contractText: fc.oneof(
            fc.constant("PAYMENT TERMS: Payment shall be made within 30 days of invoice. LIABILITY: Contractor's liability is limited to the total contract value. TERMINATION: Either party may terminate with 60 days written notice."),
            fc.constant("CONFIDENTIALITY: All information shared shall remain confidential for 5 years. INTELLECTUAL PROPERTY: All work product belongs to the client. GOVERNING LAW: This agreement is governed by California law."),
            fc.constant("INDEMNIFICATION: Each party shall indemnify the other for third-party claims. FORCE MAJEURE: Neither party is liable for delays due to acts of God. ASSIGNMENT: This agreement may not be assigned without written consent."),
            fc.constant("WARRANTIES: Contractor warrants all work will be performed in a professional manner. DISPUTE RESOLUTION: All disputes shall be resolved through binding arbitration. ENTIRE AGREEMENT: This constitutes the entire agreement between parties.")
          ),
          analysisOptions: fc.record({
            enableClauseExtraction: fc.constant(true),
            enableRiskAnalysis: fc.constant(true),
            enableRecommendations: fc.constant(true),
            confidenceThreshold: fc.constant(0.5)
          }),
          numRuns: fc.integer({ min: 2, max: 5 }) // Number of times to run the same analysis
        }),
        async ({ contractText, analysisOptions, numRuns }) => {
          // Mock the model manager to provide consistent responses
          modelManager.isLoaded = true;
          modelManager.inference = async (prompt) => {
            // Create deterministic responses based on prompt content
            if (prompt.includes('PAYMENT TERMS')) {
              if (prompt.includes('clause')) {
                return JSON.stringify({
                  clauses: [
                    {
                      id: "clause_1",
                      text: "Payment shall be made within 30 days of invoice.",
                      type: "payment_terms",
                      category: "Financial",
                      confidence: 0.9,
                      startPosition: 15,
                      endPosition: 60
                    },
                    {
                      id: "clause_2", 
                      text: "Contractor's liability is limited to the total contract value.",
                      type: "liability_limitation",
                      category: "Risk Management",
                      confidence: 0.85,
                      startPosition: 75,
                      endPosition: 135
                    },
                    {
                      id: "clause_3",
                      text: "Either party may terminate with 60 days written notice.",
                      type: "termination_clause",
                      category: "Contract Management",
                      confidence: 0.8,
                      startPosition: 150,
                      endPosition: 205
                    }
                  ]
                });
              } else if (prompt.includes('risk')) {
                return JSON.stringify({
                  risks: [
                    {
                      id: "risk_1",
                      title: "Payment Delay Risk",
                      description: "30-day payment terms may cause cash flow issues",
                      severity: "Medium",
                      category: "Financial",
                      affectedClauses: ["clause_1"],
                      explanation: "Extended payment terms can impact cash flow and working capital",
                      confidence: 0.8,
                      riskScore: 0.6,
                      businessImpact: "Medium"
                    }
                  ]
                });
              } else if (prompt.includes('recommendation')) {
                return JSON.stringify({
                  recommendations: [
                    {
                      id: "rec_1",
                      title: "Negotiate Shorter Payment Terms",
                      description: "Consider negotiating payment terms to 15-20 days",
                      priority: "Medium",
                      category: "Financial",
                      actionRequired: true,
                      estimatedEffort: "Moderate negotiation required",
                      timeline: "Before contract execution",
                      riskReduction: 0.7
                    }
                  ]
                });
              }
            } else if (prompt.includes('CONFIDENTIALITY')) {
              if (prompt.includes('clause')) {
                return JSON.stringify({
                  clauses: [
                    {
                      id: "clause_1",
                      text: "All information shared shall remain confidential for 5 years.",
                      type: "confidentiality_agreement",
                      category: "Information Security",
                      confidence: 0.95,
                      startPosition: 17,
                      endPosition: 75
                    },
                    {
                      id: "clause_2",
                      text: "All work product belongs to the client.",
                      type: "intellectual_property",
                      category: "Intellectual Property",
                      confidence: 0.9,
                      startPosition: 95,
                      endPosition: 135
                    },
                    {
                      id: "clause_3",
                      text: "This agreement is governed by California law.",
                      type: "governing_law",
                      category: "Legal",
                      confidence: 0.85,
                      startPosition: 155,
                      endPosition: 200
                    }
                  ]
                });
              } else if (prompt.includes('risk')) {
                return JSON.stringify({
                  risks: [
                    {
                      id: "risk_1",
                      title: "IP Ownership Risk",
                      description: "All work product ownership transfers to client without compensation",
                      severity: "High",
                      category: "Intellectual Property",
                      affectedClauses: ["clause_2"],
                      explanation: "Complete IP transfer without additional compensation presents significant risk",
                      confidence: 0.9,
                      riskScore: 0.8,
                      businessImpact: "High"
                    }
                  ]
                });
              }
            }
            
            // Default fallback response
            return JSON.stringify({
              clauses: [],
              risks: [],
              recommendations: []
            });
          };

          // Run the same analysis multiple times
          const results = [];
          for (let i = 0; i < numRuns; i++) {
            const result = await contractAnalyzer.analyzeContract(contractText, analysisOptions);
            results.push(result);
          }

          // Requirement 9.1: Same contract analyzed multiple times should produce consistent clause extraction results
          expect(results.length).toBeGreaterThanOrEqual(2);

          // Compare all results for consistency
          const firstResult = results[0];
          
          for (let i = 1; i < results.length; i++) {
            const currentResult = results[i];
            
            // Clause extraction consistency
            expect(currentResult.clauses.length).toBe(firstResult.clauses.length);
            
            for (let j = 0; j < firstResult.clauses.length; j++) {
              const firstClause = firstResult.clauses[j];
              const currentClause = currentResult.clauses[j];
              
              // Core clause properties should be identical
              expect(currentClause.text).toBe(firstClause.text);
              expect(currentClause.type).toBe(firstClause.type);
              expect(currentClause.category).toBe(firstClause.category);
              expect(currentClause.startPosition).toBe(firstClause.startPosition);
              expect(currentClause.endPosition).toBe(firstClause.endPosition);
              
              // Confidence scores should be consistent (within small tolerance for floating point)
              expect(Math.abs(currentClause.confidence - firstClause.confidence)).toBeLessThan(0.01);
            }
            
            // Risk analysis consistency
            expect(currentResult.risks.length).toBe(firstResult.risks.length);
            
            for (let j = 0; j < firstResult.risks.length; j++) {
              const firstRisk = firstResult.risks[j];
              const currentRisk = currentResult.risks[j];
              
              // Core risk properties should be identical
              expect(currentRisk.title).toBe(firstRisk.title);
              expect(currentRisk.description).toBe(firstRisk.description);
              expect(currentRisk.severity).toBe(firstRisk.severity);
              expect(currentRisk.category).toBe(firstRisk.category);
              expect(currentRisk.affectedClauses).toEqual(firstRisk.affectedClauses);
              expect(currentRisk.explanation).toBe(firstRisk.explanation);
              
              // Confidence and risk scores should be consistent
              expect(Math.abs(currentRisk.confidence - firstRisk.confidence)).toBeLessThan(0.01);
              expect(Math.abs(currentRisk.riskScore - firstRisk.riskScore)).toBeLessThan(0.01);
            }
            
            // Recommendations consistency
            expect(currentResult.recommendations.length).toBe(firstResult.recommendations.length);
            
            for (let j = 0; j < firstResult.recommendations.length; j++) {
              const firstRec = firstResult.recommendations[j];
              const currentRec = currentResult.recommendations[j];
              
              // Core recommendation properties should be identical
              expect(currentRec.title).toBe(firstRec.title);
              expect(currentRec.description).toBe(firstRec.description);
              expect(currentRec.priority).toBe(firstRec.priority);
              expect(currentRec.category).toBe(firstRec.category);
              expect(currentRec.actionRequired).toBe(firstRec.actionRequired);
            }
            
            // Summary consistency
            expect(currentResult.summary.totalClauses).toBe(firstResult.summary.totalClauses);
            expect(Math.abs(currentResult.summary.riskScore - firstResult.summary.riskScore)).toBeLessThan(0.01);
            expect(Math.abs(currentResult.summary.confidence - firstResult.summary.confidence)).toBeLessThan(0.01);
            
            // Metadata consistency (processing method should be the same)
            expect(currentResult.metadata.processingMethod).toBe(firstResult.metadata.processingMethod);
            expect(currentResult.metadata.modelUsed).toBe(firstResult.metadata.modelUsed);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18a: Analysis consistency with different confidence thresholds produces predictable variations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          contractText: fc.constant("PAYMENT TERMS: Payment due in 45 days. LIABILITY: Limited to contract value. CONFIDENTIALITY: 3-year confidentiality period."),
          thresholds: fc.array(
            fc.float({ min: Math.fround(0.1), max: Math.fround(0.9), noNaN: true }),
            { minLength: 2, maxLength: 4 }
          ).map(arr => arr.sort()) // Sort thresholds in ascending order
        }),
        async ({ contractText, thresholds }) => {
          modelManager.isLoaded = true;
          modelManager.inference = async (prompt) => {
            // Mock response with varying confidence levels
            if (prompt.includes('clause')) {
              return JSON.stringify({
                clauses: [
                  {
                    id: "clause_1",
                    text: "Payment due in 45 days.",
                    type: "payment_terms",
                    category: "Financial",
                    confidence: 0.8,
                    startPosition: 15,
                    endPosition: 40
                  },
                  {
                    id: "clause_2",
                    text: "Limited to contract value.",
                    type: "liability_limitation", 
                    category: "Risk Management",
                    confidence: 0.6,
                    startPosition: 55,
                    endPosition: 80
                  },
                  {
                    id: "clause_3",
                    text: "3-year confidentiality period.",
                    type: "confidentiality_agreement",
                    category: "Information Security", 
                    confidence: 0.4,
                    startPosition: 100,
                    endPosition: 130
                  }
                ]
              });
            }
            return JSON.stringify({ clauses: [], risks: [], recommendations: [] });
          };

          const results = [];
          
          // Run analysis with each threshold
          for (const threshold of thresholds) {
            const result = await contractAnalyzer.analyzeContract(contractText, {
              confidenceThreshold: threshold,
              enableClauseExtraction: true,
              enableRiskAnalysis: false,
              enableRecommendations: false
            });
            results.push({ threshold, result });
          }

          // Higher thresholds should result in fewer or equal clauses
          for (let i = 1; i < results.length; i++) {
            const prevResult = results[i - 1];
            const currentResult = results[i];
            
            expect(currentResult.result.clauses.length).toBeLessThanOrEqual(prevResult.result.clauses.length);
            
            // All clauses in higher threshold result should also be in lower threshold result
            for (const clause of currentResult.result.clauses) {
              const foundInPrev = prevResult.result.clauses.some(prevClause => 
                prevClause.text === clause.text && prevClause.type === clause.type
              );
              expect(foundInPrev).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18b: Analysis consistency handles model unavailability gracefully', async () => {
    // Test with model not loaded
    modelManager.isLoaded = false;
    
    const contractText = "Simple contract with payment terms and liability clauses.";
    
    // Should handle gracefully when model is not available
    const result1 = await contractAnalyzer.analyzeContract(contractText, {
      enableClauseExtraction: true,
      enableRiskAnalysis: true,
      enableRecommendations: true
    });
    
    const result2 = await contractAnalyzer.analyzeContract(contractText, {
      enableClauseExtraction: true,
      enableRiskAnalysis: true,
      enableRecommendations: true
    });
    
    // Results should be consistent even when using fallback methods
    expect(result1.metadata.processingMethod).toBe(result2.metadata.processingMethod);
    expect(result1.clauses.length).toBe(result2.clauses.length);
    expect(result1.risks.length).toBe(result2.risks.length);
    expect(result1.recommendations.length).toBe(result2.recommendations.length);
  });

  it('Property 18c: Analysis consistency with identical input produces identical clause IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 50, maxLength: 500 }),
        async (contractText) => {
          modelManager.isLoaded = true;
          modelManager.inference = async (prompt) => {
            // Generate consistent clause IDs based on content
            const hash = contractText.length % 3;
            return JSON.stringify({
              clauses: [
                {
                  id: `clause_${hash}_1`,
                  text: contractText.substring(0, Math.min(50, contractText.length)),
                  type: "general",
                  category: "General",
                  confidence: 0.7,
                  startPosition: 0,
                  endPosition: Math.min(50, contractText.length)
                }
              ]
            });
          };

          const result1 = await contractAnalyzer.analyzeContract(contractText);
          const result2 = await contractAnalyzer.analyzeContract(contractText);

          // Clause IDs should be identical for identical input
          expect(result1.clauses.length).toBe(result2.clauses.length);
          
          for (let i = 0; i < result1.clauses.length; i++) {
            expect(result1.clauses[i].id).toBe(result2.clauses[i].id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});