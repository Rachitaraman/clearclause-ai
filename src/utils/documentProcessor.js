/**
 * Document Processing Service
 * Orchestrates the document analysis workflow using backend API
 */

// No AWS imports needed - we use the backend API for everything

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
    // For now, convert file to text and process via backend API
    results.stage = 'textract'
    results.progress = 10
    
    // Read file content as text
    const fileText = await readFileAsText(file)
    results.progress = 50

    // Stage 2: Analyze with backend API
    results.stage = 'bedrock'
    
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        documentText: fileText,
        documentType: file.type
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const analysisResult = await response.json()
    results.progress = 90

    // Stage 3: Format results
    results.data = {
      document: {
        name: file.name,
        size: file.size,
        type: file.type,
        source: 'file-upload'
      },
      extraction: {
        text: fileText,
        confidence: 95,
        method: 'file-reader'
      },
      analysis: analysisResult.analysis,
      metadata: {
        processedAt: analysisResult.processedAt || new Date().toISOString(),
        model: analysisResult.model,
        confidence: analysisResult.confidence || 95
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
 */
async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('Failed to read file'))
    reader.readAsText(file)
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
    // Use local backend API instead of direct AWS calls
    results.stage = 'bedrock'
    results.progress = 30
    
    console.log('processTextInput: Sending request to backend with text:', text.substring(0, 100) + '...')
    
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        documentText: text,
        documentType: 'text'
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const analysisResult = await response.json()
    console.log('processTextInput: Received response from backend:', analysisResult)
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
        confidence: 100,
        method: 'direct-input'
      },
      analysis: analysisResult.analysis,
      metadata: {
        processedAt: analysisResult.processedAt || new Date().toISOString(),
        model: analysisResult.model,
        confidence: analysisResult.confidence || 95
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

  const result = {
    summary: {
      title: analysis.summary?.documentType || 'Legal Document Analysis',
      totalClauses: analysis.clauses?.length || 0,
      riskScore: calculateRiskScore(analysis.risks || []),
      keyFindings: [
        analysis.summary?.keyPurpose || 'Document analysis completed',
        `Processed with ${metadata.confidence}% confidence`,
        `${analysis.clauses?.length || 0} clauses identified`,
        `${analysis.risks?.length || 0} risks detected`
      ]
    },
    clauses: (analysis.clauses || []).map(clause => ({
      id: clause.id,
      title: clause.title,
      text: clause.content, // UI expects 'text' not 'content'
      riskLevel: clause.riskLevel,
      explanation: clause.explanation
    })),
    risks: calculateRiskCounts(analysis.risks || []),
    metadata: {
      ...metadata,
      document: document,
      extraction: {
        method: extraction.method,
        confidence: extraction.confidence,
        textLength: extraction.text.length
      }
    }
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
    return sum + (severityWeights[risk.severity] || 1)
  }, 0)
  
  return Math.round((totalScore / risks.length) * 10) / 10
}

function calculateRiskCounts(risks) {
  if (!risks || risks.length === 0) return []
  
  const counts = risks.reduce((acc, risk) => {
    acc[risk.severity] = (acc[risk.severity] || 0) + 1
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

function generateSimplifiedText(content) {
  // Simple text simplification - in production, this could use another AI model
  return content
    .replace(/\b(shall|hereby|whereas|heretofore|hereinafter)\b/gi, '')
    .replace(/\b(the party of the first part|the party of the second part)\b/gi, 'the party')
    .replace(/\s+/g, ' ')
    .trim()
}