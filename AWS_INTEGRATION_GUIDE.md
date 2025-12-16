# ClearClause AI - AWS Integration Guide

## Overview

ClearClause AI now integrates with real AWS services to provide enterprise-grade document analysis capabilities. This guide explains the AWS architecture, setup, and usage.

## AWS Architecture

### Services Used

1. **Amazon S3** - Document storage and management
2. **Amazon Textract** - OCR and document text extraction
3. **Amazon Bedrock** - AI-powered legal document analysis
4. **AWS Lambda** - Serverless processing functions

### Data Flow

```
Document Upload → S3 Storage → Textract OCR → Bedrock Analysis → Results Display
```

## Environment Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# AWS Configuration
VITE_AWS_ACCESS_KEY_ID=your_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here
VITE_AWS_REGION=us-east-1

# AWS Services Configuration
VITE_S3_BUCKET=your-s3-bucket-name
VITE_TEXTRACT_LAMBDA=your-textract-lambda-function
VITE_URL_LAMBDA=your-url-fetcher-lambda-function
VITE_BEDROCK_MODEL=anthropic.claude-3-sonnet-20240229-v1:0
```

### AWS Credentials Setup

Your AWS credentials should have the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "textract:DetectDocumentText",
                "textract:AnalyzeDocument"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": "arn:aws:bedrock:*:*:foundation-model/anthropic.claude-*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "lambda:InvokeFunction"
            ],
            "Resource": [
                "arn:aws:lambda:*:*:function:ClearClause_TextractOCR",
                "arn:aws:lambda:*:*:function:ClearClause_URLFetcher"
            ]
        }
    ]
}
```

## AWS Services Setup

### 1. S3 Bucket Configuration

Create an S3 bucket for document storage:

```bash
aws s3 mb s3://impactxaws-docs --region us-east-1
```

Configure CORS for web access:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 2. Textract Setup

Textract is ready to use with your AWS credentials. No additional setup required.

### 3. Bedrock Model Access

Enable access to Claude 3 Sonnet in Amazon Bedrock:

1. Go to Amazon Bedrock console
2. Navigate to "Model access"
3. Request access to "Anthropic Claude 3 Sonnet"
4. Wait for approval (usually instant)

### 4. Lambda Functions (Optional)

Create Lambda functions for enhanced processing:

#### Textract OCR Lambda

```javascript
// ClearClause_TextractOCR function
import { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';

export const handler = async (event) => {
    const { bucket, key, features } = event;
    
    const textractClient = new TextractClient({ region: 'us-east-1' });
    
    try {
        const params = {
            Document: {
                S3Object: { Bucket: bucket, Name: key }
            }
        };

        if (features && features.includes('LAYOUT')) {
            params.FeatureTypes = ['TABLES', 'FORMS', 'LAYOUT'];
            const command = new AnalyzeDocumentCommand(params);
            const result = await textractClient.send(command);
            
            return {
                statusCode: 200,
                body: {
                    extractedText: extractText(result.Blocks),
                    layout: extractLayout(result.Blocks),
                    confidence: calculateConfidence(result.Blocks)
                }
            };
        } else {
            const command = new DetectDocumentTextCommand(params);
            const result = await textractClient.send(command);
            
            return {
                statusCode: 200,
                body: {
                    extractedText: extractText(result.Blocks),
                    confidence: calculateConfidence(result.Blocks)
                }
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: { error: error.message }
        };
    }
};
```

#### URL Fetcher Lambda

```javascript
// ClearClause_URLFetcher function
import https from 'https';
import http from 'http';

export const handler = async (event) => {
    const { url, extractText, followRedirects } = event;
    
    try {
        const content = await fetchURL(url, followRedirects);
        
        if (extractText) {
            const extractedText = extractTextFromHTML(content);
            return {
                statusCode: 200,
                body: {
                    extractedText,
                    originalContent: content,
                    metadata: {
                        url,
                        fetchedAt: new Date().toISOString()
                    }
                }
            };
        }
        
        return {
            statusCode: 200,
            body: {
                content,
                metadata: {
                    url,
                    fetchedAt: new Date().toISOString()
                }
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: { error: error.message }
        };
    }
};
```

## Usage Examples

### Single Document Analysis

