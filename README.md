# 🚀 ClearClause AI - Enterprise Contract Analysis Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![AWS](https://img.shields.io/badge/AWS-Bedrock%20%7C%20Textract-orange.svg)](https://aws.amazon.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.1.0-646CFF.svg)](https://vitejs.dev/)

> **Transform legal document analysis with enterprise-grade AI technology. Get instant insights, risk assessments, and simplified explanations.**

## ✨ Features

### 📄 **Multi-Document Analysis**
- **Document Upload**: PDF, DOCX, TXT, and image files with drag-and-drop
- **Text Input**: Direct text input with character/word count
- **URL Processing**: Web scraping for online documents and terms of service
- **Image OCR**: Extract text from scanned documents using AWS Textract

### ⚖️ **Document Comparison**
- **Multi-Document Comparison**: Analyze 2-5 documents simultaneously
- **Side-by-side Analysis**: Compare key terms, clauses, and risk levels
- **Tabulated Results**: Professional comparison tables with risk indicators
- **Key Differences**: Identify variations in termination, liability, payment terms

### 🤖 **AI-Powered Analysis**
- **AWS Bedrock Integration**: Enterprise-grade AI for contract analysis
- **Local AI Support**: Ollama + Llama 3.1 8B Instruct for offline processing
- **Clause Extraction**: Categorize and score contract clauses with confidence
- **Risk Assessment**: Critical/High/Medium/Low risk levels with explanations

### 📊 **Visual Analytics**
- **Risk Distribution Charts**: Interactive pie charts and comparison metrics
- **Progress Tracking**: Real-time analysis progress with confidence meters
- **Professional UI**: Enterprise-grade interface with animations and themes

## 🏗️ Architecture

```
ClearClause AI/
├── src/                    # React frontend application
│   ├── components/         # Reusable UI components
│   ├── utils/             # AWS services and document processing
│   └── styles/            # Tailwind CSS and custom themes
├── functions/             # Serverless backend functions
├── api/                   # API clients and normalizers
├── model/                 # Local AI model management
├── test/                  # Comprehensive test suite
└── .kiro/specs/          # Feature specifications and tasks
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- AWS Account with Bedrock/Textract access
- (Optional) Ollama for local AI models

### Installation

```bash
# Clone the repository
git clone https://github.com/leishaaa14/clearclause-ai.git
cd clearclause-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your AWS credentials and configuration

# Start development server
npm run dev
```

### AWS Setup

1. **Configure AWS Credentials**:
   ```bash
   # Set up AWS CLI or use environment variables
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   ```

2. **Enable AWS Services**:
   - AWS Bedrock (Claude/Llama models)
   - AWS Textract (document extraction)
   - AWS Lambda (serverless functions)

### Local AI Setup (Optional)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Llama 3.1 8B Instruct model
ollama pull llama3.1:8b-instruct-q4_0

# Run setup script
npm run setup-ai
```

## 📖 Usage

### Single Document Analysis
1. Navigate to `/clearclause`
2. Upload a document (PDF, DOCX, TXT, or image)
3. Click "🚀 Analyze with AI"
4. View results in Summary, Clauses, and Risks tabs

### Multi-Document Comparison
1. Click the "⚖️ Compare Docs" tab
2. Select 2-5 documents for comparison
3. Review document preview and click "🚀 Analyze with AI"
4. View comparison results in Overview, Key Differences, and Risk Analysis tabs

### Text and URL Analysis
- **Text Input**: Paste contract text directly
- **URL Processing**: Enter URLs for terms of service analysis
- **Image Upload**: Upload scanned documents for OCR processing

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm test -- --grep "contract-analysis"
npm test -- --grep "aws-integration"
```

### Test Coverage
- **Property-based Testing**: 22 correctness properties with fast-check
- **Unit Tests**: Component and function testing
- **Integration Tests**: End-to-end workflow validation
- **AWS Integration Tests**: Real AWS service testing

## 🔧 Configuration

### Environment Variables
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_MAX_TOKENS=4096

# Textract Configuration
TEXTRACT_REGION=us-east-1

# Local AI Configuration (Optional)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-instruct-q4_0
```

### Model Configuration
- **Primary**: AWS Bedrock (Claude 3 Sonnet)
- **Fallback**: Local Ollama (Llama 3.1 8B)
- **Context Window**: 128K tokens
- **Temperature**: 0.1 for consistent analysis

## 📊 Performance

### Benchmarks
- **Processing Time**: < 30 seconds for typical contracts
- **Memory Usage**: Optimized with automatic cleanup
- **Accuracy**: High confidence clause extraction and risk assessment
- **Reliability**: 99%+ availability with automatic fallback

### Optimization Features
- **Request Queuing**: Handle concurrent processing
- **Resource Management**: Automatic memory cleanup
- **Performance Monitoring**: Real-time metrics and alerting
- **Graceful Degradation**: Fallback systems for reliability

## 🛠️ Development

### Project Structure
```
src/
├── components/
│   ├── analysis/          # Analysis result components
│   ├── auth/             # Authentication components
│   ├── charts/           # Data visualization
│   ├── layout/           # Layout and navigation
│   └── ui/               # Reusable UI components
├── utils/
│   ├── awsServices.js    # AWS integration
│   ├── documentProcessor.js # Document processing
│   └── mockData.js       # Fallback data
└── styles/               # CSS and themes
```

### Key Components
- **DocumentPreview**: Multi-format document upload
- **ComparisonResults**: Multi-document analysis results
- **RiskPieChart**: Interactive risk visualization
- **ContractProcessor**: AI analysis orchestration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices and hooks patterns
- Write property-based tests for new features
- Update documentation for API changes
- Ensure AWS integration tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AWS Bedrock** for enterprise AI capabilities
- **Ollama** for local AI model hosting
- **React** and **Tailwind CSS** for modern UI development
- **Vite** for fast development and building
- **CUAD Dataset** for contract analysis training data

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions for help and ideas

---

**Built with ❤️ for legal professionals and developers**

*Transform your contract analysis workflow with AI-powered insights and professional-grade tools.*