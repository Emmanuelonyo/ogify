import type { Context, Next, MiddlewareHandler } from 'hono';
import { PrismaClient } from '@prisma/client';
import type { AppContext } from '../types';

const prisma = new PrismaClient();

export const apiKeyAuth: MiddlewareHandler<AppContext> = async (c, next) => {
  // Check for API key in header or query param
  const apiKey = c.req.header('X-API-Key') || c.req.query('api_key');

  if (!apiKey) {
    return c.json({
      success: false,
      error: 'API key required',
      hint: 'Pass your API key via X-API-Key header or api_key query parameter',
    }, 401);
  }

  // Validate API key
  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!key) {
    return c.json({
      success: false,
      error: 'Invalid API key',
    }, 401);
  }

  if (!key.active) {
    return c.json({
      success: false,
      error: 'API key has been deactivated',
    }, 401);
  }

  if (key.expiresAt && key.expiresAt < new Date()) {
    return c.json({
      success: false,
      error: 'API key has expired',
    }, 401);
  }

  // Check endpoint permissions
  const path = c.req.path;
  if (path.includes('/extract') && !key.canExtract) {
    return c.json({
      success: false,
      error: 'API key does not have permission for extraction',
    }, 403);
  }

  if (path.includes('/og') && !key.canGenerate) {
    return c.json({
      success: false,
      error: 'API key does not have permission for image generation',
    }, 403);
  }

  // Set context for downstream handlers
  c.set('apiKey', {
    id: key.id,
    userId: key.userId,
    key: key.key,
    rateLimit: key.rateLimit,
    dailyLimit: key.dailyLimit,
    canExtract: key.canExtract,
    canGenerate: key.canGenerate,
  });
  c.set('userId', key.userId);

  await next();
};
