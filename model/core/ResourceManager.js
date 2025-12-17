// Resource management system for AI contract analysis
// Handles memory optimization, resource limits, and graceful degradation

import winston from 'winston';
import { RequestQueue, PerformanceMonitor } from './PerformanceMonitor.js';

// Configure logger for resource management
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'resource-manager.log' })
  ]
});

/**
 * Resource manager for coordinating system resources and performance
 */
export class ResourceManager {
  constructor(options = {}) {
    this.options = {
      maxMemoryUsage: options.maxMemoryUsage || 16000, // MB
      maxConcurrentRequests: options.maxConcurrentRequests || 3,
      maxProcessingTime: options.maxProcessingTime || 30000, // ms
      memoryOptimizationThreshold: options.memoryOptimizationThreshold || 0.8,
      gracefulDegradationThreshold: options.gracefulDegradationThreshold || 0.9,
      monitoringInterval: options.monitoringInterval || 5000, // ms
      ...options
    };

    // Initialize components
    this.requestQueue = new RequestQueue(this.options.maxConcurrentRequests);
    this.performanceMonitor = new PerformanceMonitor({
      maxMemoryUsage: this.options.maxMemoryUsage,
      maxProcessingTime: this.options.maxProcessingTime,
      monitoringInterval: this.options.monitoringInterval
    });

    // Resource tracking
    this.currentMemoryUsage = 0;
    this.resourceLimits = {
      maxMemoryUsage: this.options.maxMemoryUsage,
      maxProcessingTime: this.options.maxProcessingTime
    };

    // State tracking
    this.isOptimizing = false;
    this.isDegraded = false;
    this.lastOptimization = null;
    
    // Registered model managers for resource coordination
    this.modelManagers = new Set();
  }

  /**
   * Start resource monitoring and management
   */
  start() {
    this.performanceMonitor.startMonitoring();
    
    logger.info('Resource manager started', {
      maxMemoryUsage: this.options.maxMemoryUsage,
      maxConcurrentRequests: this.options.maxConcurrentRequests,
      maxProcessingTime: this.options.maxProcessingTime
    });
  }

  /**
   * Stop resource monitoring and management
   */
  stop() {
    this.performanceMonitor.stopMonitoring();
    
    logger.info('Resource manager stopped');
  }

  /**
   * Register a model manager for resource coordination
   * @param {ModelManager} modelManager - Model manager instance
   */
  registerModelManager(modelManager) {
    this.modelManagers.add(modelManager);
    
    logger.debug('Model manager registered', {
      managersCount: this.modelManagers.size
    });
  }

  /**
   * Unregister a model manager
   * @param {ModelManager} modelManager - Model manager instance
   */
  unregisterModelManager(modelManager) {
    this.modelManagers.delete(modelManager);
    
    logger.debug('Model manager unregistered', {
      managersCount: this.modelManagers.size
    });
  }

  /**
   * Process a request with resource management
   * @param {Function} requestHandler - Async function to execute
   * @param {Object} options - Processing options
   * @returns {Promise} - Processing result
   */
  async processRequest(requestHandler, options = {}) {
    const requestId = Math.random().toString(36).substr(2, 9);
    const request = this.performanceMonitor.recordRequestStart(requestId);

    try {
      // Check if system is under resource pressure
      await this.checkResourcePressure();

      // Queue the request for processing
      const result = await this.requestQueue.enqueue(async () => {
        // Monitor memory usage during processing
        const initialMemory = this.getCurrentMemoryUsage();
        
        try {
          const result = await requestHandler();
          
          // Check for memory leaks or excessive usage
          const finalMemory = this.getCurrentMemoryUsage();
          const memoryIncrease = finalMemory - initialMemory;
          
          if (memoryIncrease > 1000) { // More than 1GB increase
            logger.warn('High memory usage detected during request', {
              requestId,
              memoryIncrease,
              initialMemory,
              finalMemory
            });
          }
          
          return result;
        } catch (error) {
          // Ensure cleanup on error
          await this.optimizeResources();
          throw error;
        }
      });

      this.performanceMonitor.recordRequestEnd(request, true);
      return result;

    } catch (error) {
      this.performanceMonitor.recordRequestEnd(request, false);
      
      logger.error('Request processing failed', {
        requestId,
        error: error.message,
        duration: request.duration
      });
      
      throw error;
    }
  }

  /**
   * Check for resource pressure and take action if needed
   * @private
   */
  async checkResourcePressure() {
    const memoryUsage = this.getCurrentMemoryUsage();
    const memoryUtilization = memoryUsage / this.resourceLimits.maxMemoryUsage;

    // Trigger optimization if memory usage is high
    if (memoryUtilization > this.options.memoryOptimizationThreshold) {
      logger.info('Memory optimization triggered', {
        memoryUsage,
        memoryUtilization,
        threshold: this.options.memoryOptimizationThreshold
      });
      
      await this.optimizeResources();
    }

    // Trigger graceful degradation if memory usage is critical
    if (memoryUtilization > this.options.gracefulDegradationThreshold) {
      logger.warn('Graceful degradation triggered', {
        memoryUsage,
        memoryUtilization,
        threshold: this.options.gracefulDegradationThreshold
      });
      
      await this.enableGracefulDegradation();
    }
  }

