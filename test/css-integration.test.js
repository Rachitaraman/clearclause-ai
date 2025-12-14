import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('CSS Integration Unit Tests', () => {
    describe('Base styles loading', () => {
        it('should load base styles correctly', () => {
            // **Requirements: 4.2, 4.4**
            const stylesPath = join(process.cwd(), 'public', 'styles.css')
            expect(existsSync(stylesPath)).toBe(true)

            const stylesContent = readFileSync(stylesPath, 'utf-8')

            // Test that base styles are present
            expect(stylesContent).toContain('* {')
            expect(stylesContent).toContain('box-sizing: border-box')
            expect(stylesContent).toContain('html,')
            expect(stylesContent).toContain('body {')
            expect(stylesContent).toContain('margin: 0')
            expect(stylesContent).toContain('padding: 0')
            expect(stylesContent).toContain('font-family:')
        })

        it('should include font smoothing properties', () => {
            // **Requirements: 4.2**
            const stylesPath = join(process.cwd(), 'public', 'styles.css')
            const stylesContent = readFileSync(stylesPath, 'utf-8')

            expect(stylesContent).toContain('-webkit-font-smoothing: antialiased')
            expect(stylesContent).toContain('-moz-osx-font-smoothing: grayscale')
        })
    })

    describe('Tailwind classes application', () => {
        it('should verify Tailwind classes are applied through directives', () => {
            // **Requirements: 4.2, 4.4**
            const stylesPath = join(process.cwd(), 'public', 'styles.css')
            const stylesContent = readFileSync(stylesPath, 'utf-8')

            // Test that Tailwind directives are in correct order
            const baseIndex = stylesContent.indexOf('@tailwind base')
            const componentsIndex = stylesContent.indexOf('@tailwind components')
            const utilitiesIndex = stylesContent.indexOf('@tailwind utilities')

            expect(baseIndex).toBeGreaterThan(-1)
            expect(componentsIndex).toBeGreaterThan(baseIndex)
            expect(utilitiesIndex).toBeGreaterThan(componentsIndex)
        })

        it('should have Tailwind configuration for content paths', () => {
            // **Requirements: 4.2**
            const configPath = join(process.cwd(), 'tailwind.config.js')
            const configContent = readFileSync(configPath, 'utf-8')

            // Test that content paths are configured for Tailwind processing
            expect(configContent).toContain('content:')
            expect(configContent).toContain('./routes/**/*.{js,jsx}')
            expect(configContent).toContain('./public/**/*.html')
        })

        it('should have PostCSS configured for Tailwind processing', () => {
            // **Requirements: 4.2**
            const postcssPath = join(process.cwd(), 'postcss.config.js')
            const postcssContent = readFileSync(postcssPath, 'utf-8')

            expect(postcssContent).toContain('tailwindcss: {}')
            expect(postcssContent).toContain('autoprefixer: {}')
        })
    })

    describe('Custom CSS alongside Tailwind', () => {
        it('should test custom CSS alongside Tailwind', () => {
            // **Requirements: 4.4**
            const stylesPath = join(process.cwd(), 'public', 'styles.css')
            const stylesContent = readFileSync(stylesPath, 'utf-8')

            // Test that custom CSS classes are defined
            expect(stylesContent).toContain('.app-container')
            expect(stylesContent).toContain('min-height: 100vh')
            expect(stylesContent).toContain('display: flex')
            expect(stylesContent).toContain('flex-direction: column')
        })

        it('should allow custom CSS to coexist with Tailwind directives', () => {
            // **Requirements: 4.4**
            const stylesPath = join(process.cwd(), 'public', 'styles.css')
            const stylesContent = readFileSync(stylesPath, 'utf-8')

            // Test that both Tailwind directives and custom CSS exist
            const hasTailwindDirectives = stylesContent.includes('@tailwind base') &&
                stylesContent.includes('@tailwind components') &&
                stylesContent.includes('@tailwind utilities')

            const hasCustomCSS = stylesContent.includes('.app-container') &&
                stylesContent.includes('/* Custom CSS alongside Tailwind */')

            expect(hasTailwindDirectives).toBe(true)
            expect(hasCustomCSS).toBe(true)
        })

        it('should have proper CSS structure with comments', () => {
            // **Requirements: 4.4**
            const stylesPath = join(process.cwd(), 'public', 'styles.css')
            const stylesContent = readFileSync(stylesPath, 'utf-8')

            // Test that CSS is well-structured with comments
            expect(stylesContent).toContain('/* Base foundational styles */')
            expect(stylesContent).toContain('/* Custom CSS alongside Tailwind */')
            expect(stylesContent).toContain('/* Responsive utilities are enabled through Tailwind\'s default configuration */')
        })
    })

    describe('CSS file structure and organization', () => {
        it('should have proper CSS file organization', () => {
            // **Requirements: 4.2, 4.4**
            const stylesPath = join(process.cwd(), 'public', 'styles.css')
            const stylesContent = readFileSync(stylesPath, 'utf-8')

            // Test that CSS is organized in logical sections
            const sections = [
                '@tailwind base',
                '@tailwind components',
                '@tailwind utilities',
                '/* Base foundational styles */',
                '/* Custom CSS alongside Tailwind */'
            ]

            let lastIndex = -1
            for (const section of sections) {
                const currentIndex = stylesContent.indexOf(section)
                expect(currentIndex).toBeGreaterThan(lastIndex)
                lastIndex = currentIndex
            }
        })

        it('should be valid CSS syntax', () => {
            // **Requirements: 4.2**
            const stylesPath = join(process.cwd(), 'public', 'styles.css')
            const stylesContent = readFileSync(stylesPath, 'utf-8')

            // Basic CSS syntax validation
            // Check for balanced braces
            const openBraces = (stylesContent.match(/{/g) || []).length
            const closeBraces = (stylesContent.match(/}/g) || []).length
            expect(openBraces).toBe(closeBraces)

            // Check that selectors are properly formatted
            const selectorPattern = /^[.#*a-zA-Z][^{]*{/gm
            const selectors = stylesContent.match(selectorPattern)
            expect(selectors).toBeTruthy()
            expect(selectors.length).toBeGreaterThan(0)
        })
    })
})