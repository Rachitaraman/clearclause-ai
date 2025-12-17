// Performance monitoring and optimization system for AI contract analysis
// Provides request queuing, resource management, and performance tracking

import winston from 'winston';

// Configure logger for performance monitoring
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'performance-monitor.log' })
  ]
});

/**
 * Request queue implementation for managing concurrent processing
 */
export class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.processing = new Set();
    this.maxConcurrent = maxConcurrent;
    this.completed = [];
    this.failed = [];
    this.metrics = {
      totalRequests: 0,
      completedRequests: 0,
      failedRequests: 0,
      averageWaitTime: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Enqueue a request for processing
   * @param {Function} request - Async function to execute
   * @returns {Promise} - Promise that resolves when request completes
   */
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
      this.metrics.totalRequests++;
      
      logger.debug('Request enqueued', {
        requestId: queueItem.id,
        queueLength: this.queue.length,
        processing: this.processing.size
      });
      
      this.processNext();
    });
  }

  /**
   * Process the next item in the queue
   * @private
   */
  async processNext() {
    if (this.processing.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    this.processing.add(item);
    item.startedAt = Date.now();

    logger.debug('Processing request', {
      requestId: item.id,
      waitTime: item.startedAt - item.enqueuedAt,
      processing: this.processing.size
    });

    try {
      const result = await item.request();
      item.completedAt = Date.now();
      
      this.processing.delete(item);
      this.completed.push(item);
      this.metrics.completedRequests++;
      
      // Update metrics
      this.updateMetrics();
      
      logger.debug('Request completed successfully', {
        requestId: item.id,
        processingTime: item.completedAt - item.startedAt,
        totalTime: item.completedAt - item.enqueuedAt
      });
      
      item.resolve(result);
    } catch (error) {
      item.completedAt = Date.now();
      
      this.processing.delete(item);
      this.failed.push(item);
      this.metrics.failedRequests++;
      
      this.updateMetrics();
      
      logger.error('Request failed', {
        requestId: item.id,
        error: error.message,
        processingTime: item.completedAt - item.startedAt
      });
      
      item.reject(error);
    }

    // Process next item in queue
    this.processNext();
  }

  /**
   * Update performance metrics
   * @private
   */
  updateMetrics() {
    const completedItems = [...this.completed, ...this.failed];
    
    if (completedItems.length > 0) {
      // Calculate average wait time
      const totalWaitTime = completedItems.reduce((sum, item) => {
        return sum + (item.startedAt - item.enqueuedAt);
      }, 0);
      this.metrics.averageWaitTime = totalWaitTime / completedItems.length;
      
      // Calculate average processing time
      const totalProcessingTime = completedItems.reduce((sum, item) => {
        return sum + (item.completedAt - item.startedAt);
      }, 0);
      this.metrics.averageProcessingTime = totalProcessingTime / completedItems.length;
    }
  }

  /**
   * Get current queue statistics
   * @returns {Object} - Queue statistics
   */
  getStats() {
    return {
      queued: this.queue.length,
      processing: this.processing.size,
      completed: this.completed.length,
      failed: this.failed.length,
      maxConcurrent: this.maxConcurrent,
      metrics: { ...this.metrics }
    };
  }

  /**
   * Get average wait time for completed requests
   * @returns {number} - Average wait time in milliseconds
   */
  getAverageWaitTime() {
    return this.metrics.averageWaitTime;
  }

  /**
   * Clear completed and failed request history
   */
  clearHistory() {
    this.completed = [];
    this.failed = [];
    this.metrics = {
      totalRequests: this.queue.length + this.processing.size,
      completedRequests: 0,
      failedRequests: 0,
      averageWaitTime: 0,
      averageProcessingTime: 0
    };
    
    logger.info('Request queue history cleared');
  }

  /**
   * Update concurrency limit
   * @param {number} newLimit - New maximum concurrent requests
   */
  setMaxConcurrent(newLimit) {
    const oldLimit = this.maxConcurrent;
    this.maxConcurrent = Math.max(1, newLimit);
    
    logger.info('Concurrency limit updated', {
      oldLimit,
      newLimit: this.maxConcurrent
    });
    
    // Process more items if limit was increased
    if (this.maxConcurrent > oldLimit) {
      this.processNext();
    }
  }
}

