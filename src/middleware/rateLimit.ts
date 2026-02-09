import type { MiddlewareHandler } from 'hono';
import Redis from 'ioredis';
import type { AppContext } from '../types';

let redis: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
} catch (error) {
  console.warn('Redis not available for rate limiting, using in-memory fallback');
}

// In-memory fallback for rate limiting
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of inMemoryStore.entries()) {
    if (value.resetAt < now) {
      inMemoryStore.delete(key);
    }
  }
}, 60000); // Clean every minute

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
};

export const rateLimiter: MiddlewareHandler<AppContext> = async (c, next) => {
  const apiKey = c.get('apiKey');
  if (!apiKey) {
    // No API key = stricter rate limit by IP
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    return await checkRateLimit(c, next, `ip:${ip}`, { windowMs: 60000, max: 10 });
  }

  // Use API key's rate limit settings
  const config: RateLimitConfig = {
    windowMs: 60 * 1000,
    max: apiKey.rateLimit || DEFAULT_RATE_LIMIT.max,
  };

  return await checkRateLimit(c, next, `key:${apiKey.id}`, config);
};

async function checkRateLimit(
  c: Parameters<MiddlewareHandler<AppContext>>[0],
  next: Parameters<MiddlewareHandler<AppContext>>[1],
  identifier: string,
  config: RateLimitConfig
): Promise<Response | void> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowEnd = now + config.windowMs;

  let current: number;
  let resetAt: number;

  if (redis) {
    try {
      const multi = redis.multi();
      multi.incr(key);
      multi.pttl(key);
      const results = await multi.exec();

      current = (results?.[0]?.[1] as number) || 1;
      const ttl = (results?.[1]?.[1] as number) || -1;

      if (ttl === -1) {
        await redis.pexpire(key, config.windowMs);
        resetAt = windowEnd;
      } else {
        resetAt = now + ttl;
      }
    } catch (error) {
      console.warn('Redis rate limit error, falling back to in-memory');
      return await inMemoryRateLimit(c, next, key, config);
    }
  } else {
    return await inMemoryRateLimit(c, next, key, config);
  }

  // Set rate limit headers
  c.header('X-RateLimit-Limit', config.max.toString());
  c.header('X-RateLimit-Remaining', Math.max(0, config.max - current).toString());
  c.header('X-RateLimit-Reset', Math.ceil(resetAt / 1000).toString());

  if (current > config.max) {
    return c.json({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((resetAt - now) / 1000),
    }, 429);
  }

  await next();
}

async function inMemoryRateLimit(
  c: Parameters<MiddlewareHandler<AppContext>>[0],
  next: Parameters<MiddlewareHandler<AppContext>>[1],
  key: string,
  config: RateLimitConfig
): Promise<Response | void> {
  const now = Date.now();
  let entry = inMemoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + config.windowMs };
  }

  entry.count++;
  inMemoryStore.set(key, entry);

  c.header('X-RateLimit-Limit', config.max.toString());
  c.header('X-RateLimit-Remaining', Math.max(0, config.max - entry.count).toString());
  c.header('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());

  if (entry.count > config.max) {
    return c.json({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }, 429);
  }

  await next();
}
