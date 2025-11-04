# 🔧 Mermaid MCP Connector Configuration Guide

Complete guide to configuring the Mermaid MCP Connector for different use cases.

---

## 📋 Table of Contents

1. [Environment Variables](#environment-variables)
2. [Command-Line Options](#command-line-options)
3. [Configuration Files](#configuration-files)
4. [GitHub Copilot Configuration](#github-copilot-configuration)
5. [ChatGPT Configuration](#chatgpt-configuration)
6. [Claude Desktop Configuration](#claude-desktop-configuration)
7. [Custom Integration Configuration](#custom-integration-configuration)

---

## 🌍 Environment Variables

Create a `.env` file in the connector directory:

```bash
# Copy the example file
cp .env.example .env
```

### Available Environment Variables

```bash
# ============================================
# SERVER PORTS
# ============================================

# Port for REST API server (used by ChatGPT)
PORT=3000

# Port for WebSocket server (used by custom integrations)
WS_PORT=3001

# ============================================
# MCP SERVER CONFIGURATION
# ============================================

# Command to start the MCP server
# Option 1: Global installation (recommended)
MCP_SERVER_CMD=mermaid-mcp

# Option 2: Local installation via npx
# MCP_SERVER_CMD=npx
# MCP_SERVER_ARGS=@narasimhaponnada/mermaid-mcp-server

# Option 3: Direct node execution (for development)
# MCP_SERVER_CMD=node
# MCP_SERVER_ARGS=/path/to/mermaid-mcp-server/dist/index.js

# ============================================
# CORS CONFIGURATION (for REST API)
# ============================================

# Allowed origins (comma-separated)
CORS_ORIGINS=*

# Or restrict to specific domains:
# CORS_ORIGINS=https://chat.openai.com,https://your-app.com

# ============================================
# LOGGING
# ============================================

# Log level: error, warn, info, debug
LOG_LEVEL=info

# Enable request logging
ENABLE_REQUEST_LOGGING=true
```

---

## ⚙️ Command-Line Options

### Basic Commands

```bash
# Show help
mermaid-connector --help

# Show version
mermaid-connector --version

# Test MCP server connection
mermaid-connector test
```

### Start REST API Server

```bash
# Default (port 3000)
mermaid-connector rest

# Custom port
mermaid-connector rest --port 8080

# Using environment variable
PORT=8080 mermaid-connector rest
```

### Start WebSocket Server

```bash
# Default (port 3001)
mermaid-connector websocket

# Custom port
mermaid-connector websocket --ws-port 8081
mermaid-connector ws --ws-port 8081  # Short form

# Using environment variable
WS_PORT=8081 mermaid-connector ws
```

### Quick Actions

```bash
# Generate a diagram
mermaid-connector generate "Create a flowchart for user authentication"

# List available diagram types
mermaid-connector types

# List available templates
mermaid-connector templates
```

---

## 📁 Configuration Files

### 1. Package Configuration (`package.json`)

The connector is configured as an ES module:

```json
{
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "mermaid-connector": "./dist/cli.js"
  }
}
```

### 2. TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

---

## 🤖 GitHub Copilot Configuration

### For VS Code

**Location:** `~/Library/Application Support/Code/User/settings.json` (macOS)

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "mermaid": {
      "command": "mermaid-mcp",
      "args": []
    }
  }
}
```

### Alternative: Using Connector as Bridge

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "mermaid": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/Documents/Mermaid/mcp-connector/dist/index.js"
      ]
    }
  }
}
```

### Using npx (No Installation)

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "mermaid": {
      "command": "npx",
      "args": [
        "@narasimhaponnada/mermaid-mcp-server"
      ]
    }
  }
}
```

### Verification

```bash
# Restart VS Code
# Open Copilot Chat (Cmd+Shift+I on macOS)
# Type: @mermaid create a simple flowchart
```

---

## 💬 ChatGPT Configuration

### Step 1: Deploy the Connector

**Option A: Railway (Recommended)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd mcp-connector
railway init
railway up
```

**Option B: Render**

1. Connect GitHub repo to Render
2. Set build command: `npm install && npm run build`
3. Set start command: `node dist/cli.js rest`
4. Set environment variables: `PORT=3000`

**Option C: Local with ngrok (Testing)**

```bash
# Terminal 1: Start connector
node dist/cli.js rest

# Terminal 2: Create tunnel
ngrok http 3000

# Use the ngrok URL (e.g., https://abc123.ngrok.io)
```

### Step 2: Configure ChatGPT Plugin

1. Go to ChatGPT → Settings → Beta Features → Plugins
2. Click "Develop your own plugin"
3. Enter your URL: `https://your-domain.com`
4. ChatGPT will automatically discover the manifest at `/.well-known/ai-plugin.json`

### Plugin Manifest (Auto-served)

The connector automatically serves this at `/.well-known/ai-plugin.json`:

```json
{
  "schema_version": "v1",
  "name_for_human": "Mermaid Diagram Generator",
  "name_for_model": "mermaid",
  "description_for_human": "Generate diagrams using Mermaid syntax",
  "description_for_model": "Generate various types of diagrams (flowcharts, sequence diagrams, etc.) using natural language descriptions.",
  "auth": {
    "type": "none"
  },
  "api": {
    "type": "openapi",
    "url": "https://your-domain.com/openapi.json"
  },
  "logo_url": "https://your-domain.com/logo.png",
  "contact_email": "narasimha.ponnada@hotmail.com",
  "legal_info_url": "https://github.com/Narasimhaponnada/mermaid-mcp"
}
```

### Environment Variables for Production

```bash
# On Railway/Render, set these:
PORT=3000
MCP_SERVER_CMD=mermaid-mcp
CORS_ORIGINS=https://chat.openai.com
LOG_LEVEL=info
```

---

## 🧠 Claude Desktop Configuration

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

### Basic Configuration

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "mermaid-mcp",
      "args": []
    }
  }
}
```

### Using Connector

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/Documents/Mermaid/mcp-connector/dist/index.js"
      ]
    }
  }
}
```

