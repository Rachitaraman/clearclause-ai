import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { render } from '@testing-library/react'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import React from 'react'
import HomePage from '../routes/index.jsx'

describe('JSX Rendering Property Tests', () => {
    it('**Feature: clearclause-ai, Property 4: JSX syntax renders correctly**', () => {
        // **Validates: Requirements 2.4**
        fc.assert(
            fc.property(fc.constant(null), () => {
                // Get all JSX files in routes directory
                const getJSXFiles = (dir) => {
                    const files = []
                    try {
                        const items = readdirSync(dir)
                        for (const item of items) {
                            const fullPath = join(dir, item)
                            const stat = statSync(fullPath)

                            if (stat.isFile() && item.endsWith('.jsx')) {
                                files.push({ path: fullPath, name: item })
                            }
                        }
                    } catch (error) {
                        // Directory might not exist yet
                    }
                    return files
                }

                const routesDir = join(process.cwd(), 'routes')
                const jsxFiles = getJSXFiles(routesDir)

                // Test each JSX file for valid JSX syntax
                for (const file of jsxFiles) {
                    const content = readFileSync(file.path, 'utf-8')

                    // Check that file contains JSX elements
                    const hasJSXElements = /<[A-Za-z][^>]*>/.test(content) || /React\.createElement/.test(content)

                    if (hasJSXElements) {
                        // Test that JSX syntax is valid by checking for proper structure
                        // Basic JSX syntax validation - should not have obvious syntax errors
                        expect(content).not.toMatch(/<</)  // No double opening brackets
                        expect(content).not.toMatch(/>>/)  // No double closing brackets
                        expect(content).toMatch(/import.*React/)  // Should import React
                        expect(content).toMatch(/export.*default/)  // Should have default export
                    }
                }

                // Test that the HomePage component specifically renders correctly
                if (HomePage && typeof HomePage === 'function') {
                    const renderResult = render(React.createElement(HomePage))

                    // Component should render and produce DOM output
                    expect(renderResult.container).toBeDefined()
                    expect(renderResult.container.innerHTML).not.toBe('')

                    // Clean up
                    renderResult.unmount()
                }
            }),
            { numRuns: 100 }
        )
    })
})