// Property-based test for risk mitigation recommendations
// **Feature: ai-contract-analysis, Property 11: Risk mitigation recommendations**
// **Validates: Requirements 5.4, 5.5**

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { RiskAnalyzer } from '../../model/analyzers/RiskAnalyzer.js';
import { ModelManager } from '../../model/core/ModelManager.js';

describe('Risk Mitigation Recommendations Property Tests', () => {
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

  it('Property 11: Risk mitigation recommendations', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various risk scenarios
        fc.record({
          risks: fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              title: fc.oneof(
                fc.constant("Unlimited Liability Exposure"),
                fc.constant("Immediate Termination Without Cause"),
                fc.constant("Intellectual Property Assignment Risk"),
                fc.constant("Extended Payment Terms Risk"),
                fc.constant("Confidentiality Breach Risk"),
                fc.constant("Indemnification Scope Risk"),
                fc.constant("Governing Law Jurisdiction Risk"),
                fc.constant("Force Majeure Exclusion Risk")
              ),
              description: fc.string({ minLength: 20, maxLength: 200 }),
              severity: fc.oneof(
                fc.constant("Critical"),
                fc.constant("High"), 
                fc.constant("Medium"),
                fc.constant("Low")
              ),
              category: fc.oneof(
                fc.constant("Risk Management"),
                fc.constant("Financial"),
                fc.constant("Legal"),
                fc.constant("Intellectual Property"),
                fc.constant("Information Security"),
                fc.constant("Contract Management")
              ),
              affectedClauses: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
              explanation: fc.string({ minLength: 50, maxLength: 300 }),
              confidence: fc.float({ min: 0.5, max: 1.0, noNaN: true }),
              riskScore: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
              businessImpact: fc.oneof(
                fc.constant("Very High"),
                fc.constant("High"),
                fc.constant("Medium"),
                fc.constant("Low")
              )
            }),
            { minLength: 1, maxLength: 8 }
          ),
          options: fc.record({
            includePrioritization: fc.boolean(),
            includeActionItems: fc.boolean(),
            riskTolerance: fc.oneof(
              fc.constant("conservative"),
              fc.constant("moderate"),
              fc.constant("aggressive")
            )
          })
        }),
        async ({ risks, options }) => {
          // Mock the model manager for testing
          modelManager.isLoaded = true;
          modelManager.inference = async (prompt) => {
            // Mock response that simulates AI model output for mitigation recommendations
            const recommendations = risks.map((risk, index) => {
              let mitigation = "";
              let actionRequired = false;
              let priority = "Medium";

              // Generate mitigation based on risk type and severity
              if (risk.title.includes("Unlimited Liability")) {
                mitigation = "Negotiate liability cap equal to contract value or annual fees. Add mutual liability limitations and exclude consequential damages.";
                actionRequired = true;
                priority = "High";
              } else if (risk.title.includes("Immediate Termination")) {
                mitigation = "Require minimum notice period (30-90 days) and limit termination for cause to material breaches with cure periods.";
                actionRequired = true;
                priority = risk.severity === "Critical" ? "High" : "Medium";
              } else if (risk.title.includes("Intellectual Property")) {
                mitigation = "Clarify IP ownership, retain rights to pre-existing IP, and negotiate fair compensation for work product.";
                actionRequired = true;
                priority = "High";
              } else if (risk.title.includes("Payment Terms")) {
                mitigation = "Negotiate shorter payment terms (net 30), add late payment interest, and include right to suspend services for non-payment.";
                actionRequired = risk.severity !== "Low" || risk.businessImpact === "Very High";
                priority = "Medium";
              } else if (risk.title.includes("Confidentiality")) {
                mitigation = "Define confidential information clearly, add reasonable exceptions, and include return/destruction obligations.";
                actionRequired = risk.severity === "High" || risk.severity === "Critical" || risk.businessImpact === "Very High";
                priority = "Medium";
              } else {
                mitigation = "Review clause terms and negotiate more balanced language that protects both parties' interests.";
                actionRequired = risk.severity === "High" || risk.severity === "Critical" || risk.businessImpact === "Very High";
                priority = risk.severity === "Critical" ? "High" : "Medium";
              }

              return {
                id: `recommendation_${index + 1}`,
                riskId: risk.id,
                title: `Mitigate ${risk.title}`,
                description: mitigation,
                priority: priority,
                category: risk.category,
                actionRequired: actionRequired,
                estimatedEffort: priority === "High" ? "Significant negotiation required" : 
                                priority === "Medium" ? "Moderate discussion needed" : "Minor clarification needed",
                timeline: priority === "High" ? "Before contract execution" : 
                         priority === "Medium" ? "During contract review" : "Nice to have",
                riskReduction: risk.severity === "Critical" ? 0.8 : 
                              risk.severity === "High" ? 0.7 : 
                              risk.severity === "Medium" ? 0.5 : 0.3
              };
            });

            return JSON.stringify({ recommendations });
          };

          // Test mitigation recommendation generation
          const result = await riskAnalyzer.generateMitigationStrategies(risks, options);

          // Requirement 5.4: System should generate actionable recommendations for risk mitigation
          expect(result).toHaveProperty('recommendations');
          expect(Array.isArray(result.recommendations)).toBe(true);
          expect(result.recommendations.length).toBeGreaterThan(0);

          for (const recommendation of result.recommendations) {
            // Each recommendation should have required properties
            expect(recommendation).toHaveProperty('id');
            expect(typeof recommendation.id).toBe('string');
            expect(recommendation.id.length).toBeGreaterThan(0);

            expect(recommendation).toHaveProperty('riskId');
            expect(typeof recommendation.riskId).toBe('string');
            expect(recommendation.riskId.length).toBeGreaterThan(0);

            expect(recommendation).toHaveProperty('title');
            expect(typeof recommendation.title).toBe('string');
            expect(recommendation.title.length).toBeGreaterThan(0);

            expect(recommendation).toHaveProperty('description');
            expect(typeof recommendation.description).toBe('string');
            expect(recommendation.description.length).toBeGreaterThan(10); // Should be actionable

            expect(recommendation).toHaveProperty('priority');
            expect(typeof recommendation.priority).toBe('string');
            expect(['Low', 'Medium', 'High']).toContain(recommendation.priority);

            expect(recommendation).toHaveProperty('category');
            expect(typeof recommendation.category).toBe('string');
            expect(recommendation.category.length).toBeGreaterThan(0);

            expect(recommendation).toHaveProperty('actionRequired');
            expect(typeof recommendation.actionRequired).toBe('boolean');

            // Recommendations should be actionable and specific
            expect(recommendation.description.toLowerCase()).toMatch(/negotiate|add|require|clarify|review|include|exclude|limit|define/);
          }

          // Each risk should have at least one recommendation
          const riskIds = risks.map(r => r.id);
          const recommendationRiskIds = result.recommendations.map(r => r.riskId);
          for (const riskId of riskIds) {
            expect(recommendationRiskIds).toContain(riskId);
          }

          // Requirement 5.5: System should prioritize risks by severity and business impact
          if (options.includePrioritization) {
            const prioritizedResult = await riskAnalyzer.prioritizeRisks(risks);
            expect(prioritizedResult).toHaveProperty('prioritized');
            expect(Array.isArray(prioritizedResult.prioritized)).toBe(true);

            // Should be sorted by priority score (highest first)
            for (let i = 0; i < prioritizedResult.prioritized.length - 1; i++) {
              expect(prioritizedResult.prioritized[i].priorityScore).toBeGreaterThanOrEqual(
                prioritizedResult.prioritized[i + 1].priorityScore
              );
            }

            // Each prioritized risk should have priority scoring
            for (const risk of prioritizedResult.prioritized) {
              expect(risk).toHaveProperty('priorityScore');
              expect(typeof risk.priorityScore).toBe('number');
              expect(risk.priorityScore).toBeGreaterThanOrEqual(0);
              expect(risk.priorityScore).toBeLessThanOrEqual(1);

              // Higher severity should generally have higher priority scores
              if (risk.severity === 'Critical') {
                expect(risk.priorityScore).toBeGreaterThan(0.5); // Critical risks should have decent priority
              } else if (risk.severity === 'High') {
                expect(risk.priorityScore).toBeGreaterThan(0.4); // High risks should be above medium baseline
              }
            }
          }

          // Test business impact consideration
          for (const recommendation of result.recommendations) {
            // High business impact risks should have high priority recommendations
            const correspondingRisk = risks.find(r => r.id === recommendation.riskId);
            if (correspondingRisk && correspondingRisk.businessImpact === 'Very High') {
              expect(recommendation.priority).toMatch(/High|Medium/);
              expect(recommendation.actionRequired).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11a: Mitigation recommendations are specific to risk types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          riskType: fc.oneof(
            fc.constant("liability"),
            fc.constant("termination"),
            fc.constant("payment"),
            fc.constant("intellectual_property"),
            fc.constant("confidentiality")
          ),
          severity: fc.oneof(
            fc.constant("Critical"),
            fc.constant("High"),
            fc.constant("Medium"),
            fc.constant("Low")
          )
        }),
        async ({ riskType, severity }) => {
          const mockRisk = {
            id: "test_risk_1",
            title: `${riskType} risk`,
            description: `Test ${riskType} risk`,
            severity: severity,
            category: "Test",
            affectedClauses: ["clause_1"],
            explanation: "Test explanation",
            confidence: 0.8,
            riskScore: 0.6,
            businessImpact: "High"
          };

          modelManager.isLoaded = true;
          modelManager.inference = async () => {
            let mitigation = "";
            switch (riskType) {
              case "liability":
                mitigation = "Add liability caps and mutual limitations";
                break;
              case "termination":
                mitigation = "Require notice periods and limit termination causes";
                break;
              case "payment":
                mitigation = "Negotiate shorter payment terms and add interest";
                break;
              case "intellectual_property":
                mitigation = "Clarify intellectual property ownership and retain pre-existing rights";
                break;
              case "confidentiality":
                mitigation = "Define confidentiality requirements and add reasonable exceptions";
                break;
            }

            return JSON.stringify({
              recommendations: [{
                id: "rec_1",
                riskId: mockRisk.id,
                title: `Mitigate ${riskType} risk`,
                description: mitigation,
                priority: severity === "Critical" ? "High" : "Medium",
                category: "Test",
                actionRequired: severity !== "Low",
                riskReduction: 0.7
              }]
            });
          };

          const result = await riskAnalyzer.generateMitigationStrategies([mockRisk]);
          
          expect(result.recommendations.length).toBe(1);
          const recommendation = result.recommendations[0];
          
          // Recommendation should be specific to the risk type
          expect(recommendation.description.toLowerCase()).toContain(riskType.replace('_', ' '));
          
          // Critical risks should have high priority recommendations
          if (severity === "Critical") {
            expect(recommendation.priority).toBe("High");
            expect(recommendation.actionRequired).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11b: Risk prioritization considers multiple factors', async () => {
    const testRisks = [
      {
        id: "risk_1",
        title: "Critical Liability Risk",
        severity: "Critical",
        businessImpact: "Very High",
        riskScore: 0.9,
        confidence: 0.8
      },
      {
        id: "risk_2", 
        title: "High Payment Risk",
        severity: "High",
        businessImpact: "High",
        riskScore: 0.7,
        confidence: 0.9
      },
      {
        id: "risk_3",
        title: "Medium Confidentiality Risk", 
        severity: "Medium",
        businessImpact: "Medium",
        riskScore: 0.5,
        confidence: 0.7
      },
      {
        id: "risk_4",
        title: "Low General Risk",
        severity: "Low", 
        businessImpact: "Low",
        riskScore: 0.2,
        confidence: 0.6
      }
    ];

    modelManager.isLoaded = true;
    modelManager.inference = async () => {
      return JSON.stringify({
        prioritized: testRisks.map(risk => {
          const severityWeight = risk.severity === 'Critical' ? 1.0 : 
                               risk.severity === 'High' ? 0.8 : 
                               risk.severity === 'Medium' ? 0.6 : 0.4;
          const impactWeight = risk.businessImpact === 'Very High' ? 1.0 :
                             risk.businessImpact === 'High' ? 0.8 :
                             risk.businessImpact === 'Medium' ? 0.6 : 0.4;
          const priorityScore = severityWeight * 0.6 + impactWeight * 0.4;
          return {
            ...risk,
            priorityScore: risk.severity === 'Critical' ? Math.max(0.8, priorityScore) : 
                          risk.severity === 'High' ? Math.max(0.6, priorityScore) : priorityScore
          };
        }).sort((a, b) => b.priorityScore - a.priorityScore)
      });
    };

    const result = await riskAnalyzer.prioritizeRisks(testRisks);
    
    expect(result.prioritized.length).toBe(4);
    
    // Should be ordered by priority score (highest first)
    for (let i = 0; i < result.prioritized.length - 1; i++) {
      expect(result.prioritized[i].priorityScore).toBeGreaterThanOrEqual(
        result.prioritized[i + 1].priorityScore
      );
    }
    
    // Critical risk should be first
    expect(result.prioritized[0].severity).toBe("Critical");
    expect(result.prioritized[0].id).toBe("risk_1");
  });

  it('Property 11c: Empty risk input handling', async () => {
    modelManager.isLoaded = true;
    modelManager.inference = async () => {
      return JSON.stringify({ recommendations: [] });
    };

    // Should handle empty risk array gracefully
    const result = await riskAnalyzer.generateMitigationStrategies([]);
    expect(result).toHaveProperty('recommendations');
    expect(result.recommendations).toEqual([]);

    // Should throw error for null/undefined input
    await expect(riskAnalyzer.generateMitigationStrategies(null)).rejects.toThrow();
    await expect(riskAnalyzer.generateMitigationStrategies(undefined)).rejects.toThrow();
  });
});