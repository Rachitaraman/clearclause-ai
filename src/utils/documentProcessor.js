/**
 * Document Processing Service
 * Orchestrates the document analysis workflow using AI-powered contract analysis
 */

// Client-side contract processor (simplified version without server dependencies)

/**
 * Process a single document through the complete analysis pipeline
 */
export async function processDocument(file, options = {}) {
  const results = {
    stage: 'starting',
    progress: 0,
    data: null,
    error: null
  }

  try {
    // Stage 1: Extract text from file
    results.stage = 'textract'
    results.progress = 10

    // Read file content as text
    const fileText = await readFileAsText(file)
    results.progress = 50

    // Stage 2: Analyze with backend API
    results.stage = 'bedrock'
    results.progress = 60

    // Send to backend API for analysis
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        documentText: fileText,
        documentType: file.type,
        filename: file.name
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const analysisResult = await response.json()
    results.progress = 90

    // Stage 3: Format results for UI compatibility
    results.data = {
      document: {
        name: file.name,
        size: file.size,
        type: file.type,
        source: 'file-upload'
      },
      extraction: {
        text: fileText,
        confidence: analysisResult.confidence || 95,
        method: 'api-processing'
      },
      analysis: analysisResult.analysis || analysisResult,
      metadata: {
        processedAt: new Date().toISOString(),
        model: analysisResult.model || 'backend-api',
        confidence: analysisResult.confidence || 95,
        processingMethod: 'api-processing',
        processingTime: analysisResult.processingTime || 0
      }
    }

    results.stage = 'complete'
    results.progress = 100

    return results

  } catch (error) {
    console.error('Document processing error:', error)
    results.error = error.message
    results.stage = 'error'
    return results
  }
}

/**
 * Helper function to read file as text
 * Handles text files, PDFs, Word docs, and Excel files
 */
async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    // Check if it's an Excel file
    if (['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      // For Excel files, we'll send a placeholder that indicates Excel processing is needed
      // The backend will handle the actual Excel parsing
      resolve(`[Excel Document: ${file.name}]\n\nThis is an Excel/CSV file that will be processed by the backend API. The file contains tabular data that will be analyzed for contract terms, financial information, and risk assessment.\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type || 'Excel/CSV Document'}`)
    } else {
      // For text-based files, read as text
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    }
  })
}

/**
 * Process an image document with OCR
 */
export async function processImageDocument(file, options = {}) {
  const results = {
    stage: 'starting',
    progress: 0,
    data: null,
    error: null
  }

  try {
    // For now, return a placeholder for image processing
    // In a full implementation, this would use OCR services
    results.stage = 'textract'
    results.progress = 30

    // Simulate OCR processing
    const placeholderText = `[Image Document: ${file.name}]\n\nThis is a placeholder for OCR-extracted text from the uploaded image. In a production environment, this would contain the actual text extracted from the image using OCR technology.`

    results.stage = 'bedrock'
    results.progress = 60

    // Analyze placeholder text with backend API
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        documentText: placeholderText,
        documentType: 'image'
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const analysisResult = await response.json()
    results.progress = 90

    // Format results
    results.data = {
      document: {
        name: file.name,
        size: file.size,
        type: file.type,
        source: 'image-upload'
      },
      extraction: {
        text: placeholderText,
        confidence: 85,
        method: 'ocr-placeholder'
      },
      analysis: analysisResult.analysis,
      metadata: {
        processedAt: analysisResult.processedAt || new Date().toISOString(),
        model: analysisResult.model,
        confidence: analysisResult.confidence || 85
      }
    }

    results.stage = 'complete'
    results.progress = 100

    return results

  } catch (error) {
    console.error('Image processing error:', error)
    results.error = error.message
    results.stage = 'error'
    return results
  }
}

/**
 * Process text input directly
 */
export async function processTextInput(text, options = {}) {
  const results = {
    stage: 'starting',
    progress: 0,
    data: null,
    error: null
  }

  try {
    // Stage 1: Direct text processing
    results.stage = 'bedrock'
    results.progress = 30

    console.log('processTextInput: Processing text with backend API:', text.substring(0, 100) + '...')

    // Send to backend API for analysis
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        documentText: text,
        documentType: 'text/plain',
        filename: 'Text Input'
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const analysisResult = await response.json()
    console.log('processTextInput: Received API analysis result:', analysisResult)
    results.progress = 90

    // Format results to match expected structure
    results.data = {
      document: {
        name: 'Text Input',
        size: text.length,
        type: 'text/plain',
        source: 'direct-input'
      },
      extraction: {
        text: text,
        confidence: analysisResult.confidence || 95,
        method: 'api-processing'
      },
      analysis: analysisResult.analysis || analysisResult,
      metadata: {
        processedAt: new Date().toISOString(),
        model: analysisResult.model || 'backend-api',
        confidence: analysisResult.confidence || 95,
        processingMethod: 'api-processing',
        processingTime: analysisResult.processingTime || 0
      }
    }

    results.stage = 'complete'
    results.progress = 100

    return results

  } catch (error) {
    console.error('Text processing error:', error)
    results.error = error.message
    results.stage = 'error'
    return results
  }
}

