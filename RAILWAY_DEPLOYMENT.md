# Railway Deployment Guide

## Environment Variables to Set in Railway Dashboard

When deploying to Railway, configure these environment variables in the Railway dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `PORT` | `3000` | HTTP server port (Railway auto-assigns) |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` | Path to Chromium in container |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | `true` | Skip Puppeteer's Chromium download |

## Deployment Steps

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

### 3. Initialize Project

```bash
cd /Users/narasimharao.ponnada/Documents/Mermaid
railway init
```

### 4. Deploy

```bash
railway up
```

### 5. Set Environment Variables

In Railway Dashboard:
- Go to your project
- Click on Variables tab
- Add the environment variables listed above

### 6. Get Public URL

```bash
railway domain
```

Or in Railway Dashboard:
- Go to Settings
- Generate domain under "Domains"

## Local Testing with Docker

### Build and Run

```bash
# Build the image
docker build -t mermaid-mcp-connector .

# Run with docker-compose
docker-compose up -d

# Or run directly
docker run -p 3000:3000 -p 3001:3001 \
  -e NODE_ENV=production \
  -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  mermaid-mcp-connector
```

### Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Generate diagram
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "graph TD\n    A[Start] --> B[End]",
    "format": "svg"
  }'
```

### View Logs

```bash
# docker-compose
docker-compose logs -f

# Docker
docker logs -f mermaid-mcp-connector
```

### Stop Container

```bash
# docker-compose
docker-compose down

# Docker
docker stop mermaid-mcp-connector
docker rm mermaid-mcp-connector
```

## ChatGPT Integration

Once deployed to Railway:

1. **Get Railway URL**: e.g., `https://your-app.railway.app`

2. **Create Custom GPT**:
   - Go to ChatGPT → Create a GPT
   - Add action with this OpenAPI spec:

```yaml
openapi: 3.0.0
info:
  title: Mermaid Diagram Generator
  version: 1.0.0
servers:
  - url: https://your-app.railway.app
paths:
  /api/diagram/generate:
    post:
      operationId: generateDiagram
      summary: Generate Mermaid diagram
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                code:
                  type: string
                  description: Mermaid diagram code
                format:
                  type: string
                  enum: [svg, png]
                  default: svg
      responses:
        '200':
          description: Diagram generated successfully
```

3. **Test**: Ask ChatGPT to generate diagrams!

## Troubleshooting

### Puppeteer/Chromium Issues

If Puppeteer fails to launch:
- Check `PUPPETEER_EXECUTABLE_PATH` is set to `/usr/bin/chromium`
- Verify Chromium dependencies in Dockerfile
- Check container logs for missing libraries

### Memory Issues

Railway free tier has memory limits:
- Reduce `maxBrowserInstances` in puppeteer-renderer.ts
- Monitor memory usage in Railway dashboard
- Consider upgrading Railway plan if needed

### Slow Cold Starts

First request may take 3-5 seconds:
- This is normal (Chromium initialization)
- Subsequent requests are faster (300-500ms)
- Consider keeping service warm with health checks

## Cost Estimation

Railway Pricing:
- **Free Tier**: $5 credit/month, good for testing
- **Hobby**: $5/month base + usage
- **Pro**: $20/month base + usage

Typical usage:
- ~100 diagram generations/day ≈ $0.50/month
- Keep within free tier for testing
- Upgrade if needed for production

## Monitoring

Railway provides:
- CPU/Memory metrics
- Request logs
- Deployment history
- Custom metrics via health endpoint

Monitor these metrics:
- Response time (target: <500ms)
- Error rate (target: <1%)
- Memory usage (target: <512MB)
- CPU usage (target: <50%)
