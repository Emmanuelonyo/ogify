import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import type { ExtractedMetadata } from './extractor';

const prisma = new PrismaClient();

// Redis connection (optional - falls back to Prisma if not available)
let redis: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    
    redis.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
  }
} catch (error) {
  console.warn('Redis not available, using database cache only');
}

const CACHE_TTL = parseInt(process.env.CACHE_TTL_HOURS || '24') * 60 * 60; // hours to seconds
const CACHE_PREFIX = 'ogify:meta:';

function hashUrl(url: string): string {
  // Simple hash for cache key
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function getCachedMetadata(url: string): Promise<ExtractedMetadata | null> {
  const urlHash = hashUrl(url);

  // Try Redis first
  if (redis) {
    try {
      const cached = await redis.get(`${CACHE_PREFIX}${urlHash}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Redis get error:', error);
    }
  }

  // Fallback to database
  try {
    const dbCached = await prisma.cachedMetadata.findUnique({
      where: { urlHash },
    });

    if (dbCached && dbCached.expiresAt > new Date()) {
      return {
        title: dbCached.title || undefined,
        description: dbCached.description || undefined,
        image: dbCached.image || undefined,
        siteName: dbCached.siteName || undefined,
        type: dbCached.type || undefined,
        locale: dbCached.locale || undefined,
        twitterCard: dbCached.twitterCard || undefined,
        twitterSite: dbCached.twitterSite || undefined,
        twitterCreator: dbCached.twitterCreator || undefined,
        twitterTitle: dbCached.twitterTitle || undefined,
        twitterDescription: dbCached.twitterDescription || undefined,
        twitterImage: dbCached.twitterImage || undefined,
        favicon: dbCached.favicon || undefined,
        themeColor: dbCached.themeColor || undefined,
        canonical: dbCached.canonical || undefined,
        rawMeta: dbCached.rawMeta as Record<string, string> || undefined,
      };
    }
  } catch (error) {
    console.warn('Database cache error:', error);
  }

  return null;
}

export async function setCachedMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
  const urlHash = hashUrl(url);
  const expiresAt = new Date(Date.now() + CACHE_TTL * 1000);

  // Set in Redis
  if (redis) {
    try {
      await redis.setex(
        `${CACHE_PREFIX}${urlHash}`,
        CACHE_TTL,
        JSON.stringify(metadata)
      );
    } catch (error) {
      console.warn('Redis set error:', error);
    }
  }

  // Also store in database for persistence
  try {
    await prisma.cachedMetadata.upsert({
      where: { urlHash },
      create: {
        urlHash,
        url,
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        siteName: metadata.siteName,
        type: metadata.type,
        locale: metadata.locale,
        twitterCard: metadata.twitterCard,
        twitterSite: metadata.twitterSite,
        twitterCreator: metadata.twitterCreator,
        twitterTitle: metadata.twitterTitle,
        twitterDescription: metadata.twitterDescription,
        twitterImage: metadata.twitterImage,
        favicon: metadata.favicon,
        themeColor: metadata.themeColor,
        canonical: metadata.canonical,
        rawMeta: metadata.rawMeta || {},
        expiresAt,
      },
      update: {
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        siteName: metadata.siteName,
        type: metadata.type,
        locale: metadata.locale,
        twitterCard: metadata.twitterCard,
        twitterSite: metadata.twitterSite,
        twitterCreator: metadata.twitterCreator,
        twitterTitle: metadata.twitterTitle,
        twitterDescription: metadata.twitterDescription,
        twitterImage: metadata.twitterImage,
        favicon: metadata.favicon,
        themeColor: metadata.themeColor,
        canonical: metadata.canonical,
        rawMeta: metadata.rawMeta || {},
        fetchedAt: new Date(),
        expiresAt,
      },
    });
  } catch (error) {
    console.warn('Database cache set error:', error);
  }
}

export async function invalidateCache(url: string): Promise<void> {
  const urlHash = hashUrl(url);

  if (redis) {
    try {
      await redis.del(`${CACHE_PREFIX}${urlHash}`);
    } catch (error) {
      console.warn('Redis delete error:', error);
    }
  }

  try {
    await prisma.cachedMetadata.delete({ where: { urlHash } });
  } catch (error) {
    // Ignore if not found
  }
}

export async function cleanExpiredCache(): Promise<number> {
  const result = await prisma.cachedMetadata.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
