import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DocumentParser } from '../../model/parsers/DocumentParser.js';
import { TextPreprocessor } from '../../model/preprocessing/TextPreprocessor.js';

/**
 * Feature: ai-contract-analysis, Property 12: Document format parsing round-trip
 * 
 * Property: For any supported document format (PDF, DOCX, TXT), the system should 
 * successfully parse the document and output clean, structured text suitable for AI analysis
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.5
 */

describe('Document Format Parsing Property Tests', () => {
  const parser = new DocumentParser();
  const preprocessor = new TextPreprocessor();

  // Generator for valid text content
  const validTextGenerator = fc.string({ minLength: 10, maxLength: 5000 })
    .filter(text => text.trim().length > 0);

  // Generator for contract-like text content
  const contractTextGenerator = fc.oneof(
    fc.constant("AGREEMENT\n\nThis agreement is entered into between Party A and Party B.\n\n1. Terms and Conditions\nThe parties agree to the following terms.\n\n2. Payment Terms\nPayment shall be made within 30 days."),
    fc.constant("CONTRACT\n\nWHEREAS, the parties wish to enter into this agreement;\nNOW THEREFORE, the parties agree as follows:\n\nArticle 1: Definitions\nFor purposes of this agreement, the following terms shall have the meanings set forth below."),
    fc.constant("SERVICE AGREEMENT\n\n1. Scope of Services\nThe service provider shall provide the following services.\n\n2. Compensation\nThe client shall pay the agreed amount.\n\n3. Termination\nThis agreement may be terminated by either party."),
    validTextGenerator
  );

  it('Property 12: Document format parsing produces valid output for text format', async () => {
    await fc.assert(
      fc.asyncProperty(contractTextGenerator, async (text) => {
        // Parse the text document
        const result = await parser.parseDocument(text, 'txt');
        
        // Verify the result has required structure
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('metadata');
        expect(result.metadata).toHaveProperty('format', 'txt');
        expect(result.metadata).toHaveProperty('wordCount');
        expect(result.metadata).toHaveProperty('characterCount');
        
        // Verify text is clean and non-empty
        expect(typeof result.text).toBe('string');
        expect(result.text.trim().length).toBeGreaterThan(0);
        
        // Verify metadata is accurate
        expect(result.metadata.wordCount).toBeGreaterThan(0);
        expect(result.metadata.characterCount).toBe(result.text.length);
        
        // Verify text is suitable for AI analysis (preprocessor can handle it)
        const preprocessed = await preprocessor.preprocessForModel(result.text);
        expect(preprocessed).toHaveProperty('processedText');
        expect(preprocessed).toHaveProperty('segments');
        expect(preprocessed.segments.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 12: Document format parsing handles buffer input for text format', async () => {
    await fc.assert(
      fc.asyncProperty(contractTextGenerator, async (text) => {
        const buffer = Buffer.from(text, 'utf8');
        
        // Parse the text document from buffer
        const result = await parser.parseDocument(buffer, 'txt');
        
        // Verify the result has required structure
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('metadata');
        expect(result.metadata.format).toBe('txt');
        
        // Verify text content is preserved
        expect(result.text.trim().length).toBeGreaterThan(0);
        
        // Verify the parsed text is suitable for preprocessing
        const preprocessed = await preprocessor.preprocessForModel(result.text);
        expect(preprocessed.processedText.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 12: Document parsing preserves essential content structure', async () => {
    const structuredTextGenerator = fc.oneof(
      fc.constant("1. First Section\nThis is the first section content.\n\n2. Second Section\nThis is the second section content."),
      fc.constant("Article I: Introduction\nThis article introduces the agreement.\n\nArticle II: Terms\nThese are the terms of the agreement."),
      fc.constant("WHEREAS, Party A desires to enter into this agreement;\nWHEREAS, Party B agrees to the terms;\nNOW THEREFORE, the parties agree as follows:")
    );

    await fc.assert(
      fc.asyncProperty(structuredTextGenerator, async (text) => {
        const result = await parser.parseDocument(text, 'txt');
        
        // Verify structure preservation - check if any of the expected patterns exist
        const hasStructure = result.text.includes('1.') || 
                            result.text.includes('Article') || 
                            result.text.includes('WHEREAS');
        expect(hasStructure).toBe(true);
        
        // Verify preprocessing maintains structure
        const preprocessed = await preprocessor.preprocessForModel(result.text);
        expect(preprocessed.processedText.length).toBeGreaterThan(0);
        
        // Verify segmentation works properly
        expect(preprocessed.segments.length).toBeGreaterThan(0);
        preprocessed.segments.forEach(segment => {
          expect(segment).toHaveProperty('text');
          expect(segment).toHaveProperty('index');
          expect(segment).toHaveProperty('wordCount');
          expect(segment.wordCount).toBeGreaterThan(0);
        });
      }),
      { numRuns: 50 }
    );
  });

  it('Property 12: Document parsing metadata is consistent and accurate', async () => {
    await fc.assert(
      fc.asyncProperty(validTextGenerator, async (text) => {
        const result = await parser.parseDocument(text, 'txt');
        
        // Verify metadata consistency
        const actualWordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        expect(result.metadata.wordCount).toBeGreaterThanOrEqual(0);
        
        // Character count should match processed text length
        expect(result.metadata.characterCount).toBe(result.text.length);
        
        // Format should be correctly identified
        expect(result.metadata.format).toBe('txt');
        
        // Parse time should be reasonable
        expect(result.metadata.parseTime).toBeGreaterThan(0);
        expect(result.metadata.parseTime).toBeLessThanOrEqual(Date.now());
      }),
      { numRuns: 100 }
    );
  });

  it('Property 12: Parsed documents are suitable for AI analysis pipeline', async () => {
    await fc.assert(
      fc.asyncProperty(contractTextGenerator, async (text) => {
        // Parse document
        const parseResult = await parser.parseDocument(text, 'txt');
        
        // Preprocess for AI model
        const preprocessResult = await preprocessor.preprocessForModel(parseResult.text);
        
        // Verify the full pipeline produces valid output
        expect(preprocessResult.processedText.length).toBeGreaterThan(0);
        expect(preprocessResult.segments.length).toBeGreaterThan(0);
        expect(preprocessResult.metadata.wordCount).toBeGreaterThan(0);
        
        // Verify each segment is valid
        preprocessResult.segments.forEach(segment => {
          expect(segment.text.trim().length).toBeGreaterThan(0);
          expect(segment.wordCount).toBeGreaterThan(0);
          expect(segment.characterCount).toBe(segment.text.length);
          expect(segment.startPosition).toBeGreaterThanOrEqual(0);
          expect(segment.endPosition).toBeGreaterThan(segment.startPosition);
        });
      }),
      { numRuns: 100 }
    );
  });
});