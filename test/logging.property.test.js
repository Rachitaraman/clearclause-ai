import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MetricsCollector } from '../model/logging/MetricsCollector.js';

describe('Logging Property Tests', () => {
  const collector = new MetricsCollector();

  it('should log comprehensive metrics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          processingTime: fc.nat({ max: 30000 }),
          tokenUsage: fc.nat({ max: 10000 }),
          confidence: fc.float({ min: 0, max: 1 }),
          clauseCount: fc.nat({ max: 50 }),
          riskCount: fc.nat({ max: 20 })
        }),
        async (data) => {
          collector.logAnalysisOperation('test_analysis', data);
          const summary = collector.getMetricsSummary();
          
          expect(summary.averageProcessingTime).toBeGreaterThanOrEqual(0);
          expect(summary.averageTokenUsage).toBeGreaterThanOrEqual(0);
          expect(summary.averageConfidence).toBeGreaterThanOrEqual(0);
          expect(summary.averageConfidence).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should log error and fallback events', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(),
        fc.record({ status: fc.string(), memory: fc.nat() }),
        async (reason, systemState) => {
          collector.logFallbackEvent(reason, systemState);
          const summary = collector.getMetricsSummary();
          
          expect(summary.fallbackEventCount).toBeGreaterThan(0);
          expect(summary.recentFallbacks).toBeInstanceOf(Array);
        }
      ),
      { numRuns: 5 }
    );
  });
});