import type { Context } from 'hono';
import { ZodError } from 'zod';

export function errorHandler(err: Error, c: Context) {
  console.error('Unhandled error:', err);

  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: 'Validation error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    }, 400);
  }

  // Check for specific error types
  if (err.name === 'AbortError') {
    return c.json({
      success: false,
      error: 'Request timeout',
    }, 504);
  }

  if (err.message?.includes('fetch failed')) {
    return c.json({
      success: false,
      error: 'Failed to fetch URL',
      hint: 'The URL may be unreachable or blocking requests',
    }, 502);
  }

  // Generic error response
  return c.json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  }, 500);
}
