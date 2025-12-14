import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

describe('ES Modules Property Tests', () => {
    it('**Feature: clearclause-ai, Property 3: Components use modern ES modules syntax**', () => {
        // **Validates: Requirements 2.3, 3.3**
        fc.assert(
            fc.property(fc.constant(null), () => {
                // Get all JavaScript/JSX files in routes and functions directories
                const getJSFiles = (dir) => {
                    const files = []
                    if (!readdirSync(dir)) return files

                    const items = readdirSync(dir)
                    for (const item of items) {
                        const fullPath = join(dir, item)
                        const stat = statSync(fullPath)

                        if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
                            files.push(fullPath)
                        }
                    }
                    return files
                }

                const routesFiles = getJSFiles(join(process.cwd(), 'routes'))
                const functionsFiles = getJSFiles(join(process.cwd(), 'functions'))
                const allFiles = [...routesFiles, ...functionsFiles]

                // Test each file for ES modules syntax
                for (const filePath of allFiles) {
                    const content = readFileSync(filePath, 'utf-8')

                    // Check for ES modules import/export syntax
                    const hasESImport = /^import\s+.*from\s+['"][^'"]+['"];?$/m.test(content)
                    const hasESExport = /^export\s+(default\s+|{.*}|.*)/m.test(content)

                    // Check that CommonJS syntax is NOT used
                    const hasCommonJSRequire = /require\s*\(['"][^'"]+['"]\)/.test(content)
                    const hasCommonJSExports = /module\.exports\s*=/.test(content)

                    // Files should use ES modules (import/export) and not CommonJS
                    expect(hasESImport || hasESExport).toBe(true)
                    expect(hasCommonJSRequire).toBe(false)
                    expect(hasCommonJSExports).toBe(false)
                }
            }),
            { numRuns: 100 }
        )
    })
})