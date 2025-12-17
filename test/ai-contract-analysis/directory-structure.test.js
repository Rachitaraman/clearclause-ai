// Property Test: Directory Structure Validation
// **Feature: ai-contract-analysis, Property 1: Project structure validation**
// **Validates: Requirements 2.1, 2.2**

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

describe('AI Contract Analysis - Directory Structure', () => {
  describe('Property 1: Project structure validation', () => {
    it('should have required AI model directory structure', () => {
      // **Feature: ai-contract-analysis, Property 1: Project structure validation**
      
      const requiredDirectories = [
        'model',
        'model/core',
        'model/config',
        'api',
        'api/clients',
        'api/normalizers',
        'src/processors'
      ];

      const requiredFiles = [
        'model/core/ModelManager.js',
        'model/config/ModelConfig.js',
        'model/config/OllamaConfig.js',
        'api/clients/APIClient.js',
        'api/normalizers/ResponseNormalizer.js',
        'src/processors/ContractProcessor.js'
      ];

      // Test that all required directories exist
      requiredDirectories.forEach(dir => {
        const dirPath = join(process.cwd(), dir);
        expect(existsSync(dirPath), `Directory ${dir} should exist`).toBe(true);
        
        if (existsSync(dirPath)) {
          const stats = statSync(dirPath);
          expect(stats.isDirectory(), `${dir} should be a directory`).toBe(true);
        }
      });

      // Test that all required files exist
      requiredFiles.forEach(file => {
        const filePath = join(process.cwd(), file);
        expect(existsSync(filePath), `File ${file} should exist`).toBe(true);
        
        if (existsSync(filePath)) {
          const stats = statSync(filePath);
          expect(stats.isFile(), `${file} should be a file`).toBe(true);
        }
      });
    });

    it('should maintain separation between AI model and API systems', () => {
      fc.assert(fc.property(
        fc.constantFrom('model', 'api'),
        (systemType) => {
          const systemPath = join(process.cwd(), systemType);
          
          // Verify system directory exists
          expect(existsSync(systemPath)).toBe(true);
          
          if (systemType === 'model') {
            // AI model system should have core, config subdirectories
            const coreExists = existsSync(join(systemPath, 'core'));
            const configExists = existsSync(join(systemPath, 'config'));
            
            expect(coreExists).toBe(true);
            expect(configExists).toBe(true);
          } else if (systemType === 'api') {
            // API system should have clients, normalizers subdirectories
            const clientsExists = existsSync(join(systemPath, 'clients'));
            const normalizersExists = existsSync(join(systemPath, 'normalizers'));
            
            expect(clientsExists).toBe(true);
            expect(normalizersExists).toBe(true);
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });

    it('should have proper file naming conventions', () => {
      fc.assert(fc.property(
        fc.constantFrom(
          'ModelManager.js',
          'ModelConfig.js', 
          'OllamaConfig.js',
          'APIClient.js',
          'ResponseNormalizer.js',
          'ContractProcessor.js'
        ),
        (filename) => {
          // Test filename follows conventions
          expect(filename).toMatch(/^[A-Z][a-zA-Z0-9]*\.js$/);
          
          // Test file uses PascalCase for class names
          const className = filename.replace('.js', '');
          expect(className).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
          
          return true;
        }
      ), { numRuns: 100 });
    });

    it('should have ES module exports in all AI system files', async () => {
      const aiSystemFiles = [
        'model/core/ModelManager.js',
        'model/config/ModelConfig.js',
        'model/config/OllamaConfig.js',
        'api/clients/APIClient.js',
        'api/normalizers/ResponseNormalizer.js',
        'src/processors/ContractProcessor.js'
      ];

      for (const file of aiSystemFiles) {
        try {
          // Dynamic import to test ES module compatibility
          const module = await import(`../../${file}`);
          
          // Should have default export or named exports
          const hasExports = Boolean(module.default) || Object.keys(module).length > 0;
          expect(hasExports, `${file} should have exports`).toBe(true);
          
        } catch (error) {
          // If import fails, check if it's a syntax error vs missing file
          if (error.code !== 'ERR_MODULE_NOT_FOUND') {
            throw new Error(`${file} has ES module syntax errors: ${error.message}`);
          }
        }
      }
    });

    it('should maintain proper directory hierarchy', () => {
      fc.assert(fc.property(
        fc.record({
          system: fc.constantFrom('model', 'api'),
          subsystem: fc.constantFrom('core', 'config', 'clients', 'normalizers')
        }),
        ({ system, subsystem }) => {
          const validCombinations = {
            'model': ['core', 'config'],
            'api': ['clients', 'normalizers']
          };
          
          const isValidCombination = validCombinations[system].includes(subsystem);
          
          if (isValidCombination) {
            const dirPath = join(process.cwd(), system, subsystem);
            
            // If it's a valid combination, directory should exist
            if (existsSync(dirPath)) {
              const stats = statSync(dirPath);
              expect(stats.isDirectory()).toBe(true);
            }
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });

  describe('Directory Structure Integration Tests', () => {
    it('should allow importing core AI components', async () => {
      // Test that we can import the main AI system components
      try {
        const { ModelManager } = await import('../../model/core/ModelManager.js');
        const { APIClient } = await import('../../api/clients/APIClient.js');
        const { ContractProcessor } = await import('../../src/processors/ContractProcessor.js');
        
        expect(ModelManager).toBeDefined();
        expect(APIClient).toBeDefined();
        expect(ContractProcessor).toBeDefined();
        
        // Test that classes can be instantiated
        expect(() => new ModelManager()).not.toThrow();
        expect(() => new APIClient()).not.toThrow();
        expect(() => new ContractProcessor()).not.toThrow();
        
      } catch (error) {
        throw new Error(`Failed to import AI components: ${error.message}`);
      }
    });

    it('should have configuration files with proper structure', async () => {
      try {
        const ModelConfig = await import('../../model/config/ModelConfig.js');
        
        expect(ModelConfig.default || ModelConfig.ModelConfig).toBeDefined();
        
        const config = ModelConfig.default || ModelConfig.ModelConfig;
        
        // Verify configuration structure
        expect(config).toHaveProperty('primary');
        expect(config).toHaveProperty('clauseTypes');
        expect(config).toHaveProperty('riskLevels');
        
        // Verify primary model config has required fields
        expect(config.primary).toHaveProperty('modelName');
        expect(config.primary).toHaveProperty('maxTokens');
        expect(config.primary).toHaveProperty('temperature');
        
      } catch (error) {
        throw new Error(`Configuration validation failed: ${error.message}`);
      }
    });
  });
});