import fs from 'fs';
import path from 'path';
// Lazy load pdf-parse to avoid DOM issues in test environment
let pdfParse = null;
async function loadPdfParse() {
  if (!pdfParse) {
    try {
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      pdfParse = require('pdf-parse');
    } catch (error) {
      throw new Error('PDF parsing is not available in this environment');
    }
  }
  return pdfParse;
}
import mammoth from 'mammoth';

/**
 * DocumentParser handles parsing of various document formats (PDF, DOCX, TXT)
 * and converts them to clean text suitable for AI analysis.
 */
export class DocumentParser {
  constructor() {
    this.supportedFormats = ['pdf', 'docx', 'txt'];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB limit
  }

  /**
   * Parse a document based on its format
   * @param {Buffer|string} input - Document buffer or text content
   * @param {string} format - Document format ('pdf', 'docx', 'txt')
   * @param {Object} options - Parsing options
   * @returns {Promise<Object>} Parsed document with text and metadata
   */
  async parseDocument(input, format, options = {}) {
    try {
      this.validateInput(input, format);
      
      switch (format.toLowerCase()) {
        case 'pdf':
          return await this.parsePDF(input, options);
        case 'docx':
          return await this.parseDOCX(input, options);
        case 'txt':
          return await this.parseText(input, options);
        default:
          throw new Error(`Unsupported document format: ${format}. Supported formats: ${this.supportedFormats.join(', ')}`);
      }
    } catch (error) {
      throw new Error(`Document parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse PDF document
   * @param {Buffer} buffer - PDF file buffer
   * @param {Object} options - Parsing options
   * @returns {Promise<Object>} Parsed PDF content
   */
  async parsePDF(buffer, options = {}) {
    try {
      if (!Buffer.isBuffer(buffer)) {
        throw new Error('PDF input must be a Buffer');
      }

      const pdfParser = await loadPdfParse();
      const data = await pdfParser(buffer, {
        // Preserve page structure for clause identification
        normalizeWhitespace: false,
        disableCombineTextItems: false,
        ...options
      });

      const cleanText = this.cleanText(data.text);
      
      return {
        text: cleanText,
        metadata: {
          format: 'pdf',
          pages: data.numpages,
          info: data.info || {},
          wordCount: this.countWords(cleanText),
          characterCount: cleanText.length,
          parseTime: Date.now()
        },
        raw: data
      };
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse DOCX document
   * @param {Buffer} buffer - DOCX file buffer
   * @param {Object} options - Parsing options
   * @returns {Promise<Object>} Parsed DOCX content
   */
  async parseDOCX(buffer, options = {}) {
    try {
      if (!Buffer.isBuffer(buffer)) {
        throw new Error('DOCX input must be a Buffer');
      }

      const result = await mammoth.extractRawText(buffer, {
        // Preserve paragraph structure
        convertImage: mammoth.images.ignoreImage,
        ...options
      });

      const cleanText = this.cleanText(result.value);
      
      return {
        text: cleanText,
        metadata: {
          format: 'docx',
          wordCount: this.countWords(cleanText),
          characterCount: cleanText.length,
          parseTime: Date.now(),
          warnings: result.messages || []
        },
        raw: result
      };
    } catch (error) {
      throw new Error(`DOCX parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse plain text document
   * @param {string|Buffer} input - Text content or buffer
   * @param {Object} options - Parsing options
   * @returns {Promise<Object>} Parsed text content
   */
  async parseText(input, options = {}) {
    try {
      let text;
      
      if (Buffer.isBuffer(input)) {
        // Try to detect encoding
        const encoding = options.encoding || 'utf8';
        text = input.toString(encoding);
      } else if (typeof input === 'string') {
        text = input;
      } else {
        throw new Error('Text input must be a string or Buffer');
      }

      const cleanText = this.cleanText(text);
      
      return {
        text: cleanText,
        metadata: {
          format: 'txt',
          wordCount: this.countWords(cleanText),
          characterCount: cleanText.length,
          parseTime: Date.now(),
          encoding: options.encoding || 'utf8'
        },
        raw: text
      };
    } catch (error) {
      throw new Error(`Text parsing failed: ${error.message}`);
    }
  }

  /**
   * Validate document input and format
   * @param {*} input - Document input
   * @param {string} format - Document format
   */
  validateInput(input, format) {
    if (!format) {
      throw new Error('Document format must be specified');
    }

    if (!this.supportedFormats.includes(format.toLowerCase())) {
      throw new Error(`Unsupported format '${format}'. Supported formats: ${this.supportedFormats.join(', ')}`);
    }

    if (Buffer.isBuffer(input)) {
      if (input.length === 0) {
        throw new Error('Document buffer is empty');
      }
      if (input.length > this.maxFileSize) {
        throw new Error(`Document size (${input.length} bytes) exceeds maximum allowed size (${this.maxFileSize} bytes)`);
      }
    } else if (typeof input === 'string') {
      if (input.trim().length === 0) {
        throw new Error('Document text is empty');
      }
      if (input.length > this.maxFileSize) {
        throw new Error(`Document size (${input.length} characters) exceeds maximum allowed size (${this.maxFileSize} characters)`);
      }
    } else {
      throw new Error('Document input must be a Buffer or string');
    }
  }

  /**
   * Clean and normalize text content
   * @param {string} text - Raw text content
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive whitespace while preserving paragraph structure
      .replace(/[ \t]+/g, ' ')
      // Normalize multiple newlines but preserve paragraph breaks
      .replace(/\n{3,}/g, '\n\n')
      // Remove leading/trailing whitespace from lines
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Remove leading/trailing whitespace from entire document
      .trim();
  }

  /**
   * Count words in text
   * @param {string} text - Text content
   * @returns {number} Word count
   */
  countWords(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  /**
   * Get supported document formats
   * @returns {string[]} Array of supported formats
   */
  getSupportedFormats() {
    return [...this.supportedFormats];
  }

  /**
   * Check if a format is supported
   * @param {string} format - Document format to check
   * @returns {boolean} True if format is supported
   */
  isFormatSupported(format) {
    return this.supportedFormats.includes(format.toLowerCase());
  }
}

export default DocumentParser;