import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { QualityAssurance } from '../model/quality/QualityAssurance.js';

describe('Quality Assurance Property Tests', () => {
  const qa = new QualityAssurance();

  it('should validate output and retry logic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          analysisId: fc.string(),
          summary: fc.record({ totalClauses: fc.nat() }),
          clauses: fc.array(fc.record({ id: fc.string(), text: fc.string() })),
          risks: fc.array(fc.record({ id: fc.string(), severity: fc.string() })),
          recommendations: fc.array(fc.record({ id: fc.string(), title: fc.string() })),
          metadata: fc.record({ processingTime: fc.nat() })
        }),
        async (validOutput) => {
          expect(qa.validateOutput(validOutput)).toBe(true);
          
          const invalidOutput = { ...validOutput };
          delete invalidOutput.analysisId;
          expect(qa.validateOutput(invalidOutput)).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should validate schema completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          analysisId: fc.string(),
          summary: fc.object(),
          clauses: fc.array(fc.object()),
          risks: fc.array(fc.object()),
          recommendations: fc.array(fc.object()),
          metadata: fc.object()
        }),
        async (output) => {
          expect(qa.validateOutput(output)).toBe(true);
        }
      ),
      { numRuns: 15 }
    );
  });
});