#!/usr/bin/env node

/**
 * Mermaid MCP Server
 * Model Context Protocol server for Mermaid diagram generation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Import tools
import { 
  generateDiagram, 
  validateDiagramSyntax, 
  getDiagramInformation,
  listSupportedDiagramTypes,
  convertDiagram
} from './tools/core.js';
import {
  listDiagramTemplates,
  getTemplate,
  createCustomTemplate,
  searchTemplates
} from './tools/templates.js';

// Import utilities
import { initializeMermaid, cleanup } from './utils/mermaid.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// CLI preflight: support --version and --help without starting the server
{
  const args = process.argv.slice(2);
  if (args.includes('--version') || args.includes('-v')) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const pkgPath = path.resolve(__dirname, '..', 'package.json');
      let pkg: any = undefined;
      try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      } catch (e) {
        try {
          const alt = path.resolve(process.cwd(), 'package.json');
          pkg = JSON.parse(fs.readFileSync(alt, 'utf8'));
        } catch (e2) {
          console.log('mermaid-mcp (version unknown)');
          process.exit(0);
        }
      }
      console.log(`mermaid-mcp ${pkg.version || 'unknown'}`);
      process.exit(0);
    } catch (err) {
      console.log('mermaid-mcp (version unknown)');
      process.exit(0);
    }
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log('mermaid-mcp - Mermaid MCP Server');
    console.log('Usage: mermaid-mcp [options]');
    console.log('  --version, -v    Print version');
    console.log('  --help, -h       Show this help');
    process.exit(0);
  }
}

/**
 * MCP Tool definitions with enhanced descriptions
 */
const TOOLS = [
  // Core Diagram Tools
  {
    name: 'generateDiagram',
    description: 'Generate and render a Mermaid diagram to SVG file. Supports all 22+ diagram types with advanced layout options.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Mermaid diagram code (e.g., "flowchart TD\\nA --> B")'
        },
        options: {
          type: 'object',
          description: 'Rendering options (theme, layout, format)',
          properties: {
            config: {
              type: 'object',
              description: 'Mermaid configuration',
              properties: {
                theme: { type: 'string', enum: ['default', 'dark', 'forest', 'neutral', 'base'] },
                securityLevel: { type: 'string', enum: ['strict', 'loose', 'antiscript', 'sandbox'] },
                fontSize: { type: 'number' },
                fontFamily: { type: 'string' }
              }
            },
            layout: {
              type: 'object',
              description: 'Advanced layout configuration',
              properties: {
                engine: { type: 'string', enum: ['elk', 'dagre', 'tidy-tree'] },
                direction: { type: 'string', enum: ['TB', 'TD', 'BT', 'RL', 'LR'] },
                spacing: { type: 'number' }
              }
            }
          }
        },
        filename: {
          type: 'string',
          description: 'Output filename (optional, auto-generated if not provided)'
        },
        outputPath: {
          type: 'string',
          description: 'Output directory path (optional, defaults to current directory)'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'validateDiagram',
    description: 'Validate Mermaid diagram syntax and provide detailed error messages and suggestions.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Mermaid diagram code to validate'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'getDiagramInfo',
    description: 'Analyze diagram code and return metadata (type, complexity, node/edge count, estimated render time).',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Mermaid diagram code to analyze'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'listSupportedTypes',
    description: 'List all supported Mermaid diagram types (22+ types including flowchart, sequence, class, etc.).',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'convertDiagram',
    description: 'Convert diagram to different formats. Currently supports SVG (PNG/PDF coming soon).',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Mermaid diagram code'
        },
        format: {
          type: 'string',
          description: 'Output format',
          enum: ['svg', 'png', 'pdf']
        },
        options: {
          type: 'object',
          description: 'Conversion options'
        },
        filename: {
          type: 'string',
          description: 'Output filename'
        },
        outputPath: {
          type: 'string',
          description: 'Output directory path'
        }
      },
      required: ['code']
    }
  },

  // Template Tools
  {
    name: 'listTemplates',
    description: 'List available pre-built diagram templates (50+ templates) by category or type.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by category (flowchart, sequence, class, etc.)'
        },
        type: {
          type: 'string',
          description: 'Filter by diagram type'
        }
      },
      required: []
    }
  },
  {
    name: 'getTemplate',
    description: 'Get a specific diagram template by ID with complete code and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          description: 'Template ID (e.g., "flowchart-basic", "sequence-api")'
        }
      },
      required: ['templateId']
    }
  },
  {
    name: 'searchTemplates',
    description: 'Search templates by keyword (name, description, type, tags, or code content).',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "authentication", "database", "workflow")'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'createCustomTemplate',
    description: 'Create a custom template from diagram code for reuse in current session.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Template name'
        },
        description: {
          type: 'string',
          description: 'Template description'
        },
        code: {
          type: 'string',
          description: 'Mermaid diagram code'
        },
        category: {
          type: 'string',
          description: 'Template category (optional)'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Template tags (optional)'
        }
      },
      required: ['name', 'description', 'code']
    }
  }
];

/**
 * Map tool names to handler functions
 */
const TOOL_HANDLERS = {
  generateDiagram,
  validateDiagram: validateDiagramSyntax,
  getDiagramInfo: getDiagramInformation,
  listSupportedTypes: listSupportedDiagramTypes,
  convertDiagram,
  listTemplates: listDiagramTemplates,
  getTemplate,
  searchTemplates,
  createCustomTemplate
};

/**
 * Main server class
 */
class MermaidMCPServer {
  private server: Server;
  private transport: StdioServerTransport;

  constructor() {
    this.server = new Server(
      {
        name: 'mermaid-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.transport = new StdioServerTransport();
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOLS.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const handler = TOOL_HANDLERS[name as keyof typeof TOOL_HANDLERS];
        if (!handler) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
        }

        const result = await handler({ name, arguments: args || {} });
        return {
          content: result.content,
          isError: result.isError || false
        };
      } catch (error: any) {
        console.error(`Error in tool ${name}:`, error);
        
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });

    // Handle server lifecycle
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.shutdown();
      process.exit(0);
    });
  }

  async start() {
    try {
      console.error('🎨 Initializing Mermaid MCP Server...');
      
      // Initialize Mermaid
      await initializeMermaid({
        theme: 'default',
        startOnLoad: false,
        securityLevel: 'strict',
        logLevel: 'error'
      });

      console.error('✅ Mermaid initialized successfully');
      console.error('🚀 Starting MCP server...');

      await this.server.connect(this.transport);
      console.error('✅ Mermaid MCP Server is running');
      console.error('📋 Available tools:', TOOLS.length);
      console.error('🎯 Ready for GitHub Copilot integration!');
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    try {
      console.error('🛑 Shutting down Mermaid MCP Server...');
      cleanup();
      await this.server.close();
      console.error('✅ Server shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

// Start the server
async function main() {
  const server = new MermaidMCPServer();
  await server.start();
}

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Failed to start:', error);
    process.exit(1);
  });
}