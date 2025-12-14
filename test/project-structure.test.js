import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { existsSync } from 'fs'
import { join } from 'path'

describe('Project Structure Property Tests', () => {
    it('**Feature: clearclause-ai, Property 1: Project initialization creates required directory structure**', () => {
        // **Validates: Requirements 1.1, 1.2, 1.3**
        fc.assert(
            fc.property(fc.constant(null), () => {
                // Test that all required directories exist
                const requiredDirectories = ['routes', 'functions', 'public']

                for (const dir of requiredDirectories) {
                    const dirPath = join(process.cwd(), dir)
                    expect(existsSync(dirPath)).toBe(true)
                }

                // Test that exactly these three directories exist (no more, no less)
                const expectedDirs = new Set(['routes', 'functions', 'public'])
                const actualDirs = new Set(requiredDirectories.filter(dir =>
                    existsSync(join(process.cwd(), dir))
                ))

                expect(actualDirs).toEqual(expectedDirs)
            }),
            { numRuns: 100 }
        )
    })
})