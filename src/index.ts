import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { extractRouter } from './api/extract';
import { generateRouter } from './api/generate';
import { authRouter } from './api/auth';
import { dashboardRouter } from './api/dashboard';
import { errorHandler } from './middleware/error';
import { rateLimiter } from './middleware/rateLimit';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400,
}));

// Error handling
app.onError(errorHandler);

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Ogify API',
    version: '1.0.0',
    status: 'healthy',
    docs: '/docs',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.route('/api/v1/extract', extractRouter);
app.route('/api/v1/og', generateRouter);
app.route('/api/v1/auth', authRouter);
app.route('/api/v1/dashboard', dashboardRouter);

// Docs endpoint
app.get('/docs', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Ogify API',
      version: '1.0.0',
      description: 'OpenGraph metadata extraction and image generation API',
    },
    servers: [
      { url: 'https://ogify.io/api/v1', description: 'Production' },
      { url: 'http://localhost:3000/api/v1', description: 'Development' },
    ],
    paths: {
      '/extract': {
        get: {
          summary: 'Extract OpenGraph metadata from URL',
          parameters: [
            { name: 'url', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'cache', in: 'query', required: false, schema: { type: 'boolean', default: true } },
          ],
          responses: {
            200: { description: 'Metadata extracted successfully' },
            400: { description: 'Invalid URL' },
            429: { description: 'Rate limit exceeded' },
          },
        },
      },
      '/og': {
        get: {
          summary: 'Generate OpenGraph image',
          parameters: [
            { name: 'title', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'description', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'template', in: 'query', required: false, schema: { type: 'string', default: 'default' } },
          ],
          responses: {
            200: { description: 'Image generated', content: { 'image/png': {} } },
            400: { description: 'Invalid parameters' },
            429: { description: 'Rate limit exceeded' },
          },
        },
      },
    },
  });
});

const port = parseInt(process.env.PORT || '3000');

console.log(`🚀 Ogify API running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
