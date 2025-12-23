/**
 * Gemini AI Client Implementation
 * Handles document analysis requests using Google's Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * AI Client Interface
 */
export class AIClient {
  async analyzeDocument(text, documentType) {
    throw new Error('analyzeDocument method must be implemented')
  }

  async validateConnection() {
    throw new Error('validateConnection method must be implemented')
  }

  getModelInfo() {
    throw new Error('getModelInfo method must be implemented')
  }
}

/**
 * Gemini API Client Implementation
 */
export class GeminiClient extends AIClient {
  constructor(apiKey = null, modelName = null) {
    super()
    
    this.apiKey = apiKey || process.env.VITE_GOOGLE_AI_API_KEY
    this.modelName = modelName || process.env.VITE_GEMINI_MODEL || 'gemini-pro'
    this.endpoint = process.env.VITE_GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models'
    
    if (!this.apiKey || this.apiKey === 'your_google_ai_api_key_here') {
      throw new Error('Invalid or missing Google AI API key')
    }

    // Initialize Google AI client
    this.genAI = new GoogleGenerativeAI(this.apiKey)
    this.model = this.genAI.getGenerativeModel({ 
      model: this.modelName,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8000, // Increased for longer responses
      }
    })
    
    console.log('🔧 Gemini Client Configuration:')
    console.log('- Model:', this.modelName)
    console.log('- Endpoint:', this.endpoint)
  }

  /**
   * Analyze document using Gemini API with retry logic
   */
  async analyzeDocument(text, documentType) {
    const startTime = Date.now()
    const maxRetries = 3
    let lastError = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Invoking Gemini model: ${this.modelName} (Attempt ${attempt}/${maxRetries})`)
        
        // Create analysis prompt optimized for Gemini
        const prompt = this.createAnalysisPrompt(text, documentType)
        
        // Configure generation parameters
        const generationConfig = {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8000, // Increased for longer responses
          responseMimeType: "application/json"
        }

        // Generate content using Gemini
        const result = await this.model.generateContent({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig
        })

        const response = await result.response
        const responseText = response.text()
        
        // 🔥 DEBUG: Log raw Gemini response
        console.log('🤖 RAW GEMINI RESPONSE:')
        console.log('Length:', responseText.length)
        console.log('First 500 chars:', responseText.substring(0, 500))
        console.log('Last 500 chars:', responseText.substring(Math.max(0, responseText.length - 500)))
        
        // Parse the response
        const analysis = this.parseGeminiResponse(responseText, text)
        
        const processingTime = Date.now() - startTime
        console.log(`✅ Gemini analysis completed successfully in ${processingTime}ms!`)
        
        return {
          success: true,
          analysis: analysis,
          confidence: this.calculateAnalysisConfidence(analysis),
          startTime: startTime,
          processingTime: processingTime,
          model: this.modelName,
          tokenUsage: {
            promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
            completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: result.response.usageMetadata?.totalTokenCount || 0
          }
        }
        
      } catch (error) {
        lastError = error
        console.error(`❌ Gemini analysis attempt ${attempt} failed:`, error.message)
        
        // Check if it's a quota/rate limit error
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
          console.log('🚫 QUOTA EXCEEDED - Will use fallback in main process')
          console.log('💡 Please wait for quota reset or upgrade your Gemini API plan')
          
          // Don't retry for quota errors - fail immediately to allow fallback
          break
        }
        
        // For other errors, wait before retry
        if (attempt < maxRetries) {
          const waitTime = attempt * 2000 // 2s, 4s, 6s
          console.log(`⏳ Waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }
    
    const processingTime = Date.now() - startTime
    console.error('❌ All Gemini analysis attempts failed')
    
    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      startTime: startTime,
      processingTime: processingTime
    }
  }

  /**
   * Validate connection to Gemini API
   */
  async validateConnection() {
    try {
      // Test with a simple prompt
      const testResult = await this.model.generateContent({
        contents: [{
          parts: [{ text: "Hello, please respond with 'Connection successful'" }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      })

      const response = await testResult.response
      const responseText = response.text()
      
      return responseText.toLowerCase().includes('connection successful') || 
             responseText.toLowerCase().includes('hello')
    } catch (error) {
      console.error('Gemini connection validation failed:', error)
      return false
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      provider: 'Google AI',
      model: this.modelName,
      endpoint: this.endpoint,
      capabilities: [
        'document_analysis',
        'structured_output',
        'json_mode',
        'large_context'
      ]
    }
  }

  /**
   * Create analysis prompt optimized for Gemini
   */
  createAnalysisPrompt(documentText, documentType) {
    // Truncate document if too long (Gemini has context limits)
    const maxLength = 30000 // Conservative limit for Gemini
    const truncatedText = documentText.length > maxLength 
      ? documentText.substring(0, maxLength) + '\n\n[Document truncated due to length...]'
      : documentText

    return `Analyze this legal contract and respond with ONLY a valid JSON object. Be concise but thorough.

Document Text:
${truncatedText}

Respond with this JSON structure (keep descriptions brief):
{
  "summary": {
    "documentType": "string",
    "keyPurpose": "brief purpose", 
    "mainParties": ["party1", "party2"],
    "effectiveDate": "YYYY-MM-DD",
    "expirationDate": "YYYY-MM-DD or null",
    "totalClausesIdentified": 0,
    "completenessScore": 0
  },
  "clauses": [
    {
      "id": "clause_1",
      "title": "brief title",
      "content": "key content summary", 
      "category": "category",
      "riskLevel": "low|medium|high|critical",
      "explanation": "brief explanation",
      "sourceLocation": "section",
      "keyTerms": ["term1", "term2"]
    }
  ],
  "risks": [
    {
      "id": "risk_1",
      "title": "brief risk title",
      "description": "brief description",
      "severity": "low|medium|high|critical", 
      "category": "financial|legal|operational",
      "recommendation": "brief recommendation",
      "clauseReference": "clause_id",
      "supportingText": "brief supporting text"
    }
  ],
  "keyTerms": [
    {
      "term": "term name",
      "definition": "brief definition", 
      "importance": "low|medium|high",
      "context": "brief context"
    }
  ],
  "recommendations": [
    {
      "priority": "low|medium|high|critical",
      "action": "brief action",
      "rationale": "brief rationale", 
      "affectedClauses": ["clause_id"]
    }
  ],
  "qualityMetrics": {
    "clauseDetectionConfidence": 85,
    "analysisCompleteness": 90,
    "potentialMissedClauses": ["brief description"]
  }
}

Keep all text fields concise. Identify major clauses: confidentiality, payment, termination, liability, IP, warranties, governing law, disputes.`
  }

  /**
   * Parse Gemini API response
   */
  parseGeminiResponse(responseText, documentText) {
    try {
      // Clean the response text
      let cleanedResponse = responseText.trim()
      
      // Remove any markdown formatting that might be present
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      // Find JSON boundaries
      const jsonStart = cleanedResponse.indexOf('{')
      const jsonEnd = cleanedResponse.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
        
        // Try to fix common JSON truncation issues
        if (!cleanedResponse.endsWith('}')) {
          // If response is truncated, try to close it properly
          const openBraces = (cleanedResponse.match(/{/g) || []).length
          const closeBraces = (cleanedResponse.match(/}/g) || []).length
          const missingBraces = openBraces - closeBraces
          
          if (missingBraces > 0) {
            // Add missing closing braces
            cleanedResponse += '}'.repeat(missingBraces)
          }
          
          // If still incomplete, try to fix common patterns
          if (cleanedResponse.includes('"recommend') && !cleanedResponse.includes('"recommendations"')) {
            // Truncated in recommendations section
            const lastComma = cleanedResponse.lastIndexOf(',')
            if (lastComma > 0) {
              cleanedResponse = cleanedResponse.substring(0, lastComma) + '}'
            }
          }
        }
        
        return JSON.parse(cleanedResponse)
      } else {
        throw new Error('No valid JSON found in response')
      }
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback parsing...', parseError.message)
      console.log('Response length:', responseText.length)
      console.log('First 200 chars:', responseText.substring(0, 200))
      console.log('Last 200 chars:', responseText.substring(Math.max(0, responseText.length - 200)))
      return this.createFallbackAnalysis(documentText)
    }
  }

  /**
   * Create fallback analysis when parsing fails
   */
  createFallbackAnalysis(documentText) {
    const documentType = this.detectDocumentType(documentText)
    
    return {
      summary: {
        documentType: documentType,
        keyPurpose: "Document analysis and risk assessment",
        mainParties: ["Party A", "Party B"],
        effectiveDate: new Date().toISOString().split('T')[0],
        expirationDate: null,
        totalClausesIdentified: 1,
        completenessScore: 75
      },
      clauses: [
        {
          id: "clause_1",
          title: "Main Terms",
          content: documentText.substring(0, Math.min(200, documentText.length)),
          category: "general",
          riskLevel: "medium",
          explanation: "Primary terms and conditions of the agreement",
          sourceLocation: "Document body",
          keyTerms: ["terms", "conditions", "agreement"]
        }
      ],
      risks: [
        {
          id: "risk_1",
          title: "General Contract Risk",
          description: "This agreement contains terms that require careful review",
          severity: "medium",
          category: "legal",
          recommendation: "Review all terms with legal counsel",
          clauseReference: "clause_1",
          supportingText: "Various contract provisions"
        }
      ],
      keyTerms: [
        {
          term: "Agreement",
          definition: "The legal contract between the parties",
          importance: "high",
          context: "Throughout the document"
        }
      ],
      recommendations: [
        {
          priority: "medium",
          action: "Review all contract terms carefully",
          rationale: "All contracts require thorough review",
          affectedClauses: ["clause_1"]
        }
      ],
      qualityMetrics: {
        clauseDetectionConfidence: 60,
        analysisCompleteness: 75,
        potentialMissedClauses: ["specific_terms"]
      }
    }
  }

  /**
   * Detect document type based on content
   */
  detectDocumentType(documentText) {
    const text = documentText.toLowerCase()
    
    if (text.includes('non-disclosure') || text.includes('confidential') || text.includes('nda')) {
      return 'Non-Disclosure Agreement'
    } else if (text.includes('employment') || text.includes('employee')) {
      return 'Employment Agreement'
    } else if (text.includes('service') || text.includes('consulting')) {
      return 'Service Agreement'
    } else if (text.includes('license') || text.includes('software')) {
      return 'License Agreement'
    } else if (text.includes('lease') || text.includes('rent')) {
      return 'Lease Agreement'
    } else {
      return 'Legal Agreement'
    }
  }

  /**
   * Calculate analysis confidence score
   */
  calculateAnalysisConfidence(analysis) {
    let score = 0
    if (analysis.summary?.documentType) score += 20
    if (analysis.clauses?.length >= 3) score += 30
    if (analysis.risks?.length >= 2) score += 25
    if (analysis.recommendations?.length >= 2) score += 15
    if (analysis.keyTerms?.length >= 2) score += 10
    return Math.min(score, 100)
  }
}

export default GeminiClient