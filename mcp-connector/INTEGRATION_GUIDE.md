# Integration Guide - Mermaid MCP Connector

Complete guide for integrating the Mermaid MCP Connector with various AI assistants and applications.

## Table of Contents

1. [GitHub Copilot Integration](#github-copilot-integration)
2. [ChatGPT Plugin Integration](#chatgpt-plugin-integration)
3. [Claude Integration](#claude-integration)
4. [Custom AI Assistant Integration](#custom-ai-assistant-integration)
5. [Web Application Integration](#web-application-integration)
6. [Slack Bot Integration](#slack-bot-integration)

---

## GitHub Copilot Integration

### Method 1: Using VS Code Extension (Recommended)

The connector can be used as a backend for a VS Code extension that extends Copilot's capabilities.

#### Step 1: Create VS Code Extension

```bash
yo code
# Select: New Extension (TypeScript)
# Name: mermaid-copilot-extension
```

#### Step 2: Install Dependencies

```bash
cd mermaid-copilot-extension
npm install @narasimhaponnada/mermaid-mcp-connector
```

#### Step 3: Implement Extension

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

let connector: MermaidMCPConnector;

export async function activate(context: vscode.ExtensionContext) {
  console.log('Mermaid Copilot Extension activated');

  // Initialize connector
  connector = new MermaidMCPConnector();
  await connector.connect();

  // Register command
  const disposable = vscode.commands.registerCommand(
    'mermaid-copilot.generateDiagram',
    async () => {
      const description = await vscode.window.showInputBox({
        prompt: 'Describe the diagram you want to create',
        placeHolder: 'e.g., Create a flowchart for user authentication'
      });

      if (description) {
        try {
          const result = await connector.generateDiagram({ description });
          
          // Insert diagram code into editor
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            editor.edit(editBuilder => {
              editBuilder.insert(editor.selection.active, result.code);
            });
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

export async function deactivate() {
  if (connector) {
    await connector.disconnect();
  }
}
```

#### Step 4: Configure VS Code Settings

Add to your `settings.json`:

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "mermaid": {
      "command": "mermaid-mcp"
    }
  }
}
```

---

## ChatGPT Plugin Integration

### Method 1: Local Development

#### Step 1: Start the Connector

```bash
mermaid-connector rest --port 3000
```

#### Step 2: Configure ChatGPT Plugin

1. Go to ChatGPT → Settings → Beta Features
2. Enable "Plugins"
3. Click "Plugin store" → "Develop your own plugin"
4. Enter: `http://localhost:3000`

The connector automatically serves:
- OpenAPI spec at `/openapi.json`
- Plugin manifest at `/.well-known/ai-plugin.json`

#### Step 3: Use in ChatGPT

```
User: "Create a sequence diagram showing how a user logs into my application"

ChatGPT: [Uses Mermaid plugin] Here's the sequence diagram for user login...
```

### Method 2: Production Deployment

#### Deploy to Cloud

```bash
# Deploy to Railway, Render, or any Node.js host
git push production main

# Set environment variables
PORT=3000
MCP_SERVER_CMD=mermaid-mcp
```

#### Update Plugin URL

Use your production URL: `https://your-domain.com`

---

## Claude Integration

Claude already supports MCP natively, so you can use the Mermaid MCP Server directly.

### Configuration

Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "mermaid-mcp"
    }
  }
}
```

### Usage in Claude

```
User: "Create a flowchart for the checkout process"

Claude: [Uses MCP to call Mermaid server] Here's the checkout flowchart...
```

---

## Custom AI Assistant Integration

### Using the SDK

```typescript
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

class MyAIAssistant {
  private mermaidConnector: MermaidMCPConnector;

  async initialize() {
    this.mermaidConnector = new MermaidMCPConnector();
    await this.mermaidConnector.connect();
  }

  async processUserMessage(message: string) {
    // Check if user wants a diagram
    if (message.includes('diagram') || message.includes('flowchart')) {
      try {
        const result = await this.mermaidConnector.generateDiagram({
          description: message
        });

        return {
          type: 'diagram',
          code: result.code,
          svg: result.svg
        };
      } catch (error) {
        console.error('Diagram generation failed:', error);
      }
    }

    // Handle other message types...
  }

  async shutdown() {
    await this.mermaidConnector.disconnect();
  }
}
```

---

## Web Application Integration

### React Application

```typescript
// services/mermaidService.ts
const API_URL = 'http://localhost:3000';

export async function generateDiagram(description: string) {
  const response = await fetch(`${API_URL}/api/diagram/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  });

  return response.json();
}

export async function getDiagramTypes() {
  const response = await fetch(`${API_URL}/api/diagram/types`);
  return response.json();
}

// components/DiagramGenerator.tsx
import React, { useState } from 'react';
import { generateDiagram } from '../services/mermaidService';

export function DiagramGenerator() {
  const [description, setDescription] = useState('');
  const [diagram, setDiagram] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateDiagram(description);
      setDiagram(result.result.svg);
    } catch (error) {
      console.error('Failed to generate diagram:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your diagram..."
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Diagram'}
      </button>
      {diagram && (
        <div dangerouslySetInnerHTML={{ __html: diagram }} />
      )}
    </div>
  );
}
```

### Vue Application

```vue
<template>
  <div class="diagram-generator">
    <textarea
      v-model="description"
      placeholder="Describe your diagram..."
    />
    <button @click="generate" :disabled="loading">
      {{ loading ? 'Generating...' : 'Generate Diagram' }}
    </button>
    <div v-if="diagram" v-html="diagram"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const description = ref('');
const diagram = ref('');
const loading = ref(false);

const generate = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/diagram/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: description.value })
    });
    const data = await response.json();
    diagram.value = data.result.svg;
  } catch (error) {
    console.error('Failed to generate:', error);
  }
  loading.value = false;
};
</script>
```

---

## Slack Bot Integration

```typescript
import { App } from '@slack/bolt';
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const connector = new MermaidMCPConnector();

// Initialize connector
connector.connect().then(() => {
  console.log('Connected to Mermaid MCP Server');
});

// Listen for /diagram command
app.command('/diagram', async ({ command, ack, respond }) => {
  await ack();

  try {
    const result = await connector.generateDiagram({
      description: command.text
    });

    // Upload SVG to Slack
    await app.client.files.upload({
      channels: command.channel_id,
      content: result.svg,
      filename: 'diagram.svg',
      filetype: 'svg',
      initial_comment: `Here's your diagram for: "${command.text}"`
    });
  } catch (error) {
    await respond({
      text: `Error generating diagram: ${error.message}`,
      response_type: 'ephemeral'
    });
  }
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack bot is running!');
})();
```

---

## Discord Bot Integration

```typescript
import { Client, GatewayIntentBits } from 'discord.js';
import { MermaidMCPConnector } from '@narasimhaponnada/mermaid-mcp-connector';
import { writeFileSync } from 'fs';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const connector = new MermaidMCPConnector();

client.once('ready', async () => {
  console.log('Discord bot ready!');
  await connector.connect();
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!diagram ')) {
    const description = message.content.replace('!diagram ', '');

    try {
      await message.channel.sendTyping();

      const result = await connector.generateDiagram({ description });

      // Save SVG to file
      const filename = `diagram-${Date.now()}.svg`;
      writeFileSync(filename, result.svg);

      // Send file
      await message.reply({
        content: `Here's your diagram!`,
        files: [filename]
      });

      // Clean up
      unlinkSync(filename);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
```

---

## Testing Your Integration

### 1. Test REST API

```bash
# Start the server
mermaid-connector rest

# Test with curl
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "Create a flowchart for user login"}'
```

### 2. Test WebSocket

```bash
# Start the server
mermaid-connector websocket

# Run the example client
node examples/websocket-client.js
```

### 3. Test SDK

```bash
# Run the basic usage example
node examples/basic-usage.js
```

---

## Troubleshooting

### Connection Errors

```bash
# Make sure MCP server is accessible
mermaid-mcp --version

# Test connector
mermaid-connector test
```

### Port Conflicts

```bash
# Change ports
export PORT=4000
export WS_PORT=4001
mermaid-connector rest
```

### Authentication Issues

For ChatGPT plugins, ensure your server is publicly accessible or use ngrok for local testing:

```bash
ngrok http 3000
# Use the ngrok URL in ChatGPT plugin settings
```

---

## Best Practices

1. **Error Handling**: Always wrap connector calls in try-catch blocks
2. **Connection Management**: Reuse connections instead of creating new ones for each request
3. **Rate Limiting**: Implement rate limiting for public APIs
4. **Caching**: Cache diagram types and templates to reduce MCP calls
5. **Timeouts**: Set appropriate timeouts for long-running operations
6. **Logging**: Log all interactions for debugging
7. **Security**: Validate user input before passing to the connector

---

## Support

- [GitHub Issues](https://github.com/Narasimhaponnada/mermaid-mcp/issues)
- [Documentation](https://github.com/Narasimhaponnada/mermaid-mcp)
- Email: narasimha.ponnada@hotmail.com
