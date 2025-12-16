#!/usr/bin/env node

// AI Model Setup Script
// Helps with Ollama installation and model setup for contract analysis

import OllamaConfig from '../model/config/OllamaConfig.js';
import ModelConfig from '../model/config/ModelConfig.js';

class AIModelSetup {
  constructor() {
    this.ollama = new OllamaConfig();
  }

  /**
   * Run the complete setup process
   */
  async run() {
    console.log('🚀 AI Contract Analysis Model Setup');
    console.log('=====================================\n');

    try {
      // Check Ollama availability
      await this.checkOllamaService();
      
      // Setup recommended models
      await this.setupModels();
      
      // Verify setup
      await this.verifySetup();
      
      console.log('\n✅ AI model setup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Start your application: npm run dev');
      console.log('2. Upload a contract document to test AI analysis');
      console.log('3. Check the console for AI processing logs');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      console.log('\nTroubleshooting:');
      console.log('1. Make sure Ollama is installed: https://ollama.ai/download');
      console.log('2. Start Ollama service: ollama serve');
      console.log('3. Check if port 11434 is available');
      process.exit(1);
    }
  }

  /**
   * Check if Ollama service is running
   */
  async checkOllamaService() {
    console.log('🔍 Checking Ollama service...');
    
    const isAvailable = await this.ollama.isAvailable();
    
    if (!isAvailable) {
      throw new Error('Ollama service is not running. Please install and start Ollama first.');
    }
    
    console.log('✅ Ollama service is running');
    
    // List existing models
    const models = await this.ollama.listModels();
    console.log(`📋 Found ${models.length} existing models`);
    
    if (models.length > 0) {
      console.log('   Existing models:');
      models.forEach(model => {
        console.log(`   - ${model.name} (${this.formatSize(model.size)})`);
      });
    }
  }

  /**
   * Setup recommended models for contract analysis
   */
  async setupModels() {
    console.log('\n📦 Setting up AI models for contract analysis...');
    
    const recommendedModels = [
      {
        name: 'llama3.1:8b-instruct-q8_0',
        description: 'Primary model for contract analysis (8B parameters)',
        priority: 'high'
      },
      {
        name: 'llama3.2:3b',
        description: 'Lightweight alternative (3B parameters)',
        priority: 'medium'
      },
      {
        name: 'mistral:7b-instruct',
        description: 'Multilingual support (7B parameters)',
        priority: 'low'
      }
    ];

    for (const model of recommendedModels) {
      await this.setupSingleModel(model);
    }
  }

  /**
   * Setup a single model
   * @param {Object} modelInfo - Model information
   */
  async setupSingleModel(modelInfo) {
    console.log(`\n🔄 Setting up ${modelInfo.name}...`);
    console.log(`   ${modelInfo.description}`);
    
    try {
      const isAvailable = await this.ollama.isModelAvailable(modelInfo.name);
      
      if (isAvailable) {
        console.log(`✅ ${modelInfo.name} is already available`);
        return;
      }

      console.log(`📥 Downloading ${modelInfo.name}... (this may take several minutes)`);
      
      const pullSuccess = await this.ollama.pullModel(modelInfo.name);
      
      if (pullSuccess) {
        console.log(`✅ ${modelInfo.name} downloaded successfully`);
      } else {
        console.log(`⚠️  Failed to download ${modelInfo.name}`);
        
        if (modelInfo.priority === 'high') {
          throw new Error(`Critical model ${modelInfo.name} failed to download`);
        }
      }
    } catch (error) {
      console.error(`❌ Error setting up ${modelInfo.name}:`, error.message);
      
      if (modelInfo.priority === 'high') {
        throw error;
      }
    }
  }

  /**
   * Verify the setup by testing model inference
   */
  async verifySetup() {
    console.log('\n🧪 Verifying AI model setup...');
    
    try {
      // Test primary model
      const primaryModel = 'llama3.1:8b-instruct-q8_0';
      const isAvailable = await this.ollama.isModelAvailable(primaryModel);
      
      if (!isAvailable) {
        throw new Error('Primary model not available');
      }

      // Test simple inference
      console.log('🔬 Testing model inference...');
      
      const testPrompt = 'Analyze this simple contract clause: "Payment is due within 30 days." Identify the clause type.';
      
      const response = await this.ollama.generate(primaryModel, testPrompt, {
        temperature: 0.1,
        maxTokens: 100
      });

      if (response && response.length > 0) {
        console.log('✅ Model inference test successful');
        console.log(`   Response preview: ${response.substring(0, 100)}...`);
      } else {
        throw new Error('Model inference returned empty response');
      }

    } catch (error) {
      console.error('❌ Model verification failed:', error.message);
      console.log('⚠️  The models are installed but may need additional configuration');
    }
  }

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string} - Formatted size
   */
  formatSize(bytes) {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Display system requirements and recommendations
   */
  displaySystemRequirements() {
    console.log('\n💻 System Requirements:');
    console.log('- RAM: 16GB+ recommended for 8B models');
    console.log('- Storage: 10GB+ free space for models');
    console.log('- CPU: Modern multi-core processor');
    console.log('- GPU: Optional but recommended for faster inference');
    console.log('\n📚 Model Information:');
    console.log('- Llama 3.1 8B: Best accuracy, requires ~8GB RAM');
    console.log('- Llama 3.2 3B: Good balance, requires ~3GB RAM');
    console.log('- Mistral 7B: Multilingual, requires ~7GB RAM');
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new AIModelSetup();
  
  // Display system requirements first
  setup.displaySystemRequirements();
  
  // Ask for confirmation
  console.log('\n❓ Do you want to proceed with model setup? (y/N)');
  
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      const input = chunk.trim().toLowerCase();
      
      if (input === 'y' || input === 'yes') {
        setup.run();
      } else {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }
  });
}

export default AIModelSetup;