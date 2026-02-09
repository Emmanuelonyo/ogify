import { Hono } from 'hono';
import { z } from 'zod';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getTemplate, templates } from '../templates';
import { apiKeyAuth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimit';
import { logUsage } from '../services/usage';
import type { AppContext } from '../types';

export const generateRouter = new Hono<AppContext>();

const generateSchema = z.object({
  title: z.string().max(200),
  description: z.string().max(500).optional(),
  template: z.string().default('default'),
  theme: z.enum(['light', 'dark']).default('dark'),
  width: z.coerce.number().min(200).max(2400).default(1200),
  height: z.coerce.number().min(200).max(1260).default(630),
  
  // Customization
  logo: z.string().url().optional(),
  background: z.string().optional(), // color or gradient
  textColor: z.string().optional(),
  fontSize: z.coerce.number().min(12).max(120).optional(),
  fontFamily: z.string().optional(),
  
  // Output
  format: z.enum(['png', 'svg']).default('png'),
});

// Apply middleware
generateRouter.use('*', apiKeyAuth);
generateRouter.use('*', rateLimiter);

// Load fonts
const loadFonts = async () => {
  // Using Inter font from Google Fonts CDN
  const interBold = await fetch(
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2'
  ).then((res) => res.arrayBuffer());
  
  const interRegular = await fetch(
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
  ).then((res) => res.arrayBuffer());

  return [
    { name: 'Inter', data: interBold, weight: 700 as const, style: 'normal' as const },
    { name: 'Inter', data: interRegular, weight: 400 as const, style: 'normal' as const },
  ];
};

let fontsCache: Awaited<ReturnType<typeof loadFonts>> | null = null;

const getFonts = async () => {
  if (!fontsCache) {
    fontsCache = await loadFonts();
  }
  return fontsCache;
};

generateRouter.get('/', async (c) => {
  const startTime = Date.now();
  
  try {
    const query = c.req.query();
    const params = generateSchema.parse({
      title: query.title,
      description: query.description,
      template: query.template,
      theme: query.theme,
      width: query.width,
      height: query.height,
      logo: query.logo,
      background: query.background,
      textColor: query.textColor,
      fontSize: query.fontSize,
      fontFamily: query.fontFamily,
      format: query.format,
    });

    const { title, description, template, theme, width, height, format } = params;

    // Get template component
    const templateFn = getTemplate(template);
    const element = templateFn({
      title,
      description,
      theme,
      logo: params.logo,
      background: params.background,
      textColor: params.textColor,
      fontSize: params.fontSize,
    });

    // Load fonts
    const fonts = await getFonts();

    // Generate SVG with Satori
    const svg = await satori(element as unknown as Parameters<typeof satori>[0], {
      width,
      height,
      fonts,
    });

    const latencyMs = Date.now() - startTime;

    // Log usage
    const apiKey = c.get('apiKey');
    if (apiKey) {
      await logUsage({
        userId: apiKey.userId,
        apiKeyId: apiKey.id,
        endpoint: 'generate',
        status: 200,
        latencyMs,
        cached: false,
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      });
    }

    // Return SVG or convert to PNG
    if (format === 'svg') {
      c.header('Content-Type', 'image/svg+xml');
      c.header('Cache-Control', 'public, max-age=31536000, immutable');
      return c.body(svg);
    }

    // Convert to PNG using resvg
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: width },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    c.header('Content-Type', 'image/png');
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
    return new Response(pngBuffer, {
      headers: c.res.headers,
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
      error: err.message || 'Failed to generate image',
    }, 500);
  }
});

// List available templates
generateRouter.get('/templates', (c) => {
  return c.json({
    success: true,
    data: Object.keys(templates).map((key) => ({
      id: key,
      name: templates[key].name,
      description: templates[key].description,
      preview: `/api/v1/og?title=Preview&template=${key}`,
    })),
  });
});
