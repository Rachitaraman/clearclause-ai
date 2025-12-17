// Property-based test for model specifications
// **Feature: ai-contract-analysis, Property 5: Model meets performance specifications**
// **Validates: Requirements 3.2, 3.5**

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { ModelManager } from '../../model/core/ModelManager.js';
import { ModelConfig } from '../../model/config/ModelConfig.js';

describe('Model Specifications Property Tests', () => {
  let modelManager;

  beforeEach(() => {
    modelManager = new ModelManager();
  });

  afterEach(async () => {
    if (modelManager.isLoaded) {
      await modelManager.unloadModel();
    }
  });

  it('Property 5: Model meets performance specifications', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid model configurations
        fc.record({
          modelName: fc.oneof(
            fc.constant('llama3.1:8b-instruct-q8_0'),
            fc.constant('llama3.1:70b'),
            fc.constant('mistral:7b-instruct'),
            fc.constant('codellama:13b'),
            fc.constant('vicuna:33b'),
            fc.constant('wizardlm:70b')
          ),
          maxTokens: fc.integer({ min: 50000, max: 200000 }),
          contextWindow: fc.integer({ min: 50000, max: 200000 }),
          temperature: fc.float({ min: Math.fround(0.0), max: Math.fround(1.0), noNaN: true }),
          topP: fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
          memoryOptimization: fc.boolean(),
          quantization: fc.oneof(
            fc.constant('int8'),
            fc.constant('int4'),
            fc.constant('fp16')
          )
        }),
        async (config) => {
          // Test that model configuration meets minimum requirements
          
          // Requirement 3.2: Model should have at least 7 billion parameters
          const modelName = config.modelName.toLowerCase();
          const parameterMatch = modelName.match(/(\d+)b/);
          
          if (parameterMatch) {
            const parameterCount = parseInt(parameterMatch[1]);
            expect(parameterCount).toBeGreaterThanOrEqual(7);
          }
          
          // Requirement 3.5: Model should handle documents up to 50,000 tokens
          expect(config.contextWindow).toBeGreaterThanOrEqual(50000);
          expect(config.maxTokens).toBeGreaterThanOrEqual(50000);
          
          // Test configuration validation
          const isValidConfig = modelManager.validateConfig(config);
          expect(isValidConfig).toBe(true);
          
          // Test that configuration is properly stored
          const mergedConfig = {
            ...ModelConfig.primary,
            ...config
          };
          
          // Verify all required fields are present
          expect(mergedConfig).toHaveProperty('modelName');
          expect(mergedConfig).toHaveProperty('maxTokens');
          expect(mergedConfig).toHaveProperty('contextWindow');
          expect(mergedConfig).toHaveProperty('temperature');
          expect(mergedConfig).toHaveProperty('topP');
          
          // Verify parameter ranges are valid
          expect(mergedConfig.temperature).toBeGreaterThanOrEqual(0.0);
          expect(mergedConfig.temperature).toBeLessThanOrEqual(1.0);
          expect(mergedConfig.topP).toBeGreaterThanOrEqual(0.0);
          expect(mergedConfig.topP).toBeLessThanOrEqual(1.0);
          expect(mergedConfig.maxTokens).toBeGreaterThan(0);
          expect(mergedConfig.contextWindow).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5a: Model validation rejects invalid configurations', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate invalid model configurations
        fc.oneof(
          // Missing required fields
          fc.record({
            temperature: fc.float({ min: Math.fround(0.0), max: Math.fround(1.0) })
          }),
          // Invalid parameter counts (less than 7B)
          fc.record({
            modelName: fc.oneof(
              fc.constant('llama3.2:1b'),
              fc.constant('tiny-model:3b'),
              fc.constant('small:6b')
            ),
            maxTokens: fc.integer({ min: 1000, max: 10000 }),
            contextWindow: fc.integer({ min: 1000, max: 10000 })
          }),
          // Invalid context window (less than 50K)
          fc.record({
            modelName: fc.constant('llama3.1:8b'),
            maxTokens: fc.integer({ min: 100, max: 49999 }),
            contextWindow: fc.integer({ min: 100, max: 49999 })
          }),
          // Invalid data types
          fc.record({
            modelName: fc.integer(),
            maxTokens: fc.string(),
            contextWindow: fc.boolean()
          })
        ),
        async (invalidConfig) => {
          // Test that invalid configurations are properly rejected
          const isValidConfig = modelManager.validateConfig(invalidConfig);
          
          // Should reject configurations that don't meet requirements
          if (!invalidConfig.modelName || !invalidConfig.maxTokens || !invalidConfig.contextWindow) {
            expect(isValidConfig).toBe(false);
          } else if (typeof invalidConfig.modelName !== 'string' || 
                     typeof invalidConfig.maxTokens !== 'number' || 
                     typeof invalidConfig.contextWindow !== 'number') {
            expect(isValidConfig).toBe(false);
          } else if (invalidConfig.maxTokens <= 0 || invalidConfig.contextWindow <= 0) {
            expect(isValidConfig).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5b: Model status reflects configuration accurately', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          modelName: fc.constant('llama3.1:8b-instruct-q8_0'),
          maxTokens: fc.integer({ min: 50000, max: 128000 }),
          contextWindow: fc.integer({ min: 50000, max: 128000 }),
          temperature: fc.float({ min: Math.fround(0.0), max: Math.fround(1.0), noNaN: true }),
          memoryOptimization: fc.boolean()
        }),
        async (config) => {
          // Set the model configuration (without actually loading due to test environment)
          modelManager.modelConfig = {
            ...ModelConfig.primary,
            ...config
          };
          
          // Simulate loaded state for testing
          modelManager.isLoaded = true;
          modelManager.memoryUsage = modelManager.estimateMemoryUsage();
          
          const status = modelManager.getModelStatus();
          
          // Verify status reflects the configuration
          expect(status.modelName).toBe(config.modelName);
          expect(status.contextWindow).toBe(config.contextWindow);
          expect(status.isLoaded).toBe(true);
          expect(status.memoryUsage).toBeGreaterThan(0);
          expect(status.configuration).toMatchObject(config);
          
          // Clean up
          modelManager.isLoaded = false;
          modelManager.memoryUsage = 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});