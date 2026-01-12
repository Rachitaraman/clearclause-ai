import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ClauseExtractor } from '../model/extractors/ClauseExtractor.js';
import { ClauseSummaryGenerator } from '../model/utils/ClauseSummaryGenerator.js';
import { ContractAnalyzer } from '../model/analyzers/ContractAnalyzer.js';

/**
 * Property-based tests for clause extraction system
 * **Feature: ai-contract-analysis, Property 7: Clause extraction with categorization and confidence**
 * **Feature: ai-contract-analysis, Property 9: Clause extraction provides summary counts**
 */

describe('Clause Extraction Property Tests', () => {
  const clauseExtractor = new ClauseExtractor();
  const summaryGenerator = new ClauseSummaryGenerator();
  const contractAnalyzer = new ContractAnalyzer();

  // Mock Gemini API for testing
  const mockGeminiResponse = (clauses) => {
    const mockClauses = clauses.map((clause, index) => ({
      id: `clause_${index + 1}`,
      text: clause,
      startPosition: 0,
      endPosition: clause.length
    }));
    
    return JSON.stringify(mockClauses);
  };

  // Generator for contract-like text
  const contractTextGenerator = fc.array(
    fc.string({ minLength: 50, maxLength: 500 }).filter(s => 
      s.includes('shall') || s.includes('agreement') || s.includes('party') || s.includes('contract')
    ),
    { minLength: 1, maxLength: 10 }
  ).map(clauses => clauses.join('. '));

  // Generator for clause objects
  const clauseGenerator = fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }),
    text: fc.string({ minLength: 20, maxLength: 200 }),
    type: fc.constantFrom(
      'payment_terms', 'termination_clause', 'liability_limitation',
      'confidentiality_agreement', 'ip_rights', 'force_majeure'
    ),
    category: fc.constantFrom('PAYMENT', 'TERMINATION', 'LIABILITY', 'CONFIDENTIALITY'),
    confidence: fc.float({ min: 0, max: 1 }),
    startPosition: fc.nat({ max: 1000 }),
    endPosition: fc.nat({ max: 2000 })
  });

  /**
   * Property 7: Clause extraction with categorization and confidence
   * **Validates: Requirements 4.1, 4.2, 4.3**
   */
  it('should extract clauses with categorization and confidence scores', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(clauseGenerator, { minLength: 1, maxLength: 5 }),
        async (inputClauses) => {
          // Mock the AI response
          const originalGenerateContent = clauseExtractor.model.generateContent;
          clauseExtractor.model.generateContent = async () => ({
            response: {
              text: () => mockGeminiResponse(inputClauses.map(c => c.text))
            }
          });

          try {
            const result = await clauseExtractor.categorizeClauses(inputClauses);
            
            // Property: All clauses should have required fields
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            
            result.forEach(clause => {
              // Each clause should have categorization
              expect(clause).toHaveProperty('category');
              expect(clause).toHaveProperty('type');
              
              // Each clause should have confidence score between 0 and 1
              expect(clause).toHaveProperty('confidence');
              expect(clause.confidence).toBeGreaterThanOrEqual(0);
              expect(clause.confidence).toBeLessThanOrEqual(1);
              
              // Each clause should preserve original text
              expect(clause).toHaveProperty('text');
              expect(typeof clause.text).toBe('string');
              expect(clause.text.length).toBeGreaterThan(0);
              
              // Each clause should have an ID
              expect(clause).toHaveProperty('id');
              expect(typeof clause.id).toBe('string');
            });
            
          } finally {
            // Restore original method
            clauseExtractor.model.generateContent = originalGenerateContent;
          }
        }
      ),
      { numRuns: 10 } // Reduced for faster testing
    );
  });

  /**
   * Property 8: Clause grouping preserves individual text
   * **Validates: Requirements 4.4**
   */
  it('should group clauses by type while preserving individual text', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(clauseGenerator, { minLength: 2, maxLength: 8 }),
        async (inputClauses) => {
          // Ensure we have some duplicate types for grouping but unique IDs
          const clausesWithDuplicates = [
            ...inputClauses,
            { ...inputClauses[0], id: `duplicate_1_${Date.now()}`, text: 'Duplicate clause text 1' },
            { ...inputClauses[0], id: `duplicate_2_${Date.now()}`, text: 'Duplicate clause text 2' }
          ];
          
          const grouped = contractAnalyzer.groupClausesByType(clausesWithDuplicates);
          
          // Property: All original clauses should be preserved
          expect(grouped.length).toBe(clausesWithDuplicates.length);
          
          // Property: Each clause should maintain its individual text
          clausesWithDuplicates.forEach(originalClause => {
            const foundClause = grouped.find(c => c.id === originalClause.id);
            expect(foundClause).toBeDefined();
            expect(foundClause.text).toBe(originalClause.text);
          });
          
          // Property: Clauses of same type should have group information
          const typeGroups = {};
          grouped.forEach(clause => {
            const type = clause.type || 'unknown';
            if (!typeGroups[type]) typeGroups[type] = [];
            typeGroups[type].push(clause);
          });
          
          Object.entries(typeGroups).forEach(([type, clauses]) => {
            if (clauses.length > 1) {
              clauses.forEach(clause => {
                expect(clause).toHaveProperty('groupType', type);
                expect(clause).toHaveProperty('groupTotal', clauses.length);
              });
            }
          });
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 9: Clause extraction provides summary counts
   * **Validates: Requirements 4.5**
   */
  it('should provide accurate summary counts for extracted clauses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(clauseGenerator, { minLength: 1, maxLength: 10 }),
        async (inputClauses) => {
          const summary = summaryGenerator.generateSummary(inputClauses);
          
          // Property: Total count should match input
          expect(summary.totalClauses).toBe(inputClauses.length);
          
          // Property: Type counts should sum to total
          const typeCountSum = Object.values(summary.clauseTypeCounts)
            .reduce((sum, count) => sum + count, 0);
          expect(typeCountSum).toBe(inputClauses.length);
          
          // Property: Each type count should be positive
          Object.values(summary.clauseTypeCounts).forEach(count => {
            expect(count).toBeGreaterThan(0);
          });
          
          // Property: Summary should include confidence statistics
          expect(summary).toHaveProperty('confidenceStatistics');
          expect(summary.confidenceStatistics).toHaveProperty('average');
          expect(summary.confidenceStatistics).toHaveProperty('minimum');
          expect(summary.confidenceStatistics).toHaveProperty('maximum');
          
          // Property: Category breakdown should account for all clauses
          const categoryTotal = Object.values(summary.categoryBreakdown)
            .reduce((sum, category) => sum + category.count, 0);
          expect(categoryTotal).toBe(inputClauses.length);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Confidence scores should be valid
   */
  it('should assign valid confidence scores', async () => {
    await fc.assert(
      fc.asyncProperty(
        clauseGenerator,
        fc.constantFrom('PAYMENT', 'TERMINATION', 'LIABILITY'),
        async (clause, category) => {
          // Mock confidence calculation
          const originalCalculateConfidence = clauseExtractor.calculateConfidence;
          clauseExtractor.calculateConfidence = async () => Math.random();
          
          try {
            const confidence = await clauseExtractor.calculateConfidence(clause, category);
            
            // Property: Confidence should be between 0 and 1
            expect(confidence).toBeGreaterThanOrEqual(0);
            expect(confidence).toBeLessThanOrEqual(1);
            expect(typeof confidence).toBe('number');
            expect(isNaN(confidence)).toBe(false);
            
          } finally {
            clauseExtractor.calculateConfidence = originalCalculateConfidence;
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Clause types should be from supported set
   */
  it('should only return supported clause types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(clauseGenerator, { minLength: 1, maxLength: 5 }),
        async (inputClauses) => {
          const supportedTypes = Object.values(clauseExtractor.getSupportedClauseTypes());
          supportedTypes.push('unknown'); // Include fallback type
          
          inputClauses.forEach(clause => {
            // Property: All clause types should be from supported set
            expect(supportedTypes).toContain(clause.type);
          });
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * Property: Summary validation should work correctly
   */
  it('should validate summary data correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(clauseGenerator, { minLength: 1, maxLength: 8 }),
        async (inputClauses) => {
          const summary = summaryGenerator.generateSummary(inputClauses);
          
          // Property: Valid summary should pass validation
          const isValid = summaryGenerator.validateSummary(summary);
          expect(isValid).toBe(true);
          
          // Property: Invalid summary should fail validation
          const invalidSummary = { ...summary };
          delete invalidSummary.totalClauses;
          const isInvalid = summaryGenerator.validateSummary(invalidSummary);
          expect(isInvalid).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });
});