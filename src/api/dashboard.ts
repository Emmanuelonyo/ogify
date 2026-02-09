import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/crypto';
import type { AppContext } from '../types';

export const dashboardRouter = new Hono<AppContext>();

const prisma = new PrismaClient();

// Auth middleware for dashboard
dashboardRouter.use('*', async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const payload = await verifyToken(auth.slice(7));
  if (!payload) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }

  c.set('userId', payload.userId);
  await next();
});

// Get usage stats
dashboardRouter.get('/stats', async (c) => {
  const userId = c.get('userId');
  
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const [todayStats, weekStats, monthStats, totalStats] = await Promise.all([
    prisma.usageLog.aggregate({
      where: { userId, createdAt: { gte: startOfDay } },
      _count: true,
      _avg: { latencyMs: true },
    }),
    prisma.usageLog.aggregate({
      where: { userId, createdAt: { gte: startOfWeek } },
      _count: true,
    }),
    prisma.usageLog.aggregate({
      where: { userId, createdAt: { gte: startOfMonth } },
      _count: true,
    }),
    prisma.usageLog.aggregate({
      where: { userId },
      _count: true,
    }),
  ]);

  // Get endpoint breakdown
  const endpointBreakdown = await prisma.usageLog.groupBy({
    by: ['endpoint'],
    where: { userId, createdAt: { gte: startOfMonth } },
    _count: true,
  });

  // Get cache hit rate
  const cacheStats = await prisma.usageLog.groupBy({
    by: ['cached'],
    where: { userId, createdAt: { gte: startOfMonth }, endpoint: 'extract' },
    _count: true,
  });

  const cacheHits = cacheStats.find((s) => s.cached)?._count || 0;
  const cacheMisses = cacheStats.find((s) => !s.cached)?._count || 0;
  const totalCache = (typeof cacheHits === 'number' ? cacheHits : 0) + (typeof cacheMisses === 'number' ? cacheMisses : 0);
  const cacheHitRate = totalCache > 0 
    ? (((typeof cacheHits === 'number' ? cacheHits : 0) / totalCache) * 100).toFixed(1)
    : '0';

  return c.json({
    success: true,
    data: {
      requests: {
        today: todayStats._count,
        week: weekStats._count,
        month: monthStats._count,
        total: totalStats._count,
      },
      performance: {
        avgLatencyMs: Math.round(todayStats._avg?.latencyMs || 0),
        cacheHitRate: `${cacheHitRate}%`,
      },
      breakdown: {
        extract: endpointBreakdown.find((e) => e.endpoint === 'extract')?._count || 0,
        generate: endpointBreakdown.find((e) => e.endpoint === 'generate')?._count || 0,
      },
    },
  });
});

// Get usage history (for charts)
dashboardRouter.get('/history', async (c) => {
  const userId = c.get('userId');
  const days = parseInt(c.req.query('days') || '30');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.usageLog.findMany({
    where: { userId, createdAt: { gte: startDate } },
    select: { createdAt: true, endpoint: true, cached: true, latencyMs: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by day
  const dailyStats: Record<string, { extract: number; generate: number; total: number }> = {};
  
  logs.forEach((log) => {
    const date = log.createdAt.toISOString().split('T')[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { extract: 0, generate: 0, total: 0 };
    }
    dailyStats[date].total++;
    if (log.endpoint === 'extract') dailyStats[date].extract++;
    if (log.endpoint === 'generate') dailyStats[date].generate++;
  });

  return c.json({
    success: true,
    data: Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats,
    })),
  });
});

// Get recent requests
dashboardRouter.get('/requests', async (c) => {
  const userId = c.get('userId');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  const offset = parseInt(c.req.query('offset') || '0');

  const [logs, total] = await Promise.all([
    prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        endpoint: true,
        url: true,
        status: true,
        latencyMs: true,
        cached: true,
        createdAt: true,
      },
    }),
    prisma.usageLog.count({ where: { userId } }),
  ]);

  return c.json({
    success: true,
    data: logs,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
});

// Get user profile
dashboardRouter.get('/profile', async (c) => {
  const userId = c.get('userId');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      apiKeys: {
        where: { active: true },
        select: { id: true, name: true, rateLimit: true, dailyLimit: true },
      },
    },
  });

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  return c.json({ success: true, data: user });
});
