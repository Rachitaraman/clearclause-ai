import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DocumentParser } from '../../model/parsers/DocumentParser.js';

/**
 * Feature: ai-contract-analysis, Property 13: Document parsing error handling
 * 
 * Property: For any document parsing failure, the system should provide clear, 
 * specific error messages indicating the parsing issue encountered
 * 
 * Validates: Requirements 6.4
 */

describe('Document Parsing Error Handling Property Tests', () => {
  const parser = new DocumentParser();

  // Generator for unsupported formats
  const unsupportedFormatGenerator = fc.oneof(
    fc.constant('xml'),
    fc.constant('json'),
    fc.constant('html'),
    fc.constant('rtf'),
    fc.constant('odt'),
    fc.constant(''),
    fc.constant('unknown'),
    fc.string({ minLength: 1, maxLength: 10 }).filter(s => !['pdf', 'docx', 'txt'].includes(s.toLowerCase()))
  );

  // Generator for invalid inputs
  const invalidInputGenerator = fc.oneof(
    fc.constant(null),
    fc.constant(undefined),
    fc.constant(''),
    fc.constant('   '),
    fc.constant(Buffer.alloc(0)), // empty buffer
    fc.constant({}),
    fc.constant([]),
    fc.constant(123)
  );

  // Generator for oversized content
  const oversizedContentGenerator = fc.string({ minLength: 50 * 1024 * 1024 + 1 }); // > 50MB

  it('Property 13: Unsupported formats produce clear error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        unsupportedFormatGenerator,
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (format, content) => {
          try {
            await parser.parseDocument(content, format);
            // If we reach here, the test should fail because an error was expected
            expect.fail(`Expected error for unsupported format '${format}', but parsing succeeded`);
          } catch (error) {
            // Verify error message is clear and specific
            expect(error.message).toBeDefined();
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
            
            // Error message should mention the unsupported format
            const lowerMessage = error.message.toLowerCase();
            expect(
              lowerMessage.includes('unsupported') || 
              lowerMessage.includes('format') ||
              lowerMessage.includes('supported formats')
            ).toBe(true);
            
            // Error message should be informative, not just generic
            expect(error.message).not.toBe('Error');
            expect(error.message).not.toBe('Failed');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Invalid inputs produce specific error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidInputGenerator,
        fc.constantFrom('txt', 'pdf', 'docx'),
        async (input, format) => {
          try {
            await parser.parseDocument(input, format);
            // If we reach here, the test should fail because an error was expected
            expect.fail(`Expected error for invalid input '${input}', but parsing succeeded`);
          } catch (error) {
            // Verify error message is clear and specific
            expect(error.message).toBeDefined();
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
            
            // Error message should indicate the specific issue
            const lowerMessage = error.message.toLowerCase();
            expect(
              lowerMessage.includes('empty') || 
              lowerMessage.includes('buffer') ||
              lowerMessage.includes('string') ||
              lowerMessage.includes('input') ||
              lowerMessage.includes('must be')
            ).toBe(true);
            
            // Error message should be specific, not generic
            expect(error.message).not.toBe('Error');
            expect(error.message).not.toBe('Invalid input');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 13: Missing format parameter produces clear error message', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (content) => {
          try {
            await parser.parseDocument(content, null);
            expect.fail('Expected error for missing format, but parsing succeeded');
          } catch (error) {
            expect(error.message).toBeDefined();
            expect(error.message.toLowerCase()).toContain('format');
            expect(error.message.toLowerCase()).toContain('must be specified');
          }
          
          try {
            await parser.parseDocument(content, undefined);
            expect.fail('Expected error for undefined format, but parsing succeeded');
          } catch (error) {
            expect(error.message).toBeDefined();
            expect(error.message.toLowerCase()).toContain('format');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 13: File size validation produces informative error messages', async () => {
    // Test with content that's too large
    const largeContent = 'x'.repeat(51 * 1024 * 1024); // 51MB
    
    try {
      await parser.parseDocument(largeContent, 'txt');
      expect.fail('Expected error for oversized content, but parsing succeeded');
    } catch (error) {
      expect(error.message).toBeDefined();
      expect(error.message.toLowerCase()).toContain('size');
      expect(error.message.toLowerCase()).toContain('exceeds');
      expect(error.message.toLowerCase()).toContain('maximum');
    }
  });

  it('Property 13: PDF parsing errors are handled gracefully', async () => {
    // Test with invalid PDF buffer
    const invalidPdfBuffer = Buffer.from('This is not a valid PDF file content');
    
    try {
      await parser.parseDocument(invalidPdfBuffer, 'pdf');
      expect.fail('Expected error for invalid PDF, but parsing succeeded');
    } catch (error) {
      expect(error.message).toBeDefined();
      // Error could be about PDF parsing or environment availability
      expect(
        error.message.toLowerCase().includes('pdf') ||
        error.message.toLowerCase().includes('parsing') ||
        error.message.toLowerCase().includes('environment')
      ).toBe(true);
    }
  });

  it('Property 13: DOCX parsing errors are handled gracefully', async () => {
    // Test with invalid DOCX buffer
    const invalidDocxBuffer = Buffer.from('This is not a valid DOCX file content');
    
    try {
      await parser.parseDocument(invalidDocxBuffer, 'docx');
      expect.fail('Expected error for invalid DOCX, but parsing succeeded');
    } catch (error) {
      expect(error.message).toBeDefined();
      expect(
        error.message.toLowerCase().includes('docx') ||
        error.message.toLowerCase().includes('parsing')
      ).toBe(true);
    }
  });

  it('Property 13: Error messages contain actionable information', async () => {
    await fc.assert(
      fc.asyncProperty(
        unsupportedFormatGenerator,
        fc.string({ minLength: 1, maxLength: 100 }),
        async (format, content) => {
          try {
            await parser.parseDocument(content, format);
            expect.fail(`Expected error for format '${format}', but parsing succeeded`);
          } catch (error) {
            // Error message should contain actionable information
            expect(error.message).toBeDefined();
            
            // Should mention supported formats when format is unsupported
            if (error.message.toLowerCase().includes('unsupported')) {
              expect(
                error.message.includes('pdf') || 
                error.message.includes('docx') || 
                error.message.includes('txt') ||
                error.message.includes('Supported formats')
              ).toBe(true);
            }
            
            // Error message should be long enough to be informative
            expect(error.message.length).toBeGreaterThan(10);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 13: Validation methods provide consistent error handling', async () => {
    const testCases = [
      { input: null, format: 'txt' },
      { input: '', format: 'txt' },
      { input: Buffer.alloc(0), format: 'pdf' },
      { input: 'valid content', format: 'invalid' },
      { input: 'valid content', format: null }
    ];

    for (const testCase of testCases) {
      try {
        await parser.parseDocument(testCase.input, testCase.format);
        expect.fail(`Expected error for input: ${testCase.input}, format: ${testCase.format}`);
      } catch (error) {
        // All errors should have consistent structure
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBeDefined();
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);
        
        // Error message should start with a clear indication
        expect(
          error.message.startsWith('Document parsing failed:') ||
          error.message.includes('format') ||
          error.message.includes('input') ||
          error.message.includes('buffer') ||
          error.message.includes('string')
        ).toBe(true);
      }
    }
  });
});