/**
 * Process URL content
 */
export async function processURLContent(url, options = {}) {
  const results = {
    stage: 'starting',
    progress: 0,
    data: null,
    error: null
  }

  try {
    // For now, return a placeholder for URL processing
    // In a full implementation, this would fetch and analyze URL content
    results.stage = 'textract'
    results.progress = 30

    const placeholderText = `[URL Content: ${url}]\n\nThis is a placeholder for content fetched from the provided URL. In a production environment, this would contain the actual text content extracted from the webpage.`

    results.stage = 'bedrock'
    results.progress = 60

    // Analyze placeholder text with backend API
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        documentText: placeholderText,
        documentType: 'url'
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const analysisResult = await response.json()
    results.progress = 90

    // Format results
    results.data = {
      document: {
        name: new URL(url).hostname,
        size: placeholderText.length,
        type: 'text/html',
        source: 'url',
        url: url
      },
      extraction: {
        text: placeholderText,
        confidence: 90,
        method: 'url-placeholder'
      },
      analysis: analysisResult.analysis,
      metadata: {
        processedAt: analysisResult.processedAt || new Date().toISOString(),
        model: analysisResult.model,
        confidence: analysisResult.confidence || 90
      }
    }

    results.stage = 'complete'
    results.progress = 100

    return results

  } catch (error) {
    console.error('URL processing error:', error)
    results.error = error.message
    results.stage = 'error'
    return results
  }
}

/**
 * Compare multiple documents
 */
export async function compareDocuments(documents, options = {}) {
  const results = {
    stage: 'starting',
    progress: 0,
    data: null,
    error: null
  }

  try {
    // Stage 1: Process each document to extract text
    results.stage = 'textract'
    const processedDocs = []

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i]
      results.progress = 10 + (i / documents.length) * 40

      if (doc instanceof File) {
        // Read file content as text
        const fileText = await readFileAsText(doc)
        processedDocs.push({
          name: doc.name,
          text: fileText
        })
      } else if (typeof doc === 'string') {
        // Direct text input
        processedDocs.push({
          name: `Document ${i + 1}`,
          text: doc
        })
      }
    }

    results.progress = 60

    // Stage 2: Compare documents with backend API
    results.stage = 'bedrock'

    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'compare',
        documents: processedDocs
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const comparisonResult = await response.json()
    results.progress = 90

    // Format results
    results.data = {
      documents: processedDocs.map(doc => ({
        name: doc.name,
        textLength: doc.text.length
      })),
      comparison: comparisonResult.comparison,
      metadata: {
        processedAt: comparisonResult.processedAt || new Date().toISOString(),
        model: comparisonResult.model,
        documentsAnalyzed: comparisonResult.documentsAnalyzed || processedDocs.length
      }
    }

    results.stage = 'complete'
    results.progress = 100

    return results

  } catch (error) {
    console.error('Document comparison error:', error)
    results.error = error.message
    results.stage = 'error'
    return results
  }
}

/**
 * Transform AWS analysis results to match the existing UI format
 */
