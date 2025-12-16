// Ollama Configuration and Integration
// Handles connection and communication with Ollama for local AI model hosting

import axios from 'axios';

export class OllamaConfig {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.timeout = config.timeout || 300000; // 5 minutes
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check if Ollama service is available
   * @returns {Promise<boolean>} - Service availability status
   */
  async isAvailable() {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch (error) {
      console.warn('Ollama service not available:', error.message);
      return false;
    }
  }

  /**
   * List available models in Ollama
   * @returns {Promise<Array>} - List of available models
   */
  async listModels() {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  /**
   * Pull a model from Ollama registry
   * @param {string} modelName - Name of the model to pull
   * @returns {Promise<boolean>} - Success status
   */
  async pullModel(modelName) {
    try {
      console.log(`Pulling model: ${modelName}`);
      
      const response = await this.client.post('/api/pull', {
        name: modelName
      });
      
      return response.status === 200;
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Generate text using Ollama model
   * @param {string} modelName - Model to use for generation
   * @param {string} prompt - Input prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} - Generated text
   */
  async generate(modelName, prompt, options = {}) {
    try {
      const requestData = {
        model: modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.1,
          top_p: options.topP || 0.9,
          num_predict: options.maxTokens || 4096,
          ...options
        }
      };

      const response = await this.client.post('/api/generate', requestData);
      
      if (response.data && response.data.response) {
        return response.data.response;
      } else {
        throw new Error('Invalid response format from Ollama');
      }
    } catch (error) {
      console.error('Ollama generation failed:', error);
      throw new Error(`Ollama generation failed: ${error.message}`);
    }
  }

  /**
   * Chat with Ollama model (conversation format)
   * @param {string} modelName - Model to use for chat
   * @param {Array} messages - Chat messages array
   * @param {Object} options - Chat options
   * @returns {Promise<string>} - Model response
   */
  async chat(modelName, messages, options = {}) {
    try {
      const requestData = {
        model: modelName,
        messages: messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.1,
          top_p: options.topP || 0.9,
          num_predict: options.maxTokens || 4096,
          ...options
        }
      };

      const response = await this.client.post('/api/chat', requestData);
      
      if (response.data && response.data.message && response.data.message.content) {
        return response.data.message.content;
      } else {
        throw new Error('Invalid chat response format from Ollama');
      }
    } catch (error) {
      console.error('Ollama chat failed:', error);
      throw new Error(`Ollama chat failed: ${error.message}`);
    }
  }

  /**
   * Check if a specific model is available
   * @param {string} modelName - Model name to check
   * @returns {Promise<boolean>} - Model availability status
   */
  async isModelAvailable(modelName) {
    try {
      const models = await this.listModels();
      return models.some(model => model.name === modelName);
    } catch (error) {
      console.error('Failed to check model availability:', error);
      return false;
    }
  }

  /**
   * Get model information
   * @param {string} modelName - Model name
   * @returns {Promise<Object|null>} - Model information
   */
  async getModelInfo(modelName) {
    try {
      const response = await this.client.post('/api/show', {
        name: modelName
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to get model info for ${modelName}:`, error);
      return null;
    }
  }

  /**
   * Setup recommended models for contract analysis
   * @returns {Promise<Array>} - Setup results for each model
   */
  async setupRecommendedModels() {
    const recommendedModels = [
      'llama3.1:8b-instruct-q8_0',  // Primary model
      'llama3.2:3b',                // Lightweight alternative
      'mistral:7b-instruct'         // Multilingual alternative
    ];

    const results = [];
    
    for (const modelName of recommendedModels) {
      try {
        console.log(`Setting up model: ${modelName}`);
        
        const isAvailable = await this.isModelAvailable(modelName);
        
        if (!isAvailable) {
          console.log(`Pulling model: ${modelName}`);
          const pullSuccess = await this.pullModel(modelName);
          
          results.push({
            model: modelName,
            available: pullSuccess,
            action: 'pulled'
          });
        } else {
          results.push({
            model: modelName,
            available: true,
            action: 'already_available'
          });
        }
      } catch (error) {
        console.error(`Failed to setup model ${modelName}:`, error);
        results.push({
          model: modelName,
          available: false,
          action: 'failed',
          error: error.message
        });
      }
    }

    return results;
  }
}

export default OllamaConfig;