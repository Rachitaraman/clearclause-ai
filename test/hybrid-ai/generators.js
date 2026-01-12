/**
 * Fast-check generators for property-based testing
 * Provides smart generators for hybrid AI system testing
 */

import fc from 'fast-check';
import { DocumentType, DocumentStatus, RiskSeverity, RiskCategory, ClauseType } from '../../src/hybrid-ai/types/index.js';

/**
 * Generator for document IDs
 */
export const documentIdArb = fc.uuid();

/**
 * Generator for document filenames
 */
export const filenameArb = fc.string({ minLength: 1, maxLength: 100 })
  .map(str => str.replace(/[^a-zA-Z0-9.-]/g, '_'))
  .filter(str => str.length > 0);

/**
 * Generator for document types
 */
export const documentTypeArb = fc.constantFrom(...Object.values(DocumentType));

/**
 * Generator for document status
 */
export const documentStatusArb = fc.constantFrom(...Object.values(DocumentStatus));

/**
 * Generator for risk severity
 */
export const riskSeverityArb = fc.constantFrom(...Object.values(RiskSeverity));

/**
 * Generator for risk category
 */
export const riskCategoryArb = fc.constantFrom(...Object.values(RiskCategory));

/**
 * Generator for clause types
 */
export const clauseTypeArb = fc.constantFrom(...Object.values(ClauseType));

/**
 * Generator for confidence scores (0-1)
 */
export const confidenceArb = fc.float({ min: 0, max: 1 });

/**
 * Generator for timestamps
 */
export const timestampArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') });

/**
 * Generator for S3 locations
 */
export const s3LocationArb = fc.record({
  bucket: fc.string({ minLength: 3, maxLength: 63 }),
  key: fc.string({ minLength: 1, maxLength: 1024 })
});

/**
 * Generator for document metadata
 */
export const documentMetadataArb = fc.record({
  size: fc.integer({ min: 1, max: 100000000 }),
  pages: fc.integer({ min: 1, max: 1000 }),
  language: fc.constantFrom('en', 'es', 'fr', 'de', 'it')
});

/**
 * Generator for complete document objects
 */
export const documentArb = fc.record({
  id: documentIdArb,
  filename: filenameArb,
  type: documentTypeArb,
  s3Location: fc.option(s3LocationArb),
  uploadTimestamp: timestampArb,
  status: documentStatusArb,
  metadata: fc.option(documentMetadataArb)
});

/**
 * Generator for clause objects
 */
export const clauseArb = fc.record({
  id: fc.uuid(),
  type: clauseTypeArb,
  text: fc.lorem({ maxCount: 50 }),
  confidence: confidenceArb,
  risks: fc.array(fc.string({ minLength: 10, maxLength: 200 }), { maxLength: 5 })
});

/**
 * Generator for risk objects
 */
export const riskArb = fc.record({
  id: fc.uuid(),
  severity: riskSeverityArb,
  category: riskCategoryArb,
  description: fc.lorem({ maxCount: 20 }),
  recommendations: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { maxLength: 3 })
});

/**
 * Generator for analysis summary
 */
export const analysisSummaryArb = fc.record({
  documentType: fc.string({ minLength: 5, maxLength: 50 }),
  keyPoints: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
  overallRisk: riskSeverityArb
});

/**
 * Generator for AWS metadata
 */
export const awsMetadataArb = fc.record({
  textractJobId: fc.option(fc.uuid()),
  s3ProcessingTime: fc.integer({ min: 100, max: 30000 }),
  extractionConfidence: confidenceArb
});

/**
 * Generator for Gemini metadata
 */
export const geminiMetadataArb = fc.record({
  modelVersion: fc.constantFrom('gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'),
  tokensUsed: fc.integer({ min: 100, max: 50000 }),
  responseTime: fc.integer({ min: 500, max: 30000 })
});

/**
 * Generator for complete analysis result objects
 */
export const analysisResultArb = fc.record({
  documentId: documentIdArb,
  analysisTimestamp: timestampArb,
  processingTime: fc.integer({ min: 1000, max: 60000 }),
  confidence: confidenceArb,
  summary: analysisSummaryArb,
  clauses: fc.array(clauseArb, { minLength: 1, maxLength: 20 }),
  risks: fc.array(riskArb, { minLength: 0, maxLength: 15 }),
  awsMetadata: awsMetadataArb,
  geminiMetadata: geminiMetadataArb
});

/**
 * Generator for AWS configuration
 */
export const awsConfigArb = fc.record({
  accessKeyId: fc.string({ minLength: 16, maxLength: 32 }),
  secretAccessKey: fc.string({ minLength: 32, maxLength: 64 }),
  region: fc.constantFrom('us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'),
  s3Bucket: fc.string({ minLength: 3, maxLength: 63 }),
  textractLambda: fc.string({ minLength: 5, maxLength: 64 }),
  urlLambda: fc.string({ minLength: 5, maxLength: 64 })
});

/**
 * Generator for Gemini configuration
 */
export const geminiConfigArb = fc.record({
  apiKey: fc.string({ minLength: 32, maxLength: 64 }),
  model: fc.constantFrom('gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'),
  endpoint: fc.constantFrom('https://generativelanguage.googleapis.com/v1/models'),
  maxTokens: fc.integer({ min: 1000, max: 100000 }),
  temperature: fc.float({ min: 0, max: 2 })
});

/**
 * Generator for complete configuration objects
 */
export const configurationArb = fc.record({
  aws: awsConfigArb,
  gemini: geminiConfigArb
});

/**
 * Generator for URLs
 */
export const urlArb = fc.webUrl();

/**
 * Generator for contract text content
 */
export const contractTextArb = fc.lorem({ maxCount: 500 });

/**
 * Generator for extracted text with confidence
 */
export const extractedTextArb = fc.record({
  text: contractTextArb,
  confidence: confidenceArb,
  segments: fc.array(fc.record({
    text: fc.lorem({ maxCount: 50 }),
    confidence: confidenceArb,
    boundingBox: fc.option(fc.record({
      left: fc.float({ min: 0, max: 1 }),
      top: fc.float({ min: 0, max: 1 }),
      width: fc.float({ min: 0, max: 1 }),
      height: fc.float({ min: 0, max: 1 })
    }))
  }), { maxLength: 100 })
});

/**
 * Generator for processing errors
 */
export const processingErrorArb = fc.record({
  code: fc.constantFrom('AWS_ERROR', 'GEMINI_ERROR', 'NETWORK_ERROR', 'VALIDATION_ERROR'),
  message: fc.string({ minLength: 10, maxLength: 200 }),
  details: fc.option(fc.object()),
  timestamp: timestampArb,
  correlationId: fc.uuid()
});