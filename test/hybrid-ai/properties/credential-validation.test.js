/**
 * Property-based tests for dual credential validation
 * **Feature: hybrid-aws-gemini-model, Property 4: Dual credential validation**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { awsConfigArb, geminiConfigArb, configurationArb } from '../generators.js';
import { CredentialManager } from '../../../src/hybrid-ai/orchestration/CredentialManager.js';

describe('Dual Credential Validation Properties', () => {
  let credentialManager;

  beforeEach(() => {
    credentialManager = new CredentialManager();
    vi.clearAllMocks();
  });

  /**
   * Property 4: Dual credential validation
   * For any system initialization, both AWS and Google AI credentials should be validated 
   * before the system becomes operational
   * **Validates: Requirements 1.4**
   */
  it('should validate both AWS and Gemini credentials before system becomes operational', () => {
    fc.assert(fc.property(
      configurationArb,
      async (config) => {
        // Arrange - Set up environment variables with generated config
        const originalEnv = { ...process.env };
        
        process.env.VITE_AWS_ACCESS_KEY_ID = config.aws.accessKeyId;
        process.env.VITE_AWS_SECRET_ACCESS_KEY = config.aws.secretAccessKey;
        process.env.VITE_AWS_REGION = config.aws.region;
        process.env.VITE_S3_BUCKET = config.aws.s3Bucket;
        process.env.VITE_TEXTRACT_LAMBDA = config.aws.textractLambda;
        process.env.VITE_URL_LAMBDA = config.aws.urlLambda;
        process.env.VITE_GOOGLE_AI_API_KEY = config.gemini.apiKey;
        process.env.VITE_GEMINI_MODEL = config.gemini.model;
        process.env.VITE_GEMINI_ENDPOINT = config.gemini.endpoint;
        process.env.VITE_GEMINI_MAX_TOKENS = config.gemini.maxTokens.toString();
        process.env.VITE_GEMINI_TEMPERATURE = config.gemini.temperature.toString();

        try {
          // Act - Initialize credential manager
          const initResult = await credentialManager.initialize();
          
          // Assert - Both platforms should be validated
          const validationStatus = credentialManager.getValidationStatus();
          
          expect(validationStatus.aws).toBeDefined();
          expect(validationStatus.gemini).toBeDefined();
          expect(validationStatus.lastValidation).toBeInstanceOf(Date);
          
          // If initialization succeeded, both should be valid
          if (initResult) {
            expect(validationStatus.aws.valid).toBe(true);
            expect(validationStatus.gemini.valid).toBe(true);
            expect(validationStatus.bothValid).toBe(true);
            expect(credentialManager.areBothPlatformsValid()).toBe(true);
          }
          
          // Verify individual platform validation methods were called
          expect(credentialManager.isAWSValid()).toBe(validationStatus.aws.valid);
          expect(credentialManager.isGeminiValid()).toBe(validationStatus.gemini.valid);
          
        } finally {
          // Cleanup - Restore original environment
          process.env = originalEnv;
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: AWS credential validation consistency
   * For any valid AWS configuration, validation should consistently return true
   */
  it('should consistently validate valid AWS credentials', () => {
    fc.assert(fc.property(
      awsConfigArb,
      async (awsConfig) => {
        // Arrange
        const originalEnv = { ...process.env };
        
        process.env.VITE_AWS_ACCESS_KEY_ID = awsConfig.accessKeyId;
        process.env.VITE_AWS_SECRET_ACCESS_KEY = awsConfig.secretAccessKey;
        process.env.VITE_AWS_REGION = awsConfig.region;
        process.env.VITE_S3_BUCKET = awsConfig.s3Bucket;
        process.env.VITE_TEXTRACT_LAMBDA = awsConfig.textractLambda;
        process.env.VITE_URL_LAMBDA = awsConfig.urlLambda;

        try {
          // Set up credentials
          credentialManager.awsCredentials = awsConfig;
          
          // Act - Validate multiple times
          const validation1 = await credentialManager.validateAWSCredentials();
          const validation2 = await credentialManager.validateAWSCredentials();
          const validation3 = await credentialManager.validateAWSCredentials();
          
          // Assert - Results should be consistent
          expect(validation1).toBe(validation2);
          expect(validation2).toBe(validation3);
          
          // Validation status should be consistent
          const status1 = credentialManager.isAWSValid();
          const status2 = credentialManager.isAWSValid();
          expect(status1).toBe(status2);
          
        } finally {
          process.env = originalEnv;
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Gemini credential validation consistency
   * For any valid Gemini configuration, validation should consistently return true
   */
  it('should consistently validate valid Gemini credentials', () => {
    fc.assert(fc.property(
      geminiConfigArb,
      async (geminiConfig) => {
        // Arrange
        const originalEnv = { ...process.env };
        
        process.env.VITE_GOOGLE_AI_API_KEY = geminiConfig.apiKey;
        process.env.VITE_GEMINI_MODEL = geminiConfig.model;
        process.env.VITE_GEMINI_ENDPOINT = geminiConfig.endpoint;
        process.env.VITE_GEMINI_MAX_TOKENS = geminiConfig.maxTokens.toString();
        process.env.VITE_GEMINI_TEMPERATURE = geminiConfig.temperature.toString();

        try {
          // Set up credentials
          credentialManager.geminiCredentials = geminiConfig;
          
          // Act - Validate multiple times
          const validation1 = await credentialManager.validateGeminiCredentials();
          const validation2 = await credentialManager.validateGeminiCredentials();
          const validation3 = await credentialManager.validateGeminiCredentials();
          
          // Assert - Results should be consistent
          expect(validation1).toBe(validation2);
          expect(validation2).toBe(validation3);
          
          // Validation status should be consistent
          const status1 = credentialManager.isGeminiValid();
          const status2 = credentialManager.isGeminiValid();
          expect(status1).toBe(status2);
          
        } finally {
          process.env = originalEnv;
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Credential update without restart
   * For any credential update, the system should handle updates without requiring restart
   */
  it('should handle credential updates without system restart', () => {
    fc.assert(fc.property(
      configurationArb,
      configurationArb,
      async (initialConfig, updatedConfig) => {
        // Arrange - Set up initial credentials
        credentialManager.awsCredentials = initialConfig.aws;
        credentialManager.geminiCredentials = initialConfig.gemini;
        
        const initialAWSValid = await credentialManager.validateAWSCredentials();
        const initialGeminiValid = await credentialManager.validateGeminiCredentials();
        
        // Act - Update credentials
        const awsUpdateResult = await credentialManager.updateCredentials('aws', updatedConfig.aws);
        const geminiUpdateResult = await credentialManager.updateCredentials('gemini', updatedConfig.gemini);
        
        // Assert - Updates should be processed
        expect(typeof awsUpdateResult).toBe('boolean');
        expect(typeof geminiUpdateResult).toBe('boolean');
        
        // Verify credentials were actually updated
        const finalAWSCredentials = credentialManager.awsCredentials;
        const finalGeminiCredentials = credentialManager.geminiCredentials;
        
        expect(finalAWSCredentials.accessKeyId).toBe(updatedConfig.aws.accessKeyId);
        expect(finalGeminiCredentials.apiKey).toBe(updatedConfig.gemini.apiKey);
        
        // Validation status should reflect the updates
        const finalStatus = credentialManager.getValidationStatus();
        expect(finalStatus.aws.valid).toBe(awsUpdateResult);
        expect(finalStatus.gemini.valid).toBe(geminiUpdateResult);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Error message specificity
   * For any invalid credentials, specific error messages should be provided for each platform
   */
  it('should provide specific error messages for invalid credentials', () => {
    fc.assert(fc.property(
      fc.record({
        aws: fc.record({
          accessKeyId: fc.string({ maxLength: 10 }), // Invalid short key
          secretAccessKey: fc.string({ maxLength: 20 }), // Invalid short secret
          region: fc.string({ maxLength: 5 }), // Invalid region
          s3Bucket: fc.string({ minLength: 1, maxLength: 5 })
        }),
        gemini: fc.record({
          apiKey: fc.string({ maxLength: 20 }), // Invalid short key
          model: fc.string({ maxLength: 10 }), // Invalid model
          endpoint: fc.string({ maxLength: 10 }), // Invalid endpoint
          maxTokens: fc.integer({ min: -100, max: 500 }), // Invalid token count
          temperature: fc.float({ min: -5, max: 10 }) // Invalid temperature
        })
      }),
      async (invalidConfig) => {
        // Arrange
        credentialManager.awsCredentials = invalidConfig.aws;
        credentialManager.geminiCredentials = invalidConfig.gemini;
        
        // Act
        const awsValid = await credentialManager.validateAWSCredentials();
        const geminiValid = await credentialManager.validateGeminiCredentials();
        
        // Assert - Should be invalid
        expect(awsValid).toBe(false);
        expect(geminiValid).toBe(false);
        
        // Should have specific error messages
        const errorMessages = credentialManager.getErrorMessages();
        expect(errorMessages.aws).toBeTruthy();
        expect(errorMessages.gemini).toBeTruthy();
        expect(typeof errorMessages.aws).toBe('string');
        expect(typeof errorMessages.gemini).toBe('string');
        
        // Error messages should be descriptive
        expect(errorMessages.aws.length).toBeGreaterThan(10);
        expect(errorMessages.gemini.length).toBeGreaterThan(10);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Validation cache consistency
   * For any validation operation, cache should maintain consistency with actual validation state
   */
  it('should maintain validation cache consistency', () => {
    fc.assert(fc.property(
      configurationArb,
      async (config) => {
        // Arrange
        credentialManager.awsCredentials = config.aws;
        credentialManager.geminiCredentials = config.gemini;
        
        // Act - Perform validation
        const awsResult = await credentialManager.validateAWSCredentials();
        const geminiResult = await credentialManager.validateGeminiCredentials();
        
        // Assert - Cache should match validation results
        expect(credentialManager.isAWSValid()).toBe(awsResult);
        expect(credentialManager.isGeminiValid()).toBe(geminiResult);
        
        const status = credentialManager.getValidationStatus();
        expect(status.aws.valid).toBe(awsResult);
        expect(status.gemini.valid).toBe(geminiResult);
        expect(status.bothValid).toBe(awsResult && geminiResult);
        
        // Cache timestamps should be recent
        expect(status.aws.timestamp).toBeInstanceOf(Date);
        expect(status.gemini.timestamp).toBeInstanceOf(Date);
        expect(status.lastValidation).toBeInstanceOf(Date);
      }
    ), { numRuns: 100 });
  });
});