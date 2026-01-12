/**
 * Test setup for Hybrid AWS-Gemini AI Model system
 * Configures Jest and fast-check for property-based testing
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

// Configure fast-check for property-based testing
fc.configureGlobal({
  numRuns: 100, // Minimum 100 iterations as specified in design
  verbose: true,
  seed: 42, // For reproducible tests
  endOnFailure: true
});

// Mock AWS SDK for testing
const mockAWS = {
  S3: {
    upload: vi.fn(),
    getObject: vi.fn(),
    deleteObject: vi.fn(),
    headObject: vi.fn()
  },
  Textract: {
    startDocumentTextDetection: vi.fn(),
    getDocumentTextDetection: vi.fn()
  },
  Lambda: {
    invoke: vi.fn()
  }
};

// Mock Gemini API for testing
const mockGemini = {
  generateContent: vi.fn(),
  getGenerativeModel: vi.fn()
};

// Global test setup
beforeAll(() => {
  // Set up environment variables for testing
  process.env.VITE_AWS_ACCESS_KEY_ID = 'test-access-key';
  process.env.VITE_AWS_SECRET_ACCESS_KEY = 'test-secret-key';
  process.env.VITE_AWS_REGION = 'us-east-1';
  process.env.VITE_S3_BUCKET = 'test-bucket';
  process.env.VITE_TEXTRACT_LAMBDA = 'test-textract-lambda';
  process.env.VITE_URL_LAMBDA = 'test-url-lambda';
  process.env.VITE_GOOGLE_AI_API_KEY = 'test-gemini-key';
  process.env.VITE_GEMINI_MODEL = 'gemini-2.5-flash';
  process.env.VITE_GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models';
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});

afterAll(() => {
  // Clean up environment variables
  delete process.env.VITE_AWS_ACCESS_KEY_ID;
  delete process.env.VITE_AWS_SECRET_ACCESS_KEY;
  delete process.env.VITE_AWS_REGION;
  delete process.env.VITE_S3_BUCKET;
  delete process.env.VITE_TEXTRACT_LAMBDA;
  delete process.env.VITE_URL_LAMBDA;
  delete process.env.VITE_GOOGLE_AI_API_KEY;
  delete process.env.VITE_GEMINI_MODEL;
  delete process.env.VITE_GEMINI_ENDPOINT;
});

// Export mocks for use in tests
export { mockAWS, mockGemini, fc };