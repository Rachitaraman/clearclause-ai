// Property Test: Standardized Format Consistency
// **Feature: ai-contract-analysis, Property 4: Both processing methods return standardized format**
// **Validates: Requirements 1.5**

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { APIClient } from '../../api/clients/APIClient.js';
import { ResponseNormalizer } from '../../api/normalizers/ResponseNormalizer.js';

describe('Property 4: Both processing methods return standardized format', () => {
  it('should ensure API fallback returns standardized format matching AI model output', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various API response formats to test normalization
        fc.record({
          // Summary variations
          summary: fc.oneof(
            // Standard format
            fc.record({
              title: fc.string({ minLength: 1, maxLength: 100 }),
              documentType: fc.constantFrom('contract', 'agreement', 'document'),
              totalClauses: fc.integer({ min: 0, max: 50 }),
              riskScore: fc.float({ min: 0, max: 100 }),
              processingTime: fc.integer({ min: 100, max: 30000 }),
              confidence: fc.float({ min: 0, max: 1 })
            }),
            // Alternative field names (external API format)
            fc.record({
              document_title: fc.string({ minLength: 1, maxLength: 100 }),
              type: fc.constantFrom('contract', 'agreement', 'document'),
              clause_count: fc.integer({ min: 0, max: 50 }),
              risk_score: fc.float({ min: 0, max: 100 }),
              processing_ms: fc.integer({ min: 100, max: 30000 }),
              confidence_score: fc.float({ min: 0, max: 1 })
            })
          ),
          
          // Clauses variations
          clauses: fc.array(
            fc.oneof(
              // Standard format
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                text: fc.string({ minLength: 10, maxLength: 500 }),
                type: fc.constantFrom('payment_terms', 'termination_clause', 'liability_limitation'),
                category: fc.constantFrom('Payment', 'Termination', 'Liability'),
                confidence: fc.float({ min: 0, max: 1 }),
                startPosition: fc.integer({ min: 0, max: 1000 }),
                endPosition: fc.integer({ min: 0, max: 1000 })
              }),
              // Alternative format
              fc.record({
                clause_id: fc.string({ minLength: 1, maxLength: 50 }),
                content: fc.string({ minLength: 10, maxLength: 500 }),
                clause_type: fc.constantFrom('payment', 'termination', 'liability'),
                confidence_score: fc.float({ min: 0, max: 1 }),
                start_pos: fc.integer({ min: 0, max: 1000 }),
                end_pos: fc.integer({ min: 0, max: 1000 })
              })
            ),
            { minLength: 0, maxLength: 10 }
          ),
          
          // Risks variations
          risks: fc.array(
            fc.oneof(
              // Standard format
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                title: fc.string({ minLength: 5, maxLength: 100 }),
                description: fc.string({ minLength: 10, maxLength: 300 }),
                severity: fc.constantFrom('Low', 'Medium', 'High', 'Critical'),
                category: fc.string({ minLength: 3, maxLength: 20 }),
                affectedClauses: fc.array(fc.string(), { maxLength: 5 }),
                mitigation: fc.string({ minLength: 10, maxLength: 200 }),
                confidence: fc.float({ min: 0, max: 1 })
              }),
              // Alternative format
              fc.record({
                risk_id: fc.string({ minLength: 1, maxLength: 50 }),
                name: fc.string({ minLength: 5, maxLength: 100 }),
                details: fc.string({ minLength: 10, maxLength: 300 }),
                level: fc.constantFrom('low', 'medium', 'high', 'critical', 'minor', 'major', 'severe'),
                risk_category: fc.string({ minLength: 3, maxLength: 20 }),
                clause_ids: fc.array(fc.string(), { maxLength: 5 }),
                recommendation: fc.string({ minLength: 10, maxLength: 200 }),
                confidence_score: fc.float({ min: 0, max: 1 })
              })
            ),
            { minLength: 0, maxLength: 8 }
          ),
          
          // Recommendations variations
          recommendations: fc.array(
            fc.oneof(
              // Standard format
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                title: fc.string({ minLength: 5, maxLength: 100 }),
                description: fc.string({ minLength: 10, maxLength: 300 }),
                priority: fc.constantFrom('Low', 'Medium', 'High'),
                category: fc.string({ minLength: 3, maxLength: 20 }),
                actionRequired: fc.boolean()
              }),
              // Alternative format
              fc.record({
                recommendation_id: fc.string({ minLength: 1, maxLength: 50 }),
                recommendation_title: fc.string({ minLength: 5, maxLength: 100 }),
                recommendation_text: fc.string({ minLength: 10, maxLength: 300 }),
                importance: fc.constantFrom('Low', 'Medium', 'High'),
                rec_category: fc.string({ minLength: 3, maxLength: 20 }),
                requires_action: fc.boolean()
              })
            ),
            { minLength: 0, maxLength: 6 }
          ),
          
          // Metadata variations
          metadata: fc.oneof(
            fc.record({
              modelUsed: fc.string({ minLength: 3, maxLength: 50 }),
              processingTime: fc.integer({ min: 100, max: 30000 }),
              tokenUsage: fc.integer({ min: 0, max: 10000 }),
              confidence: fc.float({ min: 0, max: 1 })
            }),
            fc.record({
              model: fc.string({ minLength: 3, maxLength: 50 }),
              processing_ms: fc.integer({ min: 100, max: 30000 }),
              tokens: fc.integer({ min: 0, max: 10000 }),
              overall_confidence: fc.float({ min: 0, max: 1 })
            })
          )
        }),
        
        async (apiResponse) => {
          // Test the ResponseNormalizer
          const normalizer = new ResponseNormalizer();
          
          try {
            const normalizedResponse = normalizer.normalizeToStandardFormat(apiResponse);
            
            // Verify the standardized format structure
            expect(normalizedResponse).toHaveProperty('summary');
            expect(normalizedResponse).toHaveProperty('clauses');
            expect(normalizedResponse).toHaveProperty('risks');
            expect(normalizedResponse).toHaveProperty('recommendations');
            expect(normalizedResponse).toHaveProperty('metadata');
            
            // Verify summary structure
            expect(normalizedResponse.summary).toHaveProperty('title');
            expect(normalizedResponse.summary).toHaveProperty('documentType');
            expect(normalizedResponse.summary).toHaveProperty('totalClauses');
            expect(normalizedResponse.summary).toHaveProperty('riskScore');
            expect(normalizedResponse.summary).toHaveProperty('processingTime');
            expect(normalizedResponse.summary).toHaveProperty('confidence');
            
            // Verify arrays are arrays
            expect(Array.isArray(normalizedResponse.clauses)).toBe(true);
            expect(Array.isArray(normalizedResponse.risks)).toBe(true);
            expect(Array.isArray(normalizedResponse.recommendations)).toBe(true);
            
            // Verify clause structure (if clauses exist)
            normalizedResponse.clauses.forEach(clause => {
              expect(clause).toHaveProperty('id');
              expect(clause).toHaveProperty('text');
              expect(clause).toHaveProperty('type');
              expect(clause).toHaveProperty('category');
              expect(clause).toHaveProperty('confidence');
              expect(clause).toHaveProperty('startPosition');
              expect(clause).toHaveProperty('endPosition');
              
              // Verify confidence is normalized to 0-1 range
              expect(clause.confidence).toBeGreaterThanOrEqual(0);
              expect(clause.confidence).toBeLessThanOrEqual(1);
            });
            
            // Verify risk structure (if risks exist)
            normalizedResponse.risks.forEach(risk => {
              expect(risk).toHaveProperty('id');
              expect(risk).toHaveProperty('title');
              expect(risk).toHaveProperty('description');
              expect(risk).toHaveProperty('severity');
              expect(risk).toHaveProperty('category');
              expect(risk).toHaveProperty('affectedClauses');
              expect(risk).toHaveProperty('mitigation');
              expect(risk).toHaveProperty('confidence');
              
              // Verify severity is standardized
              expect(['Low', 'Medium', 'High', 'Critical']).toContain(risk.severity);
              
              // Verify affectedClauses is an array
              expect(Array.isArray(risk.affectedClauses)).toBe(true);
              
              // Verify confidence is normalized
              expect(risk.confidence).toBeGreaterThanOrEqual(0);
              expect(risk.confidence).toBeLessThanOrEqual(1);
            });
            
            // Verify recommendation structure (if recommendations exist)
            normalizedResponse.recommendations.forEach(rec => {
              expect(rec).toHaveProperty('id');
              expect(rec).toHaveProperty('title');
              expect(rec).toHaveProperty('description');
              expect(rec).toHaveProperty('priority');
              expect(rec).toHaveProperty('category');
              expect(rec).toHaveProperty('actionRequired');
              
              // Verify priority is standardized
              expect(['Low', 'Medium', 'High']).toContain(rec.priority);
              
              // Verify actionRequired is boolean
              expect(typeof rec.actionRequired).toBe('boolean');
            });
            
            // Verify metadata structure
            expect(normalizedResponse.metadata).toHaveProperty('processingMethod');
            expect(normalizedResponse.metadata).toHaveProperty('modelUsed');
            expect(normalizedResponse.metadata).toHaveProperty('processingTime');
            expect(normalizedResponse.metadata).toHaveProperty('tokenUsage');
            expect(normalizedResponse.metadata).toHaveProperty('confidence');
            
            // Verify metadata values
            expect(normalizedResponse.metadata.processingMethod).toBe('api_fallback');
            expect(typeof normalizedResponse.metadata.processingTime).toBe('number');
            expect(typeof normalizedResponse.metadata.tokenUsage).toBe('number');
            expect(normalizedResponse.metadata.confidence).toBeGreaterThanOrEqual(0);
            expect(normalizedResponse.metadata.confidence).toBeLessThanOrEqual(1);
            
            // Verify numeric fields in summary are properly normalized
            expect(typeof normalizedResponse.summary.totalClauses).toBe('number');
            expect(normalizedResponse.summary.totalClauses).toBeGreaterThanOrEqual(0);
            expect(typeof normalizedResponse.summary.riskScore).toBe('number');
            expect(normalizedResponse.summary.riskScore).toBeGreaterThanOrEqual(0);
            expect(normalizedResponse.summary.riskScore).toBeLessThanOrEqual(100);
            expect(normalizedResponse.summary.confidence).toBeGreaterThanOrEqual(0);
            expect(normalizedResponse.summary.confidence).toBeLessThanOrEqual(1);
            
          } catch (error) {
            // If normalization fails, it should still produce a minimal valid response
            const recoveredResponse = normalizer.normalizeWithErrorRecovery(apiResponse);
            
            // Verify the error recovery produces a valid standardized format
            expect(recoveredResponse).toHaveProperty('summary');
            expect(recoveredResponse).toHaveProperty('clauses');
            expect(recoveredResponse).toHaveProperty('risks');
            expect(recoveredResponse).toHaveProperty('recommendations');
            expect(recoveredResponse).toHaveProperty('metadata');
            
            // Verify arrays are arrays even in error recovery
            expect(Array.isArray(recoveredResponse.clauses)).toBe(true);
            expect(Array.isArray(recoveredResponse.risks)).toBe(true);
            expect(Array.isArray(recoveredResponse.recommendations)).toBe(true);
            
            // Verify metadata indicates the processing method
            expect(recoveredResponse.metadata.processingMethod).toBe('api_fallback');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure API client mock responses match standardized format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 1000 }), // document text
        fc.record({
          extractClauses: fc.boolean(),
          assessRisks: fc.boolean(),
          generateRecommendations: fc.boolean()
        }), // options
        
        async (documentText, options) => {
          // Create API client (will use mock responses for testing)
          const apiClient = new APIClient({
            baseUrl: 'https://test-api.example.com',
            apiKey: 'test-key'
          });
          
          try {
            const response = await apiClient.analyzeContract(documentText, options);
            
            // Verify the mock response already follows standardized format
            expect(response).toHaveProperty('summary');
            expect(response).toHaveProperty('clauses');
            expect(response).toHaveProperty('risks');
            expect(response).toHaveProperty('recommendations');
            expect(response).toHaveProperty('metadata');
            
            // Verify metadata indicates API fallback processing
            expect(response.metadata.processingMethod).toBe('api_fallback');
            
            // Verify the response can be normalized without issues
            const normalizer = new ResponseNormalizer();
            const normalizedResponse = normalizer.normalizeToStandardFormat(response);
            
            // Should be identical since mock already follows standard format
            expect(normalizedResponse.summary.title).toBeDefined();
            expect(normalizedResponse.metadata.processingMethod).toBe('api_fallback');
            
          } catch (error) {
            // API errors should be properly handled
            expect(error.message).toContain('API');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle edge cases in API response normalization', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Empty response
          fc.constant({}),
          // Null/undefined fields
          fc.record({
            summary: fc.constant(null),
            clauses: fc.constant(undefined),
            risks: fc.array(fc.record({
              severity: fc.constantFrom('invalid', '', null, undefined)
            })),
            recommendations: fc.array(fc.record({
              priority: fc.constantFrom('invalid', '', null, undefined)
            }))
          }),
          // Invalid data types
          fc.record({
            summary: fc.record({
              totalClauses: fc.oneof(fc.string(), fc.constant(null), fc.constant(-1)),
              riskScore: fc.oneof(fc.string(), fc.constant(null), fc.constant(-10), fc.constant(150)),
              confidence: fc.oneof(fc.string(), fc.constant(null), fc.constant(-1), fc.constant(2))
            }),
            clauses: fc.oneof(fc.string(), fc.constant(null), fc.integer()),
            risks: fc.oneof(fc.string(), fc.constant(null), fc.integer())
          })
        ),
        
        async (invalidResponse) => {
          const normalizer = new ResponseNormalizer();
          
          // Should handle invalid responses gracefully
          const result = normalizer.normalizeWithErrorRecovery(invalidResponse);
          
          // Should always produce valid standardized format
          expect(result).toHaveProperty('summary');
          expect(result).toHaveProperty('clauses');
          expect(result).toHaveProperty('risks');
          expect(result).toHaveProperty('recommendations');
          expect(result).toHaveProperty('metadata');
          
          // Arrays should be arrays
          expect(Array.isArray(result.clauses)).toBe(true);
          expect(Array.isArray(result.risks)).toBe(true);
          expect(Array.isArray(result.recommendations)).toBe(true);
          
          // Numeric fields should be valid numbers
          expect(typeof result.summary.totalClauses).toBe('number');
          expect(result.summary.totalClauses).toBeGreaterThanOrEqual(0);
          expect(typeof result.summary.riskScore).toBe('number');
          expect(result.summary.riskScore).toBeGreaterThanOrEqual(0);
          expect(result.summary.riskScore).toBeLessThanOrEqual(100);
          expect(result.summary.confidence).toBeGreaterThanOrEqual(0);
          expect(result.summary.confidence).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});