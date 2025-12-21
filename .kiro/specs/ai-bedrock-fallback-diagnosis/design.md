# Design Document

## Overview

This design addresses the issue where ClearClause AI is falling back to mock data instead of using real AWS Bedrock AI analysis. The system has valid AWS credentials configured but is silently failing during AI processing and returning mock data without clear error reporting. The solution involves implementing comprehensive error handling, credential validation, retry logic, and transparent reporting of analysis sources.

## Architecture

The current architecture has these components:
- Frontend document processor (`src/utils/documentProcessor.js`)
- Backend API handler (`functions/process.js`) 
- AWS Bedrock client integration
- Mock data fallback system

The enhanced architecture will add:
- Credential validation service
- Enhanced error handling and logging
- Retry mechanism with exponential backoff
- Analysis source transparency
- User-friendly error reporting

## Components and Interfaces

### 1. Enhanced Backend API Handler
- **Location**: `functions/process.js`
- **Responsibilities**: 
  - Process document analysis requests
  - Implement retry logic for Bedrock calls
  - Provide detailed error logging
  - Return analysis source metadata
- **Key Methods**:
  - `processDocumentAnalysis()` - Enhanced with better error handling
  - `analyzeWithBedrock()` - Enhanced with retry logic
  - `validateCredentials()` - New credential validation
  - `createDetailedErrorResponse()` - New error response formatting

### 2. Credential Validation Service
- **Location**: `functions/credentialValidator.js` (new)
- **Responsibilities**:
  - Validate AWS credentials on startup
  - Check Bedrock model access permissions
  - Provide detailed validation results
- **Key Methods**:
  - `validateAWSCredentials()` - Check credential validity
  - `validateBedrockAccess()` - Check model access permissions
  - `testModelInvocation()` - Test actual model calls

### 3. Enhanced Error Handler
- **Location**: `functions/errorHandler.js` (new)
- **Responsibilities**:
  - Categorize different types of errors
  - Generate user-friendly error messages
  - Log detailed error information
- **Key Methods**:
  - `categorizeError()` - Classify error types
  - `generateUserMessage()` - Create user-friendly messages
  - `logDetailedError()` - Comprehensive error logging

### 4. Retry Service
- **Location**: `functions/retryService.js` (new)
- **Responsibilities**:
  - Implement exponential backoff retry logic
  - Determine if errors are retryable
  - Track retry attempts and outcomes
- **Key Methods**:
  - `retryWithBackoff()` - Execute retry logic
  - `isRetryableError()` - Determine if error can be retried
  - `calculateBackoffDelay()` - Calculate retry delays

### 5. Frontend Analysis Source Display
- **Location**: `src/components/ui/AnalysisSourceIndicator.jsx` (new)
- **Responsibilities**:
  - Display whether real AI or mock data was used
  - Show error messages when AI fails
  - Provide user guidance for resolving issues
- **Key Methods**:
  - `renderAnalysisSource()` - Display analysis source
  - `renderErrorGuidance()` - Show error resolution steps

## Data Models

### Enhanced Analysis Response
```javascript
{
  analysis: { /* existing analysis data */ },
  confidence: number,
  processedAt: string,
  model: string,
  usingRealAI: boolean,
  processingDetails: {
    source: 'real-ai' | 'mock-fallback',
    retryAttempts: number,
    processingTime: number,
    credentialStatus: 'valid' | 'invalid' | 'unknown'
  },
  errorDetails?: {
    category: 'credentials' | 'permissions' | 'network' | 'quota' | 'model',
    message: string,
    userMessage: string,
    resolution: string,
    retryable: boolean
  }
}
```

### Credential Validation Result
```javascript
{
  valid: boolean,
  details: {
    accessKeyValid: boolean,
    secretKeyValid: boolean,
    regionValid: boolean,
    bedrockAccess: boolean,
    modelAccess: boolean
  },
  errors: string[],
  recommendations: string[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

<function_calls>
<invoke name="prework">
<parameter name="featureName">ai-bedrock-fallback-diagnosis

### Property Reflection

After reviewing all properties identified in the prework, I found several areas for consolidation:

**Redundancy Analysis:**
- Properties 1.1 and 1.2 can be combined into a single property about metadata accuracy
- Properties 2.1-2.5 all test error logging and can be consolidated into comprehensive error logging properties
- Properties 3.2-3.5 all test credential validation logging and can be combined
- Properties 4.1-4.5 all test retry behavior and can be consolidated into retry mechanism properties
- Properties 5.1-5.5 all test error messaging and can be combined into user-friendly error properties

**Consolidated Properties:**

Property 1: Analysis source metadata accuracy
*For any* analysis request, the response metadata should accurately indicate whether real AI or mock data was used, including the specific reason for any fallback
**Validates: Requirements 1.1, 1.2, 1.4, 1.5**

Property 2: Comprehensive error logging
*For any* AI processing error (credentials, permissions, network, model), the system should log detailed error information including error type, message, and debugging details
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 3: UI analysis source transparency
*For any* analysis result displayed in the UI, the interface should clearly show whether real AI or mock data was used
**Validates: Requirements 1.3**

Property 4: Credential validation logging
*For any* credential validation attempt, the system should log the validation results including specific failures and recommendations
**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

Property 5: Retry mechanism with exponential backoff
*For any* retryable Bedrock API failure, the system should retry up to 3 times with exponential backoff and log all retry attempts
**Validates: Requirements 4.1, 4.2, 4.5**

Property 6: Successful retry handling
*For any* retry sequence that eventually succeeds, the system should use the real AI result and not fall back to mock data
**Validates: Requirements 4.4**

Property 7: Retry exhaustion fallback
*For any* retry sequence where all attempts fail, the system should fall back to mock data and indicate this in the response
**Validates: Requirements 4.3**

Property 8: User-friendly error messaging
*For any* error that occurs, the system should provide user-friendly error messages with specific resolution steps based on the error category
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

## Error Handling

The enhanced error handling system will categorize errors into specific types:

1. **Credential Errors**: Invalid AWS access keys, secret keys, or expired tokens
2. **Permission Errors**: Insufficient IAM permissions for Bedrock or specific models
3. **Network Errors**: Connection timeouts, DNS resolution failures, network unreachability
4. **Quota Errors**: Rate limiting, usage quotas exceeded, throttling
5. **Model Errors**: Model not found, model access denied, invalid model parameters

Each error category will have:
- Specific detection logic
- User-friendly error messages
- Actionable resolution steps
- Appropriate retry behavior (retryable vs non-retryable)

## Testing Strategy

**Dual testing approach requirements**:

The testing strategy will include both unit testing and property-based testing approaches:
- Unit tests verify specific examples, edge cases, and error conditions
- Property tests verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

**Unit testing requirements**:

Unit tests will cover:
- Specific error scenarios (invalid credentials, network timeouts)
- Credential validation with known good/bad credentials
- Retry logic with controlled failure sequences
- Error message formatting for different error types

**Property-based testing requirements**:

Property-based tests will use Jest with fast-check library for JavaScript property testing. Each property-based test will run a minimum of 100 iterations. Each property-based test will be tagged with a comment explicitly referencing the correctness property using this format: '**Feature: ai-bedrock-fallback-diagnosis, Property {number}: {property_text}**'. Each correctness property will be implemented by a single property-based test.

The property tests will verify:
- Analysis source metadata accuracy across all possible analysis outcomes
- Error logging completeness across all error types
- Retry behavior consistency across different failure patterns
- User message quality across all error categories