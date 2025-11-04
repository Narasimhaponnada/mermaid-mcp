# Mermaid MCP Connector

Universal connector for integrating Mermaid MCP Server with various AI assistants and applications.

[![npm version](https://badge.fury.io/js/%40narasimhaponnada%2Fmermaid-mcp-connector.svg)](https://www.npmjs.com/package/@narasimhaponnada/mermaid-mcp-connector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Features

- **Multiple Integration Methods:**
  - ✅ REST API for ChatGPT plugins
  - ✅ WebSocket for real-time communication
  - ✅ Direct SDK for custom applications
  - ✅ CLI for testing and automation

- **AI Assistant Support:**
  - 🤖 GitHub Copilot (via VS Code extension)
  - 💬 ChatGPT (via plugin/API)
  - 🧠 Claude (native MCP support)
  - 🔧 Custom AI assistants

- **Full MCP Functionality:**
  - Generate diagrams from natural language
  - 22+ diagram types supported
  - 50+ pre-built templates
  - Syntax validation
  - Multiple export formats (SVG, PNG, PDF)

## 📦 Installation

```bash
# Install globally
npm install -g @narasimhaponnada/mermaid-mcp-connector

# Or install locally in your project
npm install @narasimhaponnada/mermaid-mcp-connector
```

## 🚀 Quick Start

### 1. REST API Mode (for ChatGPT)

```bash
# Start REST API server
mermaid-connector rest

# Server runs on http://localhost:3000
# OpenAPI spec: http://localhost:3000/openapi.json
# ChatGPT manifest: http://localhost:3000/.well-known/ai-plugin.json
```

### 2. WebSocket Mode (for real-time apps)

```bash
# Start WebSocket server
mermaid-connector websocket

# Server runs on ws://localhost:3001
```

### 3. SDK Mode (for custom applications)

```typescript
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

const connector = new MermaidMCPConnector();

// Connect to MCP server
await connector.connect();

// Generate a diagram
const result = await connector.generateDiagram({
  description: 'Create a flowchart for user authentication'
});

console.log(result);

// Disconnect
await connector.disconnect();
```

### 4. CLI Mode (for testing)

```bash
# Test connection
mermaid-connector test

# Generate a diagram
mermaid-connector generate "Create a sequence diagram for API calls"

# List diagram types
mermaid-connector types

# List templates
mermaid-connector templates
```

## 🔧 Configuration

### Environment Variables

```bash
# Port for REST API (default: 3000)
export PORT=3000

# Port for WebSocket server (default: 3001)
export WS_PORT=3001

# MCP server command (default: mermaid-mcp)
export MCP_SERVER_CMD=mermaid-mcp
```

### Custom MCP Server Path

```typescript
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

const connector = new MermaidMCPConnector(
  'node',  // command
  ['/path/to/mermaid-mcp-server/dist/index.js']  // args
);
```

## 📚 REST API Endpoints

### Generate Diagram

```bash
POST /api/diagram/generate
Content-Type: application/json

{
  "description": "Create a flowchart for user login",
  "type": "flowchart",
  "filename": "login-flow.svg"
}
```

### Get Diagram Types

```bash
GET /api/diagram/types
```

### Get Templates

```bash
GET /api/templates?category=architecture
```

### Validate Syntax

```bash
POST /api/diagram/validate
Content-Type: application/json

{
  "code": "flowchart TD\\n  A --> B"
}
```

### Export Diagram

```bash
POST /api/diagram/export
Content-Type: application/json

{
  "code": "flowchart TD\\n  A --> B",
  "format": "svg",
  "filename": "diagram.svg"
}
```

## 🔌 WebSocket Protocol

### Connect

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('Connected');
});
```

### Send Messages

```javascript
// Generate diagram
ws.send(JSON.stringify({
  action: 'generate_diagram',
  params: {
    description: 'Create a sequence diagram'
  }
}));

// Get diagram types
ws.send(JSON.stringify({
  action: 'get_diagram_types'
}));

