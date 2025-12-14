import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { handler } from '../functions/process.js'

describe('HTTP Request Handling Property Tests', () => {
    it('**Feature: clearclause-ai, Property 5: Backend functions handle HTTP requests properly**', async () => {
        // **Validates: Requirements 3.2, 3.4**
        await fc.assert(
            fc.asyncProperty(
                // Generate valid HTTP methods
                fc.oneof(
                    fc.constant('GET'),
                    fc.constant('POST'),
                    fc.constant('PUT'),
                    fc.constant('DELETE'),
                    fc.constant('OPTIONS'),
                    fc.constant('PATCH')
                ),
                // Generate headers object
                fc.record({
                    'content-type': fc.oneof(
                        fc.constant('application/json'),
                        fc.constant('text/plain'),
                        fc.constant('application/xml')
                    ),
                    'authorization': fc.option(fc.string(), { nil: undefined })
                }, { requiredKeys: [] }),
                // Generate body (string or object)
                fc.oneof(
                    fc.string(),
                    fc.record({
                        data: fc.string(),
                        id: fc.option(fc.integer(), { nil: undefined })
                    }, { requiredKeys: [] }),
                    fc.constant(null)
                ),
                // Generate query parameters
                fc.record({
                    id: fc.option(fc.string(), { nil: undefined }),
                    page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined })
                }, { requiredKeys: [] }),
                async (method, headers, body, query) => {
                    // Create request object
                    const request = {
                        method,
                        headers: headers || {},
                        body,
                        query: query || {}
                    }

                    // Call the handler function
                    const response = await handler(request)

                    // Verify response structure
                    expect(response).toBeDefined()
                    expect(typeof response).toBe('object')

                    // Verify required response properties
                    expect(response).toHaveProperty('statusCode')
                    expect(response).toHaveProperty('headers')
                    expect(response).toHaveProperty('body')

                    // Verify statusCode is a valid HTTP status code
                    expect(typeof response.statusCode).toBe('number')
                    expect(response.statusCode).toBeGreaterThanOrEqual(200)
                    expect(response.statusCode).toBeLessThan(600)

                    // Verify headers is an object
                    expect(typeof response.headers).toBe('object')
                    expect(response.headers).not.toBeNull()

                    // Verify Content-Type header is present
                    expect(response.headers).toHaveProperty('Content-Type')
                    expect(response.headers['Content-Type']).toBe('application/json')

                    // Verify CORS headers are present
                    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin')
                    expect(response.headers).toHaveProperty('Access-Control-Allow-Methods')
                    expect(response.headers).toHaveProperty('Access-Control-Allow-Headers')

                    // Verify body is a string (JSON stringified)
                    expect(typeof response.body).toBe('string')

                    // Verify body can be parsed as JSON
                    let parsedBody
                    expect(() => {
                        parsedBody = JSON.parse(response.body)
                    }).not.toThrow()

                    // For supported methods (GET, POST, PUT, DELETE), verify success responses
                    if (['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
                        if (method === 'DELETE' && !query?.id) {
                            // DELETE without ID should return 400
                            expect(response.statusCode).toBe(400)
                            expect(parsedBody).toHaveProperty('error')
                            expect(parsedBody).toHaveProperty('message')
                        } else if (method === 'POST' && headers['content-type'] &&
                            !headers['content-type'].includes('application/json')) {
                            // POST with wrong content-type should return 400
                            expect(response.statusCode).toBe(400)
                            expect(parsedBody).toHaveProperty('error')
                            expect(parsedBody).toHaveProperty('message')
                        } else {
                            // Valid requests should return success status codes
                            expect(response.statusCode).toBeGreaterThanOrEqual(200)
                            expect(response.statusCode).toBeLessThan(300)
                            expect(parsedBody).toHaveProperty('message')
                            expect(parsedBody).toHaveProperty('timestamp')
                        }
                    } else {
                        // Unsupported methods should return 405
                        expect(response.statusCode).toBe(405)
                        expect(parsedBody).toHaveProperty('error')
                        expect(parsedBody.error).toBe('Method Not Allowed')
                    }

                    // Verify timestamp format in response body
                    if (parsedBody.timestamp) {
                        expect(() => new Date(parsedBody.timestamp)).not.toThrow()
                        expect(new Date(parsedBody.timestamp).toISOString()).toBe(parsedBody.timestamp)
                    }
                }
            ),
            { numRuns: 100 }
        )
    })
})