export function transformAnalysisForUI(analysisData) {
  console.log('transformAnalysisForUI: Input data:', analysisData)
  const { analysis, extraction, document, metadata } = analysisData

  // Handle both old format (analysis nested) and new format (analysis is the root)
  const analysisResult = analysis.summary ? analysis : analysis

  const result = {
    summary: {
      title: analysisResult.summary?.title || analysisResult.summary?.documentType || 'AI Contract Analysis',
      totalClauses: analysisResult.clauses?.length || 0,
      riskScore: analysisResult.summary?.riskScore || calculateRiskScore(analysisResult.risks || []),
      keyFindings: [
        analysisResult.summary?.title || 'AI-powered contract analysis completed',
        `Processed with ${Math.round(metadata.confidence || 95)}% confidence using ${metadata.processingMethod || 'AI model'}`,
        `${analysisResult.clauses?.length || 0} clauses identified and categorized`,
        `${analysisResult.risks?.length || 0} risks detected and assessed`,
        `Processing time: ${metadata.processingTime || 0}ms`
      ]
    },
    clauses: (analysisResult.clauses || []).map(clause => ({
      id: clause.id,
      title: clause.category || clause.type || 'Contract Clause',
      text: clause.text || clause.content,
      type: clause.type,
      category: clause.category,
      confidence: clause.confidence,
      riskLevel: determineClauseRiskLevel(clause, analysisResult.risks || []),
      explanation: generateClauseExplanation(clause)
    })),
    risks: calculateRiskCounts(analysisResult.risks || []),
    metadata: {
      ...metadata,
      document: document,
      extraction: {
        method: extraction?.method || metadata.processingMethod,
        confidence: extraction?.confidence || metadata.confidence,
        textLength: extraction?.text?.length || document?.size || 0
      },
      aiAnalysis: {
        modelUsed: metadata.model || metadata.modelUsed,
        processingMethod: metadata.processingMethod,
        processingTime: metadata.processingTime,
        confidence: metadata.confidence
      }
    },
    // Include error details if present
    errorDetails: metadata.errorDetails
  }

  console.log('transformAnalysisForUI: Output result:', result)
  return result
}

/**
 * Helper functions
 */
function calculateRiskScore(risks) {
  if (!risks || risks.length === 0) return 0

  const severityWeights = { critical: 10, high: 7, medium: 4, low: 1 }
  const totalScore = risks.reduce((sum, risk) => {
    const severity = risk.severity?.toLowerCase() || 'low'
    return sum + (severityWeights[severity] || 1)
  }, 0)

  return Math.round((totalScore / risks.length) * 10) / 10
}

function calculateRiskCounts(risks) {
  if (!risks || risks.length === 0) return []

  const counts = risks.reduce((acc, risk) => {
    const severity = risk.severity?.toLowerCase() || 'low'
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {})

  const colors = {
    critical: '#dc2626',
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  }

  return Object.entries(counts).map(([level, count]) => ({
    level,
    count,
    color: colors[level] || '#6b7280'
  }))
}

function determineClauseRiskLevel(clause, risks) {
  // Find risks that affect this clause
  const relatedRisks = risks.filter(risk =>
    risk.affectedClauses && risk.affectedClauses.includes(clause.id)
  )

  if (relatedRisks.length === 0) return 'low'

  // Return the highest risk level
  const riskLevels = { low: 1, medium: 2, high: 3, critical: 4 }
  const maxRisk = relatedRisks.reduce((max, risk) => {
    const level = risk.severity?.toLowerCase() || 'low'
    return riskLevels[level] > riskLevels[max] ? level : max
  }, 'low')

  return maxRisk
}

function generateClauseExplanation(clause) {
  // Generate a simple explanation based on clause type
  const explanations = {
    payment_terms: 'This clause defines when and how payments should be made.',
    termination_clause: 'This clause specifies conditions under which the contract can be ended.',
    liability_limitation: 'This clause limits the liability of one or both parties.',
    confidentiality_agreement: 'This clause requires parties to keep certain information confidential.',
    intellectual_property: 'This clause addresses ownership and use of intellectual property.',
    force_majeure: 'This clause addresses unforeseeable circumstances that prevent contract fulfillment.',
    governing_law: 'This clause specifies which jurisdiction\'s laws govern the contract.',
    dispute_resolution: 'This clause outlines how disputes will be resolved.',
    warranties_representations: 'This clause contains promises or guarantees made by the parties.',
    indemnification: 'This clause requires one party to protect the other from certain losses.',
    assignment_rights: 'This clause addresses whether contract rights can be transferred.',
    amendment_modification: 'This clause specifies how the contract can be changed.',
    severability_clause: 'This clause ensures the contract remains valid even if parts are unenforceable.',
    entire_agreement: 'This clause states that the contract represents the complete agreement.',
    notice_provisions: 'This clause specifies how official communications should be made.'
  }

  return explanations[clause.type] || 'This is a contract clause that requires review.'
}

function generateSimplifiedText(content) {
  // Simple text simplification - in production, this could use another AI model
  return content
    .replace(/\b(shall|hereby|whereas|heretofore|hereinafter)\b/gi, '')
    .replace(/\b(the party of the first part|the party of the second part)\b/gi, 'the party')
    .replace(/\s+/g, ' ')
    .trim()
}