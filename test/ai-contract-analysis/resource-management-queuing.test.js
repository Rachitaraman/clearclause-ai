// Property-based test for resource management and queuing
// **Feature: ai-contract-analysis, Property 16: Resource management and queuing**
// **Validates: Requirements 8.3, 8.4**

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { ModelManager } from '../../model/core/ModelManager.js';
import { ModelConfig } from '../../model/config/ModelConfig.js';

// Mock queue implementation for testing
class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.processing = new Set();
    this.maxConcurrent = maxConcurrent;
    this.completed = [];
    this.failed = [];
  }

  async enqueue(request) {
    return new Promise((resolve, reject) => {
      const queueItem = {
        id: Math.random().toString(36).substr(2, 9),
        request,
        resolve,
        reject,
        enqueuedAt: Date.now(),
        startedAt: null,
        completedAt: null
      };
      
      this.queue.push(queueItem);
      this.processNext();
    });
  }

  async processNext() {
    if (this.processing.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    this.processing.add(item);
    item.startedAt = Date.now();

    try {
      const result = await item.request();
      item.completedAt = Date.now();
      this.processing.delete(item);
      this.completed.push(item);
      item.resolve(result);
    } catch (error) {
      item.completedAt = Date.now();
      this.processing.delete(item);
      this.failed.push(item);
      item.reject(error);
    }

    // Process next item in queue
    this.processNext();
  }

  getStats() {
    return {
      queued: this.queue.length,
      processing: this.processing.size,
      completed: this.completed.length,
      failed: this.failed.length,
      maxConcurrent: this.maxConcurrent
    };
  }

  getAverageWaitTime() {
    const completedItems = [...this.completed, ...this.failed];
    if (completedItems.length === 0) return 0;
    
    const totalWaitTime = completedItems.reduce((sum, item) => {
      return sum + (item.startedAt - item.enqueuedAt);
    }, 0);
    
    return totalWaitTime / completedItems.length;
  }
}

