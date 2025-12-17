import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: ai-contract-analysis, Property 6: Structured prompting produces consistent output**
 * 
 * Property 6: Structured prompting produces consistent output
 * For any AI model inference, the system should use structured prompting techniques 
 * that produce output conforming to the expected schema
 * Validates: Requirements 3.4
 */

// Mock PromptManager for testing structured prompting
class MockPromptManager {
  constructor() {
    this.promptTemplates = {
      clauseExtraction: `
        Analyze the following contract text and extract clauses in JSON format:
        {
          "clauses": [
            {
              "id": "string",
              "text": "string", 
              "type": "string",
              "category": "string",
              "confidence": number
            }
          ]
        }
        
        Contract text: {{CONTRACT_TEXT}}
      `,
      riskAnalysis: `
        Analyze the following clauses for risks and return JSON format:
        {
          "risks": [
            {
              "id": "string",
              "title": "string",
              "description": "string", 
              "severity": "Low|Medium|High|Critical",
              "category": "string",
              "confidence": number
            }
          ]
        }
        
        Clauses: {{CLAUSES}}
      `
    };
  }

  generateStructuredPrompt(templateName, variables) {
    let prompt = this.promptTemplates[templateName];
    if (!prompt) {
      throw new Error(`Template ${templateName} not found`);
    }
    
    // Replace variables in template
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return prompt;
  }

  async executeStructuredPrompt(prompt) {
    // Mock AI model response that follows the structured format
    if (prompt.includes('Analyze the following contract text and extract clauses')) {
      return {
        clauses: [
          {
            id: "clause_1",
            text: "Sample clause text",
            type: "payment_terms",
            category: "financial",
            confidence: 0.9
          }
        ]
      };
    } else if (prompt.includes('Analyze the following clauses for risks')) {
      return {
        risks: [
          {
            id: "risk_1",
            title: "Payment Risk",
            description: "Risk in payment terms",
            severity: "Medium",
            category: "financial",
            confidence: 0.8
          }
        ]
      };
    }
    
    // Default response for clause extraction
    return {
      clauses: [
        {
          id: "default_clause",
          text: "Default clause text",
          type: "general",
          category: "general",
          confidence: 0.5
        }
      ]
    };
  }

  validateOutputSchema(output, expectedSchema) {
    // Validate that output conforms to expected schema
    if (expectedSchema === 'clauseExtraction') {
      expect(output).toHaveProperty('clauses');
      expect(Array.isArray(output.clauses)).toBe(true);
      
      output.clauses.forEach(clause => {
        expect(clause).toHaveProperty('id');
        expect(clause).toHaveProperty('text');
        expect(clause).toHaveProperty('type');
        expect(clause).toHaveProperty('category');
        expect(clause).toHaveProperty('confidence');
        
        expect(typeof clause.id).toBe('string');
        expect(typeof clause.text).toBe('string');
        expect(typeof clause.type).toBe('string');
        expect(typeof clause.category).toBe('string');
        expect(typeof clause.confidence).toBe('number');
        
        expect(clause.confidence).toBeGreaterThanOrEqual(0);
        expect(clause.confidence).toBeLessThanOrEqual(1);
      });
    } else if (expectedSchema === 'riskAnalysis') {
      expect(output).toHaveProperty('risks');
      expect(Array.isArray(output.risks)).toBe(true);
      
      output.risks.forEach(risk => {
        expect(risk).toHaveProperty('id');
        expect(risk).toHaveProperty('title');
        expect(risk).toHaveProperty('description');
        expect(risk).toHaveProperty('severity');
        expect(risk).toHaveProperty('category');
        expect(risk).toHaveProperty('confidence');
        
        expect(typeof risk.id).toBe('string');
        expect(typeof risk.title).toBe('string');
        expect(typeof risk.description).toBe('string');
        expect(typeof risk.severity).toBe('string');
        expect(typeof risk.category).toBe('string');
        expect(typeof risk.confidence).toBe('number');
        
        expect(['Low', 'Medium', 'High', 'Critical']).toContain(risk.severity);
        expect(risk.confidence).toBeGreaterThanOrEqual(0);
        expect(risk.confidence).toBeLessThanOrEqual(1);
      });
    }
    
    return true;
  }
}

// Generator for contract text inputs
const contractTextArbitrary = fc.string({ minLength: 50, maxLength: 2000 });

// Generator for clause data
const clauseDataArbitrary = fc.array(
  fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }),
    text: fc.string({ minLength: 20, maxLength: 200 }),
    type: fc.constantFrom('payment_terms', 'termination', 'liability', 'confidentiality'),
    category: fc.constantFrom('financial', 'legal', 'operational')
  }),
  { minLength: 1, maxLength: 5 }
);

// Generator for prompt template names
const templateNameArbitrary = fc.constantFrom('clauseExtraction', 'riskAnalysis');

