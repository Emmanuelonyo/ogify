import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UsageLogInput {
  userId: string;
  apiKeyId: string;
  endpoint: string;
  url?: string;
  status: number;
  latencyMs: number;
  cached: boolean;
  userAgent?: string;
  ip?: string;
}

export async function logUsage(input: UsageLogInput): Promise<void> {
  try {
    await prisma.usageLog.create({
      data: {
        userId: input.userId,
        apiKeyId: input.apiKeyId,
        endpoint: input.endpoint,
        url: input.url,
        status: input.status,
        latencyMs: input.latencyMs,
        cached: input.cached,
        userAgent: input.userAgent,
        ip: input.ip,
      },
    });

    // Update last used timestamp on API key
    await prisma.apiKey.update({
      where: { id: input.apiKeyId },
      data: { lastUsedAt: new Date() },
    });
  } catch (error) {
    console.error('Failed to log usage:', error);
    // Don't throw - logging shouldn't break requests
  }
}

export async function getUsageStats(userId: string, startDate: Date, endDate: Date) {
  const stats = await prisma.usageLog.groupBy({
    by: ['endpoint'],
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
    },
    _count: true,
    _avg: { latencyMs: true },
  });

  const totalRequests = await prisma.usageLog.count({
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  const successfulRequests = await prisma.usageLog.count({
    where: {
      userId,
      status: { lt: 400 },
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  return {
    totalRequests,
    successfulRequests,
    successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : '0',
    byEndpoint: stats.map((s) => ({
      endpoint: s.endpoint,
      count: s._count,
      avgLatencyMs: Math.round(s._avg.latencyMs || 0),
    })),
  };
}

export async function getDailyUsage(userId: string, apiKeyId?: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.usageLog.findMany({
    where: {
      userId,
      ...(apiKeyId && { apiKeyId }),
      createdAt: { gte: startDate },
    },
    select: { createdAt: true, endpoint: true },
    orderBy: { createdAt: 'asc' },
  });

  const dailyStats: Record<string, { extract: number; generate: number }> = {};

  logs.forEach((log) => {
    const date = log.createdAt.toISOString().split('T')[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { extract: 0, generate: 0 };
    }
    if (log.endpoint === 'extract') dailyStats[date].extract++;
    if (log.endpoint === 'generate') dailyStats[date].generate++;
  });

  return Object.entries(dailyStats).map(([date, counts]) => ({
    date,
    ...counts,
    total: counts.extract + counts.generate,
  }));
}