/**
 * Performance monitor for tracking system performance and resource usage
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      maxMemoryUsage: options.maxMemoryUsage || 16000, // MB
      maxProcessingTime: options.maxProcessingTime || 30000, // ms
      monitoringInterval: options.monitoringInterval || 5000, // ms
      alertThresholds: {
        memoryUsage: options.memoryThreshold || 0.8,
        processingTime: options.processingTimeThreshold || 0.8,
        errorRate: options.errorRateThreshold || 0.1
      },
      ...options
    };

    this.metrics = {
      requests: {
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: 0
      },
      performance: {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        throughput: 0,
        errorRate: 0
      },
      resources: {
        memoryUsage: 0,
        cpuUsage: 0,
        activeConnections: 0
      },
      timestamps: {
        startTime: Date.now(),
        lastUpdate: Date.now()
      }
    };

    this.responseTimes = [];
    this.monitoringTimer = null;
    this.isMonitoring = false;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.metrics.timestamps.startTime = Date.now();
    
    this.monitoringTimer = setInterval(() => {
      this.updateMetrics();
      this.checkAlerts();
    }, this.options.monitoringInterval);

    logger.info('Performance monitoring started', {
      interval: this.options.monitoringInterval,
      thresholds: this.options.alertThresholds
    });
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }

    logger.info('Performance monitoring stopped');
  }

  /**
   * Record a request start
   * @param {string} requestId - Unique request identifier
   * @returns {Object} - Request tracking object
   */
  recordRequestStart(requestId) {
    const request = {
      id: requestId,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      success: null
    };

    this.metrics.requests.total++;
    this.metrics.requests.inProgress++;

    logger.debug('Request started', { requestId, startTime: request.startTime });

    return request;
  }

  /**
   * Record a request completion
   * @param {Object} request - Request tracking object
   * @param {boolean} success - Whether request was successful
   */
  recordRequestEnd(request, success = true) {
    request.endTime = Date.now();
    request.duration = request.endTime - request.startTime;
    request.success = success;

    this.metrics.requests.inProgress--;
    
    if (success) {
      this.metrics.requests.completed++;
    } else {
      this.metrics.requests.failed++;
    }

    // Track response times for percentile calculations
    this.responseTimes.push(request.duration);
    
    // Keep only recent response times (last 1000 requests)
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    logger.debug('Request completed', {
      requestId: request.id,
      duration: request.duration,
      success
    });

    this.updatePerformanceMetrics();
  }

  /**
   * Update performance metrics
   * @private
   */
  updatePerformanceMetrics() {
    if (this.responseTimes.length === 0) {
      return;
    }

    // Calculate average response time
    const totalTime = this.responseTimes.reduce((sum, time) => sum + time, 0);
    this.metrics.performance.averageResponseTime = totalTime / this.responseTimes.length;

    // Calculate 95th percentile response time
    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    this.metrics.performance.p95ResponseTime = sortedTimes[p95Index] || 0;

    // Calculate error rate
    this.metrics.performance.errorRate = 
      this.metrics.requests.total > 0 
        ? this.metrics.requests.failed / this.metrics.requests.total 
        : 0;

    // Calculate throughput (requests per second)
    const uptime = (Date.now() - this.metrics.timestamps.startTime) / 1000;
    this.metrics.performance.throughput = 
      uptime > 0 ? this.metrics.requests.completed / uptime : 0;

    this.metrics.timestamps.lastUpdate = Date.now();
  }

  /**
   * Update system resource metrics
   * @private
   */
  updateMetrics() {
    // Update resource metrics (simplified for this implementation)
    this.metrics.resources.activeConnections = this.metrics.requests.inProgress;
    
    // In a real implementation, you would gather actual system metrics here
    // For now, we'll use placeholder values
    this.updatePerformanceMetrics();
  }

  /**
   * Check for performance alerts
   * @private
   */
  checkAlerts() {
    const { alertThresholds } = this.options;
    const { performance, resources } = this.metrics;

    // Check error rate
    if (performance.errorRate > alertThresholds.errorRate) {
      logger.warn('High error rate detected', {
        errorRate: performance.errorRate,
        threshold: alertThresholds.errorRate
      });
    }

    // Check response time
    const responseTimeRatio = performance.averageResponseTime / this.options.maxProcessingTime;
    if (responseTimeRatio > alertThresholds.processingTime) {
      logger.warn('High response time detected', {
        averageResponseTime: performance.averageResponseTime,
        threshold: this.options.maxProcessingTime * alertThresholds.processingTime
      });
    }
  }

  /**
   * Get current performance metrics
   * @returns {Object} - Current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.timestamps.startTime,
      isMonitoring: this.isMonitoring
    };
  }

  /**
   * Reset all metrics
   */
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: 0
      },
      performance: {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        throughput: 0,
        errorRate: 0
      },
      resources: {
        memoryUsage: 0,
        cpuUsage: 0,
        activeConnections: 0
      },
      timestamps: {
        startTime: Date.now(),
        lastUpdate: Date.now()
      }
    };

    this.responseTimes = [];
    
    logger.info('Performance metrics reset');
  }

  /**
   * Get performance summary
   * @returns {Object} - Performance summary
   */
  getSummary() {
    const uptime = Date.now() - this.metrics.timestamps.startTime;
    
    return {
      uptime: uptime,
      totalRequests: this.metrics.requests.total,
      successRate: this.metrics.requests.total > 0 
        ? (this.metrics.requests.completed / this.metrics.requests.total) 
        : 0,
      averageResponseTime: this.metrics.performance.averageResponseTime,
      throughput: this.metrics.performance.throughput,
      currentLoad: this.metrics.requests.inProgress,
      isHealthy: this.isSystemHealthy()
    };
  }

  /**
   * Check if system is healthy based on current metrics
   * @returns {boolean} - System health status
   */
  isSystemHealthy() {
    const { performance } = this.metrics;
    const { alertThresholds } = this.options;

    return (
      performance.errorRate <= alertThresholds.errorRate &&
      performance.averageResponseTime <= this.options.maxProcessingTime * alertThresholds.processingTime
    );
  }
}

export default { RequestQueue, PerformanceMonitor };