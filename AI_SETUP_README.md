# AI Contract Analysis Setup Guide

## Overview

This guide helps you set up the AI-powered contract analysis system for ClearClause. The system uses local AI models via Ollama for intelligent contract processing with API fallback for reliability.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │ Contract         │    │ AI Model        │
│   (React)       │───▶│ Processor        │───▶│ System          │
│                 │    │ (Unified)        │    │ (Ollama)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                              │                          ▼
                              │                 ┌─────────────────┐
                              │                 │ Model Manager   │
                              │                 │ - Llama 3.1 8B  │
                              │                 │ - Memory Mgmt   │
                              │                 │ - Health Check  │
                              │                 └─────────────────┘
                              ▼
                       ┌─────────────────┐
                       │ API Fallback    │
                       │ System          │
                       │ - External APIs │
                       │ - Retry Logic   │
                       │ - Normalization │
                       └─────────────────┘
```

## Directory Structure

```
├── model/                     # AI Model System
│   ├── core/
│   │   └── ModelManager.js    # Model lifecycle management
│   ├── config/
│   │   ├── ModelConfig.js     # Model configurations
│   │   └── OllamaConfig.js    # Ollama integration
│   ├── analyzers/             # Analysis components (to be created)
│   ├── extractors/            # Clause extraction (to be created)
│   └── parsers/               # Document parsing (to be created)
├── api/                       # API Fallback System
│   ├── clients/
│   │   └── APIClient.js       # External API integration
│   └── normalizers/
│       └── ResponseNormalizer.js # Response standardization
├── src/processors/
│   └── ContractProcessor.js   # Unified processing interface
└── scripts/
    └── setup-ai-models.js     # Setup automation
```

## Prerequisites

### System Requirements

- **RAM**: 16GB+ recommended (8GB minimum)
- **Storage**: 10GB+ free space for AI models
- **CPU**: Modern multi-core processor
- **GPU**: Optional but recommended for faster inference
- **Node.js**: 18+ with ES modules support

### Software Dependencies

1. **Ollama** (Required for local AI models)
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Or download from: https://ollama.ai/download
   ```

2. **Node.js Dependencies** (Already installed)
   - pdf-parse: PDF text extraction
   - mammoth: DOCX document conversion
   - axios: HTTP client for API calls
   - winston: Structured logging
   - fast-check: Property-based testing

## Quick Start

### 1. Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download installer from https://ollama.ai/download

# Start Ollama service
ollama serve
```

### 2. Setup AI Models

```bash
# Run automated setup
npm run setup-ai

# Or manually setup models
npm run ai:models
```

### 3. Verify Installation

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Start development server
npm run dev
```

## AI Models

### Primary Model: Llama 3.1 8B Instruct

- **Parameters**: 8 billion
- **Context Window**: 128K tokens
- **Memory Usage**: ~8GB (4GB with quantization)
- **Best For**: Comprehensive contract analysis
- **Download Size**: ~4.7GB

### Alternative Models

1. **Llama 3.2 3B** (Lightweight)
   - Memory: ~3GB
   - Good for resource-constrained environments

2. **Mistral 7B Instruct** (Multilingual)
   - Memory: ~7GB
   - Supports multiple languages

## Configuration

### Model Configuration

Edit `model/config/ModelConfig.js`:

```javascript
export const ModelConfig = {
  primary: {
    modelName: "llama-3.1-8b-instruct",
    maxTokens: 128000,
    temperature: 0.1,
    topP: 0.9,
    contextWindow: 128000
  }
};
```

### Ollama Configuration

Edit `model/config/OllamaConfig.js`:

```javascript
this.baseUrl = 'http://localhost:11434';
this.timeout = 300000; // 5 minutes
```

### API Fallback Configuration

Set environment variables:

```bash
# .env
FALLBACK_API_URL=https://your-api-service.com
FALLBACK_API_KEY=your-api-key
```

## Usage

### Basic Contract Processing

