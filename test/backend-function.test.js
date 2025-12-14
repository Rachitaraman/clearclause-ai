import { describe, it, expect } from 'vitest'
import { handler } from '../functions/process.js'

describe('Backend Function Unit Tests', () => {
    describe('GET requests', () => {
        it('should respond with 200 status code for GET requests', async () => {
            const request = {
                method: 'GET',
                headers: {},
                body: null,
                query: { page: '1' }
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(200)
            expect(response.headers['Content-Type']).toBe('application/json')

            const body = JSON.parse(response.body)
            expect(body.message).toBe('GET request processed successfully')
            expect(body.query).toEqual({ page: '1' })
            expect(body.timestamp).toBeDefined()
        })

        it('should handle GET requests with empty query parameters', async () => {
            const request = {
                method: 'GET',
                headers: {},
                body: null,
                query: {}
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(200)
            const body = JSON.parse(response.body)
            expect(body.query).toEqual({})
        })
    })

    describe('POST requests', () => {
        it('should respond with 201 status code for valid POST requests', async () => {
            const request = {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: { name: 'test', value: 123 },
                query: {}
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(201)
            expect(response.headers['Content-Type']).toBe('application/json')

            const body = JSON.parse(response.body)
            expect(body.message).toBe('POST request processed successfully')
            expect(body.received).toEqual({ name: 'test', value: 123 })
            expect(body.timestamp).toBeDefined()
        })

        it('should return 400 for POST requests with invalid content-type', async () => {
            const request = {
                method: 'POST',
                headers: { 'content-type': 'text/plain' },
                body: 'plain text data',
                query: {}
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(400)
            const body = JSON.parse(response.body)
            expect(body.error).toBe('Bad Request')
            expect(body.message).toBe('Content-Type must be application/json')
        })

        it('should handle POST requests without content-type header', async () => {
            const request = {
                method: 'POST',
                headers: {},
                body: { data: 'test' },
                query: {}
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(201)
            const body = JSON.parse(response.body)
            expect(body.message).toBe('POST request processed successfully')
        })
    })

    describe('PUT requests', () => {
        it('should respond with 200 status code for PUT requests', async () => {
            const request = {
                method: 'PUT',
                headers: {},
                body: { id: '123', name: 'updated' },
                query: {}
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(200)
            const body = JSON.parse(response.body)
            expect(body.message).toBe('PUT request processed successfully')
            expect(body.updated).toEqual({ id: '123', name: 'updated' })
        })
    })

    describe('DELETE requests', () => {
        it('should respond with 200 status code for DELETE requests with ID', async () => {
            const request = {
                method: 'DELETE',
                headers: {},
                body: null,
                query: { id: '123' }
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(200)
            const body = JSON.parse(response.body)
            expect(body.message).toBe('DELETE request processed successfully')
            expect(body.deleted).toEqual({ id: '123' })
        })

        it('should return 400 for DELETE requests without ID parameter', async () => {
            const request = {
                method: 'DELETE',
                headers: {},
                body: null,
                query: {}
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(400)
            const body = JSON.parse(response.body)
            expect(body.error).toBe('Bad Request')
            expect(body.message).toBe('ID parameter is required for DELETE requests')
        })
    })

    describe('Unsupported methods', () => {
        it('should return 405 for unsupported HTTP methods', async () => {
            const request = {
                method: 'PATCH',
                headers: {},
                body: null,
                query: {}
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(405)
            const body = JSON.parse(response.body)
            expect(body.error).toBe('Method Not Allowed')
            expect(body.message).toBe('Method PATCH is not supported')
        })
    })

    describe('Response format and headers', () => {
        it('should include CORS headers in all responses', async () => {
            const request = {
                method: 'GET',
                headers: {},
                body: null,
                query: {}
            }

            const response = await handler(request)

            expect(response.headers['Access-Control-Allow-Origin']).toBe('*')
            expect(response.headers['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE, OPTIONS')
            expect(response.headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization')
        })

        it('should return valid JSON in response body', async () => {
            const request = {
                method: 'GET',
                headers: {},
                body: null,
                query: {}
            }

            const response = await handler(request)

            expect(typeof response.body).toBe('string')
            expect(() => JSON.parse(response.body)).not.toThrow()
        })

        it('should include timestamp in ISO format', async () => {
            const request = {
                method: 'GET',
                headers: {},
                body: null,
                query: {}
            }

            const response = await handler(request)
            const body = JSON.parse(response.body)

            expect(body.timestamp).toBeDefined()
            expect(() => new Date(body.timestamp)).not.toThrow()
            expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
        })
    })

    describe('Error handling scenarios', () => {
        it('should handle requests with null body gracefully', async () => {
            const request = {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: null,
                query: {}
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(201)
            const body = JSON.parse(response.body)
            expect(body.received).toEqual({})
        })

        it('should handle requests with undefined query gracefully', async () => {
            const request = {
                method: 'GET',
                headers: {},
                body: null,
                query: undefined
            }

            const response = await handler(request)

            expect(response.statusCode).toBe(200)
            const body = JSON.parse(response.body)
            expect(body.query).toEqual({})
        })
    })
})