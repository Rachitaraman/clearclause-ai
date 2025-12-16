// AI Model Configuration
// Centralized configuration for AI models and processing parameters

export const ModelConfig = {
  // Primary model configuration
  primary: {
    modelName: "llama-3.1-8b-instruct",
    maxTokens: 128000,
    temperature: 0.1,
    topP: 0.9,
    contextWindow: 128000,
    batchSize: 1,
    memoryOptimization: true,
    quantization: "int8"
  },

  // Alternative model configurations
  alternatives: {
    lightweight: {
      modelName: "llama-3.2-3b",
      maxTokens: 64000,
      temperature: 0.1,
      topP: 0.9,
      contextWindow: 64000,
      batchSize: 1,
      memoryOptimization: true,
      quantization: "int8"
    },
    
    multilingual: {
      modelName: "mistral-7b-instruct",
      maxTokens: 100000,
      temperature: 0.1,
      topP: 0.9,
      contextWindow: 100000,
      batchSize: 1,
      memoryOptimization: true,
      quantization: "int8"
    }
  },

  // Ollama configuration
  ollama: {
    baseUrl: "http://localhost:11434",
    timeout: 300000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 1000
  },

  // Performance thresholds
  performance: {
    maxProcessingTime: 30000, // 30 seconds
    memoryLimit: 16000, // 16GB
    concurrentRequests: 3,
    queueTimeout: 60000 // 1 minute
  },

  // Clause type definitions
  clauseTypes: {
    PAYMENT: "payment_terms",
    TERMINATION: "termination_clause",
    LIABILITY: "liability_limitation", 
    CONFIDENTIALITY: "confidentiality_agreement",
    INTELLECTUAL_PROPERTY: "ip_rights",
    FORCE_MAJEURE: "force_majeure",
    GOVERNING_LAW: "governing_law",
    DISPUTE_RESOLUTION: "dispute_resolution",
    WARRANTIES: "warranties_representations",
    INDEMNIFICATION: "indemnification",
    ASSIGNMENT: "assignment_rights",
    AMENDMENT: "amendment_modification",
    SEVERABILITY: "severability_clause",
    ENTIRE_AGREEMENT: "entire_agreement",
    NOTICE: "notice_provisions"
  },

  // Risk severity levels
  riskLevels: {
    LOW: "Low",
    MEDIUM: "Medium", 
    HIGH: "High",
    CRITICAL: "Critical"
  },

  // Prompting templates
  prompts: {
    clauseExtraction: `
You are a legal AI assistant specialized in contract analysis. Extract and categorize clauses from the following contract text.

Contract Text:
{contractText}

Instructions:
1. Identify individual clauses in the contract
2. Categorize each clause using these types: {clauseTypes}
3. Assign confidence scores (0.0-1.0) for each categorization
4. Extract the full text of each clause
5. Provide a summary count of each clause type

Return your response in the following JSON format:
{
  "clauses": [
    {
      "id": "unique_id",
      "text": "full clause text",
      "type": "clause_type",
      "category": "category_name",
      "confidence": 0.95,
      "startPosition": 0,
      "endPosition": 100
    }
  ],
  "summary": {
    "totalClauses": 10,
    "clauseTypeCounts": {
      "payment_terms": 2,
      "termination_clause": 1
    }
  }
}`,

    riskAnalysis: `
You are a legal risk assessment AI. Analyze the following contract clauses for potential legal and business risks.

Clauses:
{clauses}

Instructions:
1. Evaluate each clause for potential risks
2. Assign risk levels: Low, Medium, High, Critical
3. Provide specific explanations for each risk
4. Generate actionable mitigation recommendations
5. Prioritize risks by severity and business impact

Return your response in the following JSON format:
{
  "risks": [
    {
      "id": "risk_id",
      "title": "Risk Title",
      "description": "Detailed risk description",
      "severity": "High",
      "category": "liability",
      "affectedClauses": ["clause_id_1"],
      "mitigation": "Recommended mitigation strategy",
      "confidence": 0.85
    }
  ],
  "recommendations": [
    {
      "id": "rec_id",
      "title": "Recommendation Title",
      "description": "Detailed recommendation",
      "priority": "High",
      "category": "risk_mitigation",
      "actionRequired": true
    }
  ]
}`
  }
};

export default ModelConfig;