```javascript
import ContractProcessor from './src/processors/ContractProcessor.js';

const processor = new ContractProcessor();

const result = await processor.processContract({
  text: "Your contract text here...",
  filename: "contract.pdf"
});

console.log(result.summary);
console.log(result.clauses);
console.log(result.risks);
```

### Processing Options

```javascript
const options = {
  extractClauses: true,
  assessRisks: true,
  generateRecommendations: true,
  confidenceThreshold: 0.8
};

const result = await processor.processContract(document, options);
```

## Features

### Clause Extraction

- **15+ Clause Types**: Payment, termination, liability, etc.
- **Confidence Scoring**: 0.0-1.0 confidence for each clause
- **Position Tracking**: Start/end positions in document
- **Categorization**: Automatic grouping by clause type

### Risk Analysis

- **4 Risk Levels**: Low, Medium, High, Critical
- **Risk Explanations**: Detailed reasoning for each risk
- **Mitigation Strategies**: Actionable recommendations
- **Priority Ranking**: Sorted by severity and impact

### Document Support

- **PDF**: Text extraction with structure preservation
- **DOCX**: Microsoft Word document conversion
- **TXT**: Plain text processing
- **Size Limit**: Up to 50,000 tokens (~200KB text)

## Performance

### Processing Targets

- **Speed**: < 30 seconds per contract
- **Memory**: Optimized loading and cleanup
- **Concurrency**: Up to 3 simultaneous requests
- **Reliability**: 99%+ availability with API fallback

### Monitoring

```javascript
// Get processing statistics
const stats = processor.getProcessingStats();
console.log(stats.aiModelSuccessRate);
console.log(stats.totalRequests);
```

## Troubleshooting

### Common Issues

1. **Ollama Not Running**
   ```bash
   # Start Ollama service
   ollama serve
   
   # Check status
   curl http://localhost:11434/api/tags
   ```

2. **Model Download Failed**
   ```bash
   # Manual model pull
   ollama pull llama3.1:8b-instruct-q8_0
   
   # Check available models
   ollama list
   ```

3. **Memory Issues**
   - Use lighter model: `llama3.2:3b`
   - Enable quantization in config
   - Close other applications

4. **Port Conflicts**
   - Change Ollama port: `OLLAMA_HOST=0.0.0.0:11435 ollama serve`
   - Update config in `OllamaConfig.js`

### Debug Mode

```bash
# Enable debug logging
DEBUG=ai-contract-analysis npm run dev

# Check model status
curl http://localhost:11434/api/show -d '{"name": "llama3.1:8b-instruct-q8_0"}'
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run property-based tests
npm run test:watch

# Test specific component
npm test -- model/core/ModelManager.test.js
```

### Adding New Models

1. Update `ModelConfig.js` with new model configuration
2. Add model to `setup-ai-models.js` recommended list
3. Test with `ContractProcessor`

### Extending Analysis

1. Create new analyzer in `model/analyzers/`
2. Register in `ContractAnalyzer.js`
3. Add corresponding tests

## API Reference

### ContractProcessor

- `processContract(document, options)`: Main processing method
- `getProcessingStats()`: Get performance metrics
- `cleanup()`: Release resources

### ModelManager

- `loadModel(config)`: Load AI model
- `inference(prompt, options)`: Run inference
- `getModelStatus()`: Check model health
- `optimizeMemory()`: Clean up resources

### APIClient

- `analyzeContract(text, options)`: External API analysis
- `validateAPIResponse(response)`: Response validation

## Support

For issues and questions:

1. Check this README and troubleshooting section
2. Review console logs for error details
3. Verify Ollama installation and model availability
4. Test with smaller documents first

## Next Steps

After setup completion:

1. **Test Basic Functionality**: Upload a simple contract
2. **Monitor Performance**: Check processing times and memory usage
3. **Customize Configuration**: Adjust model parameters for your needs
4. **Implement Additional Features**: Add custom clause types or risk categories
5. **Scale Deployment**: Consider GPU acceleration for production use