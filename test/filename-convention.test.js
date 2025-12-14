import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

describe('Filename Convention Property Tests', () => {
    it('**Feature: clearclause-ai, Property 2: All filenames use lowercase convention**', () => {
        // **Validates: Requirements 1.5**
        fc.assert(
            fc.property(fc.constant(null), () => {
                // Get only the essential project files we control (not dependencies)
                const projectDirectories = ['routes', 'functions', 'public', 'test']
                const rootFiles = ['package.json', 'package-lock.json', 'vite.config.js', 'tailwind.config.js', 'postcss.config.js', 'test-setup.js']

                const getAllProjectFiles = () => {
                    const files = []

                    // Add root files
                    for (const file of rootFiles) {
                        const filePath = join(process.cwd(), file)
                        if (existsSync(filePath)) {
                            files.push(file)
                        }
                    }

                    // Add files from project directories
                    for (const dir of projectDirectories) {
                        const dirPath = join(process.cwd(), dir)
                        if (existsSync(dirPath)) {
                            const items = readdirSync(dirPath)
                            for (const item of items) {
                                const fullPath = join(dirPath, item)
                                const stat = statSync(fullPath)
                                if (stat.isFile()) {
                                    files.push(item)
                                }
                            }
                        }
                    }

                    return files
                }

                const projectFiles = getAllProjectFiles()

                // Test that all filenames follow lowercase convention
                for (const filename of projectFiles) {
                    // Check that filename contains only lowercase letters, numbers, hyphens, dots, and underscores
                    const isValidFilename = /^[a-z0-9\-._]+$/.test(filename)
                    expect(isValidFilename).toBe(true)
                }
            }),
            { numRuns: 100 }
        )
    })
})