import { Hono } from 'hono';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto';

export const authRouter = new Hono();

const prisma = new PrismaClient();

// Signup
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

authRouter.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = signupSchema.parse(body);

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return c.json({ success: false, error: 'Email already registered' }, 400);
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Create default API key
    const apiKey = await prisma.apiKey.create({
      data: {
        key: `og_${nanoid(32)}`,
        name: 'Default',
        userId: user.id,
      },
    });

    // Generate JWT
    const token = await generateToken({ userId: user.id, email: user.email });

    return c.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        apiKey: apiKey.key,
        token,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { apiKeys: { where: { active: true }, take: 1 } },
    });

    if (!user || !(await verifyPassword(password, user.password))) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    const token = await generateToken({ userId: user.id, email: user.email });

    return c.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        apiKey: user.apiKeys[0]?.key,
        token,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ success: false, error: error.message }, 500);
  }
});

// API Key Management
authRouter.post('/keys', async (c) => {
  try {
    const auth = c.req.header('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const payload = await import('../utils/crypto').then((m) => m.verifyToken(auth.slice(7)));
    if (!payload) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    const body = await c.req.json();
    const name = z.string().min(1).max(100).parse(body.name);

    const apiKey = await prisma.apiKey.create({
      data: {
        key: `og_${nanoid(32)}`,
        name,
        userId: payload.userId,
      },
    });

    return c.json({
      success: true,
      data: {
        id: apiKey.id,
        key: apiKey.key,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

authRouter.get('/keys', async (c) => {
  try {
    const auth = c.req.header('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const payload = await import('../utils/crypto').then((m) => m.verifyToken(auth.slice(7)));
    if (!payload) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: payload.userId },
      select: {
        id: true,
        key: true,
        name: true,
        active: true,
        rateLimit: true,
        dailyLimit: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    // Mask API keys (show only last 8 chars)
    const maskedKeys = keys.map((k) => ({
      ...k,
      key: `og_${'*'.repeat(24)}${k.key.slice(-8)}`,
    }));

    return c.json({ success: true, data: maskedKeys });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

authRouter.delete('/keys/:id', async (c) => {
  try {
    const auth = c.req.header('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const payload = await import('../utils/crypto').then((m) => m.verifyToken(auth.slice(7)));
    if (!payload) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    const keyId = c.req.param('id');

    await prisma.apiKey.deleteMany({
      where: { id: keyId, userId: payload.userId },
    });

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
