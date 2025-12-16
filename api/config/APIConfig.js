// API Configuration Management
// Handles configuration for external API services and authentication

export class APIConfig {
  constructor() {
    this.config = this.loadDefaultConfig();
    this.loadEnvironmentConfig();
  }

  /**
   * Load default API configuration
   * @returns {Object} - Default configuration
   * @private
   */
  loadDefaultConfig() {
    return {
      // Primary API service configuration
      primary: {
        baseUrl: 'https://api.contractanalysis.com/v1',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        rateLimiting: {
          minTime: 100,
          maxConcurrent: 5,
          reservoir: 100,
          reservoirRefreshAmount: 100,
          reservoirRefreshInterval: 60000
        }
      },
      
      // Fallback API service configuration
      fallback: {
        baseUrl: 'https://backup-api.contractanalysis.com/v1',
        timeout: 45000,
        retryAttempts: 2,
        retryDelay: 2000,
        rateLimiting: {
          minTime: 200,
          maxConcurrent: 3,
          reservoir: 50,
          reservoirRefreshAmount: 50,
          reservoirRefreshInterval: 60000
        }
      },

      // Authentication configuration
      authentication: {
        type: 'bearer', // 'bearer', 'api-key', 'oauth'
        headerName: 'Authorization',
        keyPrefix: 'Bearer ',
        refreshThreshold: 300000 // 5 minutes before expiry
      },

      // Request configuration
      requests: {
        defaultHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'ClearClause-AI/1.0.0'
        },
        maxRequestSize: 10485760, // 10MB
        compressionEnabled: true
      },

      // Response handling configuration
      responses: {
        validateSchema: true,
        normalizeOutput: true,
        cacheResults: false,
        cacheTTL: 3600000 // 1 hour
      },

      // Error handling configuration
      errorHandling: {
        logErrors: true,
        includeStackTrace: false,
        retryableStatusCodes: [429, 500, 502, 503, 504],
        nonRetryableStatusCodes: [400, 401, 403, 404, 422]
      },

      // Monitoring and metrics
      monitoring: {
        enableMetrics: true,
        logRequests: true,
        logResponses: false,
        performanceThresholds: {
          warning: 5000, // 5 seconds
          error: 15000   // 15 seconds
        }
      }
    };
  }

  /**
   * Load configuration from environment variables
   * @private
   */
  loadEnvironmentConfig() {
    // Override with environment variables if present
    if (process.env.FALLBACK_API_URL) {
      this.config.primary.baseUrl = process.env.FALLBACK_API_URL;
    }
    
    if (process.env.FALLBACK_API_BACKUP_URL) {
      this.config.fallback.baseUrl = process.env.FALLBACK_API_BACKUP_URL;
    }
    
    if (process.env.API_TIMEOUT) {
      const timeout = parseInt(process.env.API_TIMEOUT);
      if (!isNaN(timeout)) {
        this.config.primary.timeout = timeout;
        this.config.fallback.timeout = timeout + 15000; // Add 15s for fallback
      }
    }
    
    if (process.env.API_RETRY_ATTEMPTS) {
      const retries = parseInt(process.env.API_RETRY_ATTEMPTS);
      if (!isNaN(retries)) {
        this.config.primary.retryAttempts = retries;
        this.config.fallback.retryAttempts = Math.max(1, retries - 1);
      }
    }
    
    if (process.env.API_RATE_LIMIT_RPM) {
      const rpm = parseInt(process.env.API_RATE_LIMIT_RPM);
      if (!isNaN(rpm)) {
        this.config.primary.rateLimiting.reservoir = rpm;
        this.config.primary.rateLimiting.reservoirRefreshAmount = rpm;
      }
    }
    
    // Monitoring configuration
    if (process.env.API_ENABLE_METRICS === 'false') {
      this.config.monitoring.enableMetrics = false;
    }
    
    if (process.env.API_LOG_REQUESTS === 'false') {
      this.config.monitoring.logRequests = false;
    }
  }

  /**
   * Get configuration for specific service
   * @param {string} service - Service name ('primary' or 'fallback')
   * @returns {Object} - Service configuration
   */
  getServiceConfig(service = 'primary') {
    const serviceConfig = this.config[service];
    if (!serviceConfig) {
      throw new Error(`Unknown service configuration: ${service}`);
    }
    
    return {
      ...serviceConfig,
      apiKey: this.getApiKey(service),
      ...this.config.authentication,
      ...this.config.requests,
      ...this.config.responses,
      ...this.config.errorHandling,
      ...this.config.monitoring
    };
  }

  /**
   * Get API key for specific service
   * @param {string} service - Service name
   * @returns {string|null} - API key
   * @private
   */
  getApiKey(service) {
    const envKey = service === 'primary' ? 'FALLBACK_API_KEY' : 'FALLBACK_API_BACKUP_KEY';
    return process.env[envKey] || null;
  }

  /**
   * Update configuration at runtime
   * @param {string} service - Service name
   * @param {Object} updates - Configuration updates
   */
  updateServiceConfig(service, updates) {
    if (!this.config[service]) {
      throw new Error(`Unknown service: ${service}`);
    }
    
    this.config[service] = {
      ...this.config[service],
      ...updates
    };
  }

  /**
   * Validate configuration
   * @param {string} service - Service to validate
   * @returns {Object} - Validation results
   */
  validateConfig(service = 'primary') {
    const config = this.config[service];
    const issues = [];
    
    // Check required fields
    if (!config.baseUrl) {
      issues.push(`Missing baseUrl for ${service} service`);
    }
    
    if (!this.getApiKey(service)) {
      issues.push(`Missing API key for ${service} service`);
    }
    
    // Validate URL format
    if (config.baseUrl) {
      try {
        new URL(config.baseUrl);
      } catch (error) {
        issues.push(`Invalid baseUrl format for ${service} service: ${config.baseUrl}`);
      }
    }
    
    // Validate numeric values
    if (config.timeout && (config.timeout < 1000 || config.timeout > 300000)) {
      issues.push(`Invalid timeout for ${service} service: should be between 1000-300000ms`);
    }
    
    if (config.retryAttempts && (config.retryAttempts < 0 || config.retryAttempts > 10)) {
      issues.push(`Invalid retryAttempts for ${service} service: should be between 0-10`);
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      service: service
    };
  }

  /**
   * Get all configuration
   * @returns {Object} - Complete configuration
   */
  getAllConfig() {
    return { ...this.config };
  }

  /**
   * Reset configuration to defaults
   * @param {string} service - Service to reset (optional)
   */
  resetConfig(service = null) {
    if (service) {
      const defaultConfig = this.loadDefaultConfig();
      this.config[service] = defaultConfig[service];
    } else {
      this.config = this.loadDefaultConfig();
      this.loadEnvironmentConfig();
    }
  }

  /**
   * Export configuration for external use
   * @param {string} service - Service to export
   * @returns {Object} - Exportable configuration (without sensitive data)
   */
  exportConfig(service = 'primary') {
    const config = this.getServiceConfig(service);
    
    // Remove sensitive information
    const exported = { ...config };
    delete exported.apiKey;
    
    return exported;
  }
}

// Singleton instance
export const apiConfig = new APIConfig();

export default APIConfig;