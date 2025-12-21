/**
 * AWS Services Integration for ClearClause AI
 * Handles S3, Textract, Bedrock, and Lambda integrations
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand } from '@aws-sdk/client-textract'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'

// AWS Configuration from environment variables
const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
}

// Initialize AWS clients
const s3Client = new S3Client(AWS_CONFIG)
const textractClient = new TextractClient(AWS_CONFIG)
const bedrockClient = new BedrockRuntimeClient(AWS_CONFIG)
const lambdaClient = new LambdaClient(AWS_CONFIG)

// Configuration constants
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET
const TEXTRACT_LAMBDA = import.meta.env.VITE_TEXTRACT_LAMBDA
const URL_LAMBDA = import.meta.env.VITE_URL_LAMBDA
const BEDROCK_MODEL = import.meta.env.VITE_BEDROCK_MODEL || 'anthropic.claude-3-sonnet'

/**
 * Upload file to S3 bucket
 */
export async function uploadToS3(file, fileName) {
  try {
    const uploadParams = {
      Bucket: S3_BUCKET,
      Key: `documents/${Date.now()}-${fileName}`,
      Body: file,
      ContentType: file.type || 'application/octet-stream'
    }

    const command = new PutObjectCommand(uploadParams)
    const result = await s3Client.send(command)
    
    return {
      success: true,
      key: uploadParams.Key,
      location: `s3://${S3_BUCKET}/${uploadParams.Key}`,
      etag: result.ETag
    }
  } catch (error) {
    console.error('S3 Upload Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Extract text from document using Textract
 */
export async function extractTextWithTextract(s3Key) {
  try {
    const params = {
      Document: {
        S3Object: {
          Bucket: S3_BUCKET,
          Name: s3Key
        }
      }
    }

    const command = new DetectDocumentTextCommand(params)
    const result = await textractClient.send(command)
    
    // Extract text from Textract blocks
    const extractedText = result.Blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join('\n')

    return {
      success: true,
      text: extractedText,
      confidence: calculateAverageConfidence(result.Blocks),
      blocks: result.Blocks
    }
  } catch (error) {
    console.error('Textract Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Analyze document structure using Textract
 */
export async function analyzeDocumentStructure(s3Key) {
  try {
    const params = {
      Document: {
        S3Object: {
          Bucket: S3_BUCKET,
          Name: s3Key
        }
      },
      FeatureTypes: ['TABLES', 'FORMS', 'LAYOUT']
    }

    const command = new AnalyzeDocumentCommand(params)
    const result = await textractClient.send(command)
    
    return {
      success: true,
      blocks: result.Blocks,
      tables: extractTables(result.Blocks),
      forms: extractForms(result.Blocks)
    }
  } catch (error) {
    console.error('Textract Analysis Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Process document with OCR Lambda function
 */
export async function processWithOCRLambda(s3Key) {
  try {
    const payload = {
      bucket: S3_BUCKET,
      key: s3Key,
      features: ['TEXT', 'LAYOUT', 'TABLES']
    }

    const command = new InvokeCommand({
      FunctionName: TEXTRACT_LAMBDA,
      Payload: JSON.stringify(payload)
    })

    const result = await lambdaClient.send(command)
    const response = JSON.parse(new TextDecoder().decode(result.Payload))
    
    return {
      success: true,
      ...response
    }
  } catch (error) {
    console.error('OCR Lambda Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Fetch content from URL using Lambda function
 */
export async function fetchURLContent(url) {
  try {
    const payload = {
      url: url,
      extractText: true,
      followRedirects: true
    }

    const command = new InvokeCommand({
      FunctionName: URL_LAMBDA,
      Payload: JSON.stringify(payload)
    })

    const result = await lambdaClient.send(command)
    const response = JSON.parse(new TextDecoder().decode(result.Payload))
    
    return {
      success: true,
      ...response
    }
  } catch (error) {
    console.error('URL Lambda Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Analyze legal document with Bedrock AI
 */
export async function analyzeWithBedrock(documentText, analysisType = 'comprehensive') {
  try {
    const prompt = createAnalysisPrompt(documentText, analysisType)
    
    const params = {
      modelId: BEDROCK_MODEL,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    }

    const command = new InvokeModelCommand(params)
    const result = await bedrockClient.send(command)
    
    const responseBody = JSON.parse(new TextDecoder().decode(result.body))
    const analysis = JSON.parse(responseBody.content[0].text)
    
    return {
      success: true,
      analysis: analysis,
      confidence: calculateAnalysisConfidence(analysis),
      model: BEDROCK_MODEL
    }
  } catch (error) {
    console.error('Bedrock Analysis Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Compare multiple documents using Bedrock
 */
export async function compareDocumentsWithBedrock(documents) {
  try {
    const prompt = createComparisonPrompt(documents)
    
    const params = {
      modelId: BEDROCK_MODEL,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 5000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    }

    const command = new InvokeModelCommand(params)
    const result = await bedrockClient.send(command)
    
    const responseBody = JSON.parse(new TextDecoder().decode(result.body))
    const comparison = JSON.parse(responseBody.content[0].text)
    
    return {
      success: true,
      comparison: comparison,
      documentsAnalyzed: documents.length,
      model: BEDROCK_MODEL
    }
  } catch (error) {
    console.error('Bedrock Comparison Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Helper Functions
 */

function calculateAverageConfidence(blocks) {
  const confidenceValues = blocks
    .filter(block => block.Confidence)
    .map(block => block.Confidence)
  
  return confidenceValues.length > 0 
    ? confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length
    : 0
}

function extractTables(blocks) {
  return blocks
    .filter(block => block.BlockType === 'TABLE')
    .map(table => ({
      id: table.Id,
      confidence: table.Confidence,
      geometry: table.Geometry
    }))
}

function extractForms(blocks) {
  return blocks
    .filter(block => block.BlockType === 'KEY_VALUE_SET')
    .map(form => ({
      id: form.Id,
      confidence: form.Confidence,
      entityTypes: form.EntityTypes
    }))
}

function createAnalysisPrompt(documentText, analysisType) {
  const basePrompt = `
You are a legal document analysis AI. Analyze the following legal document and provide a comprehensive analysis in JSON format.

Document Text:
${documentText}

Please provide your analysis in the following JSON structure:
{
  "summary": {
    "documentType": "string",
    "keyPurpose": "string",
    "mainParties": ["string"],
    "effectiveDate": "string",
    "expirationDate": "string"
  },
  "clauses": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "category": "string",
      "riskLevel": "low|medium|high|critical",
      "explanation": "string"
    }
  ],
  "risks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "severity": "low|medium|high|critical",
      "category": "financial|legal|operational|compliance",
      "recommendation": "string",
      "clauseReference": "string"
    }
  ],
  "keyTerms": [
    {
      "term": "string",
      "definition": "string",
      "importance": "low|medium|high"
    }
  ],
  "recommendations": [
    {
      "priority": "low|medium|high|critical",
      "action": "string",
      "rationale": "string"
    }
  ]
}

Focus on identifying potential legal risks, unfavorable terms, and areas that need attention.
`

  return basePrompt
}

function createComparisonPrompt(documents) {
  const documentsText = documents.map((doc, index) => 
    `Document ${index + 1}:\n${doc.text}\n\n`
  ).join('')

  return `
You are a legal document comparison AI. Compare the following legal documents and provide a detailed comparison analysis in JSON format.

${documentsText}

Please provide your comparison in the following JSON structure:
{
  "overview": {
    "totalDocuments": ${documents.length},
    "documentTypes": ["string"],
    "comparisonSummary": "string"
  },
  "keyDifferences": [
    {
      "category": "string",
      "differences": [
        {
          "documentIndex": "number",
          "content": "string",
          "riskLevel": "low|medium|high|critical"
        }
      ],
      "impact": "string",
      "recommendation": "string"
    }
  ],
  "commonTerms": [
    {
      "term": "string",
      "consistency": "identical|similar|different",
      "notes": "string"
    }
  ],
  "riskAnalysis": [
    {
      "riskType": "string",
      "documentRisks": [
        {
          "documentIndex": "number",
          "riskLevel": "low|medium|high|critical",
          "description": "string"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "priority": "low|medium|high|critical",
      "action": "string",
      "affectedDocuments": ["number"],
      "rationale": "string"
    }
  ]
}

Focus on identifying significant differences, risk variations, and providing actionable recommendations.
`
}

function calculateAnalysisConfidence(analysis) {
  // Simple confidence calculation based on completeness
  let score = 0
  if (analysis.summary) score += 20
  if (analysis.clauses && analysis.clauses.length > 0) score += 30
  if (analysis.risks && analysis.risks.length > 0) score += 30
  if (analysis.recommendations && analysis.recommendations.length > 0) score += 20
  
  return Math.min(score, 100)
}

// Export configuration for debugging
export const AWS_CONFIGURATION = {
  region: AWS_CONFIG.region,
  bucket: S3_BUCKET,
  textractLambda: TEXTRACT_LAMBDA,
  urlLambda: URL_LAMBDA,
  bedrockModel: BEDROCK_MODEL
}