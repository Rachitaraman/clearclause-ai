import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { handler } from '../functions/process.js'

describe('Complete Application Integration Tests', () => {
    let homePageContent
    let stylesContent

    beforeAll(() => {
        // Load essential files for integration testing
        homePageContent = readFileSync(join(process.cwd(), 'routes/index.jsx'), 'utf-8')
        stylesContent = readFileSync(join(process.cwd(), 'public/styles.css'), 'utf-8')
    })

    describe('Application startup and basic functionality', () => {
        it('should have all essential components ready for startup', () => {
            // Test that all essential files exist and are readable
            expect(existsSync(join(process.cwd(), 'routes/index.jsx'))).toBe(true)
            expect(existsSync(join(process.cwd(), 'functions/process.js'))).toBe(true)
            expect(existsSync(join(process.cwd(), 'public/styles.css'))).toBe(true)

            // Test that files have proper content structure
            expect(homePageContent).toContain('import React')
            expect(homePageContent).toContain('export default')
            expect(stylesContent).toContain('@tailwind')
        })

        it('should have working React component structure', () => {
            // Test React component has proper JSX structure
            expect(homePageContent).toMatch(/const\s+\w+\s*=\s*\(\s*\)\s*=>\s*{/)
            expect(homePageContent).toContain('return')
            expect(homePageContent).toMatch(/<div[^>]*>/)

            // Test component uses Tailwind classes
            expect(homePageContent).toContain('className=')
            expect(homePageContent).toMatch(/min-h-screen|bg-|text-|flex/)
        })

        it('should have functional backend API structure', async () => {
            // Test backend function handles different HTTP methods
            const getRequest = {
                method: 'GET',
                headers: {},
                body: null,
                query: { test: 'value' }
            }

            const getResponse = await handler(getRequest)
            expect(getResponse.statusCode).toBe(200)
            expect(getResponse.headers['Content-Type']).toBe('application/json')

            const postRequest = {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: { data: 'test' },
                query: {}
            }

            const postResponse = await handler(postRequest)
            expect(postResponse.statusCode).toBe(201)
        })

        it('should have proper CSS foundation with Tailwind integration', () => {
            // Test Tailwind directives are present
            expect(stylesContent).toContain('@tailwind base')
            expect(stylesContent).toContain('@tailwind components')
            expect(stylesContent).toContain('@tailwind utilities')

            // Test foundational CSS is present
            expect(stylesContent).toMatch(/\*\s*{[^}]*box-sizing:\s*border-box/)
            expect(stylesContent).toMatch(/html,\s*body\s*{/)
        })
    })

    describe('Frontend and backend integration', () => {
        it('should have compatible data formats between frontend and backend', async () => {
            // Test that backend returns JSON that frontend can consume
            const request = {
                method: 'GET',
                headers: {},
                body: null,
                query: {}
            }

            const response = await handler(request)
            expect(response.headers['Content-Type']).toBe('application/json')

            // Test response body is valid JSON
            const responseData = JSON.parse(response.body)
            expect(responseData).toHaveProperty('message')
            expect(responseData).toHaveProperty('timestamp')
        })

        it('should have CORS headers for frontend-backend communication', async () => {
            const request = {
                method: 'GET',
                headers: {},
                body: null,
                query: {}
            }

            const response = await handler(request)
            expect(response.headers).toHaveProperty('Access-Control-Allow-Origin')
            expect(response.headers).toHaveProperty('Access-Control-Allow-Methods')
            expect(response.headers).toHaveProperty('Access-Control-Allow-Headers')
        })

        it('should handle error scenarios gracefully across the stack', async () => {
            // Test backend error handling
            const invalidRequest = {
                method: 'DELETE',
                headers: {},
                body: null,
                query: {} // Missing required ID parameter
            }

            const errorResponse = await handler(invalidRequest)
            expect(errorResponse.statusCode).toBe(400)

            const errorData = JSON.parse(errorResponse.body)
            expect(errorData).toHaveProperty('error')
            expect(errorData).toHaveProperty('message')
        })
    })

    describe('End-to-end functionality validation', () => {
        it('should demonstrate working fullstack foundation', async () => {
            // Test that the application has all pieces working together

            // 1. Frontend component structure
            expect(homePageContent).toContain('ClearClause AI')
            expect(homePageContent).toContain('Application is ready')

            // 2. Backend API functionality
            const apiRequest = {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: { message: 'Hello from frontend' },
                query: {}
            }

            const apiResponse = await handler(apiRequest)
            expect(apiResponse.statusCode).toBe(201)

            const apiData = JSON.parse(apiResponse.body)
            expect(apiData.message).toBe('POST request processed successfully')
            expect(apiData.received).toEqual({ message: 'Hello from frontend' })

            // 3. Styling foundation
            expect(stylesContent).toContain('@tailwind')
            expect(stylesContent).toContain('font-family')

            // 4. Modern ES modules throughout
            expect(homePageContent).toContain('import')
            expect(homePageContent).toContain('export default')
        })

        it('should validate application readiness without excess functionality', () => {
            // Test that application shows readiness but no demo features
            expect(homePageContent).toContain('ready')
            expect(homePageContent).not.toContain('demo')
            expect(homePageContent).not.toContain('example')
            expect(homePageContent).not.toContain('sample')

            // Test minimal but functional content
            expect(homePageContent.split('\n').length).toBeLessThan(50) // Keep it minimal
            expect(stylesContent.split('\n').length).toBeLessThan(30) // Keep it minimal
        })
    })
})