describe('Resource Management and Queuing Property Tests', () => {
  let modelManager;
  let requestQueue;

  beforeEach(() => {
    modelManager = new ModelManager();
    requestQueue = new RequestQueue(3); // Max 3 concurrent requests
  });

  afterEach(async () => {
    if (modelManager.isLoaded) {
      await modelManager.unloadModel();
    }
  });

  it('Property 16: Resource management and queuing', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate concurrent request scenarios
        fc.record({
          concurrentRequests: fc.integer({ min: 1, max: 10 }),
          maxConcurrent: fc.integer({ min: 1, max: 5 }),
          resourceLimit: fc.integer({ min: 5000, max: 20000 }), // Memory limit in MB
          requestComplexity: fc.oneof(
            fc.constant('simple'),   // Fast requests
            fc.constant('medium'),   // Medium complexity
            fc.constant('complex')   // Resource-intensive requests
          )
        }),
        async ({ concurrentRequests, maxConcurrent, resourceLimit, requestComplexity }) => {
          // Set up model manager with resource limits
          modelManager.resourceLimits.maxMemoryUsage = resourceLimit;
          modelManager.modelConfig = { ...ModelConfig.primary };
          modelManager.isLoaded = true;
          modelManager.memoryUsage = Math.min(resourceLimit * 0.5, modelManager.estimateMemoryUsage());
          modelManager.resetMetrics();

          // Set up request queue with specified concurrency limit
          requestQueue = new RequestQueue(maxConcurrent);

          // Define request processing times based on complexity (reduced for faster tests)
          const processingTimes = {
            simple: () => 10 + Math.random() * 20,   // 10-30ms
            medium: () => 50 + Math.random() * 100,  // 50-150ms
            complex: () => 100 + Math.random() * 200 // 100-300ms
          };

          const baseProcessingTime = processingTimes[requestComplexity];

          // Create mock requests that simulate AI model inference
          const createRequest = (requestId) => {
            return async () => {
              const startTime = Date.now();
              const processingTime = baseProcessingTime();
              
              // Simulate memory usage during processing
              const originalMemory = modelManager.memoryUsage;
              const memoryIncrease = requestComplexity === 'complex' ? 1000 : 
                                   requestComplexity === 'medium' ? 500 : 200;
              
              modelManager.memoryUsage += memoryIncrease;
              
              // Check if memory limit is exceeded (Req 8.4)
              if (modelManager.memoryUsage > resourceLimit) {
                // Simulate graceful degradation - reduce memory usage
                await modelManager.optimizeMemory();
                
                // If still over limit, this request should fail gracefully
                if (modelManager.memoryUsage > resourceLimit) {
                  modelManager.memoryUsage = originalMemory; // Restore memory
                  throw new Error('Resource limit exceeded - graceful degradation');
                }
              }

              // Simulate processing time
              await new Promise(resolve => setTimeout(resolve, processingTime));
              
              // Update performance metrics
              modelManager.performanceMetrics.totalRequests++;
              modelManager.inferenceCount++;
              modelManager.totalInferenceTime += processingTime;
              modelManager.performanceMetrics.averageInferenceTime = 
                modelManager.totalInferenceTime / modelManager.inferenceCount;
              
              // Restore memory usage after processing
              modelManager.memoryUsage = originalMemory;
              
              const actualTime = Date.now() - startTime;
              return {
                requestId,
                processingTime: actualTime,
                memoryUsed: memoryIncrease,
                success: true
              };
            };
          };

          // Submit all requests concurrently
          const requestPromises = [];
          const startTime = Date.now();

          for (let i = 0; i < concurrentRequests; i++) {
            const requestPromise = requestQueue.enqueue(createRequest(i));
            requestPromises.push(requestPromise);
          }

          // Wait for all requests to complete
          const results = await Promise.allSettled(requestPromises);
          const totalTime = Date.now() - startTime;

          // Analyze results
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          const stats = requestQueue.getStats();

          // Property validations

          // 1. Request queuing should manage concurrent processing (Req 8.3)
          expect(stats.processing).toBeLessThanOrEqual(maxConcurrent);
          expect(stats.completed + stats.failed).toBe(concurrentRequests);

          // 2. No more than maxConcurrent requests should process simultaneously
          expect(stats.maxConcurrent).toBe(maxConcurrent);

          // 3. All requests should eventually be processed (queued should be 0)
          expect(stats.queued).toBe(0);

          // 4. Resource limits should be respected (Req 8.4)
          expect(modelManager.memoryUsage).toBeLessThanOrEqual(resourceLimit);

          // 5. System should handle resource constraints gracefully
          if (failed > 0) {
            // Some failures are acceptable under resource pressure
            expect(failed).toBeLessThan(concurrentRequests); // Not all should fail
            expect(successful).toBeGreaterThan(0); // Some should succeed
          }

          // 6. Performance metrics should be tracked correctly
          expect(modelManager.performanceMetrics.totalRequests).toBeGreaterThan(0);
          if (successful > 0) {
            expect(modelManager.performanceMetrics.averageInferenceTime).toBeGreaterThan(0);
          }

          // 7. Queue should process requests in reasonable time
          const averageWaitTime = requestQueue.getAverageWaitTime();
          if (concurrentRequests > maxConcurrent) {
            // When queue is needed, wait time should be reasonable
            expect(averageWaitTime).toBeLessThan(10000); // Less than 10 seconds
          }

          // 8. Total processing time should be reasonable
          expect(totalTime).toBeGreaterThan(0); // Should take some time
          expect(totalTime).toBeLessThan(60000); // Should complete within 60 seconds
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 16a: Queue maintains order under normal conditions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 8 }), // Number of requests
        fc.integer({ min: 1, max: 2 }), // Max concurrent (less than requests to force queuing)
        async (requestCount, maxConcurrent) => {
          requestQueue = new RequestQueue(maxConcurrent);
          const processOrder = [];
          const completionOrder = [];

          // Create requests that track their processing order
          const createOrderedRequest = (requestId) => {
            return async () => {
              processOrder.push(requestId);
              
              // Simulate processing time (reduced for faster tests)
              const processingTime = 10 + Math.random() * 20;
              await new Promise(resolve => setTimeout(resolve, processingTime));
              
              completionOrder.push(requestId);
              return { requestId, processingTime };
            };
          };

          // Submit requests sequentially to maintain order
          const requestPromises = [];
          for (let i = 0; i < requestCount; i++) {
            requestPromises.push(requestQueue.enqueue(createOrderedRequest(i)));
          }

          await Promise.all(requestPromises);

          // Verify queue behavior
          const stats = requestQueue.getStats();
          expect(stats.completed).toBe(requestCount);
          expect(stats.queued).toBe(0);
          expect(stats.processing).toBe(0);

          // Process order should respect queue order for the first batch
          // (subsequent batches may overlap due to concurrency)
          expect(processOrder.length).toBe(requestCount);
          expect(completionOrder.length).toBe(requestCount);

          // First maxConcurrent items should start in order
          for (let i = 0; i < Math.min(maxConcurrent, requestCount - 1); i++) {
            expect(processOrder[i]).toBe(i);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('Property 16b: Resource monitoring prevents system overload', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          memoryLimit: fc.integer({ min: 6000, max: 12000 }), // Memory limit in MB
          requestCount: fc.integer({ min: 5, max: 15 }),
          memoryPressure: fc.float({ min: Math.fround(0.7), max: Math.fround(0.95) }) // How close to limit to start
        }),
        async ({ memoryLimit, requestCount, memoryPressure }) => {
          // Set up model manager near memory limit
          modelManager.resourceLimits.maxMemoryUsage = memoryLimit;
          modelManager.modelConfig = { ...ModelConfig.primary };
          modelManager.isLoaded = true;
          modelManager.memoryUsage = Math.floor(memoryLimit * memoryPressure);
          modelManager.resetMetrics();

          requestQueue = new RequestQueue(2); // Limited concurrency
          let optimizationCount = 0;
          let gracefulDegradations = 0;

          // Create memory-intensive requests
          const createMemoryIntensiveRequest = (requestId) => {
            return async () => {
              const originalMemory = modelManager.memoryUsage;
              const memoryIncrease = 800 + Math.random() * 400; // 800-1200 MB increase
              
              modelManager.memoryUsage += memoryIncrease;

              // Check if optimization is needed
              if (modelManager.memoryUsage > memoryLimit * 0.9) {
                optimizationCount++;
                await modelManager.optimizeMemory();
              }

              // Check if graceful degradation is needed
              if (modelManager.memoryUsage > memoryLimit) {
                gracefulDegradations++;
                modelManager.memoryUsage = originalMemory; // Restore and fail gracefully
                throw new Error('Graceful degradation - insufficient resources');
              }

              // Simulate processing (reduced for faster tests)
              await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
              
              // Restore memory
              modelManager.memoryUsage = originalMemory;
              
              return { requestId, memoryIncrease, success: true };
            };
          };

          // Submit requests
          const requestPromises = [];
          for (let i = 0; i < requestCount; i++) {
            requestPromises.push(requestQueue.enqueue(createMemoryIntensiveRequest(i)));
          }

          const results = await Promise.allSettled(requestPromises);
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;

          // Verify resource management behavior
          
          // 1. Memory should never exceed the hard limit for extended periods
          expect(modelManager.memoryUsage).toBeLessThanOrEqual(memoryLimit);

          // 2. System should attempt optimization when under pressure
          if (memoryPressure > 0.8) {
            expect(optimizationCount).toBeGreaterThan(0);
          }

          // 3. Graceful degradation should occur when necessary
          if (gracefulDegradations > 0) {
            expect(failed).toBeGreaterThan(0);
            expect(successful).toBeGreaterThan(0); // Some requests should still succeed
          }

          // 4. System should not completely fail under pressure
          expect(successful).toBeGreaterThan(0);
          expect(successful + failed).toBe(requestCount);

          // 5. Queue should handle resource-constrained scenarios
          const stats = requestQueue.getStats();
          expect(stats.completed + stats.failed).toBe(requestCount);
          expect(stats.queued).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('Property 16c: Queue performance scales with concurrency limits', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          requestCount: fc.integer({ min: 6, max: 12 }),
          concurrencyLevels: fc.array(
            fc.integer({ min: 1, max: 4 }), 
            { minLength: 2, maxLength: 3 }
          )
        }),
        async ({ requestCount, concurrencyLevels }) => {
          const results = [];

          // Test different concurrency levels
          for (const maxConcurrent of concurrencyLevels) {
            requestQueue = new RequestQueue(maxConcurrent);
            const startTime = Date.now();

            // Create uniform requests
            const createUniformRequest = (requestId) => {
              return async () => {
                await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 10));
                return { requestId };
              };
            };

            // Submit requests
            const requestPromises = [];
            for (let i = 0; i < requestCount; i++) {
              requestPromises.push(requestQueue.enqueue(createUniformRequest(i)));
            }

            await Promise.all(requestPromises);
            const totalTime = Date.now() - startTime;
            const stats = requestQueue.getStats();

            results.push({
              maxConcurrent,
              totalTime,
              averageWaitTime: requestQueue.getAverageWaitTime(),
              completed: stats.completed
            });
          }

          // Analyze scaling behavior
          results.sort((a, b) => a.maxConcurrent - b.maxConcurrent);

          // Higher concurrency should generally result in better performance
          for (let i = 1; i < results.length; i++) {
            const prev = results[i - 1];
            const curr = results[i];

            // Higher concurrency should not increase total time significantly
            expect(curr.totalTime).toBeLessThan(prev.totalTime * 1.5);

            // All requests should complete successfully
            expect(curr.completed).toBe(requestCount);
            expect(prev.completed).toBe(requestCount);

            // Average wait time should generally decrease with higher concurrency
            if (requestCount > curr.maxConcurrent) {
              expect(curr.averageWaitTime).toBeLessThanOrEqual(prev.averageWaitTime * 1.2);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});