### Using npx

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "npx",
      "args": [
        "-y",
        "@narasimhaponnada/mermaid-mcp-server"
      ]
    }
  }
}
```

### Multiple Servers

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "mermaid-mcp"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
```

### Verification

```bash
# Restart Claude Desktop
# Ask: "Can you create a flowchart showing user authentication?"
```

---

## 🔌 Custom Integration Configuration

### Using SDK (Programmatic Access)

```javascript
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

const connector = new MermaidMCPConnector({
  command: 'mermaid-mcp',  // or full path
  args: []
});

// Connect
await connector.connect();

// Use tools
const result = await connector.generateDiagram({
  description: 'Create a sequence diagram'
});

// Disconnect
await connector.disconnect();
```

### Using REST API

```javascript
// Configuration
const API_BASE = 'http://localhost:3000';

// Generate diagram
const response = await fetch(`${API_BASE}/api/diagram/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'Create a flowchart'
  })
});

const result = await response.json();
```

### Using WebSocket

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  // Send request
  ws.send(JSON.stringify({
    action: 'generate_diagram',
    data: {
      description: 'Create a class diagram'
    }
  }));
});

ws.on('message', (data) => {
  const result = JSON.parse(data);
  console.log(result);
});
```

---

## 🔐 Security Configuration

### API Key Authentication (Optional)

Add to `.env`:

```bash
# Enable API key authentication
ENABLE_API_KEY=true
API_KEY=your-secret-key-here

# Or use environment-specific keys
API_KEY_PRODUCTION=prod-key-here
API_KEY_DEVELOPMENT=dev-key-here
```

Then clients must include:

```bash
curl -H "Authorization: Bearer your-secret-key-here" \
  http://localhost:3000/api/diagram/generate
```

### Rate Limiting

Add to `.env`:

```bash
# Enable rate limiting
ENABLE_RATE_LIMIT=true

# Requests per minute
RATE_LIMIT_REQUESTS=60

# Time window in minutes
RATE_LIMIT_WINDOW=1
```

### HTTPS (Production)

```bash
# Use reverse proxy (recommended)
# nginx, Caddy, or cloud provider's load balancer

# Or configure directly
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

---

## 📊 Monitoring Configuration

### Logging

```bash
# Log to file
LOG_FILE=/var/log/mermaid-connector.log

# Log format: json or text
LOG_FORMAT=json

# Include timestamps
LOG_TIMESTAMPS=true
```

### Health Checks

```bash
# Health check endpoint
curl http://localhost:3000/health

# Response:
# {
#   "status": "ok",
#   "timestamp": "2025-11-03T12:00:00.000Z",
#   "uptime": 3600,
#   "mcpConnection": "connected"
# }
```

---

## 🧪 Testing Configuration

### Local Testing

```bash
# Create test.env
cp .env.example test.env

# Modify for testing
echo "PORT=3333" >> test.env
echo "LOG_LEVEL=debug" >> test.env

# Run with test config
ENV_FILE=test.env node dist/cli.js rest
```

### CI/CD Configuration

```yaml
# .github/workflows/test.yml
env:
  PORT: 3000
  MCP_SERVER_CMD: npx
  MCP_SERVER_ARGS: @narasimhaponnada/mermaid-mcp-server
  LOG_LEVEL: debug
```

---

## 📚 Configuration Examples

### Example 1: Development Setup

```bash
# .env.development
PORT=3000
WS_PORT=3001
MCP_SERVER_CMD=node
MCP_SERVER_ARGS=/Users/dev/mermaid-mcp-server/dist/index.js
LOG_LEVEL=debug
CORS_ORIGINS=*
ENABLE_REQUEST_LOGGING=true
```

### Example 2: Production Setup

```bash
# .env.production
PORT=3000
MCP_SERVER_CMD=mermaid-mcp
LOG_LEVEL=warn
CORS_ORIGINS=https://chat.openai.com,https://your-app.com
ENABLE_RATE_LIMIT=true
RATE_LIMIT_REQUESTS=100
```

### Example 3: Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist

ENV PORT=3000
ENV MCP_SERVER_CMD=mermaid-mcp

EXPOSE 3000
CMD ["node", "dist/cli.js", "rest"]
```

---

## 🆘 Troubleshooting

### Issue: MCP Server Not Found

```bash
# Check if installed
which mermaid-mcp

# If not found, install:
npm install -g @narasimhaponnada/mermaid-mcp-server

# Or use full path in .env:
MCP_SERVER_CMD=/usr/local/bin/node
MCP_SERVER_ARGS=/path/to/mermaid-mcp-server/dist/index.js
```

### Issue: Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 mermaid-connector rest
```

### Issue: CORS Errors

```bash
# Allow all origins (development only!)
CORS_ORIGINS=*

# Allow specific origins (production)
CORS_ORIGINS=https://chat.openai.com,https://your-app.com
```

---

## 📖 Additional Resources

- [Integration Guide](INTEGRATION_GUIDE.md) - Platform-specific setup
- [Testing Guide](TESTING_GUIDE.md) - How to test the connector
- [API Documentation](README.md#api-endpoints) - REST API reference
- [Examples](examples/) - Code examples

---

## 🤝 Support

- **Issues:** https://github.com/Narasimhaponnada/mermaid-mcp/issues
- **Email:** narasimha.ponnada@hotmail.com
- **Discussions:** https://github.com/Narasimhaponnada/mermaid-mcp/discussions
