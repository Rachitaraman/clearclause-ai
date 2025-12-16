// Property-based test for schema validation completeness
// **Feature: ai-contract-analysis, Property 20: Schema validation completeness**
// **Validates: Requirements 9.5**

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { ContractAnalyzer } from '../../model/analyzers/ContractAnalyzer.js';
import { ModelManager } from '../../model/core/ModelManager.js';

describe('Schema Validation Completeness Property Tests', () => {
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

  it('Property 20: Schema validation completeness - all required fields are present and properly formatted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          contractText: fc.oneof(
            fc.constant("PAYMENT TERMS: Payment due in 30 days. LIABILITY: Limited to contract value."),
            fc.constant("CONFIDENTIALITY: Information must remain confidential. TERMINATION: 60 days notice required."),
            fc.constant("INTELLECTUAL PROPERTY: All work belongs to client. GOVERNING LAW: California law applies.")
          ),
          analysisOptions: fc.record({
            enableClauseExtraction: fc.boolean(),
            enableRiskAnalysis: fc.boolean(),
            enableRecommendations: fc.boolean(),
            confidenceThreshold: fc.float({ min: Math.fround(0.0), max: Math.fround(1.0), noNaN: true })
          })
        }),
        async ({ contractText, analysisOptions }) => {
          // Mock the model manager to provide valid responses
          modelManager.isLoaded = true;
          modelManager.inference = async (prompt, options) => {
            if (prompt.includes('clause')) {
              return JSON.stringify({
                clauses: [
                  {
                    id: "clause_1",
                    text: contractText.substring(0, Math.min(50, contractText.length)),
                    type: "general",
                    category: "General",
                    confidence: 0.8,
                    startPosition: 0,
                    endPosition: Math.min(50, contractText.length)
                  }
                ]
              });
            } else if (prompt.includes('risk')) {
              return JSON.stringify({
                risks: [
                  {
                    id: "risk_1",
                    title: "Standard Risk",
                    description: "Standard contractual risk",
                    severity: "Medium",
                    category: "General",
                    affectedClauses: ["clause_1"],
                    explanation: "This is a standard risk",
                    confidence: 0.7,
                    riskScore: 0.5,
                    businessImpact: "Medium"
                  }
                ]
              });
            } else if (prompt.includes('recommendation')) {
              return JSON.stringify({
                recommendations: [
                  {
                    id: "rec_1",
                    title: "Standard Recommendation",
                    description: "Standard recommendation",
                    priority: "Medium",
                    category: "General",
                    actionRequired: true,
                    estimatedEffort: "Moderate",
                    timeline: "Within 30 days",
                    riskReduction: 0.3
                  }
                ]
              });
            }
            
            return JSON.stringify({ clauses: [], risks: [], recommendations: [] });
          };

          const result = await contractAnalyzer.analyzeContract(contractText, analysisOptions);

          // Requirement 9.5: All required fields should be present and properly formatted according to the defined schema

          // Validate top-level structure
          expect(result).toHaveProperty('summary');
          expect(result).toHaveProperty('clauses');
          expect(result).toHaveProperty('risks');
          expect(result).toHaveProperty('recommendations');
          expect(result).toHaveProperty('metadata');

          expect(typeof result).toBe('object');
          expect(result).not.toBeNull();

          // Validate summary schema completeness
          const summary = result.summary;
          expect(summary).toHaveProperty('title');
          expect(summary).toHaveProperty('documentType');
          expect(summary).toHaveProperty('totalClauses');
          expect(summary).toHaveProperty('riskScore');
          expect(summary).toHaveProperty('processingTime');
          expect(summary).toHaveProperty('confidence');

          // Validate summary field types
          expect(typeof summary.title).toBe('string');
          expect(summary.title.length).toBeGreaterThan(0);
          
          expect(typeof summary.documentType).toBe('string');
          expect(summary.documentType.length).toBeGreaterThan(0);
          
          expect(typeof summary.totalClauses).toBe('number');
          expect(Number.isInteger(summary.totalClauses)).toBe(true);
          expect(summary.totalClauses).toBeGreaterThanOrEqual(0);
          
          expect(typeof summary.riskScore).toBe('number');
          expect(summary.riskScore).toBeGreaterThanOrEqual(0);
          expect(summary.riskScore).toBeLessThanOrEqual(1);
          expect(Number.isFinite(summary.riskScore)).toBe(true);
          
          expect(typeof summary.processingTime).toBe('number');
          expect(summary.processingTime).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(summary.processingTime)).toBe(true);
          
          expect(typeof summary.confidence).toBe('number');
          expect(summary.confidence).toBeGreaterThanOrEqual(0);
          expect(summary.confidence).toBeLessThanOrEqual(1);
          expect(Number.isFinite(summary.confidence)).toBe(true);

          // Validate clauses schema completeness
          expect(Array.isArray(result.clauses)).toBe(true);
          
          result.clauses.forEach((clause, index) => {
            // Required fields
            expect(clause).toHaveProperty('id');
            expect(clause).toHaveProperty('text');
            expect(clause).toHaveProperty('type');
            expect(clause).toHaveProperty('category');
            expect(clause).toHaveProperty('confidence');
            expect(clause).toHaveProperty('startPosition');
            expect(clause).toHaveProperty('endPosition');

            // Field type validation
            expect(typeof clause.id).toBe('string');
            expect(clause.id.length).toBeGreaterThan(0);
            
            expect(typeof clause.text).toBe('string');
            expect(clause.text.length).toBeGreaterThan(0);
            
            expect(typeof clause.type).toBe('string');
            expect(clause.type.length).toBeGreaterThan(0);
            
            expect(typeof clause.category).toBe('string');
            expect(clause.category.length).toBeGreaterThan(0);
            
            expect(typeof clause.confidence).toBe('number');
            expect(clause.confidence).toBeGreaterThanOrEqual(0);
            expect(clause.confidence).toBeLessThanOrEqual(1);
            expect(Number.isFinite(clause.confidence)).toBe(true);
            
            expect(typeof clause.startPosition).toBe('number');
            expect(Number.isInteger(clause.startPosition)).toBe(true);
            expect(clause.startPosition).toBeGreaterThanOrEqual(0);
            
            expect(typeof clause.endPosition).toBe('number');
            expect(Number.isInteger(clause.endPosition)).toBe(true);
            expect(clause.endPosition).toBeGreaterThanOrEqual(clause.startPosition);
          });

          // Validate risks schema completeness
          expect(Array.isArray(result.risks)).toBe(true);
          
          result.risks.forEach((risk, index) => {
            // Required fields
            expect(risk).toHaveProperty('id');
            expect(risk).toHaveProperty('title');
            expect(risk).toHaveProperty('description');
            expect(risk).toHaveProperty('severity');
            expect(risk).toHaveProperty('category');
            expect(risk).toHaveProperty('affectedClauses');

            // Field type validation
            expect(typeof risk.id).toBe('string');
            expect(risk.id.length).toBeGreaterThan(0);
            
            expect(typeof risk.title).toBe('string');
            expect(risk.title.length).toBeGreaterThan(0);
            
            expect(typeof risk.description).toBe('string');
            expect(risk.description.length).toBeGreaterThan(0);
            
            expect(typeof risk.severity).toBe('string');
            expect(['Low', 'Medium', 'High', 'Critical']).toContain(risk.severity);
            
            expect(typeof risk.category).toBe('string');
            expect(risk.category.length).toBeGreaterThan(0);
            
            expect(Array.isArray(risk.affectedClauses)).toBe(true);
            risk.affectedClauses.forEach(clauseId => {
              expect(typeof clauseId).toBe('string');
              expect(clauseId.length).toBeGreaterThan(0);
            });

            // Optional fields with type validation if present
            if (risk.hasOwnProperty('mitigation')) {
              expect(typeof risk.mitigation).toBe('string');
            }
            
            if (risk.hasOwnProperty('confidence')) {
              expect(typeof risk.confidence).toBe('number');
              expect(risk.confidence).toBeGreaterThanOrEqual(0);
              expect(risk.confidence).toBeLessThanOrEqual(1);
              expect(Number.isFinite(risk.confidence)).toBe(true);
            }
          });

          // Validate recommendations schema completeness
          expect(Array.isArray(result.recommendations)).toBe(true);
          
          result.recommendations.forEach((rec, index) => {
            // Required fields
            expect(rec).toHaveProperty('id');
            expect(rec).toHaveProperty('title');
            expect(rec).toHaveProperty('description');
            expect(rec).toHaveProperty('priority');
            expect(rec).toHaveProperty('category');
            expect(rec).toHaveProperty('actionRequired');

            // Field type validation
            expect(typeof rec.id).toBe('string');
            expect(rec.id.length).toBeGreaterThan(0);
            
            expect(typeof rec.title).toBe('string');
            expect(rec.title.length).toBeGreaterThan(0);
            
            expect(typeof rec.description).toBe('string');
            expect(rec.description.length).toBeGreaterThan(0);
            
            expect(typeof rec.priority).toBe('string');
            expect(['Low', 'Medium', 'High']).toContain(rec.priority);
            
            expect(typeof rec.category).toBe('string');
            expect(rec.category.length).toBeGreaterThan(0);
            
            expect(typeof rec.actionRequired).toBe('boolean');
          });

          // Validate metadata schema completeness
          const metadata = result.metadata;
          expect(metadata).toHaveProperty('processingMethod');
          expect(metadata).toHaveProperty('modelUsed');
          expect(metadata).toHaveProperty('processingTime');
          expect(metadata).toHaveProperty('tokenUsage');
          expect(metadata).toHaveProperty('confidence');

          // Metadata field type validation
          expect(typeof metadata.processingMethod).toBe('string');
          expect(['ai_model', 'api_fallback']).toContain(metadata.processingMethod);
          
          expect(typeof metadata.modelUsed).toBe('string');
          expect(metadata.modelUsed.length).toBeGreaterThan(0);
          
          expect(typeof metadata.processingTime).toBe('number');
          expect(metadata.processingTime).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(metadata.processingTime)).toBe(true);
          
          expect(typeof metadata.tokenUsage).toBe('number');
          expect(metadata.tokenUsage).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(metadata.tokenUsage)).toBe(true);
          
          expect(typeof metadata.confidence).toBe('number');
          expect(metadata.confidence).toBeGreaterThanOrEqual(0);
          expect(metadata.confidence).toBeLessThanOrEqual(1);
          expect(Number.isFinite(metadata.confidence)).toBe(true);

          // Cross-field validation
          expect(result.summary.totalClauses).toBe(result.clauses.length);
          
          // Ensure all risk affectedClauses reference valid clause IDs
          const clauseIds = new Set(result.clauses.map(c => c.id));
          result.risks.forEach(risk => {
            risk.affectedClauses.forEach(clauseId => {
              // Either the clause exists or it's a valid placeholder
              if (clauseIds.size > 0) {
                // If we have clauses, affected clauses should reference them or be empty
                expect(clauseIds.has(clauseId) || risk.affectedClauses.length === 0).toBe(true);
              }
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20a: Schema validation handles missing optional fields gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          contractText: fc.constant("Simple contract for optional field testing."),
          missingFields: fc.oneof(
            fc.constant("risk_mitigation"),
            fc.constant("risk_confidence"),
            fc.constant("recommendation_optional_fields"),
            fc.constant("clause_optional_fields")
          )
        }),
        async ({ contractText, missingFields }) => {
          modelManager.isLoaded = true;
          modelManager.inference = async (prompt, options) => {
            if (prompt.includes('clause')) {
              const clause = {
                id: "clause_1",
                text: "Test clause",
                type: "general",
                category: "General",
                confidence: 0.8,
                startPosition: 0,
                endPosition: 10
              };
              
              // Optionally remove some fields based on test scenario
              if (missingFields === "clause_optional_fields") {
                // All fields are required for clauses, so we keep them all
              }
              
              return JSON.stringify({ clauses: [clause] });
            } else if (prompt.includes('risk')) {
              const risk = {
                id: "risk_1",
                title: "Test Risk",
                description: "Test description",
                severity: "Medium",
                category: "General",
                affectedClauses: ["clause_1"],
                explanation: "Test explanation"
              };
              
              // Conditionally include optional fields
              if (missingFields !== "risk_mitigation") {
                risk.mitigation = "Test mitigation";
              }
              if (missingFields !== "risk_confidence") {
                risk.confidence = 0.7;
                risk.riskScore = 0.5;
                risk.businessImpact = "Medium";
              }
              
              return JSON.stringify({ risks: [risk] });
            } else if (prompt.includes('recommendation')) {
              const rec = {
                id: "rec_1",
                title: "Test Recommendation",
                description: "Test description",
                priority: "Medium",
                category: "General",
                actionRequired: true
              };
              
              // Conditionally include optional fields
              if (missingFields !== "recommendation_optional_fields") {
                rec.estimatedEffort = "Moderate";
                rec.timeline = "30 days";
                rec.riskReduction = 0.3;
              }
              
              return JSON.stringify({ recommendations: [rec] });
            }
            
            return JSON.stringify({ clauses: [], risks: [], recommendations: [] });
          };

          const result = await contractAnalyzer.analyzeContract(contractText);

          // Schema should still be valid even with missing optional fields
          expect(result).toHaveProperty('summary');
          expect(result).toHaveProperty('clauses');
          expect(result).toHaveProperty('risks');
          expect(result).toHaveProperty('recommendations');
          expect(result).toHaveProperty('metadata');

          // Required fields should always be present
          result.clauses.forEach(clause => {
            expect(clause).toHaveProperty('id');
            expect(clause).toHaveProperty('text');
            expect(clause).toHaveProperty('type');
            expect(clause).toHaveProperty('category');
            expect(clause).toHaveProperty('confidence');
            expect(clause).toHaveProperty('startPosition');
            expect(clause).toHaveProperty('endPosition');
          });

          result.risks.forEach(risk => {
            expect(risk).toHaveProperty('id');
            expect(risk).toHaveProperty('title');
            expect(risk).toHaveProperty('description');
            expect(risk).toHaveProperty('severity');
            expect(risk).toHaveProperty('category');
            expect(risk).toHaveProperty('affectedClauses');
            
            // Optional fields may or may not be present
            if (risk.hasOwnProperty('confidence')) {
              expect(typeof risk.confidence).toBe('number');
            }
            if (risk.hasOwnProperty('mitigation')) {
              expect(typeof risk.mitigation).toBe('string');
            }
          });

          result.recommendations.forEach(rec => {
            expect(rec).toHaveProperty('id');
            expect(rec).toHaveProperty('title');
            expect(rec).toHaveProperty('description');
            expect(rec).toHaveProperty('priority');
            expect(rec).toHaveProperty('category');
            expect(rec).toHaveProperty('actionRequired');
            
            // Optional fields may or may not be present
            if (rec.hasOwnProperty('estimatedEffort')) {
              expect(typeof rec.estimatedEffort).toBe('string');
            }
            if (rec.hasOwnProperty('timeline')) {
              expect(typeof rec.timeline).toBe('string');
            }
            if (rec.hasOwnProperty('riskReduction')) {
              expect(typeof rec.riskReduction).toBe('number');
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20b: Schema validation enforces field constraints and ranges', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          contractText: fc.constant("Contract for constraint validation testing."),
          constraintType: fc.oneof(
            fc.constant("confidence_bounds"),
            fc.constant("position_ordering"),
            fc.constant("enum_values"),
            fc.constant("array_types"),
            fc.constant("numeric_types")
          )
        }),
        async ({ contractText, constraintType }) => {
          modelManager.isLoaded = true;
          modelManager.inference = async (prompt, options) => {
            // Generate responses that should be validated and corrected by the system
            if (prompt.includes('clause')) {
              return JSON.stringify({
                clauses: [{
                  id: "clause_1",
                  text: "Test clause",
                  type: "general",
                  category: "General",
                  confidence: constraintType === "confidence_bounds" ? 1.5 : 0.8, // Invalid confidence > 1
                  startPosition: constraintType === "position_ordering" ? 10 : 0,
                  endPosition: constraintType === "position_ordering" ? 5 : 10 // Invalid: end < start
                }]
              });
            } else if (prompt.includes('risk')) {
              return JSON.stringify({
                risks: [{
                  id: "risk_1",
                  title: "Test Risk",
                  description: "Test description",
                  severity: constraintType === "enum_values" ? "Extreme" : "Medium", // Invalid severity
                  category: "General",
                  affectedClauses: constraintType === "array_types" ? "clause_1" : ["clause_1"], // Should be array
                  explanation: "Test explanation",
                  confidence: constraintType === "confidence_bounds" ? -0.2 : 0.7, // Invalid negative confidence
                  riskScore: constraintType === "numeric_types" ? "high" : 0.5, // Should be number
                  businessImpact: "Medium"
                }]
              });
            } else if (prompt.includes('recommendation')) {
              return JSON.stringify({
                recommendations: [{
                  id: "rec_1",
                  title: "Test Recommendation",
                  description: "Test description",
                  priority: constraintType === "enum_values" ? "Urgent" : "Medium", // Invalid priority
                  category: "General",
                  actionRequired: constraintType === "numeric_types" ? "yes" : true // Should be boolean
                }]
              });
            }
            
            return JSON.stringify({ clauses: [], risks: [], recommendations: [] });
          };

          const result = await contractAnalyzer.analyzeContract(contractText);

          // System should validate and correct constraint violations
          result.clauses.forEach(clause => {
            // Confidence should be bounded [0, 1]
            expect(clause.confidence).toBeGreaterThanOrEqual(0);
            expect(clause.confidence).toBeLessThanOrEqual(1);
            
            // Position ordering should be valid
            expect(clause.endPosition).toBeGreaterThanOrEqual(clause.startPosition);
            
            // Positions should be non-negative integers
            expect(clause.startPosition).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(clause.startPosition)).toBe(true);
            expect(clause.endPosition).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(clause.endPosition)).toBe(true);
          });

          result.risks.forEach(risk => {
            // Severity should be valid enum value
            expect(['Low', 'Medium', 'High', 'Critical']).toContain(risk.severity);
            
            // affectedClauses should be array
            expect(Array.isArray(risk.affectedClauses)).toBe(true);
            
            // Optional numeric fields should be valid if present
            if (risk.hasOwnProperty('confidence')) {
              expect(typeof risk.confidence).toBe('number');
              expect(risk.confidence).toBeGreaterThanOrEqual(0);
              expect(risk.confidence).toBeLessThanOrEqual(1);
            }
            
            if (risk.hasOwnProperty('riskScore')) {
              expect(typeof risk.riskScore).toBe('number');
              expect(risk.riskScore).toBeGreaterThanOrEqual(0);
              expect(risk.riskScore).toBeLessThanOrEqual(1);
            }
          });

          result.recommendations.forEach(rec => {
            // Priority should be valid enum value
            expect(['Low', 'Medium', 'High']).toContain(rec.priority);
            
            // actionRequired should be boolean
            expect(typeof rec.actionRequired).toBe('boolean');
          });

          // Summary fields should be valid
          expect(result.summary.totalClauses).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(result.summary.totalClauses)).toBe(true);
          expect(result.summary.riskScore).toBeGreaterThanOrEqual(0);
          expect(result.summary.riskScore).toBeLessThanOrEqual(1);
          expect(result.summary.confidence).toBeGreaterThanOrEqual(0);
          expect(result.summary.confidence).toBeLessThanOrEqual(1);
          expect(result.summary.processingTime).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20c: Schema validation ensures data consistency across related fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          contractText: fc.string({ minLength: 20, maxLength: 200 }),
          clauseCount: fc.integer({ min: 0, max: 5 })
        }),
        async ({ contractText, clauseCount }) => {
          modelManager.isLoaded = true;
          modelManager.inference = async (prompt, options) => {
            if (prompt.includes('clause')) {
              const clauses = Array.from({ length: clauseCount }, (_, i) => ({
                id: `clause_${i + 1}`,
                text: contractText.substring(i * 10, (i + 1) * 10 + 20),
                type: "general",
                category: "General",
                confidence: 0.8,
                startPosition: i * 10,
                endPosition: (i + 1) * 10 + 20
              }));
              
              return JSON.stringify({ clauses });
            } else if (prompt.includes('risk')) {
              // Create risks that reference the clauses
              const risks = clauseCount > 0 ? [{
                id: "risk_1",
                title: "Test Risk",
                description: "Test description",
                severity: "Medium",
                category: "General",
                affectedClauses: [`clause_1`], // Reference first clause
                explanation: "Test explanation",
                confidence: 0.7,
                riskScore: 0.5,
                businessImpact: "Medium"
              }] : [];
              
              return JSON.stringify({ risks });
            }
            
            return JSON.stringify({ clauses: [], risks: [], recommendations: [] });
          };

          const result = await contractAnalyzer.analyzeContract(contractText);

          // Data consistency validation
          
          // Summary totalClauses should match actual clause count
          expect(result.summary.totalClauses).toBe(result.clauses.length);
          
          // All clause IDs should be unique
          const clauseIds = result.clauses.map(c => c.id);
          const uniqueClauseIds = new Set(clauseIds);
          expect(uniqueClauseIds.size).toBe(clauseIds.length);
          
          // All risk IDs should be unique
          const riskIds = result.risks.map(r => r.id);
          const uniqueRiskIds = new Set(riskIds);
          expect(uniqueRiskIds.size).toBe(riskIds.length);
          
          // All recommendation IDs should be unique
          const recIds = result.recommendations.map(r => r.id);
          const uniqueRecIds = new Set(recIds);
          expect(uniqueRecIds.size).toBe(recIds.length);
          
          // Risk affectedClauses should reference valid clause IDs (if any clauses exist)
          if (result.clauses.length > 0) {
            const validClauseIds = new Set(result.clauses.map(c => c.id));
            result.risks.forEach(risk => {
              risk.affectedClauses.forEach(clauseId => {
                // Either the clause exists or the array is empty (system cleaned up invalid references)
                if (risk.affectedClauses.length > 0) {
                  expect(validClauseIds.has(clauseId) || clauseId === '').toBe(true);
                }
              });
            });
          }
          
          // Clause positions should not overlap (if multiple clauses)
          if (result.clauses.length > 1) {
            const sortedClauses = [...result.clauses].sort((a, b) => a.startPosition - b.startPosition);
            for (let i = 1; i < sortedClauses.length; i++) {
              const prevClause = sortedClauses[i - 1];
              const currentClause = sortedClauses[i];
              
              // Current clause should start after or at the end of previous clause
              expect(currentClause.startPosition).toBeGreaterThanOrEqual(prevClause.endPosition);
            }
          }
          
          // Metadata should be consistent with processing
          expect(result.metadata.processingMethod).toMatch(/^(ai_model|api_fallback)$/);
          expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);
          expect(result.metadata.tokenUsage).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});