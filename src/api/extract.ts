import { Hono } from 'hono';
import { z } from 'zod';
import { extractMetadata } from '../services/extractor';
import { getCachedMetadata, setCachedMetadata } from '../services/cache';
import { apiKeyAuth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimit';
import { logUsage } from '../services/usage';
import type { AppContext } from '../types';

export const extractRouter = new Hono<AppContext>();

const extractSchema = z.object({
  url: z.string().url('Invalid URL format'),
  cache: z.coerce.boolean().default(true),
  fullResponse: z.coerce.boolean().default(false),
});

// Apply auth and rate limiting
extractRouter.use('*', apiKeyAuth);
extractRouter.use('*', rateLimiter);

extractRouter.get('/', async (c) => {
  const startTime = Date.now();
  
  try {
    const query = c.req.query();
    const params = extractSchema.parse({
      url: query.url,
      cache: query.cache ?? 'true',
      fullResponse: query.fullResponse ?? 'false',
    });

    const { url, cache: useCache, fullResponse } = params;
    let cached = false;
    let metadata;

    // Check cache first
    if (useCache) {
      const cachedData = await getCachedMetadata(url);
      if (cachedData) {
        metadata = cachedData;
        cached = true;
      }
    }

    // Fetch if not cached
    if (!metadata) {
      metadata = await extractMetadata(url);
      
      // Cache the result
      if (useCache && metadata) {
        await setCachedMetadata(url, metadata);
      }
    }

    const latencyMs = Date.now() - startTime;

    // Log usage
    const apiKey = c.get('apiKey');
    if (apiKey) {
      await logUsage({
        userId: apiKey.userId,
        apiKeyId: apiKey.id,
        endpoint: 'extract',
        url,
        status: 200,
        latencyMs,
        cached,
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      });
    }

    // Build response
    const response: Record<string, unknown> = {
      success: true,
      cached,
      latencyMs,
      data: {
        url,
        // OpenGraph
        openGraph: {
          title: metadata.title,
          description: metadata.description,
          image: metadata.image,
          siteName: metadata.siteName,
          type: metadata.type,
          locale: metadata.locale,
        },
        // Twitter Card
        twitterCard: {
          card: metadata.twitterCard,
          site: metadata.twitterSite,
          creator: metadata.twitterCreator,
          title: metadata.twitterTitle || metadata.title,
          description: metadata.twitterDescription || metadata.description,
          image: metadata.twitterImage || metadata.image,
        },
        // Meta
        meta: {
          favicon: metadata.favicon,
          themeColor: metadata.themeColor,
          canonical: metadata.canonical,
        },
      },
    };

    if (fullResponse && metadata.rawMeta) {
      (response.data as Record<string, unknown>).raw = metadata.rawMeta;
    }

    return c.json(response);
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      }, 400);
    }

    const err = error as { message?: string; status?: number };

    // Log failed request
    const apiKey = c.get('apiKey');
    if (apiKey) {
      await logUsage({
        userId: apiKey.userId,
        apiKeyId: apiKey.id,
        endpoint: 'extract',
        url: c.req.query('url'),
        status: err.status || 500,
        latencyMs,
        cached: false,
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      });
    }

    return c.json({
      success: false,
      error: err.message || 'Failed to extract metadata',
    }, 500);
  }
});

// POST variant for batch extraction
extractRouter.post('/batch', async (c) => {
  const startTime = Date.now();
  
  try {
    const body = await c.req.json();
    const urls = z.array(z.string().url()).max(10).parse(body.urls);
    
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const cached = await getCachedMetadata(url);
        if (cached) return { url, ...cached, cached: true };
        
        const metadata = await extractMetadata(url);
        await setCachedMetadata(url, metadata);
        return { url, ...metadata, cached: false };
      })
    );

    const response = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, ...result.value };
      }
      return { success: false, url: urls[index], error: (result.reason as Error)?.message };
    });

    return c.json({
      success: true,
      latencyMs: Date.now() - startTime,
      data: response,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      }, 400);
    }
    
    const err = error as Error;
    return c.json({
      success: false,
      error: err.message || 'Batch extraction failed',
    }, 500);
  }
});
