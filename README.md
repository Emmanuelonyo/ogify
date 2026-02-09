# Ogify 🔗

Production-ready OpenGraph metadata extraction and image generation API.

## Features

- 🔗 **URL Metadata Extraction** — Fetch OG tags, Twitter cards, and meta from any URL
- 🖼️ **Dynamic OG Image Generation** — Beautiful, customizable images via API
- ⚡ **Smart Caching** — Redis + PostgreSQL for speed and persistence
- 🔑 **API Key Authentication** — Secure access with per-key rate limits
- 📊 **Usage Dashboard** — Track API calls and performance
- 🎨 **Multiple Templates** — 5 built-in templates, fully customizable

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Start development server
bun run dev
```

## API Endpoints

### Extract Metadata

```bash
GET /api/v1/extract?url=https://example.com&api_key=og_xxx

# Response
{
  "success": true,
  "cached": false,
  "latencyMs": 234,
  "data": {
    "url": "https://example.com",
    "openGraph": {
      "title": "Example Domain",
      "description": "...",
      "image": "https://..."
    },
    "twitterCard": { ... },
    "meta": { ... }
  }
}
```

### Batch Extraction

```bash
POST /api/v1/extract/batch
Content-Type: application/json
X-API-Key: og_xxx

{
  "urls": [
    "https://example.com",
    "https://github.com"
  ]
}
```

### Generate OG Image

```bash
GET /api/v1/og?title=Hello%20World&description=My%20awesome%20page&template=default&api_key=og_xxx

# Returns PNG image
```

**Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| title | string | required | Main heading |
| description | string | optional | Subheading |
| template | string | default | Template name |
| theme | light/dark | dark | Color theme |
| width | number | 1200 | Image width |
| height | number | 630 | Image height |
| format | png/svg | png | Output format |

### Available Templates

- `default` — Gradient background, centered text
- `minimal` — Solid color, bottom-aligned
- `card` — Centered card with shadow
- `split` — Accent bar on left
- `border` — Gradient border effect

```bash
GET /api/v1/og/templates
```

### Authentication

```bash
# Signup
POST /api/v1/auth/signup
{ "email": "...", "password": "...", "name": "..." }

# Login
POST /api/v1/auth/login
{ "email": "...", "password": "..." }

# Create API Key
POST /api/v1/auth/keys
Authorization: Bearer <token>
{ "name": "My Key" }

# List API Keys
GET /api/v1/auth/keys
Authorization: Bearer <token>
```

### Dashboard

```bash
# Usage stats
GET /api/v1/dashboard/stats
Authorization: Bearer <token>

# Usage history (for charts)
GET /api/v1/dashboard/history?days=30
Authorization: Bearer <token>

# Recent requests
GET /api/v1/dashboard/requests?limit=50
Authorization: Bearer <token>
```

## Rate Limits

| Header | Description |
|--------|-------------|
| X-RateLimit-Limit | Max requests per window |
| X-RateLimit-Remaining | Requests left |
| X-RateLimit-Reset | Unix timestamp of reset |

Default: 60 requests/minute per API key.

## Deployment

### Docker

```bash
docker build -t ogify .
docker run -p 3000:3000 --env-file .env ogify
```

### Fly.io

```bash
fly launch
fly secrets set DATABASE_URL="..." REDIS_URL="..." JWT_SECRET="..."
fly deploy
```

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/ogify)

## Tech Stack

- **Runtime:** Bun
- **Framework:** Hono
- **Database:** PostgreSQL + Prisma
- **Cache:** Redis (optional)
- **Image Gen:** Satori + Resvg
- **Auth:** JWT + bcrypt

## License

MIT
