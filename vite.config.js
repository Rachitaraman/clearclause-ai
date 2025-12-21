import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to handle API routes
const apiPlugin = () => {
    return {
        name: 'api-handler',
        configureServer(server) {
            server.middlewares.use('/api/process', async (req, res, next) => {
                if (req.method === 'POST' || req.method === 'GET') {
                    try {
                        // Import the serverless function
                        const { handler } = await import('./functions/process.js');

                        let body = '';
                        req.on('data', chunk => {
                            body += chunk.toString();
                        });

                        req.on('end', async () => {
                            try {
                                const parsedBody = body ? JSON.parse(body) : {};
                                const response = await handler({
                                    method: req.method,
                                    headers: req.headers,
                                    body: parsedBody,
                                    query: req.query || {}
                                });

                                // Set headers
                                Object.entries(response.headers).forEach(([key, value]) => {
                                    res.setHeader(key, value);
                                });

                                res.statusCode = response.statusCode;
                                res.end(response.body);
                            } catch (error) {
                                console.error('API handler error:', error);
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Internal Server Error' }));
                            }
                        });
                    } catch (error) {
                        console.error('API import error:', error);
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    }
                } else {
                    next();
                }
            });
        }
    };
};

export default defineConfig({
    plugins: [react(), apiPlugin()],
    root: '.',
    build: {
        outDir: 'dist'
    },
    server: {
        port: 3001
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test-setup.js'],
        testTimeout: 30000 // 30 seconds for property-based tests
    }
})