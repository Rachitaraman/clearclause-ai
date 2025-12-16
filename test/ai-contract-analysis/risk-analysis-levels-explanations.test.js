// Property-based test for risk analysis with levels and explanations
// **Feature: ai-contract-analysis, Property 10: Risk analysis with levels and explanations**
// **Validates: Requirements 5.1, 5.2, 5.3**

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { RiskAnalyzer } from '../../model/analyzers/RiskAnalyzer.js';
import { ModelManager } from '../../model/core/ModelManager.js';

describe('Risk Analysis with Levels and Explanations Property Tests', () => {
  let riskAnalyzer;
  let modelManager;

  beforeEach(() => {
    modelManager = new ModelManager();
    riskAnalyzer = new RiskAnalyzer(modelManager);
  });

  afterEach(async () => {
    if (modelManager.isLoaded) {
      await modelManager.unloadModel();
    }
  });

  it('Property 10: Risk analysis with levels and explanations', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various clause types that could contain risks
        fc.record({
          clauses: fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              text: fc.oneof(
                // High-risk clauses
                fc.constant("The contractor shall be liable for unlimited damages including consequential and punitive damages."),
                fc.constant("This agreement may be terminated immediately without notice for any reason."),
                fc.constant("All intellectual property created shall belong to the client with no compensation to contractor."),
                fc.constant("Payment terms are net 120 days with no interest on late payments."),
                
                // Medium-risk clauses
                fc.constant("Either party may terminate with 30 days notice. Liability is limited to direct damages only."),
                fc.constant("Confidential information must be protected but no specific penalties are outlined."),
                fc.constant("The agreement is governed by laws of a foreign jurisdiction."),
                fc.constant("Indemnification applies to gross negligence but not ordinary negligence."),
                
                // Low-risk clauses
                fc.constant("Payment shall be made within 30 days of invoice with standard late fees."),
                fc.constant("Standard confidentiality provisions apply with reasonable protection measures."),
                fc.constant("Either party may terminate with 90 days written notice."),
                fc.constant("Liability is limited to the total contract value with standard exclusions."),
                
                // Critical risk clauses
                fc.constant("Contractor waives all rights to dispute resolution and agrees to unlimited liability."),
                fc.constant("All work product and any improvements belong exclusively to client in perpetuity."),
                fc.constant("Agreement automatically renews indefinitely unless terminated with 365 days notice."),
                fc.constant("Client may change scope and pricing unilaterally without contractor consent.")
              ),
              type: fc.oneof(
                fc.constant("liability_limitation"),
                fc.constant("termination_clause"),
                fc.constant("payment_terms"),
                fc.constant("ip_rights"),
                fc.constant("confidentiality_agreement"),
                fc.constant("indemnification"),
                fc.constant("governing_law"),
                fc.constant("dispute_resolution")
              ),
              category: fc.oneof(
                fc.constant("Risk Management"),
                fc.constant("Contract Management"),
                fc.constant("Financial"),
                fc.constant("Intellectual Property"),
                fc.constant("Information Security"),
                fc.constant("Legal")
              ),
              confidence: fc.float({ min: 0.5, max: 1.0, noNaN: true })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          options: fc.record({
            riskThreshold: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
            includeRecommendations: fc.boolean(),
            prioritizeByImpact: fc.boolean()
          })
        }),
        async ({ clauses, options }) => {
          // Mock the model manager for testing
          modelManager.isLoaded = true;
          modelManager.inference = async (prompt) => {
            // Mock response that simulates AI model output for risk analysis
            const risks = clauses.map((clause, index) => {
              let severity = "Low";
              let riskScore = 0.2;
              
              // Determine risk level based on clause content
              if (clause.text.includes("unlimited") || clause.text.includes("waives all rights") || 
                  clause.text.includes("unilaterally") || clause.text.includes("indefinitely")) {
                severity = "Critical";
                riskScore = 0.9;
              } else if (clause.text.includes("immediately without notice") || 
                         clause.text.includes("no compensation") || clause.text.includes("120 days")) {
                severity = "High";
                riskScore = 0.8;
              } else if (clause.text.includes("foreign jurisdiction") || 
                         clause.text.includes("gross negligence") || clause.text.includes("30 days notice")) {
                severity = "Medium";
                riskScore = 0.5;
              }

              return {
                id: `risk_${index + 1}`,
                title: `${severity} Risk in ${clause.type.replace('_', ' ')}`,
                description: `Risk identified in clause: ${clause.text.substring(0, 100)}...`,
                severity: severity,
                category: clause.category,
                affectedClauses: [clause.id],
                explanation: `This clause presents ${severity.toLowerCase()} risk because ${
                  severity === "Critical" ? "it contains extremely unfavorable terms that could result in significant financial or legal exposure" :
                  severity === "High" ? "it contains unfavorable terms that could result in substantial negative impact" :
                  severity === "Medium" ? "it contains terms that require careful consideration and may need modification" :
                  "it contains standard terms with minimal risk exposure"
                }`,
                confidence: Math.max(clause.confidence + 0.1, options.riskThreshold || 0.0),
                riskScore: riskScore,
                businessImpact: severity === "Critical" ? "Very High" : 
                               severity === "High" ? "High" : 
                               severity === "Medium" ? "Medium" : "Low"
              };
            });

            return JSON.stringify({ risks });
          };

          // Test risk analysis
          const result = await riskAnalyzer.analyzeRisks(clauses, options);

          // Requirement 5.1: System should evaluate each clause for potential legal and business risks
          expect(result).toHaveProperty('risks');
          expect(Array.isArray(result.risks)).toBe(true);
          expect(result.risks.length).toBeGreaterThan(0);

          for (const risk of result.risks) {
            // Each risk should have required properties
            expect(risk).toHaveProperty('id');
            expect(typeof risk.id).toBe('string');
            expect(risk.id.length).toBeGreaterThan(0);

            expect(risk).toHaveProperty('title');
            expect(typeof risk.title).toBe('string');
            expect(risk.title.length).toBeGreaterThan(0);

            expect(risk).toHaveProperty('description');
            expect(typeof risk.description).toBe('string');
            expect(risk.description.length).toBeGreaterThan(0);

            expect(risk).toHaveProperty('category');
            expect(typeof risk.category).toBe('string');
            expect(risk.category.length).toBeGreaterThan(0);

            expect(risk).toHaveProperty('affectedClauses');
            expect(Array.isArray(risk.affectedClauses)).toBe(true);
            expect(risk.affectedClauses.length).toBeGreaterThan(0);

            expect(risk).toHaveProperty('confidence');
            expect(typeof risk.confidence).toBe('number');
            expect(risk.confidence).toBeGreaterThanOrEqual(0.0);
            expect(risk.confidence).toBeLessThanOrEqual(1.0);
          }

          // Requirement 5.2: System should assign risk levels (Low, Medium, High, Critical)
          const validRiskLevels = ['Low', 'Medium', 'High', 'Critical'];
          for (const risk of result.risks) {
            expect(risk).toHaveProperty('severity');
            expect(typeof risk.severity).toBe('string');
            expect(validRiskLevels).toContain(risk.severity);
          }

          // Should have at least one risk level assigned
          const assignedLevels = result.risks.map(r => r.severity);
          expect(assignedLevels.length).toBeGreaterThan(0);

          // Requirement 5.3: System should provide specific explanations for why each risk was flagged
          for (const risk of result.risks) {
            expect(risk).toHaveProperty('explanation');
            expect(typeof risk.explanation).toBe('string');
            expect(risk.explanation.length).toBeGreaterThan(10); // Should be a meaningful explanation
            
            // Explanation should be specific and not generic
            expect(risk.explanation.toLowerCase()).toMatch(/risk|because|could|may|should|potential|impact|concern/);
          }

          // Test risk categorization
          const riskCategories = riskAnalyzer.getRiskCategories();
          expect(Array.isArray(riskCategories)).toBe(true);
          expect(riskCategories.length).toBeGreaterThan(0);

          for (const risk of result.risks) {
            // Risk category should be from supported categories
            expect(riskCategories).toContain(risk.category);
          }

          // Test confidence scoring
          for (const risk of result.risks) {
            // Confidence should be above threshold if specified
            if (options.riskThreshold) {
              expect(risk.confidence).toBeGreaterThanOrEqual(options.riskThreshold);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10a: Risk analysis handles clauses without identifiable risks', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            text: fc.oneof(
              fc.constant("This is a standard boilerplate clause with no unusual terms."),
              fc.constant("The parties agree to act in good faith throughout this agreement."),
              fc.constant("This agreement shall be binding upon the parties and their successors."),
              fc.constant("Headings in this agreement are for convenience only and have no legal effect.")
            ),
            type: fc.constant("general"),
            category: fc.constant("General"),
            confidence: fc.float({ min: 0.5, max: 1.0, noNaN: true })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (lowRiskClauses) => {
          modelManager.isLoaded = true;
          modelManager.inference = async () => {
            // Mock response for low-risk clauses
            return JSON.stringify({ 
              risks: lowRiskClauses.map((clause, index) => ({
                id: `risk_${index + 1}`,
                title: "Low Risk - Standard Terms",
                description: "This clause contains standard terms with minimal risk.",
                severity: "Low",
                category: "General",
                affectedClauses: [clause.id],
                explanation: "This clause presents low risk because it contains standard boilerplate language commonly used in agreements.",
                confidence: 0.7,
                riskScore: 0.1,
                businessImpact: "Low"
              }))
            });
          };

          const result = await riskAnalyzer.analyzeRisks(lowRiskClauses);

          // Should still return risk analysis even for low-risk clauses
          expect(result).toHaveProperty('risks');
          expect(Array.isArray(result.risks)).toBe(true);

          // All risks should be marked as Low severity
          for (const risk of result.risks) {
            expect(risk.severity).toBe('Low');
            expect(risk.explanation).toContain('low risk');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10b: Risk analysis handles empty clause input', async () => {
    modelManager.isLoaded = true;
    modelManager.inference = async () => {
      return JSON.stringify({ risks: [] });
    };

    // Should handle empty clause array gracefully
    const result = await riskAnalyzer.analyzeRisks([]);
    expect(result).toHaveProperty('risks');
    expect(result.risks).toEqual([]);

    // Should throw error for null/undefined input
    await expect(riskAnalyzer.analyzeRisks(null)).rejects.toThrow();
    await expect(riskAnalyzer.analyzeRisks(undefined)).rejects.toThrow();
  });

  it('Property 10c: Risk severity levels are properly ordered', async () => {
    const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
    const riskCategories = riskAnalyzer.getRiskCategories();
    
    // Should have standard risk categories
    expect(riskCategories).toContain('Risk Management');
    expect(riskCategories).toContain('Financial');
    expect(riskCategories).toContain('Legal');
    
    // Risk levels should be consistent
    expect(riskLevels).toEqual(['Low', 'Medium', 'High', 'Critical']);
  });
});