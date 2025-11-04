# Testing Guide - Mermaid MCP Connector

Complete guide for testing the MCP connector with GitHub Copilot, ChatGPT, Claude, and other AI assistants.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Testing with GitHub Copilot](#testing-with-github-copilot)
3. [Testing with ChatGPT](#testing-with-chatgpt)
4. [Testing with Claude Desktop](#testing-with-claude-desktop)
5. [Testing REST API](#testing-rest-api)
6. [Testing WebSocket](#testing-websocket)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Install Mermaid MCP Server

```bash
npm install -g @narasimhaponnada/mermaid-mcp-server

# Verify installation
mermaid-mcp --version
# Should output: mermaid-mcp 1.0.1
```

### 2. Install MCP Connector (if testing separately)

```bash
cd /Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector
npm install
npm run build

# Verify build
node dist/cli.js --version
```

### 3. Test MCP Server Connection

```bash
# Test that MCP server works
cd /Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector
node dist/cli.js test
```

**Expected Output:**
```
Testing connection to Mermaid MCP Server...
✅ Connection successful!

Available tools: 23
  - generate_diagram: Generate Mermaid diagrams from descriptions
  - list_diagram_types: List all available diagram types
  - list_templates: Get available diagram templates
  ...
```

---

## 🤖 Testing with GitHub Copilot

### Method 1: Direct MCP Integration (No Connector Needed)

This is the **simplest method** - Copilot talks directly to the MCP server.

#### Step 1: Configure VS Code Settings

1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type: "Preferences: Open User Settings (JSON)"
4. Add this configuration:

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

#### Step 2: Restart VS Code

Close and reopen VS Code to apply the settings.

#### Step 3: Test in Copilot Chat

1. Open Copilot Chat: `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)
2. Try these test prompts:

**Test 1: Simple Diagram Generation**
```
@mermaid Create a simple flowchart showing user login process
```

**Expected Response:**
- Copilot should generate Mermaid code
- You should see a flowchart diagram
- The diagram should show login steps

**Test 2: Specific Diagram Type**
```
@mermaid Generate a sequence diagram for API authentication with OAuth
```

**Test 3: Using Templates**
```
@mermaid Show me a microservices architecture template
```

**Test 4: List Available Types**
```
@mermaid What diagram types are available?
```

#### Step 4: Verify MCP is Working

**Check MCP Server Logs:**
```bash
# In a separate terminal, run with debug output
export DEBUG=mcp:*
mermaid-mcp
```

You should see log entries when Copilot makes requests.

#### Troubleshooting Copilot

**Issue: Copilot doesn't recognize @mermaid**

**Solution 1: Check MCP is enabled**
```json
{
  "github.copilot.chat.mcp.enabled": true  // Must be true!
}
```

**Solution 2: Check server path**
```bash
# Verify mermaid-mcp is in PATH
which mermaid-mcp

# If not found, use full path:
{
  "github.copilot.chat.mcp.servers": {
    "mermaid": {
      "command": "node",
      "args": ["/absolute/path/to/mermaid-mcp-server/dist/index.js"]
    }
  }
}
```

**Solution 3: Check Copilot version**
```bash
# In VS Code, check extensions
# GitHub Copilot should be latest version
# MCP support requires Copilot 1.120+
```

**Solution 4: Check Copilot status**
- Open Command Palette: `Cmd+Shift+P`
- Type: "GitHub Copilot: Check Status"
- Ensure logged in and subscription active

---

### Method 2: Testing via Connector (Advanced)

If you want to test the connector with Copilot:

#### Step 1: Start Connector in MCP Mode

```bash
cd /Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector

# Start connector that proxies to MCP server
node dist/index.js
```

#### Step 2: Configure VS Code to Use Connector

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "mermaid": {
      "command": "node",
      "args": ["/Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector/dist/cli.js", "mcp"]
    }
  }
}
```

#### Step 3: Test (same as Method 1)

---

## 💬 Testing with ChatGPT

ChatGPT requires a **hosted REST API** since it runs on OpenAI's servers.

### Method 1: Local Testing with ngrok (Quick Test)

#### Step 1: Start the Connector REST API

```bash
cd /Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector

# Start REST API server
node dist/cli.js rest

# Should output:
# 🚀 Mermaid MCP Connector API running on http://localhost:3000
# 📚 OpenAPI spec: http://localhost:3000/openapi.json
# 🤖 ChatGPT manifest: http://localhost:3000/.well-known/ai-plugin.json
```

#### Step 2: Expose Locally with ngrok

```bash
# Install ngrok if not already installed
brew install ngrok  # Mac
# or download from https://ngrok.com/download

# Start ngrok tunnel
ngrok http 3000
```

**You'll see output like:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

#### Step 3: Test with ChatGPT Plugin

**Option A: ChatGPT Plus (Plugin Development Mode)**

1. Go to ChatGPT: https://chat.openai.com
2. Click your profile → Settings
3. Go to Beta Features → Enable "Plugins"
4. Go to Plugin Store → "Develop your own plugin"
5. Enter your ngrok URL: `https://abc123.ngrok.io`
6. ChatGPT will:
   - Fetch `/.well-known/ai-plugin.json` (your manifest)
   - Fetch `/openapi.json` (API spec)
   - Install the plugin

**Option B: ChatGPT Actions (GPT-4)**

1. Create a Custom GPT
2. Go to "Configure" → "Actions"
3. Click "Create new action"
4. Import OpenAPI schema: `https://abc123.ngrok.io/openapi.json`
5. Save and test

#### Step 4: Test ChatGPT Integration

**In ChatGPT, try these prompts:**

**Test 1: Generate Diagram**
```
Use the Mermaid plugin to create a flowchart showing the software development lifecycle
```

**Test 2: Get Diagram Types**
```
What types of diagrams can the Mermaid plugin create?
```

**Test 3: Use Template**
```
Generate a microservices architecture diagram using the Mermaid plugin
```

**Test 4: Complex Request**
```
Create a sequence diagram showing how a user authenticates, then fetches data from an API, with error handling
```

#### Step 5: Monitor Requests

**In your terminal (where REST API is running), you'll see:**
```
📥 POST /api/diagram/generate
   Description: "Create a flowchart..."
📤 Response: { success: true, result: {...} }
```

---

### Method 2: Production Deployment (Permanent Access)

#### Step 1: Deploy to Cloud

**Option A: Deploy to Railway**

```bash
cd /Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Get URL
railway domain
# Example: https://mermaid-mcp-connector.railway.app
```

**Option B: Deploy to Render**

1. Go to https://render.com
2. Create new "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/cli.js rest`
   - **Environment Variables:**
     - `PORT=3000`
     - `MCP_SERVER_CMD=mermaid-mcp`
5. Deploy

**Option C: Deploy to Azure**

```bash
# Install Azure CLI
brew install azure-cli

# Login
az login

# Create resource group
az group create --name mermaid-mcp-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name mermaid-mcp-plan \
  --resource-group mermaid-mcp-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --name mermaid-mcp-connector \
  --resource-group mermaid-mcp-rg \
  --plan mermaid-mcp-plan \
  --runtime "NODE|18-lts"

# Deploy from local git
cd /Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector
git init
git add .
git commit -m "Initial commit"

az webapp deployment source config-local-git \
  --name mermaid-mcp-connector \
  --resource-group mermaid-mcp-rg

# Push to Azure
git remote add azure <azure-git-url>
git push azure main

# Get URL
az webapp show \
  --name mermaid-mcp-connector \
  --resource-group mermaid-mcp-rg \
  --query defaultHostName -o tsv
```

#### Step 2: Update ChatGPT with Production URL

Use your production URL (e.g., `https://mermaid-mcp-connector.railway.app`) instead of ngrok URL.

---

## 🧪 Testing REST API Directly

### Using curl

```bash
# Test health endpoint
curl http://localhost:3000/health

# Generate diagram
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a flowchart for user registration",
    "filename": "registration.svg"
  }'

# Get diagram types
curl http://localhost:3000/api/diagram/types

# Get templates
curl http://localhost:3000/api/templates?category=architecture

# Validate syntax
curl -X POST http://localhost:3000/api/diagram/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "flowchart TD\n    A --> B\n    B --> C"
  }'

# Export diagram
curl -X POST http://localhost:3000/api/diagram/export \
  -H "Content-Type: application/json" \
  -d '{
    "code": "flowchart TD\n    A --> B",
    "format": "svg",
    "filename": "test.svg"
  }'
```

### Using Postman

1. Import OpenAPI spec: `http://localhost:3000/openapi.json`
2. Test all endpoints
3. Save as collection for future testing

### Using the Example Script

```bash
cd /Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector

# Start REST API in one terminal
node dist/cli.js rest

# Run test script in another terminal
node examples/rest-api-client.js
```

**Expected Output:**
```
🚀 Testing Mermaid MCP Connector REST API

1️⃣ Testing health endpoint...
Health: { status: 'ok', service: 'mermaid-mcp-connector' }

2️⃣ Getting available tools...
Found 23 tools

3️⃣ Generating diagram...
Generated: ✅ Success

4️⃣ Getting diagram types...
Diagram types: ✅ Received

5️⃣ Getting templates...
Templates: ✅ Received

6️⃣ Validating Mermaid syntax...
Validation: ✅ Valid

✨ All tests completed!
```

---

## 🔌 Testing WebSocket

### Step 1: Start WebSocket Server

```bash
cd /Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector

# Start WebSocket server
node dist/cli.js websocket

# Should output:
# 🔌 WebSocket server running on ws://localhost:3001
```

### Step 2: Test with Example Client

```bash
# In another terminal
node examples/websocket-client.js
```

**Expected Output:**
```
🔌 Connecting to WebSocket server at ws://localhost:3001...
✅ Connected to WebSocket server

📤 Requesting diagram generation...

📥 Received response:
{
  "success": true,
  "action": "generate_diagram",
  "result": { ... }
}

📤 Requesting diagram types...

📥 Received response:
{
  "success": true,
  "action": "get_diagram_types",
  "result": { ... }
}

👋 Closing connection
❌ Disconnected from server
```

### Step 3: Test with Browser WebSocket

Create `test-websocket.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Test</title>
</head>
<body>
  <h1>Mermaid MCP WebSocket Test</h1>
  <button onclick="testConnection()">Test Connection</button>
  <button onclick="generateDiagram()">Generate Diagram</button>
  <pre id="output"></pre>

  <script>
    let ws;
    const output = document.getElementById('output');

    function log(message) {
      output.textContent += message + '\n';
    }

    function testConnection() {
      ws = new WebSocket('ws://localhost:3001');

      ws.onopen = () => {
        log('✅ Connected to WebSocket server');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        log('📥 Received: ' + JSON.stringify(data, null, 2));
      };

      ws.onerror = (error) => {
        log('❌ Error: ' + error);
      };

      ws.onclose = () => {
        log('❌ Disconnected');
      };
    }

    function generateDiagram() {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        log('❌ Not connected. Click "Test Connection" first.');
        return;
      }

      const message = {
        action: 'generate_diagram',
        params: {
          description: 'Create a flowchart for user login'
        }
      };

      log('📤 Sending: ' + JSON.stringify(message));
      ws.send(JSON.stringify(message));
    }
  </script>
</body>
</html>
```

Open in browser: `open test-websocket.html`

---

## 🔍 Testing with Claude Desktop

Claude Desktop has native MCP support (no connector needed).

### Step 1: Configure Claude Desktop

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "mermaid-mcp"
    }
  }
}
```

### Step 2: Restart Claude Desktop

Close and reopen Claude Desktop app.

### Step 3: Test in Claude

**Test Prompts:**

```
Create a flowchart showing the checkout process for an e-commerce site
```

```
Generate a sequence diagram for user authentication with JWT tokens
```

```
Show me an architecture diagram for a microservices application
```

Claude should automatically use the Mermaid MCP server to generate diagrams.

---

## 🐛 Troubleshooting

### Common Issues

#### Issue 1: "Connection Refused" or "ECONNREFUSED"

**Cause:** MCP server or connector not running

**Solution:**
```bash
# Check if anything is running on the port
lsof -i :3000  # REST API
lsof -i :3001  # WebSocket

# Start the appropriate service
node dist/cli.js rest
# or
node dist/cli.js websocket
```

#### Issue 2: "Command not found: mermaid-mcp"

**Cause:** MCP server not installed or not in PATH

**Solution:**
```bash
# Check installation
npm list -g @narasimhaponnada/mermaid-mcp-server

# Reinstall if needed
npm install -g @narasimhaponnada/mermaid-mcp-server

# Verify
which mermaid-mcp
```

#### Issue 3: Copilot doesn't see @mermaid

**Cause:** MCP not enabled or configured incorrectly

**Solution:**
```json
// settings.json - Make sure BOTH settings are present
{
  "github.copilot.chat.mcp.enabled": true,  // MUST be true
  "github.copilot.chat.mcp.servers": {
    "mermaid": {
      "command": "mermaid-mcp"
    }
  }
}
```

#### Issue 4: ChatGPT plugin not loading

**Cause:** Manifest or OpenAPI spec issues

**Solution:**
```bash
# Test manifest endpoint
curl http://localhost:3000/.well-known/ai-plugin.json

# Test OpenAPI endpoint
curl http://localhost:3000/openapi.json

# Both should return valid JSON
```

#### Issue 5: "Tool execution failed"

**Cause:** MCP server error or timeout

**Solution:**
```bash
# Test MCP server directly
cd /Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector
node dist/cli.js test

# Check logs
export DEBUG=*
node dist/cli.js rest
```

---

## ✅ Test Checklist

### Pre-deployment Tests

- [ ] MCP server starts successfully
- [ ] Connector test command passes
- [ ] REST API health check responds
- [ ] WebSocket server accepts connections
- [ ] OpenAPI spec is valid JSON
- [ ] ChatGPT manifest is valid JSON

### Copilot Integration Tests

- [ ] VS Code settings configured
- [ ] Copilot recognizes @mermaid
- [ ] Simple diagram generation works
- [ ] Complex diagrams generate correctly
- [ ] Error messages are helpful

### ChatGPT Integration Tests

- [ ] REST API accessible via ngrok/cloud
- [ ] Plugin manifest loads in ChatGPT
- [ ] ChatGPT can call generate endpoint
- [ ] Diagrams are returned correctly
- [ ] Error handling works

### Claude Integration Tests

- [ ] Config file updated
- [ ] Claude Desktop restarted
- [ ] MCP server is recognized
- [ ] Diagram generation works
- [ ] Multiple diagram types work

### Performance Tests

- [ ] Response time < 5 seconds
- [ ] No memory leaks (long-running test)
- [ ] Handles concurrent requests
- [ ] Graceful error handling

---

## 📊 Expected Response Times

| Operation | Expected Time | Max Acceptable |
|-----------|---------------|----------------|
| Health Check | < 100ms | 500ms |
| List Tools | < 200ms | 1s |
| Generate Simple | < 2s | 5s |
| Generate Complex | < 5s | 10s |
| Export to SVG | < 3s | 7s |
| Validate Syntax | < 500ms | 2s |

---

## 🚀 Next Steps After Testing

1. **Document successful configurations**
2. **Create demo videos**
3. **Publish to NPM**
4. **Submit ChatGPT plugin**
5. **Update awesome-mcp-servers**
6. **Create VS Code extension**

---

## 📞 Getting Help

If tests fail:

1. **Check logs** - Look for error messages
2. **Verify versions** - Ensure latest packages
3. **Check GitHub Issues** - See if others have same problem
4. **Create new issue** - With full logs and configuration

**Support:**
- GitHub: https://github.com/Narasimhaponnada/mermaid-mcp/issues
- Email: narasimha.ponnada@hotmail.com
