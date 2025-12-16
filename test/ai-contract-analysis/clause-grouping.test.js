// Property-based test for clause grouping
// **Feature: ai-contract-analysis, Property 8: Clause grouping preserves individual text**
// **Validates: Requirements 4.4**

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { ClauseExtractor } from '../../model/extractors/ClauseExtractor.js';

describe('Clause Grouping Property Tests', () => {
  let clauseExtractor;

  beforeEach(() => {
    clauseExtractor = new ClauseExtractor();
  });

  afterEach(() => {
    clauseExtractor = null;
  });


  it('**Feature: ai-contract-analysis, Property 8: Clause grouping preserves individual text**', () => {
    // Property: For any contract with multiple clauses of the same type, 
    // the system should group them by type while maintaining the complete text of each individual clause
    
    fc.assert(
      fc.property(
        // Generate test data: array of clauses with some having the same type but unique IDs
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 10, maxLength: 200 }),
            type: fc.constantFrom(
              'payment_terms',
              'termination_clause', 
              'liability_limitation',
              'confidentiality_agreement',
              'intellectual_property'
            ),
            confidence: fc.float({ min: 0, max: 1 }),
            startPosition: fc.nat({ max: 1000 }),
            endPosition: fc.nat({ max: 1000 })
          }),
          { minLength: 2, maxLength: 20 }
        ).map(clauses => {
          // Ensure unique IDs by adding index suffix
          return clauses.map((clause, index) => ({
            ...clause,
            id: `${clause.id.trim() || 'clause'}_${index}`
          }));
        }),
        (categorizedClauses) => {
          // Ensure we have at least one duplicate type for meaningful testing
          if (categorizedClauses.length < 2) {
            categorizedClauses.push({
              ...categorizedClauses[0],
              id: 'duplicate_' + categorizedClauses[0].id,
              text: 'Duplicate clause text for testing: ' + categorizedClauses[0].text
            });
          }

          // Group the clauses
          const grouped = clauseExtractor.groupClausesByType(categorizedClauses);

          // Property 1: All original clauses should be preserved
          const totalOriginalClauses = categorizedClauses.length;
          let totalGroupedClauses = 0;
          
          Object.values(grouped).forEach(group => {
            totalGroupedClauses += group.clauses.length;
          });

          if (totalGroupedClauses !== totalOriginalClauses) {
            return false;
          }

          // Property 2: Individual clause text must be preserved exactly
          for (const originalClause of categorizedClauses) {
            const groupType = originalClause.type;
            const group = grouped[groupType];
            
            if (!group) {
              return false;
            }
            
            const matchingClause = group.clauses.find(c => c.id === originalClause.id);
            if (!matchingClause) {
              return false;
            }
            
            // Handle NaN values properly (NaN !== NaN in JavaScript)
            const confidenceMatch = (Number.isNaN(originalClause.confidence) && Number.isNaN(matchingClause.confidence)) ||
                                   (originalClause.confidence === matchingClause.confidence);
            
            if (matchingClause.text !== originalClause.text ||
                !confidenceMatch ||
                matchingClause.startPosition !== originalClause.startPosition ||
                matchingClause.endPosition !== originalClause.endPosition) {
              return false;
            }
          }

          // Property 3: Clauses should be grouped by type correctly
          for (const groupType of Object.keys(grouped)) {
            const group = grouped[groupType];
            
            // Count should match actual clauses in group
            if (group.count !== group.clauses.length) {
              return false;
            }
            
            // All clauses in group should have been of the correct type originally
            const originalClausesOfThisType = categorizedClauses.filter(c => c.type === groupType);
            if (group.clauses.length !== originalClausesOfThisType.length) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  it('should handle empty clause arrays', () => {
    const result = clauseExtractor.groupClausesByType([]);
    
    // Should return structure with all supported types but empty clauses
    const supportedTypes = clauseExtractor.getSupportedClauseTypes();
    
    supportedTypes.forEach(type => {
      expect(result[type]).toBeDefined();
      expect(result[type].clauses).toEqual([]);
      expect(result[type].count).toBe(0);
      expect(result[type].type).toBe(type);
    });
  });

  it('should throw error for invalid input', () => {
    expect(() => {
      clauseExtractor.groupClausesByType(null);
    }).toThrow('Categorized clauses must be an array');

    expect(() => {
      clauseExtractor.groupClausesByType('invalid');
    }).toThrow('Categorized clauses must be an array');

    expect(() => {
      clauseExtractor.groupClausesByType(123);
    }).toThrow('Categorized clauses must be an array');
  });
});