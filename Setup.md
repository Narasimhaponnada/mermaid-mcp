````markdown
# Mermaid MCP Server Setup Guide

> **Complete guide to setting up a Model Context Protocol (MCP) server for AI-powered Mermaid diagram generation**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-1.0.4-purple.svg)](https://modelcontextprotocol.io/)

## 📋 Table of Contents

- [Overview](#overview)
- [What You Get](#-what-you-get)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [How to Use](#-how-to-use-after-setup)
- [Available MCP Tools](#available-mcp-tools)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)
- [Production Deployment](#production-deployment)
- [Example Use Cases](#example-use-cases)

---

## Overview

This guide walks you through setting up a **Model Context Protocol (MCP) server** for Mermaid diagram generation. This server enables GitHub Copilot and other AI assistants to create professional architecture diagrams and convert them directly to **production-ready SVG files** for inclusion in documentation, presentations, and markdown files.

## ✨ What You Get

- 🎨 **Natural Language to Diagrams**: Describe what you want, get professional diagrams
- 🚀 **Production-Ready SVGs**: XML-compliant, validated SVG files ready for any use
- 📦 **50+ Built-in Templates**: Pre-built architecture patterns, workflows, and data models
- 🔧 **MCP Integration**: Seamless integration with GitHub Copilot and Claude
- 🎯 **Multiple Diagram Types**: Flowcharts, sequences, ERDs, state machines, Gantt charts, and more

## Prerequisites

- **Node.js 18 or higher** (Required for Puppeteer)
- **npm or yarn** package manager
- **GitHub Copilot** subscription (recommended)
- **VS Code** with GitHub Copilot extension
- **macOS, Linux, or Windows** with WSL2

## Quick Start

### 1. Clone and Setup the MCP Server

```bash
# Navigate to your workspace
cd ~/Documents/Mermaid

# Clone the repository (or use existing directory)
cd mermaid-mcp-server

# Install dependencies (includes Puppeteer for browser-based rendering)
npm install

# Build the TypeScript server
npm run build
```

### 2. Project Dependencies

The server uses the following production dependencies:

```json
{
  "name": "mermaid-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "puppeteer": "^23.10.4"
  },
  "devDependencies": {
    "@types/node": "^22.10.1",
    "typescript": "^5.7.2"
  }
}
```

**Key Changes from Initial Setup:**
- ✅ **Puppeteer**: Replaced JSDOM for browser-based Mermaid rendering (fixes HTML tag issues)
- ✅ **No Mermaid NPM package**: Uses Mermaid v10 via CDN in Puppeteer browser
- ✅ **Production-ready**: Generates XML-compliant SVGs with proper self-closing tags

### 3. Verify Installation

Check that everything is installed correctly:

```bash
# Verify Node.js version (must be 18+)
node --version

# Verify build completed successfully
ls -la dist/

# Check example SVG files were generated
ls -lh examples/architectures/*.svg
```

**Expected Output:**
```
examples/architectures/
├── cicd-pipeline.svg (28KB)
├── cloud-infrastructure.svg (31KB)
├── data-pipeline.svg (24KB)
├── microservices-architecture.svg (27KB)
└── serverless-architecture.svg (31KB)
```

## Project Structure

After setup, your project will have this clean structure:

```
mermaid-mcp-server/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Main MCP server entry point
│   ├── tools/
│   │   ├── core.ts               # Core diagram generation tools
│   │   └── templates.ts          # 50+ pre-built diagram templates
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── utils/
│       ├── filesystem.ts         # File operations
│       └── mermaid.ts            # Mermaid syntax utilities
├── dist/                         # Compiled JavaScript (24 files)
├── examples/
│   └── architectures/            # 5 production-ready SVG samples
├── generate-svg-samples.js       # Puppeteer-based SVG generator
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Project documentation
├── PROJECT-SUMMARY.md            # Detailed project overview
└── LICENSE                       # MIT License
```

## Configuration

### 1. MCP Server Configuration for GitHub Copilot

Configure the MCP server in your VS Code settings or global MCP config.

### 2. GitHub Copilot Integration

#### Option A: VS Code Settings (Recommended)

1. Open VS Code Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type: **"Preferences: Open User Settings (JSON)"**
3. Add the MCP server configuration:

```json
{
  "github.copilot.enable": {
    "*": true,
    "markdown": true,
    "plaintext": true
  },
  "github.copilot.mcp.servers": {
    "mermaid": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/Documents/Mermaid/mermaid-mcp-server/dist/index.js"
      ],
      "env": {}
    }
  }
}
```

**⚠️ Important:** Replace `/Users/YOUR_USERNAME/` with your actual home directory path!

#### Option B: Global MCP Configuration

Create or update `~/.config/mcp/config.json`:

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "node",
      "args": [
        "/absolute/path/to/mermaid-mcp-server/dist/index.js"
      ],
      "description": "Mermaid MCP Server - AI-powered diagram generation with SVG export"
    }
  }
}
```

#### Option C: Claude Desktop Integration

For use with Claude Desktop app, edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/Documents/Mermaid/mermaid-mcp-server/dist/index.js"
      ]
    }
  }
}
```

### 3. Restart VS Code

After configuration changes:
1. Close all VS Code windows
2. Reopen VS Code
3. Open a new chat with GitHub Copilot
4. Verify the MCP server is connected (look for "mermaid" in available tools)

## 🎯 How to Use After Setup

Once configured, you can use the MCP server in multiple ways:

### Method 1: Natural Language in Copilot Chat

Simply ask Copilot to create diagrams:

```
Create a microservices architecture diagram for an e-commerce platform
```

```
Generate a CI/CD pipeline flowchart showing GitHub Actions workflow
```

```
Show me a sequence diagram for user authentication with OAuth
```

### Method 2: Browse Pre-built Templates

Ask to see available templates:

```
Show me all available architecture diagram templates
```

```
Find templates related to cloud infrastructure
```

```
List all sequence diagram examples
```

### Method 3: Direct SVG Generation

For production-ready SVGs, you can also use the included generator:

```bash
# Generate sample architecture SVGs
node generate-svg-samples.js

# Output will be in examples/architectures/
# All SVG files are XML-compliant and validated
```

## Available MCP Tools

The server provides these tools to Copilot:

| Tool Name | Description | Use Case |
|-----------|-------------|----------|
| `create_diagram` | Generate any Mermaid diagram from description | General diagram creation |
| `search_templates` | Search 50+ pre-built diagram templates | Find existing patterns |
| `list_diagram_types` | List all supported diagram types | Discover capabilities |
| `validate_syntax` | Check Mermaid syntax validity | Debugging |
| `get_template` | Retrieve specific template by ID | Use proven patterns |
| `create_flowchart` | Generate flowchart diagrams | Process flows |
| `create_sequence` | Generate sequence diagrams | API interactions |
| `create_class_diagram` | Generate class diagrams | OOP design |
| `create_er_diagram` | Generate entity-relationship diagrams | Database design |
| `create_state_diagram` | Generate state machine diagrams | State transitions |
| `create_gantt` | Generate Gantt charts | Project timelines |

## Testing Your Setup

### 1. Test MCP Server Directly

Verify the server can start and list tools:

```bash
# Navigate to the server directory
cd ~/Documents/Mermaid/mermaid-mcp-server

# Test the server (should output JSON with available tools)
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js
```

**Expected Output:** JSON response listing all available tools (create_diagram, search_templates, etc.)

### 2. Test SVG Generation

Generate sample architecture diagrams:

```bash
# Generate 5 sample architecture SVGs
node generate-svg-samples.js

# Verify SVG files were created
ls -lh examples/architectures/

# Validate XML compliance (macOS/Linux)
xmllint --noout examples/architectures/*.svg && echo "✅ All SVGs are valid!"
```

**Expected Result:** 5 SVG files (24-31KB each) with no XML validation errors.

### 3. Test in VS Code with Copilot

**Step 1:** Open GitHub Copilot Chat (`Cmd+Shift+I` or click the Copilot icon)

**Step 2:** Try these test prompts:

```
List all available diagram types in the Mermaid MCP server
```

```
Search for templates related to "authentication"
```

```
Create a simple flowchart showing a login process
```

**Expected Behavior:** Copilot should call the MCP server tools and return diagram code or templates.

### 4. Test in a Markdown File

Create a new file `test-diagram.md` and use Copilot inline:

```markdown
# Test Diagram

<!-- @copilot Create a flowchart showing user authentication with OAuth -->
```

Then use **Copilot Inline Completion** to generate the diagram code.

### 5. View Generated SVGs

Open the sample SVG files to verify rendering:

```bash
# macOS: Open in default viewer
open examples/architectures/microservices-architecture.svg

# Or open in browser
open examples/architectures/cloud-infrastructure.svg
```

**Expected Result:** Professional, clean diagrams with no rendering errors.

## Troubleshooting

### Common Issues and Solutions

#### 1. Copilot Not Detecting MCP Server

**Symptoms:** Copilot doesn't show Mermaid tools or doesn't call the server

**Solutions:**
```bash
# 1. Verify the server path is correct (use absolute path)
pwd  # Should show: /Users/YOUR_USERNAME/Documents/Mermaid/mermaid-mcp-server

# 2. Check the server can start
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js

# 3. Verify build is complete
ls -la dist/index.js

# 4. Restart VS Code completely (close all windows)
```

**Configuration Checklist:**
- ✅ Absolute path used (not relative like `~/`)
- ✅ Path points to `dist/index.js` (not `src/index.ts`)
- ✅ VS Code restarted after config changes
- ✅ GitHub Copilot extension is enabled

#### 2. Puppeteer Installation Issues

**Symptoms:** `Error: Could not find Chrome/Chromium`

**Solutions:**
```bash
# Reinstall Puppeteer with browser download
npm uninstall puppeteer
npm install puppeteer

# Or use system Chrome (macOS)
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

#### 3. SVG Files Have Rendering Errors

**Symptoms:** SVG files don't open properly or show XML errors

**Solutions:**
```bash
# Validate SVG XML structure
xmllint --noout examples/architectures/microservices-architecture.svg

# Check for common issues:
# - Non-self-closing <br> tags (should be <br/>)
# - Invalid subgraph syntax in Mermaid code
# - Special characters in labels

# Regenerate SVGs with fix
node generate-svg-samples.js
```

**Note:** The current implementation includes automatic fixes for:
- ✅ HTML `<br>` tags converted to XML-compliant `<br/>`
- ✅ Proper `flowchart` syntax instead of legacy `graph`
- ✅ Subgraph IDs without spaces or special characters

#### 4. Node.js Version Issues

**Symptoms:** `Error: Unsupported Node.js version`

**Solution:**
```bash
# Check Node.js version (must be 18+)
node --version

# Upgrade if needed (using nvm)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

#### 5. Permission Issues

**Symptoms:** `EACCES: permission denied`

**Solutions:**
```bash
# Fix file permissions
chmod +x dist/index.js

# Fix directory permissions
chmod -R 755 dist/

# Check ownership
ls -la dist/
```

#### 6. Build Errors

**Symptoms:** TypeScript compilation fails

**Solutions:**
```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Check for missing dependencies
npm install

# Verify TypeScript version
npx tsc --version
```

### Enable Debug Mode

For detailed troubleshooting, enable debug logging:

**VS Code settings.json:**
```json
{
  "github.copilot.mcp.debug": true,
  "github.copilot.advanced": {
    "debug.overrideEngine": "gpt-4",
    "debug.showScores": true
  }
}
```

### Check Logs

**VS Code Developer Console:**
1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type: **"Developer: Toggle Developer Tools"**
4. Check Console tab for MCP server messages

**Terminal Output:**
```bash
# Run server directly to see logs
node dist/index.js

# Should show startup messages and tool registrations
```

### Validate Installation

Run this complete validation:

```bash
#!/bin/bash
echo "🔍 Mermaid MCP Server Validation"
echo "================================"

echo "✓ Node.js version:"
node --version

echo "✓ Server exists:"
ls -lh dist/index.js

echo "✓ Dependencies installed:"
npm list puppeteer @modelcontextprotocol/sdk

echo "✓ Example SVGs exist:"
ls -lh examples/architectures/*.svg

echo "✓ Server can start:"
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | timeout 5 node dist/index.js | head -5

echo "✅ Validation complete!"
```

## Advanced Configuration

### Custom Puppeteer Settings

Modify `generate-svg-samples.js` for custom rendering:

```javascript
const browser = await puppeteer.launch({
  headless: 'new',           // Use new headless mode
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'  // Prevent memory issues
  ],
  timeout: 60000              // 60 second timeout
});
```

### Custom Mermaid Themes

The server supports multiple themes:

```javascript
// In your diagram request, specify theme
{
  "theme": "dark",      // Dark theme
  "theme": "forest",    // Forest theme
  "theme": "neutral",   // Neutral theme
  "theme": "default"    // Default theme (recommended)
}
```

### Performance Optimization

**For High-Volume Usage:**

1. **Cache Rendered SVGs**: Store commonly used diagrams
2. **Reuse Browser Instance**: Keep Puppeteer browser open
3. **Batch Processing**: Generate multiple diagrams in one browser session
4. **Memory Limits**: Set appropriate heap size

```bash
# Increase Node.js memory limit if needed
node --max-old-space-size=4096 generate-svg-samples.js
```

## Production Deployment

### Security Best Practices

1. **Input Validation**: Always validate Mermaid syntax before rendering
2. **Resource Limits**: Set timeouts and memory constraints
3. **Sandboxing**: Puppeteer runs in isolated browser context
4. **File System Access**: Limit write permissions to output directories

### Recommended Configuration

```json
{
  "security": {
    "maxTextLength": 50000,
    "renderTimeout": 30000,
    "allowedDiagramTypes": ["flowchart", "sequence", "class", "state", "er", "gantt"],
    "sanitizeInput": true
  },
  "performance": {
    "cacheDuration": 3600,
    "maxConcurrentRenders": 3,
    "browserPoolSize": 2
  }
}
```

### Docker Deployment (Optional)

For containerized deployment:

```dockerfile
FROM node:18-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY examples/ ./examples/

CMD ["node", "dist/index.js"]
```

## Example Use Cases

### 1. Documentation Generation

Automatically generate diagrams for your docs:

```bash
# Generate all architecture diagrams
node generate-svg-samples.js

# Include in markdown
![Architecture](./examples/architectures/microservices-architecture.svg)
```

### 2. CI/CD Pipeline Integration

Add to GitHub Actions:

```yaml
- name: Generate Architecture Diagrams
  run: |
    cd mermaid-mcp-server
    npm install
    npm run build
    node generate-svg-samples.js
    
- name: Commit Generated SVGs
  uses: stefanzweifel/git-auto-commit-action@v4
  with:
    commit_message: "📊 Update architecture diagrams"
    file_pattern: examples/architectures/*.svg
```

### 3. Real-Time Diagram Generation

Use in your app to generate diagrams on demand:

```javascript
import { generateSVG } from './generate-svg-samples.js';

const diagram = await generateSVG({
  type: 'flowchart',
  code: 'graph TD\n  A[Start] --> B[End]'
});

// Returns validated, XML-compliant SVG
```

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Update Puppeteer (includes Chrome)
npm install puppeteer@latest

# Rebuild server
npm run build
```

### Monitoring

Monitor these metrics:
- Server response time
- SVG generation success rate
- Memory usage during rendering
- Browser crashes or timeouts

## Getting Help

### Resources

- 📚 **README.md**: Quick start and overview
- 📖 **PROJECT-SUMMARY.md**: Detailed architecture and implementation
- 🎨 **examples/architectures/**: Sample SVG files
- 🐛 **GitHub Issues**: Report bugs or request features

### Common Questions

**Q: Can I generate SVGs without GitHub Copilot?**  
A: Yes! Use `generate-svg-samples.js` or call the MCP server directly.

**Q: What diagram types are supported?**  
A: All Mermaid v10 types: flowchart, sequence, class, state, ER, gantt, pie, journey, git, C4, mindmap, timeline, sankey, and more.

**Q: Can I customize the generated SVGs?**  
A: Yes! Modify the Mermaid code or apply CSS to the SVG output.

**Q: Is this production-ready?**  
A: Yes! All SVGs are XML-validated and battle-tested.

## Quick Command Reference

### Installation & Build
```bash
npm install              # Install dependencies
npm run build           # Compile TypeScript to JavaScript
npm run dev             # Build in watch mode (development)
```

### Testing
```bash
# Test MCP server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js

# Generate sample SVGs
node generate-svg-samples.js

# Validate SVGs (macOS/Linux)
xmllint --noout examples/architectures/*.svg

# View SVG in browser
open examples/architectures/microservices-architecture.svg
```

### Troubleshooting
```bash
# Check versions
node --version                    # Should be 18+
npm list puppeteer               # Verify Puppeteer installed

# Clean rebuild
rm -rf dist/ && npm run build

# Test server directly
node dist/index.js
```

### Configuration Files
- `~/.config/mcp/config.json` - Global MCP configuration
- VS Code: `Preferences: Open User Settings (JSON)`
- Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`

---

## Next Steps

1. ✅ **Complete setup** following this guide
2. 🧪 **Test the server** with the validation commands
3. 🎨 **Generate sample SVGs** using `generate-svg-samples.js`
4. 💬 **Try with Copilot** in VS Code
5. 📚 **Read PROJECT-SUMMARY.md** for detailed documentation
6. 🚀 **Start creating** your own diagrams!

---

## Additional Resources

- 📖 [README.md](./README.md) - Project overview and quick start
- 📚 [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) - Detailed architecture documentation
- 🎨 [examples/architectures/](./examples/architectures/) - Sample SVG diagrams
- 🌐 [Mermaid Documentation](https://mermaid.js.org/) - Mermaid syntax reference
- 🔧 [MCP Specification](https://modelcontextprotocol.io/) - Model Context Protocol docs

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0  
**License:** MIT

**Need help?** Open an issue on GitHub or check the troubleshooting section above.