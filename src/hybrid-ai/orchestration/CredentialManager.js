/**
 * Credential Manager for Hybrid AWS-Gemini AI System
 * Manages authentication and validation for both AWS and Google AI platforms
 */

import { validators } from '../types/index.js';

export class CredentialManager {
  constructor() {
    this.awsCredentials = null;
    this.geminiCredentials = null;
    this.validationCache = new Map();
    this.lastValidation = null;
  }

  /**
   * Initialize credentials from environment variables
   * @returns {Promise<boolean>} - True if initialization successful
   */
  async initialize() {
    try {
      // Load AWS credentials
      this.awsCredentials = {
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY,
        region: process.env.VITE_AWS_REGION,
        s3Bucket: process.env.VITE_S3_BUCKET,
        textractLambda: process.env.VITE_TEXTRACT_LAMBDA,
        urlLambda: process.env.VITE_URL_LAMBDA
      };

      // Load Gemini credentials
      this.geminiCredentials = {
        apiKey: process.env.VITE_GOOGLE_AI_API_KEY,
        model: process.env.VITE_GEMINI_MODEL,
        endpoint: process.env.VITE_GEMINI_ENDPOINT,
        maxTokens: parseInt(process.env.VITE_GEMINI_MAX_TOKENS) || 50000,
        temperature: parseFloat(process.env.VITE_GEMINI_TEMPERATURE) || 0.7
      };

      // Validate both credential sets
      const awsValid = await this.validateAWSCredentials();
      const geminiValid = await this.validateGeminiCredentials();

      this.lastValidation = new Date();
      return awsValid && geminiValid;
    } catch (error) {
      console.error('Credential initialization failed:', error);
      return false;
    }
  }

  /**
   * Validate AWS credentials and configuration
   * @returns {Promise<boolean>} - True if AWS credentials are valid
   */
  async validateAWSCredentials() {
    try {
      if (!this.awsCredentials) {
        throw new Error('AWS credentials not loaded');
      }

      // Check required AWS fields
      const requiredFields = ['accessKeyId', 'secretAccessKey', 'region', 's3Bucket'];
      const missingFields = requiredFields.filter(field => !this.awsCredentials[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing AWS configuration: ${missingFields.join(', ')}`);
      }

      // Validate credential format
      if (this.awsCredentials.accessKeyId.length < 16) {
        throw new Error('Invalid AWS Access Key ID format');
      }

      if (this.awsCredentials.secretAccessKey.length < 32) {
        throw new Error('Invalid AWS Secret Access Key format');
      }

      // Validate region format
      const regionPattern = /^[a-z]{2}-[a-z]+-\d{1}$/;
      if (!regionPattern.test(this.awsCredentials.region)) {
        throw new Error('Invalid AWS region format');
      }

      // Cache validation result
      this.validationCache.set('aws', {
        valid: true,
        timestamp: new Date(),
        credentials: { ...this.awsCredentials, secretAccessKey: '[REDACTED]' }
      });

      return true;
    } catch (error) {
      this.validationCache.set('aws', {
        valid: false,
        timestamp: new Date(),
        error: error.message
      });
      console.error('AWS credential validation failed:', error.message);
      return false;
    }
  }

  /**
   * Validate Google AI (Gemini) credentials and configuration
   * @returns {Promise<boolean>} - True if Gemini credentials are valid
   */
  async validateGeminiCredentials() {
    try {
      if (!this.geminiCredentials) {
        throw new Error('Gemini credentials not loaded');
      }

      // Check required Gemini fields
      const requiredFields = ['apiKey', 'model', 'endpoint'];
      const missingFields = requiredFields.filter(field => !this.geminiCredentials[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing Gemini configuration: ${missingFields.join(', ')}`);
      }

      // Validate API key format
      if (this.geminiCredentials.apiKey.length < 32) {
        throw new Error('Invalid Gemini API key format');
      }

      // Validate model name
      const validModels = ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
      if (!validModels.includes(this.geminiCredentials.model)) {
        throw new Error(`Invalid Gemini model: ${this.geminiCredentials.model}`);
      }

      // Validate endpoint URL
      try {
        new URL(this.geminiCredentials.endpoint);
      } catch {
        throw new Error('Invalid Gemini endpoint URL');
      }

      // Validate numeric parameters
      if (this.geminiCredentials.maxTokens < 1000 || this.geminiCredentials.maxTokens > 100000) {
        throw new Error('Invalid Gemini maxTokens value (must be between 1000-100000)');
      }

      if (this.geminiCredentials.temperature < 0 || this.geminiCredentials.temperature > 2) {
        throw new Error('Invalid Gemini temperature value (must be between 0-2)');
      }

      // Cache validation result
      this.validationCache.set('gemini', {
        valid: true,
        timestamp: new Date(),
        credentials: { ...this.geminiCredentials, apiKey: '[REDACTED]' }
      });

      return true;
    } catch (error) {
      this.validationCache.set('gemini', {
        valid: false,
        timestamp: new Date(),
        error: error.message
      });
      console.error('Gemini credential validation failed:', error.message);
      return false;
    }
  }

