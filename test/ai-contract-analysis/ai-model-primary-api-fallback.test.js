import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { ContractProcessor } from '../../src/processors/ContractProcessor.js'

describe('AI Model Primary with API Fallback Property Tests', () => {
    let contractProcessor
    let mockModelManager
    let mockAPIClient
    let mockResponseNormalizer

    beforeEach(() => {
        // Mock ModelManager
        mockModelManager = {
            getModelStatus: vi.fn(),
            loadModel: vi.fn(),
            unloadModel: vi.fn(),
            modelConfig: { modelName: 'llama-3.1-8b-instruct' }
        }

        // Mock APIClient
        mockAPIClient = {
            analyzeContract: vi.fn()
        }

        // Mock ResponseNormalizer
        mockResponseNormalizer = {
            normalizeToStandardFormat: vi.fn()
        }

        // Create ContractProcessor instance
        contractProcessor = new ContractProcessor()
        contractProcessor.modelManager = mockModelManager
        contractProcessor.apiClient = mockAPIClient
        contractProcessor.responseNormalizer = mockResponseNormalizer
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('**Feature: ai-contract-analysis, Property 3: System uses AI model as primary with API fallback**', async () => {
        // **Validates: Requirements 1.4, 2.3, 2.4**
        await fc.assert(
            fc.asyncProperty(
                // Generate valid document objects
                fc.record({
                    text: fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length >= 10),
                    filename: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
                }, { requiredKeys: ['text'] }),
                
                // Generate AI model availability scenarios
                fc.record({
                    isModelLoaded: fc.boolean(),
                    canLoadModel: fc.boolean(),
                    modelWillFail: fc.boolean()
                }),

                async (document, scenario) => {
                    // Reset mocks for each test
                    vi.clearAllMocks()
                    contractProcessor.resetStats()

                    // Setup mock responses based on scenario
                    mockModelManager.getModelStatus.mockReturnValue({
                        isLoaded: scenario.isModelLoaded,
                        modelName: scenario.isModelLoaded ? 'llama-3.1-8b-instruct' : null
                    })

                    mockModelManager.loadModel.mockResolvedValue(scenario.canLoadModel)

                    const aiModelResult = {
                        summary: {
                            title: document.filename || "AI Analyzed Contract",
                            documentType: "contract",
                            totalClauses: 5,
                            riskScore: 65,
                            processingTime: 1000,
                            confidence: 0.9
                        },
                        clauses: [],
                        risks: [],
                        recommendations: [],
                        metadata: {
                            processingMethod: "ai_model",
                            modelUsed: "llama-3.1-8b-instruct",
                            processingTime: 1000,
                            tokenUsage: 1500,
                            confidence: 0.9
                        }
                    }

                    const apiResult = {
                        summary: {
                            title: "API Analyzed Contract",
                            documentType: "contract",
                            totalClauses: 3,
                            riskScore: 45,
                            processingTime: 2500,
                            confidence: 0.8
                        },
                        clauses: [],
                        risks: [],
                        recommendations: [],
                        metadata: {
                            processingMethod: "api_fallback",
                            modelUsed: "external_api",
                            processingTime: 2500,
                            tokenUsage: 0,
                            confidence: 0.8
                        }
                    }

                    // Mock API client response
                    mockAPIClient.analyzeContract.mockResolvedValue(apiResult)
                    mockResponseNormalizer.normalizeToStandardFormat.mockReturnValue(apiResult)

                    // Determine expected behavior
                    const shouldUseAI = (scenario.isModelLoaded || scenario.canLoadModel) && !scenario.modelWillFail

                    // Mock AI model processing behavior
                    if (scenario.modelWillFail) {
                        // Override tryAIModel to simulate failure
                        contractProcessor.tryAIModel = vi.fn().mockRejectedValue(new Error('AI model processing failed'))
                    } else if (shouldUseAI) {
                        // Override tryAIModel to simulate success
                        contractProcessor.tryAIModel = vi.fn().mockResolvedValue(aiModelResult)
                    }

                    try {
                        const result = await contractProcessor.processContract(document)

                        // Verify result structure - this is the core property we're testing
                        expect(result).toBeDefined()
                        expect(result).toHaveProperty('summary')
                        expect(result).toHaveProperty('clauses')
                        expect(result).toHaveProperty('risks')
                        expect(result).toHaveProperty('recommendations')
                        expect(result).toHaveProperty('metadata')

                        // Verify processing method selection - core behavior
                        if (shouldUseAI && !scenario.modelWillFail) {
                            // Should use AI model as primary
                            expect(result.metadata.processingMethod).toBe('ai_model')
                        } else {
                            // Should fallback to API
                            expect(result.metadata.processingMethod).toBe('api_fallback')
                        }

                        // Verify automatic failover behavior when AI fails
                        if (scenario.modelWillFail && contractProcessor.config.fallbackToAPI) {
                            // Should have fallen back to API
                            expect(result.metadata.processingMethod).toBe('api_fallback')
                            expect(mockAPIClient.analyzeContract).toHaveBeenCalled()
                        }

                    } catch (error) {
                        // If both AI model and API fail, should throw error
                        if (scenario.modelWillFail && !contractProcessor.config.fallbackToAPI) {
                            expect(error.message).toContain('AI model processing failed')
                        } else {
                            // Unexpected error - re-throw for debugging
                            throw error
                        }
                    }
                }
            ),
            { numRuns: 25 } // Run 25 iterations to test various scenarios
        )
    })

    it('should prefer AI model when both systems are available', async () => {
        // Setup: Both AI model and API are available
        mockModelManager.getModelStatus.mockReturnValue({
            isLoaded: true,
            modelName: 'llama-3.1-8b-instruct'
        })

        const aiResult = {
            summary: { title: "AI Test", documentType: "contract", totalClauses: 1, riskScore: 50, processingTime: 1000, confidence: 0.9 },
            clauses: [],
            risks: [],
            recommendations: [],
            metadata: { processingMethod: "ai_model", modelUsed: "llama-3.1-8b-instruct", processingTime: 1000, tokenUsage: 100, confidence: 0.9 }
        }

        contractProcessor.tryAIModel = vi.fn().mockResolvedValue(aiResult)

        const document = { text: "Test contract content" }
        const result = await contractProcessor.processContract(document)

        expect(result.metadata.processingMethod).toBe('ai_model')
        expect(contractProcessor.tryAIModel).toHaveBeenCalled()
        expect(mockAPIClient.analyzeContract).not.toHaveBeenCalled()
    })

    it('should fallback to API when AI model is unavailable', async () => {
        // Setup: AI model is not available
        mockModelManager.getModelStatus.mockReturnValue({
            isLoaded: false,
            modelName: null
        })
        mockModelManager.loadModel.mockResolvedValue(false)

        const apiResult = {
            summary: { title: "API Test", documentType: "contract", totalClauses: 1, riskScore: 40, processingTime: 2000, confidence: 0.8 },
            clauses: [],
            risks: [],
            recommendations: [],
            metadata: { processingMethod: "api_fallback", modelUsed: "external_api", processingTime: 2000, tokenUsage: 0, confidence: 0.8 }
        }

        mockAPIClient.analyzeContract.mockResolvedValue(apiResult)
        mockResponseNormalizer.normalizeToStandardFormat.mockReturnValue(apiResult)

        const document = { text: "Test contract content" }
        const result = await contractProcessor.processContract(document)

        expect(result.metadata.processingMethod).toBe('api_fallback')
        expect(mockAPIClient.analyzeContract).toHaveBeenCalled()
        expect(mockResponseNormalizer.normalizeToStandardFormat).toHaveBeenCalled()
    })

    it('should fallback to API when AI model fails during processing', async () => {
        // Setup: AI model is available but fails during processing
        mockModelManager.getModelStatus.mockReturnValue({
            isLoaded: true,
            modelName: 'llama-3.1-8b-instruct'
        })

        contractProcessor.tryAIModel = vi.fn().mockRejectedValue(new Error('Model inference failed'))

        const apiResult = {
            summary: { title: "API Fallback", documentType: "contract", totalClauses: 1, riskScore: 30, processingTime: 3000, confidence: 0.7 },
            clauses: [],
            risks: [],
            recommendations: [],
            metadata: { processingMethod: "api_fallback", modelUsed: "external_api", processingTime: 3000, tokenUsage: 0, confidence: 0.7 }
        }

        mockAPIClient.analyzeContract.mockResolvedValue(apiResult)
        mockResponseNormalizer.normalizeToStandardFormat.mockReturnValue(apiResult)

        const document = { text: "Test contract content" }
        const result = await contractProcessor.processContract(document)

        expect(result.metadata.processingMethod).toBe('api_fallback')
        expect(result.metadata).toHaveProperty('fallbackReason')
        expect(contractProcessor.tryAIModel).toHaveBeenCalled()
        expect(mockAPIClient.analyzeContract).toHaveBeenCalled()
    })

    it('should throw error when both AI model and API fail', async () => {
        // Setup: Both systems fail
        mockModelManager.getModelStatus.mockReturnValue({
            isLoaded: true,
            modelName: 'llama-3.1-8b-instruct'
        })

        contractProcessor.tryAIModel = vi.fn().mockRejectedValue(new Error('AI model failed'))
        mockAPIClient.analyzeContract.mockRejectedValue(new Error('API failed'))

        const document = { text: "Test contract content" }

        await expect(contractProcessor.processContract(document))
            .rejects
            .toThrow('Both AI model and API fallback failed')
    })

    it('should update processing statistics correctly', async () => {
        // Reset stats
        contractProcessor.resetStats()

        // Setup successful AI processing
        mockModelManager.getModelStatus.mockReturnValue({
            isLoaded: true,
            modelName: 'llama-3.1-8b-instruct'
        })

        const aiResult = {
            summary: { title: "Stats Test", documentType: "contract", totalClauses: 1, riskScore: 60, processingTime: 1500, confidence: 0.85 },
            clauses: [],
            risks: [],
            recommendations: [],
            metadata: { processingMethod: "ai_model", modelUsed: "llama-3.1-8b-instruct", processingTime: 1500, tokenUsage: 200, confidence: 0.85 }
        }

        // Mock the actual method that gets called internally
        const originalTryAIModel = contractProcessor.tryAIModel
        contractProcessor.tryAIModel = vi.fn().mockImplementation(async (document, options) => {
            // Manually increment the counter since we're bypassing the real method
            contractProcessor.processingStats.aiModelRequests++
            return aiResult
        })

        const document = { text: "Test contract for statistics" }
        const result = await contractProcessor.processContract(document)

        const stats = contractProcessor.getProcessingStats()
        expect(stats.totalRequests).toBe(1)
        expect(stats.aiModelRequests).toBe(1)
        expect(stats.apiRequests).toBe(0)
        expect(stats.failures).toBe(0)
        expect(stats.aiModelSuccessRate).toBe(1)
        expect(stats.totalSuccessRate).toBe(1)
        
        // Restore original method
        contractProcessor.tryAIModel = originalTryAIModel
    })
})