// Get templates
ws.send(JSON.stringify({
  action: 'get_templates',
  params: {
    category: 'architecture'
  }
}));
```

### Receive Messages

```javascript
ws.on('message', (data) => {
  const response = JSON.parse(data);
  
  if (response.success) {
    console.log('Result:', response.result);
  } else {
    console.error('Error:', response.error);
  }
});
```

## 🤖 ChatGPT Plugin Integration

### 1. Start the Connector

```bash
mermaid-connector rest --port 3000
```

### 2. Add to ChatGPT

1. Go to ChatGPT → Settings → Beta Features
2. Enable "Plugins"
3. Go to Plugin Store → "Develop your own plugin"
4. Enter: `http://localhost:3000`
5. Plugin manifest is automatically served at `/.well-known/ai-plugin.json`

### 3. Use in ChatGPT

```
You: "Create a flowchart showing the user registration process"

ChatGPT: [Uses Mermaid plugin to generate diagram]
```

## 🔧 GitHub Copilot Integration

The connector provides an SDK that can be used in VS Code extensions:

```typescript
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

// In your VS Code extension
const connector = new MermaidMCPConnector();
await connector.connect();

// Use in Copilot commands
const result = await connector.generateDiagram({
  description: userPrompt
});
```

## 📖 API Reference

### `MermaidMCPConnector`

#### Constructor

```typescript
new MermaidMCPConnector(
  serverCommand?: string,  // default: 'mermaid-mcp'
  serverArgs?: string[]    // default: []
)
```

#### Methods

```typescript
// Connect to MCP server
async connect(): Promise<void>

// Disconnect from MCP server
async disconnect(): Promise<void>

// List available tools
async listTools(): Promise<any[]>

// Call a tool
async callTool(toolName: string, args: Record<string, any>): Promise<any>

// Generate a diagram
async generateDiagram(params: {
  description?: string;
  code?: string;
  type?: string;
  filename?: string;
}): Promise<any>

// Get diagram types
async getDiagramTypes(): Promise<any>

// Get templates
async getTemplates(category?: string): Promise<any>

// Validate syntax
async validateSyntax(code: string): Promise<any>

// Export diagram
async exportDiagram(params: {
  code: string;
  format: 'svg' | 'png' | 'pdf';
  filename?: string;
}): Promise<any>
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/Narasimhaponnada/mermaid-mcp.git
cd mermaid-mcp/mcp-connector

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Test
npm test
```

## 📝 Examples

### Example 1: Web Application

```typescript
import express from 'express';
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

const app = express();
const connector = new MermaidMCPConnector();

app.post('/generate', async (req, res) => {
  await connector.connect();
  
  const result = await connector.generateDiagram({
    description: req.body.description
  });
  
  res.json(result);
});

app.listen(3000);
```

### Example 2: Slack Bot

```typescript
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

const connector = new MermaidMCPConnector();
await connector.connect();

slackBot.on('message', async (message) => {
  if (message.text.startsWith('/diagram')) {
    const description = message.text.replace('/diagram', '').trim();
    
    const result = await connector.generateDiagram({ description });
    
    await slackBot.reply(message, {
      text: 'Here\'s your diagram:',
      attachments: [{ image_url: result.svg }]
    });
  }
});
```

### Example 3: CLI Tool

```typescript
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

const connector = new MermaidMCPConnector();

async function main() {
  await connector.connect();
  
  const types = await connector.getDiagramTypes();
  console.log('Available types:', types);
  
  const templates = await connector.getTemplates();
  console.log('Available templates:', templates);
  
  await connector.disconnect();
}

main();
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🔗 Links

- [Mermaid MCP Server](https://github.com/Narasimhaponnada/mermaid-mcp)
- [NPM Package](https://www.npmjs.com/package/@narasimhaponnada/mermaid-mcp-connector)
- [Documentation](https://github.com/Narasimhaponnada/mermaid-mcp/blob/main/mcp-connector/README.md)

## 🆘 Support

- [GitHub Issues](https://github.com/Narasimhaponnada/mermaid-mcp/issues)
- [Discussions](https://github.com/Narasimhaponnada/mermaid-mcp/discussions)
- Email: narasimha.ponnada@hotmail.com

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Mermaid.js](https://mermaid.js.org/)
- [GitHub Copilot](https://github.com/features/copilot)
- [OpenAI ChatGPT](https://openai.com/chatgpt)