  /**
   * Optimize system resources
   */
  async optimizeResources() {
    if (this.isOptimizing) {
      return; // Already optimizing
    }

    this.isOptimizing = true;
    const startTime = Date.now();

    try {
      logger.info('Starting resource optimization');

      // Optimize all registered model managers
      const optimizationPromises = Array.from(this.modelManagers).map(async (modelManager) => {
        try {
          await modelManager.optimizeMemory();
        } catch (error) {
          logger.error('Model manager optimization failed', {
            error: error.message
          });
        }
      });

      await Promise.all(optimizationPromises);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Clear request queue history to free memory
      this.requestQueue.clearHistory();

      const optimizationTime = Date.now() - startTime;
      this.lastOptimization = Date.now();

      logger.info('Resource optimization completed', {
        optimizationTime,
        memoryUsage: this.getCurrentMemoryUsage()
      });

    } catch (error) {
      logger.error('Resource optimization failed', {
        error: error.message
      });
    } finally {
      this.isOptimizing = false;
    }
  }

  /**
   * Enable graceful degradation mode
   * @private
   */
  async enableGracefulDegradation() {
    if (this.isDegraded) {
      return; // Already in degraded mode
    }

    this.isDegraded = true;

    logger.warn('Enabling graceful degradation mode');

    // Reduce concurrent request limit
    const reducedConcurrency = Math.max(1, Math.floor(this.options.maxConcurrentRequests / 2));
    this.requestQueue.setMaxConcurrent(reducedConcurrency);

    // Optimize resources aggressively
    await this.optimizeResources();

    // Set a timer to check if we can exit degraded mode
    setTimeout(() => {
      this.checkDegradationRecovery();
    }, 30000); // Check after 30 seconds
  }

  /**
   * Check if system can recover from graceful degradation
   * @private
   */
  checkDegradationRecovery() {
    const memoryUsage = this.getCurrentMemoryUsage();
    const memoryUtilization = memoryUsage / this.resourceLimits.maxMemoryUsage;

    if (memoryUtilization < this.options.memoryOptimizationThreshold) {
      this.disableGracefulDegradation();
    } else {
      // Check again later
      setTimeout(() => {
        this.checkDegradationRecovery();
      }, 30000);
    }
  }

  /**
   * Disable graceful degradation mode
   * @private
   */
  disableGracefulDegradation() {
    if (!this.isDegraded) {
      return;
    }

    this.isDegraded = false;

    logger.info('Disabling graceful degradation mode');

    // Restore normal concurrent request limit
    this.requestQueue.setMaxConcurrent(this.options.maxConcurrentRequests);
  }

  /**
   * Get current memory usage from all registered model managers
   * @returns {number} - Total memory usage in MB
   */
  getCurrentMemoryUsage() {
    let totalMemory = 0;

    for (const modelManager of this.modelManagers) {
      totalMemory += modelManager.memoryUsage || 0;
    }

    this.currentMemoryUsage = totalMemory;
    return totalMemory;
  }

  /**
   * Get resource manager status
   * @returns {Object} - Current status
   */
  getStatus() {
    const memoryUsage = this.getCurrentMemoryUsage();
    const queueStats = this.requestQueue.getStats();
    const performanceMetrics = this.performanceMonitor.getMetrics();

    return {
      memoryUsage,
      memoryUtilization: memoryUsage / this.resourceLimits.maxMemoryUsage,
      resourceLimits: { ...this.resourceLimits },
      isOptimizing: this.isOptimizing,
      isDegraded: this.isDegraded,
      lastOptimization: this.lastOptimization,
      queue: queueStats,
      performance: performanceMetrics,
      registeredManagers: this.modelManagers.size
    };
  }

  /**
   * Get performance summary
   * @returns {Object} - Performance summary
   */
  getPerformanceSummary() {
    return this.performanceMonitor.getSummary();
  }

  /**
   * Check if system is healthy
   * @returns {boolean} - System health status
   */
  isHealthy() {
    const memoryUsage = this.getCurrentMemoryUsage();
    const memoryUtilization = memoryUsage / this.resourceLimits.maxMemoryUsage;
    const performanceHealthy = this.performanceMonitor.isSystemHealthy();

    return (
      memoryUtilization < this.options.gracefulDegradationThreshold &&
      performanceHealthy &&
      !this.isDegraded
    );
  }

  /**
   * Update resource limits
   * @param {Object} newLimits - New resource limits
   */
  updateResourceLimits(newLimits) {
    const oldLimits = { ...this.resourceLimits };
    
    if (newLimits.maxMemoryUsage) {
      this.resourceLimits.maxMemoryUsage = newLimits.maxMemoryUsage;
      this.options.maxMemoryUsage = newLimits.maxMemoryUsage;
    }
    
    if (newLimits.maxProcessingTime) {
      this.resourceLimits.maxProcessingTime = newLimits.maxProcessingTime;
      this.options.maxProcessingTime = newLimits.maxProcessingTime;
    }
    
    if (newLimits.maxConcurrentRequests) {
      this.options.maxConcurrentRequests = newLimits.maxConcurrentRequests;
      if (!this.isDegraded) {
        this.requestQueue.setMaxConcurrent(newLimits.maxConcurrentRequests);
      }
    }

    logger.info('Resource limits updated', {
      oldLimits,
      newLimits: this.resourceLimits
    });
  }
}

export default ResourceManager;