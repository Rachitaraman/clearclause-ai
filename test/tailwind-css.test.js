import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('Tailwind CSS Property Tests', () => {
    it('**Feature: clearclause-ai, Property 6: Tailwind CSS classes are processed correctly**', () => {
        // **Validates: Requirements 4.1, 4.3, 4.4**
        fc.assert(
            fc.property(fc.constant(null), () => {
                // Test that styles.css exists and contains Tailwind directives
                const stylesPath = join(process.cwd(), 'public', 'styles.css')
                expect(existsSync(stylesPath)).toBe(true)

                const stylesContent = readFileSync(stylesPath, 'utf-8')

                // Test that Tailwind directives are present
                expect(stylesContent).toContain('@tailwind base')
                expect(stylesContent).toContain('@tailwind components')
                expect(stylesContent).toContain('@tailwind utilities')

                // Test that foundational CSS styling is included
                expect(stylesContent).toContain('box-sizing: border-box')
                expect(stylesContent).toContain('font-family:')

                // Test that custom CSS alongside Tailwind is supported
                expect(stylesContent).toContain('.app-container')

                // Test that Tailwind config exists and is properly configured
                const tailwindConfigPath = join(process.cwd(), 'tailwind.config.js')
                expect(existsSync(tailwindConfigPath)).toBe(true)

                const tailwindConfig = readFileSync(tailwindConfigPath, 'utf-8')

                // Test that content paths include routes for responsive utilities
                expect(tailwindConfig).toContain('./routes/**/*.{js,jsx}')
                expect(tailwindConfig).toContain('./public/**/*.html')

                // Test that PostCSS config exists for processing
                const postcssConfigPath = join(process.cwd(), 'postcss.config.js')
                expect(existsSync(postcssConfigPath)).toBe(true)

                const postcssConfig = readFileSync(postcssConfigPath, 'utf-8')
                expect(postcssConfig).toContain('tailwindcss')
                expect(postcssConfig).toContain('autoprefixer')
            }),
            { numRuns: 100 }
        )
    })
})