import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { RuntimeConfig } from '../model/config/RuntimeConfig.js';

describe('Runtime Configuration Property Tests', () => {
  it('should support runtime model configuration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          temperature: fc.float({ min: 0, max: 2 }),
          maxTokens: fc.nat({ min: 1000, max: 200000 }),
          confidenceThreshold: fc.float({ min: 0, max: 1 })
        }),
        async (modelConfig) => {
          const config = new RuntimeConfig();
          const updated = config.updateConfig({ model: modelConfig });
          
          expect(updated.model.temperature).toBe(modelConfig.temperature);
          expect(updated.model.maxTokens).toBe(modelConfig.maxTokens);
          expect(updated.model.confidenceThreshold).toBe(modelConfig.confidenceThreshold);
        }
      ),
      { numRuns: 10 }
    );
  });
});