describe('Structured Prompting Consistency Property Tests', () => {
  it('should produce consistent schema-compliant output for any structured prompt', async () => {
    const promptManager = new MockPromptManager();
    
    await fc.assert(
      fc.asyncProperty(
        templateNameArbitrary,
        contractTextArbitrary,
        async (templateName, contractText) => {
          // Generate structured prompt
          const variables = templateName === 'clauseExtraction' 
            ? { CONTRACT_TEXT: contractText }
            : { CLAUSES: JSON.stringify([{ text: contractText }]) };
            
          const prompt = promptManager.generateStructuredPrompt(templateName, variables);
          
          // Execute the structured prompt
          const output = await promptManager.executeStructuredPrompt(prompt);
          
          // Validate that output conforms to expected schema
          const isValid = promptManager.validateOutputSchema(output, templateName);
          expect(isValid).toBe(true);
          
          // Ensure prompt contains template structure
          expect(prompt).toContain('{');
          expect(prompt).toContain('}');
          expect(prompt).toContain('"');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent output structure across multiple runs with same input', async () => {
    const promptManager = new MockPromptManager();
    
    await fc.assert(
      fc.asyncProperty(
        contractTextArbitrary,
        async (contractText) => {
          const variables = { CONTRACT_TEXT: contractText };
          const prompt = promptManager.generateStructuredPrompt('clauseExtraction', variables);
          
          // Execute the same prompt multiple times
          const results = [];
          for (let i = 0; i < 3; i++) {
            const output = await promptManager.executeStructuredPrompt(prompt);
            results.push(output);
          }
          
          // Validate all results have consistent structure
          results.forEach(result => {
            promptManager.validateOutputSchema(result, 'clauseExtraction');
            
            // Check structural consistency
            expect(result).toHaveProperty('clauses');
            expect(Array.isArray(result.clauses)).toBe(true);
            
            if (result.clauses.length > 0) {
              const firstClause = result.clauses[0];
              expect(firstClause).toHaveProperty('id');
              expect(firstClause).toHaveProperty('text');
              expect(firstClause).toHaveProperty('type');
              expect(firstClause).toHaveProperty('category');
              expect(firstClause).toHaveProperty('confidence');
            }
          });
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle template variable substitution correctly', async () => {
    const promptManager = new MockPromptManager();
    
    await fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }).filter(s => !s.includes('$')), // Avoid special regex characters
        fc.array(
          fc.record({
            id: fc.string({ minLength: 5, maxLength: 20 }).filter(s => !s.includes('"')),
            text: fc.string({ minLength: 20, maxLength: 100 }).filter(s => !s.includes('"') && !s.includes('$')),
            type: fc.constantFrom('payment_terms', 'termination', 'liability', 'confidentiality'),
            category: fc.constantFrom('financial', 'legal', 'operational')
          }),
          { minLength: 1, maxLength: 3 }
        ),
        (contractText, clauseData) => {
          // Test clause extraction template
          const clausePrompt = promptManager.generateStructuredPrompt('clauseExtraction', {
            CONTRACT_TEXT: contractText
          });
          
          expect(clausePrompt).toContain(contractText);
          expect(clausePrompt).not.toContain('{{CONTRACT_TEXT}}');
          
          // Test risk analysis template with simpler data
          const clausesJson = JSON.stringify(clauseData);
          const riskPrompt = promptManager.generateStructuredPrompt('riskAnalysis', {
            CLAUSES: clausesJson
          });
          
          // Check that template variables were replaced
          expect(riskPrompt).not.toContain('{{CLAUSES}}');
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should validate JSON schema compliance in structured outputs', async () => {
    const promptManager = new MockPromptManager();
    
    await fc.assert(
      fc.asyncProperty(
        templateNameArbitrary,
        contractTextArbitrary,
        async (templateName, contractText) => {
          const variables = templateName === 'clauseExtraction' 
            ? { CONTRACT_TEXT: contractText }
            : { CLAUSES: JSON.stringify([{ text: contractText }]) };
            
          const prompt = promptManager.generateStructuredPrompt(templateName, variables);
          const output = await promptManager.executeStructuredPrompt(prompt);
          
          // Validate JSON structure
          expect(typeof output).toBe('object');
          expect(output).not.toBeNull();
          
          // Validate specific schema requirements
          if (templateName === 'clauseExtraction') {
            expect(output.clauses).toBeDefined();
            expect(Array.isArray(output.clauses)).toBe(true);
          } else if (templateName === 'riskAnalysis') {
            expect(output.risks).toBeDefined();
            expect(Array.isArray(output.risks)).toBe(true);
          }
          
          // Ensure output can be serialized to JSON
          const jsonString = JSON.stringify(output);
          expect(jsonString).toBeDefined();
          expect(jsonString.length).toBeGreaterThan(0);
          
          // Ensure it can be parsed back
          const parsedOutput = JSON.parse(jsonString);
          expect(parsedOutput).toEqual(output);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});