```javascript
import { processDocument } from './src/utils/documentProcessor.js';

// Analyze a PDF file
const file = document.getElementById('fileInput').files[0];
const result = await processDocument(file);

if (result.error) {
    console.error('Analysis failed:', result.error);
} else {
    console.log('Analysis complete:', result.data);
}
```

### Image Document OCR

```javascript
import { processImageDocument } from './src/utils/documentProcessor.js';

// Process an image with OCR
const imageFile = document.getElementById('imageInput').files[0];
const result = await processImageDocument(imageFile);

console.log('Extracted text:', result.data.extraction.text);
```

### Text Analysis

```javascript
import { processTextInput } from './src/utils/documentProcessor.js';

// Analyze direct text input
const text = "This is a legal contract...";
const result = await processTextInput(text);

console.log('Analysis:', result.data.analysis);
```

### URL Content Analysis

```javascript
import { processURLContent } from './src/utils/documentProcessor.js';

// Analyze content from a URL
const url = "https://example.com/terms-of-service";
const result = await processURLContent(url);

console.log('URL analysis:', result.data);
```

### Document Comparison

```javascript
import { compareDocuments } from './src/utils/documentProcessor.js';

// Compare multiple documents
const documents = [file1, file2, file3];
const result = await compareDocuments(documents);

console.log('Comparison results:', result.data.comparison);
```

## CUAD Dataset Integration

The system includes utilities for working with the Contract Understanding Atticus Dataset (CUAD):

```javascript
import { loadCUADDataset, validateAgainstCUAD, getSampleContracts } from './src/utils/datasetUtils.js';

// Load dataset information
const dataset = await loadCUADDataset();

// Get sample contracts for testing
const samples = getSampleContracts();

// Validate analysis against CUAD annotations
const validation = validateAgainstCUAD(analysisResult, cuadAnnotations);
console.log('Validation accuracy:', validation.accuracy);
```

## Error Handling

The system includes comprehensive error handling:

1. **Network Errors**: Automatic retry with exponential backoff
2. **AWS Service Errors**: Detailed error messages and fallback to mock data
3. **File Format Errors**: Validation and user-friendly error messages
4. **Rate Limiting**: Automatic throttling for AWS API calls

## Performance Optimization

### Caching Strategy

- S3 objects are cached for 24 hours
- Textract results are cached by document hash
- Bedrock responses are cached for identical inputs

### Batch Processing

- Multiple documents are processed in parallel
- Textract calls are batched when possible
- Results are streamed to the UI as they complete

## Security Considerations

1. **Credentials**: Never expose AWS credentials in client-side code
2. **S3 Access**: Use pre-signed URLs for secure file uploads
3. **Data Encryption**: All data is encrypted in transit and at rest
4. **Access Control**: Implement proper IAM policies

## Monitoring and Logging

### CloudWatch Integration

Monitor your usage with CloudWatch:

- API call counts and latency
- Error rates and types
- Cost tracking per service

### Application Logging

```javascript
// Enable detailed logging
localStorage.setItem('clearclause-debug', 'true');

// View logs in browser console
console.log('AWS Service calls:', window.clearclauseDebug);
```

## Cost Optimization

### Estimated Costs (per 1000 documents)

- **S3 Storage**: ~$0.02
- **Textract**: ~$1.50
- **Bedrock (Claude 3 Sonnet)**: ~$15.00
- **Lambda**: ~$0.01

### Cost Reduction Tips

1. Use Textract only for scanned documents
2. Implement intelligent caching
3. Batch process multiple documents
4. Use smaller Bedrock models for simple analysis

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**: Check IAM permissions
2. **"Model not found" errors**: Ensure Bedrock model access is enabled
3. **Timeout errors**: Increase Lambda timeout settings
4. **CORS errors**: Configure S3 bucket CORS policy

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// In browser console
localStorage.setItem('aws-debug', 'true');
```

## Support

For issues with AWS integration:

1. Check AWS service status
2. Verify credentials and permissions
3. Review CloudWatch logs
4. Test with sample documents

## Next Steps

1. Set up monitoring dashboards
2. Implement advanced caching
3. Add support for additional file formats
4. Integrate with AWS Comprehend for enhanced NLP