  /**
   * Get AWS credentials for use in AWS SDK
   * @returns {Object} - AWS credentials object
   */
  getAWSCredentials() {
    if (!this.isAWSValid()) {
      throw new Error('AWS credentials are not valid');
    }
    return { ...this.awsCredentials };
  }

  /**
   * Get Gemini credentials for use in Gemini API
   * @returns {Object} - Gemini credentials object
   */
  getGeminiCredentials() {
    if (!this.isGeminiValid()) {
      throw new Error('Gemini credentials are not valid');
    }
    return { ...this.geminiCredentials };
  }

  /**
   * Check if AWS credentials are currently valid
   * @returns {boolean} - True if AWS credentials are valid
   */
  isAWSValid() {
    const cached = this.validationCache.get('aws');
    return cached && cached.valid;
  }

  /**
   * Check if Gemini credentials are currently valid
   * @returns {boolean} - True if Gemini credentials are valid
   */
  isGeminiValid() {
    const cached = this.validationCache.get('gemini');
    return cached && cached.valid;
  }

  /**
   * Check if both platforms have valid credentials
   * @returns {boolean} - True if both AWS and Gemini credentials are valid
   */
  areBothPlatformsValid() {
    return this.isAWSValid() && this.isGeminiValid();
  }

  /**
   * Get validation status for both platforms
   * @returns {Object} - Validation status object
   */
  getValidationStatus() {
    return {
      aws: this.validationCache.get('aws') || { valid: false, error: 'Not validated' },
      gemini: this.validationCache.get('gemini') || { valid: false, error: 'Not validated' },
      lastValidation: this.lastValidation,
      bothValid: this.areBothPlatformsValid()
    };
  }

  /**
   * Update credentials without system restart
   * @param {string} platform - 'aws' or 'gemini'
   * @param {Object} newCredentials - New credential object
   * @returns {Promise<boolean>} - True if update successful
   */
  async updateCredentials(platform, newCredentials) {
    try {
      if (platform === 'aws') {
        this.awsCredentials = { ...this.awsCredentials, ...newCredentials };
        return await this.validateAWSCredentials();
      } else if (platform === 'gemini') {
        this.geminiCredentials = { ...this.geminiCredentials, ...newCredentials };
        return await this.validateGeminiCredentials();
      } else {
        throw new Error(`Invalid platform: ${platform}`);
      }
    } catch (error) {
      console.error(`Credential update failed for ${platform}:`, error.message);
      return false;
    }
  }

  /**
   * Get specific error messages for each platform
   * @returns {Object} - Error messages object
   */
  getErrorMessages() {
    const awsCached = this.validationCache.get('aws');
    const geminiCached = this.validationCache.get('gemini');

    return {
      aws: awsCached && !awsCached.valid ? awsCached.error : null,
      gemini: geminiCached && !geminiCached.valid ? geminiCached.error : null
    };
  }

  /**
   * Clear validation cache and force re-validation
   * @returns {Promise<boolean>} - True if re-validation successful
   */
  async revalidate() {
    this.validationCache.clear();
    return await this.initialize();
  }
}