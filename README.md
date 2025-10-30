# Mermaid MCP Server

> **AI-powered Mermaid diagram generation using Model Context Protocol (MCP)**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-1.0.4-purple.svg)](https://modelcontextprotocol.io/)
[![Mermaid](https://img.shields.io/badge/Mermaid-10.0+-blue.svg)](https://mermaid.js.org/)

## 🎯 Overview

The **Mermaid MCP Server** enables AI assistants like GitHub Copilot, Claude, and custom LLM applications to generate professional architecture diagrams, flowcharts, sequence diagrams, and more using natural language. It provides a Model Context Protocol interface for seamless integration with AI coding assistants.

### ✨ Key Features

- 🤖 **AI-Powered Generation**: Create diagrams using natural language with GitHub Copilot or Claude
- 🎨 **Production-Ready SVGs**: XML-compliant, validated SVG files ready for any use
- 📦 **50+ Pre-built Templates**: Architecture patterns, workflows, and data models
- 🔧 **Multiple Integrations**: VS Code, Claude Desktop, Cursor IDE, CLI, and custom apps
- 🚀 **22+ Diagram Types**: Flowcharts, sequences, ERDs, state machines, Gantt charts, and more
- ⚡ **Fast & Reliable**: Browser-based rendering with Puppeteer for consistent output

## 📋 What's Included

```
Mermaid/
├── mermaid-mcp-server/          # Main MCP server
│   ├── src/                     # TypeScript source code
│   ├── dist/                    # Compiled JavaScript
│   ├── examples/architectures/  # 5 production-ready SVG samples
│   ├── package.json             # Dependencies
│   └── README.md                # Server documentation
├── Setup.md                     # Complete setup guide
├── UserGuide.md                 # Comprehensive usage guide
└── *.md                         # Analysis and documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- GitHub Copilot (recommended) or Claude Desktop

### Installation

```bash
# Clone the repository
git clone https://github.com/NarasimhaPonnada/Mermaid.git
cd Mermaid/mermaid-mcp-server

# Install dependencies
npm install

# Build the server
npm run build

# Generate sample diagrams
node generate-svg-samples.js
```

### Configure with GitHub Copilot

Add to your VS Code settings (`Cmd+Shift+P` → "Preferences: Open User Settings (JSON)"):

```json
{
  "github.copilot.mcp.servers": {
    "mermaid": {
      "command": "node",
      "args": ["/absolute/path/to/mermaid-mcp-server/dist/index.js"]
    }
  }
}
```

### Use with Copilot

Open GitHub Copilot Chat and try:

```
Create a microservices architecture diagram for an e-commerce platform
```

```
Generate a CI/CD pipeline flowchart showing GitHub Actions workflow
```

```
Show me a sequence diagram for user authentication with OAuth
```

## 📚 Documentation

- **[Setup.md](Setup.md)** - Complete installation and configuration guide (807 lines)
- **[UserGuide.md](UserGuide.md)** - Comprehensive usage guide with examples (2,349 lines)
- **[mermaid-mcp-server/README.md](mermaid-mcp-server/README.md)** - Server-specific documentation
- **[mermaid-mcp-server/PROJECT-SUMMARY.md](mermaid-mcp-server/PROJECT-SUMMARY.md)** - Technical deep-dive

## 🎨 Diagram Types Supported

- **Process Diagrams**: Flowcharts, Block Diagrams
- **Interactions**: Sequence Diagrams, User Journeys, Timelines
- **Structure**: Class Diagrams, ER Diagrams, C4 Diagrams, Architecture
- **Data Visualization**: Pie Charts, XY Charts, Sankey, Radar, Quadrant, Treemap
- **Project Management**: Gantt Charts, Requirement Diagrams, Kanban Boards
- **Specialized**: State Diagrams, Git Flow, Mindmaps, Packet Diagrams

## 🔌 Integration Methods

1. **GitHub Copilot in VS Code** - Daily development workflow
2. **Claude Desktop** - Standalone diagram generation
3. **Cursor IDE** - AI-first development
4. **Direct CLI** - Automation and scripting
5. **MCP Inspector** - Testing and debugging
6. **Custom Applications** - Build your own integrations

## 💡 Use Cases

- 📖 **Documentation**: Auto-generate architecture diagrams for docs
- 🔄 **Code Reviews**: Include diagrams in pull requests
- 👥 **Onboarding**: Visual guides for new developers
- 📊 **Technical Proposals**: Explain changes with visuals
- 🚨 **Incident Response**: Document incidents with timelines
- 💼 **Client Presentations**: Explain technical concepts visually
- 📚 **Training Materials**: Create consistent learning resources

## 🌟 Example Output

The server generates production-ready SVG files like these (included in `examples/architectures/`):

- `microservices-architecture.svg` (27KB) - Microservices with API Gateway
- `cloud-infrastructure.svg` (31KB) - Cloud infrastructure components
- `cicd-pipeline.svg` (28KB) - Complete CI/CD workflow
- `data-pipeline.svg` (24KB) - ETL data processing pipeline
- `serverless-architecture.svg` (31KB) - Event-driven serverless

All SVGs are XML-validated and render perfectly in browsers, documentation, and presentations.

## 🛠️ Technology Stack

- **Node.js** - Server runtime
- **TypeScript** - Type-safe development
- **Puppeteer** - Browser-based rendering
- **Mermaid v10** - Diagramming library (via CDN)
- **MCP SDK** - Model Context Protocol implementation

## 📈 Project Status

- ✅ **Production-Ready**: All core features implemented and tested
- ✅ **Validated**: All SVG outputs are XML-compliant
- ✅ **Documented**: Comprehensive guides and examples
- ✅ **Clean Codebase**: 43 essential files, no cruft
- ✅ **Battle-Tested**: Fixed HTML-to-XML tag issues, subgraph syntax, etc.

## 🤝 Contributing

Contributions are welcome! Please feel free to:

- Report bugs and issues
- Suggest new diagram types or features
- Submit pull requests
- Share usage examples and best practices

## 📄 License

MIT License - see [mermaid-mcp-server/LICENSE](mermaid-mcp-server/LICENSE) for details

## 🙏 Acknowledgments

- **Mermaid.js** - Amazing diagramming library
- **Model Context Protocol** - Enabling AI tool integration
- **GitHub Copilot** - AI-powered development
- **Puppeteer** - Reliable browser automation

## 📞 Support

- 📖 Documentation: See [Setup.md](Setup.md) and [UserGuide.md](UserGuide.md)
- 🐛 Issues: Open an issue on GitHub
- 💬 Discussions: Start a discussion for questions
- 📧 Contact: Via GitHub profile

## 🚀 Getting Started

1. **Read the setup guide**: [Setup.md](Setup.md)
2. **Install and configure**: Follow the quick start above
3. **Try it out**: Generate your first diagram with Copilot
4. **Explore use cases**: Check [UserGuide.md](UserGuide.md)
5. **Integrate into your project**: Use one of 6 integration methods

---

**Last Updated**: October 30, 2025  
**Author**: Narasimha Rao Ponnada  
**Version**: 1.0.0

**Start creating amazing diagrams with AI! 🎨📊✨**
