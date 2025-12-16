/**
 * TextPreprocessor handles cleaning, structuring, and segmenting document text
 * to prepare it for AI model analysis.
 */
export class TextPreprocessor {
  constructor(options = {}) {
    this.maxSegmentLength = options.maxSegmentLength || 4000; // tokens/characters
    this.overlapLength = options.overlapLength || 200; // overlap between segments
    this.preserveStructure = options.preserveStructure !== false;
  }

  /**
   * Preprocess text for AI model consumption
   * @param {string} text - Raw document text
   * @param {Object} options - Preprocessing options
   * @returns {Promise<Object>} Preprocessed text with metadata
   */
  async preprocessForModel(text, options = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Input text must be a non-empty string');
      }

      const normalizedText = this.normalizeText(text);
      const structuredText = this.structureText(normalizedText);
      const segments = this.segmentDocument(structuredText, options);
      const metadata = this.extractMetadata(structuredText);

      return {
        originalText: text,
        processedText: structuredText,
        segments: segments,
        metadata: {
          ...metadata,
          segmentCount: segments.length,
          processingTime: Date.now(),
          options: {
            maxSegmentLength: options.maxSegmentLength || this.maxSegmentLength,
            overlapLength: options.overlapLength || this.overlapLength,
            preserveStructure: options.preserveStructure !== false
          }
        }
      };
    } catch (error) {
      throw new Error(`Text preprocessing failed: ${error.message}`);
    }
  }

  /**
   * Normalize text content for consistent processing
   * @param {string} text - Input text
   * @returns {string} Normalized text
   */
  normalizeText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      // Normalize Unicode characters
      .normalize('NFKC')
      // Fix common encoding issues
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€\u009d/g, '"')
      .replace(/â€"/g, '—')
      // Normalize quotes and apostrophes
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      // Normalize dashes
      .replace(/[–—]/g, '-')
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Structure text to preserve important formatting for legal analysis
   * @param {string} text - Normalized text
   * @returns {string} Structured text
   */
  structureText(text) {
    if (!text) return '';

    let structured = text;

    if (this.preserveStructure) {
      // Preserve section headers and numbering
      structured = structured
        // Preserve numbered sections (1., 2., etc.)
        .replace(/(\n|^)(\d+\.)\s+/g, '\n\n$2 ')
        // Preserve lettered sections (a., b., etc.)
        .replace(/(\n|^)([a-z]\.)\s+/g, '\n$2 ')
        // Preserve roman numerals (i., ii., etc.)
        .replace(/(\n|^)([ivx]+\.)\s+/g, '\n$2 ')
        // Preserve common legal section markers
        .replace(/(\n|^)(WHEREAS|THEREFORE|NOW THEREFORE|IN WITNESS WHEREOF)/gi, '\n\n$2')
        // Preserve article/section headers
        .replace(/(\n|^)(Article|Section|Clause)\s+(\d+|[IVX]+)/gi, '\n\n$1 $3')
        // Ensure proper spacing around important markers
        .replace(/\n{3,}/g, '\n\n');
    }

    return structured.trim();
  }

  /**
   * Segment document into manageable chunks for AI processing
   * @param {string} text - Structured text
   * @param {Object} options - Segmentation options
   * @returns {Array<Object>} Array of text segments with metadata
   */
  segmentDocument(text, options = {}) {
    if (!text) return [];

    const maxLength = options.maxSegmentLength || this.maxSegmentLength;
    const overlapLength = options.overlapLength || this.overlapLength;
    const preserveStructure = options.preserveStructure !== false;

    // If text is short enough, return as single segment
    if (text.length <= maxLength) {
      return [{
        text: text,
        index: 0,
        startPosition: 0,
        endPosition: text.length,
        wordCount: this.countWords(text),
        characterCount: text.length
      }];
    }

    const segments = [];
    let currentPosition = 0;
    let segmentIndex = 0;

    while (currentPosition < text.length) {
      let segmentEnd = Math.min(currentPosition + maxLength, text.length);
      
      // If we're not at the end and preserving structure, try to break at natural boundaries
      if (segmentEnd < text.length && preserveStructure) {
        segmentEnd = this.findNaturalBreakpoint(text, currentPosition, segmentEnd);
      }

      const segmentText = text.substring(currentPosition, segmentEnd).trim();
      
      if (segmentText.length > 0) {
        segments.push({
          text: segmentText,
          index: segmentIndex,
          startPosition: currentPosition,
          endPosition: segmentEnd,
          wordCount: this.countWords(segmentText),
          characterCount: segmentText.length
        });
        segmentIndex++;
      }

      // Move to next segment with overlap
      currentPosition = Math.max(segmentEnd - overlapLength, currentPosition + 1);
      
      // Prevent infinite loop
      if (currentPosition >= text.length) break;
    }

    return segments;
  }

  /**
   * Find natural breakpoint for text segmentation
   * @param {string} text - Full text
   * @param {number} start - Start position
   * @param {number} idealEnd - Ideal end position
   * @returns {number} Actual end position at natural break
   */
  findNaturalBreakpoint(text, start, idealEnd) {
    const searchWindow = Math.min(200, Math.floor((idealEnd - start) * 0.1));
    const searchStart = Math.max(start, idealEnd - searchWindow);
    
    // Look for paragraph breaks first
    for (let i = idealEnd; i >= searchStart; i--) {
      if (text.substring(i, i + 2) === '\n\n') {
        return i;
      }
    }
    
    // Look for sentence endings
    for (let i = idealEnd; i >= searchStart; i--) {
      const char = text[i];
      const nextChar = text[i + 1];
      if ((char === '.' || char === '!' || char === '?') && 
          (nextChar === ' ' || nextChar === '\n' || !nextChar)) {
        return i + 1;
      }
    }
    
    // Look for clause boundaries (semicolons, commas followed by conjunctions)
    for (let i = idealEnd; i >= searchStart; i--) {
      const char = text[i];
      if (char === ';' || 
          (char === ',' && this.isClauseBoundary(text, i))) {
        return i + 1;
      }
    }
    
    // Fall back to word boundaries
    for (let i = idealEnd; i >= searchStart; i--) {
      if (text[i] === ' ') {
        return i;
      }
    }
    
    // If no natural break found, use ideal end
    return idealEnd;
  }

  /**
   * Check if a comma represents a clause boundary
   * @param {string} text - Full text
   * @param {number} position - Position of comma
   * @returns {boolean} True if comma is at clause boundary
   */
  isClauseBoundary(text, position) {
    const afterComma = text.substring(position + 1, position + 20).trim().toLowerCase();
    const conjunctions = ['and', 'or', 'but', 'however', 'provided', 'except', 'unless'];
    
    return conjunctions.some(conj => afterComma.startsWith(conj + ' '));
  }

  /**
   * Extract metadata from processed text
   * @param {string} text - Processed text
   * @returns {Object} Text metadata
   */
  extractMetadata(text) {
    if (!text) {
      return {
        wordCount: 0,
        characterCount: 0,
        paragraphCount: 0,
        sentenceCount: 0,
        avgWordsPerSentence: 0,
        avgSentencesPerParagraph: 0
      };
    }

    const wordCount = this.countWords(text);
    const characterCount = text.length;
    const paragraphCount = this.countParagraphs(text);
    const sentenceCount = this.countSentences(text);
    
    return {
      wordCount,
      characterCount,
      paragraphCount,
      sentenceCount,
      avgWordsPerSentence: sentenceCount > 0 ? Math.round(wordCount / sentenceCount * 10) / 10 : 0,
      avgSentencesPerParagraph: paragraphCount > 0 ? Math.round(sentenceCount / paragraphCount * 10) / 10 : 0,
      estimatedReadingTime: Math.ceil(wordCount / 200), // minutes at 200 WPM
      complexity: this.assessComplexity(text, wordCount, sentenceCount)
    };
  }

  /**
   * Count words in text
   * @param {string} text - Input text
   * @returns {number} Word count
   */
  countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count paragraphs in text
   * @param {string} text - Input text
   * @returns {number} Paragraph count
   */
  countParagraphs(text) {
    if (!text) return 0;
    return text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
  }

  /**
   * Count sentences in text
   * @param {string} text - Input text
   * @returns {number} Sentence count
   */
  countSentences(text) {
    if (!text) return 0;
    // Simple sentence counting - could be improved with more sophisticated NLP
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }

  /**
   * Assess text complexity
   * @param {string} text - Input text
   * @param {number} wordCount - Word count
   * @param {number} sentenceCount - Sentence count
   * @returns {string} Complexity level
   */
  assessComplexity(text, wordCount, sentenceCount) {
    if (sentenceCount === 0) return 'unknown';
    
    const avgWordsPerSentence = wordCount / sentenceCount;
    const longWordCount = text.split(/\s+/).filter(word => word.length > 6).length;
    const longWordRatio = longWordCount / wordCount;
    
    // Simple complexity assessment
    if (avgWordsPerSentence > 25 || longWordRatio > 0.3) {
      return 'high';
    } else if (avgWordsPerSentence > 15 || longWordRatio > 0.2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Update preprocessing options
   * @param {Object} options - New options
   */
  updateOptions(options) {
    if (options.maxSegmentLength) this.maxSegmentLength = options.maxSegmentLength;
    if (options.overlapLength) this.overlapLength = options.overlapLength;
    if (options.preserveStructure !== undefined) this.preserveStructure = options.preserveStructure;
  }

  /**
   * Get current preprocessing options
   * @returns {Object} Current options
   */
  getOptions() {
    return {
      maxSegmentLength: this.maxSegmentLength,
      overlapLength: this.overlapLength,
      preserveStructure: this.preserveStructure
    };
  }
}

export default TextPreprocessor;