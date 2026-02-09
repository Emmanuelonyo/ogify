import * as cheerio from 'cheerio';

export interface ExtractedMetadata {
  // OpenGraph
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  locale?: string;
  url?: string;

  // Twitter Card
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;

  // General meta
  favicon?: string;
  themeColor?: string;
  canonical?: string;
  author?: string;
  keywords?: string;

  // Raw data
  rawMeta?: Record<string, string>;
}

const USER_AGENTS = [
  'Mozilla/5.0 (compatible; Ogify/1.0; +https://ogify.io)',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('URL does not return HTML content');
    }

    const html = await response.text();
    return parseHtml(html, url);
  } finally {
    clearTimeout(timeout);
  }
}

function parseHtml(html: string, baseUrl: string): ExtractedMetadata {
  const $ = cheerio.load(html);
  const rawMeta: Record<string, string> = {};

  // Helper to get meta content
  const getMeta = (selectors: string[]): string | undefined => {
    for (const selector of selectors) {
      const content = $(selector).attr('content');
      if (content) return content.trim();
    }
    return undefined;
  };

  // Collect all meta tags
  $('meta').each((_, el) => {
    const $el = $(el);
    const name = $el.attr('name') || $el.attr('property') || $el.attr('itemprop');
    const content = $el.attr('content');
    if (name && content) {
      rawMeta[name] = content;
    }
  });

  // Extract OpenGraph
  const ogTitle = getMeta(['meta[property="og:title"]']);
  const ogDescription = getMeta(['meta[property="og:description"]']);
  const ogImage = getMeta(['meta[property="og:image"]', 'meta[property="og:image:url"]']);
  const ogSiteName = getMeta(['meta[property="og:site_name"]']);
  const ogType = getMeta(['meta[property="og:type"]']);
  const ogLocale = getMeta(['meta[property="og:locale"]']);
  const ogUrl = getMeta(['meta[property="og:url"]']);

  // Extract Twitter Card
  const twitterCard = getMeta(['meta[name="twitter:card"]']);
  const twitterSite = getMeta(['meta[name="twitter:site"]']);
  const twitterCreator = getMeta(['meta[name="twitter:creator"]']);
  const twitterTitle = getMeta(['meta[name="twitter:title"]']);
  const twitterDescription = getMeta(['meta[name="twitter:description"]']);
  const twitterImage = getMeta(['meta[name="twitter:image"]', 'meta[name="twitter:image:src"]']);

  // Extract general meta
  const title = ogTitle || twitterTitle || $('title').text().trim() || getMeta(['meta[name="title"]']);
  const description = ogDescription || twitterDescription || getMeta([
    'meta[name="description"]',
    'meta[itemprop="description"]',
  ]);

  // Favicon
  let favicon = $('link[rel="icon"]').attr('href') 
    || $('link[rel="shortcut icon"]').attr('href')
    || $('link[rel="apple-touch-icon"]').attr('href');
  
  if (favicon && !favicon.startsWith('http')) {
    try {
      favicon = new URL(favicon, baseUrl).href;
    } catch {
      favicon = undefined;
    }
  }

  // Canonical URL
  const canonical = $('link[rel="canonical"]').attr('href');

  // Theme color
  const themeColor = getMeta(['meta[name="theme-color"]']);

  // Author
  const author = getMeta(['meta[name="author"]']);

  // Keywords
  const keywords = getMeta(['meta[name="keywords"]']);

  // Resolve relative image URLs
  const resolveUrl = (maybeUrl?: string): string | undefined => {
    if (!maybeUrl) return undefined;
    if (maybeUrl.startsWith('http')) return maybeUrl;
    try {
      return new URL(maybeUrl, baseUrl).href;
    } catch {
      return undefined;
    }
  };

  return {
    title,
    description,
    image: resolveUrl(ogImage || twitterImage),
    siteName: ogSiteName,
    type: ogType,
    locale: ogLocale,
    url: ogUrl || baseUrl,
    twitterCard,
    twitterSite,
    twitterCreator,
    twitterTitle,
    twitterDescription,
    twitterImage: resolveUrl(twitterImage),
    favicon,
    themeColor,
    canonical,
    author,
    keywords,
    rawMeta,
  };
}
