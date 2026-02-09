import { Link } from 'react-router-dom'
import { Link as LinkIcon, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const API_URL = 'https://ogify.io/api/v1'

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: `
Ogify is a powerful API for extracting OpenGraph metadata and generating dynamic OG images. 

**Base URL:** \`${API_URL}\`

All API requests require authentication via API key, passed either as:
- Header: \`X-API-Key: your_api_key\`
- Query param: \`?api_key=your_api_key\`
    `,
  },
  {
    id: 'authentication',
    title: 'Authentication',
    content: `
### Getting an API Key

1. Sign up at [ogify.io/signup](/signup)
2. Your API key is generated automatically
3. Find it in your [Dashboard](/dashboard/keys)

### Using Your Key

\`\`\`bash
# Via header (recommended)
curl -H "X-API-Key: og_xxx" "${API_URL}/extract?url=https://github.com"

# Via query parameter
curl "${API_URL}/extract?url=https://github.com&api_key=og_xxx"
\`\`\`
    `,
  },
  {
    id: 'extract',
    title: 'Extract Metadata',
    content: `
### GET /extract

Extract OpenGraph, Twitter Card, and meta tags from any URL.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| url | string | Yes | URL to extract metadata from |
| cache | boolean | No | Use cache (default: true) |
| fullResponse | boolean | No | Include raw meta tags |

**Example Request:**

\`\`\`bash
curl "${API_URL}/extract?url=https://github.com" \\
  -H "X-API-Key: og_xxx"
\`\`\`

**Example Response:**

\`\`\`json
{
  "success": true,
  "cached": false,
  "latencyMs": 234,
  "data": {
    "url": "https://github.com",
    "openGraph": {
      "title": "GitHub: Let's build from here",
      "description": "GitHub is where over 100 million developers...",
      "image": "https://github.githubassets.com/images/modules/site/social-cards/...",
      "siteName": "GitHub",
      "type": "website"
    },
    "twitterCard": {
      "card": "summary_large_image",
      "site": "@github",
      "title": "GitHub: Let's build from here",
      "description": "...",
      "image": "..."
    },
    "meta": {
      "favicon": "https://github.githubassets.com/favicons/favicon.svg",
      "themeColor": "#1e2327",
      "canonical": "https://github.com/"
    }
  }
}
\`\`\`
    `,
  },
  {
    id: 'batch',
    title: 'Batch Extraction',
    content: `
### POST /extract/batch

Extract metadata from multiple URLs in a single request.

**Request Body:**

\`\`\`json
{
  "urls": [
    "https://github.com",
    "https://twitter.com",
    "https://linkedin.com"
  ]
}
\`\`\`

**Limits:** Maximum 10 URLs per request.

**Example:**

\`\`\`bash
curl -X POST "${API_URL}/extract/batch" \\
  -H "X-API-Key: og_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"urls": ["https://github.com", "https://twitter.com"]}'
\`\`\`
    `,
  },
  {
    id: 'generate',
    title: 'Generate OG Images',
    content: `
### GET /og

Generate dynamic OpenGraph images on the fly.

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| title | string | required | Main heading text |
| description | string | - | Subheading text |
| template | string | default | Template name |
| theme | light/dark | dark | Color theme |
| width | number | 1200 | Image width (200-2400) |
| height | number | 630 | Image height (200-1260) |
| format | png/svg | png | Output format |
| background | string | - | Custom background color |
| textColor | string | - | Custom text color |

**Available Templates:**
- \`default\` - Gradient background, centered text
- \`minimal\` - Solid color, bottom-aligned
- \`card\` - Centered card with shadow
- \`split\` - Accent bar on left
- \`border\` - Gradient border effect

**Example:**

\`\`\`html
<meta property="og:image" content="${API_URL}/og?title=My%20Page&api_key=og_xxx" />
\`\`\`

**Direct URL:**

\`\`\`
${API_URL}/og?title=Hello%20World&description=Welcome%20to%20my%20site&template=card&theme=dark&api_key=og_xxx
\`\`\`
    `,
  },
  {
    id: 'rate-limits',
    title: 'Rate Limits',
    content: `
### Rate Limit Headers

Every response includes rate limit information:

| Header | Description |
|--------|-------------|
| X-RateLimit-Limit | Max requests per window |
| X-RateLimit-Remaining | Requests remaining |
| X-RateLimit-Reset | Unix timestamp when limit resets |

### Default Limits

| Plan | Requests/min | Requests/day |
|------|--------------|--------------|
| Free | 60 | 1,000 |
| Starter | 120 | 25,000 |
| Pro | 300 | 100,000 |
| Enterprise | Custom | Unlimited |

### Rate Limit Exceeded

\`\`\`json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
\`\`\`
    `,
  },
  {
    id: 'errors',
    title: 'Error Handling',
    content: `
### Error Response Format

\`\`\`json
{
  "success": false,
  "error": "Error message",
  "details": [...] // Optional validation errors
}
\`\`\`

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request / Validation error |
| 401 | Missing or invalid API key |
| 403 | Permission denied |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 502 | Failed to fetch URL |
| 504 | Request timeout |
    `,
  },
  {
    id: 'sdks',
    title: 'SDKs & Libraries',
    content: `
### JavaScript / TypeScript

\`\`\`bash
npm install ogify
\`\`\`

\`\`\`typescript
import { Ogify } from 'ogify';

const og = new Ogify('og_xxx');

// Extract metadata
const meta = await og.extract('https://github.com');
console.log(meta.openGraph.title);

// Generate image URL
const imageUrl = og.generateUrl({
  title: 'My Page',
  template: 'card',
});
\`\`\`

### Python

\`\`\`bash
pip install ogify
\`\`\`

\`\`\`python
from ogify import Ogify

og = Ogify('og_xxx')
meta = og.extract('https://github.com')
print(meta['openGraph']['title'])
\`\`\`

### cURL

\`\`\`bash
curl "${API_URL}/extract?url=https://example.com" \\
  -H "X-API-Key: og_xxx"
\`\`\`
    `,
  },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="relative group">
      <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm">
        <code className="text-gray-300">{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 p-2 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
      </button>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            Ogify
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/playground" className="text-gray-400 hover:text-white transition-colors">Playground</Link>
            <Link to="/signup" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-16 bottom-0 overflow-y-auto p-6 border-r border-gray-800 hidden lg:block">
          <nav className="space-y-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 lg:ml-64 p-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">API Documentation</h1>
          
          <div className="prose prose-invert max-w-none">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-800">{section.title}</h2>
                <div 
                  className="space-y-4 text-gray-300 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-4 [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:p-3 [&_th]:bg-gray-800 [&_td]:p-3 [&_td]:border-t [&_td]:border-gray-800 [&_code]:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary-400 [&_code]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0"
                  dangerouslySetInnerHTML={{ 
                    __html: section.content
                      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm my-4"><code class="text-gray-300">$2</code></pre>')
                      .replace(/`([^`]+)`/g, '<code>$1</code>')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
                      .replace(/\n\n/g, '</p><p class="my-4">')
                      .replace(/\| ([^|]+) \|/g, (match) => match)
                  }}
                />
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
