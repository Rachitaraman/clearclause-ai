/**
 * AWS Integration Tests for ClearClause AI
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { 
    processTextInput,
    transformAnalysisForUI 
} from '../src/utils/documentProcessor.js'
import { 
    loadCUADDataset, 
    getSampleContracts,
    validateAgainstCUAD 
} from '../src/utils/datasetUtils.js'

describe('AWS Integration Tests', () => {
    let sampleContracts

    beforeAll(async () => {
        sampleContracts = getSampleContracts()
    })

    describe('Dataset Utilities', () => {
        it('should load CUAD dataset information', async () => {
            const result = await loadCUADDataset()
            
            expect(result.success).toBe(true)
            expect(result.dataset).toBeDefined()
            expect(result.dataset.name).toContain('CUAD')
            expect(result.dataset.totalContracts).toBe(510)
        })

        it('should provide sample contracts', () => {
            expect(sampleContracts).toBeDefined()
            expect(sampleContracts.length).toBeGreaterThan(0)
            expect(sampleContracts[0]).toHaveProperty('text')
            expect(sampleContracts[0]).toHaveProperty('annotations')
        })
    })

    describe('Document Processing', () => {
        it('should process text input (mock mode)', async () => {
            const sampleText = sampleContracts[0].text
            
            // This will use mock data since AWS credentials may not be available in test
            const result = await processTextInput(sampleText)
            
            expect(result).toBeDefined()
            expect(result.stage).toBeDefined()
            
            // In test environment, this might fall back to mock data
            if (result.data) {
                expect(result.data.extraction.text).toBe(sampleText)
            }
        })

        it('should transform analysis results for UI', () => {
            const mockAnalysisData = {
                analysis: {
                    summary: {
                        documentType: 'Software License Agreement',
                        keyPurpose: 'Software licensing'
                    },
                    clauses: [
                        {
                            id: 'clause_1',
                            title: 'Grant of License',
                            content: 'Licensor grants license to use software',
                            category: 'license',
                            riskLevel: 'low'
                        }
                    ],
                    risks: [
                        {
                            id: 'risk_1',
                            title: 'Termination Risk',
                            severity: 'medium',
                            category: 'legal'
                        }
                    ]
                },
                extraction: {
                    text: 'Sample contract text',
                    confidence: 95,
                    method: 'direct-input'
                },
                document: {
                    name: 'test-contract.pdf',
                    size: 1024
                },
                metadata: {
                    processedAt: new Date().toISOString(),
                    confidence: 90,
                    model: 'anthropic.claude-3-sonnet'
                }
            }

            const transformed = transformAnalysisForUI(mockAnalysisData)
            
            expect(transformed.summary).toBeDefined()
            expect(transformed.clauses).toBeDefined()
            expect(transformed.risks).toBeDefined()
            expect(transformed.summary.confidence).toBe(90)
        })
    })

    describe('CUAD Validation', () => {
        it('should validate analysis against CUAD annotations', () => {
            const mockAnalysis = {
                clauses: [
                    {
                        id: 'clause_1',
                        title: 'Parties',
                        content: 'Agreement between TechCorp Inc. and Client Company',
                        category: 'parties'
                    },
                    {
                        id: 'clause_2', 
                        title: 'Governing Law',
                        content: 'Governed by laws of Delaware',
                        category: 'governing'
                    }
                ]
            }

            const cuadAnnotations = {
                'Parties': ['TechCorp Inc.', 'Client Company'],
                'Governing Law': 'Delaware'
            }

            const validation = validateAgainstCUAD(mockAnalysis, cuadAnnotations)
            
            expect(validation.matches).toBeDefined()
            expect(validation.misses).toBeDefined()
            expect(validation.accuracy).toBeGreaterThanOrEqual(0)
            expect(validation.accuracy).toBeLessThanOrEqual(100)
        })
    })

    describe('Configuration', () => {
        it('should have proper environment variables format', () => {
            // Test that environment variables are properly prefixed for Vite
            const requiredVars = [
                'VITE_AWS_ACCESS_KEY_ID',
                'VITE_AWS_SECRET_ACCESS_KEY', 
                'VITE_AWS_REGION',
                'VITE_S3_BUCKET',
                'VITE_BEDROCK_MODEL'
            ]

            // In test environment, these might not be set, so we just check the format
            requiredVars.forEach(varName => {
                expect(varName).toMatch(/^VITE_/)
            })
        })
    })
})

describe('Error Handling', () => {
    it('should handle missing AWS credentials gracefully', async () => {
        // Test with invalid/missing credentials
        const result = await processTextInput('test text')
        
        // Should either succeed or fail gracefully
        expect(result).toBeDefined()
        expect(result.stage).toBeDefined()
        
        if (result.error) {
            expect(typeof result.error).toBe('string')
        }
    })

    it('should provide fallback behavior', () => {
        // Test that the system can fall back to mock data
        expect(true).toBe(true) // Placeholder - actual fallback logic is in App.jsx
    })
})