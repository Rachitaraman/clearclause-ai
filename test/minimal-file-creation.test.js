import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

describe('Minimal File Creation Property Tests', () => {
    it('**Feature: clearclause-ai, Property 7: Only essential files are created**', () => {
        // **Validates: Requirements 5.1, 5.2, 5.4**
        fc.assert(
            fc.property(fc.constant(null), () => {
                // Define the essential files that should exist
                const essentialFiles = [
                    'routes/index.jsx',
                    'functions/process.js',
                    'public/styles.css'
                ]

                // Define allowed configuration files (not demo content)
                const allowedConfigFiles = [
                    'package.json',
                    'package-lock.json',
                    'vite.config.js',
                    'tailwind.config.js',
                    'postcss.config.js',
                    'test-setup.js'
                ]

                // Test that all essential files exist
                for (const file of essentialFiles) {
                    const filePath = join(process.cwd(), file)
                    expect(existsSync(filePath)).toBe(true)
                }

                // Test that main directories contain only the essential files
                const mainDirectories = ['routes', 'functions', 'public']

                for (const dir of mainDirectories) {
                    const dirPath = join(process.cwd(), dir)
                    const files = readdirSync(dirPath)

                    // Each main directory should contain exactly one file
                    expect(files.length).toBe(1)

                    // Verify the correct file exists in each directory
                    if (dir === 'routes') {
                        expect(files[0]).toBe('index.jsx')
                    } else if (dir === 'functions') {
                        expect(files[0]).toBe('process.js')
                    } else if (dir === 'public') {
                        expect(files[0]).toBe('styles.css')
                    }
                }

                // Test that no demo or example files exist in main directories
                const checkForDemoFiles = (dirPath) => {
                    const items = readdirSync(dirPath)

                    for (const item of items) {
                        const fullPath = join(dirPath, item)
                        const stat = statSync(fullPath)

                        if (stat.isFile()) {
                            // Check for demo/example keywords in filename
                            const lowerItem = item.toLowerCase()
                            const demoKeywords = ['demo', 'example', 'sample', 'test-content', 'placeholder']

                            for (const keyword of demoKeywords) {
                                expect(lowerItem).not.toContain(keyword)
                            }
                        }
                    }
                }

                // Check main directories for demo files
                for (const dir of mainDirectories) {
                    const dirPath = join(process.cwd(), dir)
                    checkForDemoFiles(dirPath)
                }

                // Test that root directory doesn't contain unnecessary files
                const rootFiles = readdirSync(process.cwd()).filter(item => {
                    const fullPath = join(process.cwd(), item)
                    return statSync(fullPath).isFile()
                })

                // All root files should be either essential config files or allowed
                for (const file of rootFiles) {
                    const isAllowedConfig = allowedConfigFiles.includes(file)
                    const isTestOrSpecFile = file.endsWith('.test.js') ||
                        file.startsWith('.') ||
                        file.includes('spec') ||
                        file.includes('README')

                    // File should be either allowed config or test/spec related
                    expect(isAllowedConfig || isTestOrSpecFile).toBe(true)
                }
            }),
            { numRuns: 100 }
        )
    })
})