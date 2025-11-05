#!/usr/bin/env node

/**
 * REST API Adapter for Mermaid MCP Connector
 * Exposes MCP functionality as REST endpoints for ChatGPT and web integrations
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { MermaidMCPConnector } from './index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize MCP Connector
const connector = new MermaidMCPConnector();

// Connect to MCP server lazily (only when first tool is called)
let connecting: Promise<void> | null = null;
async function ensureConnected() {
  if (!connecting) {
    connecting = connector.connect().catch((error) => {
      console.error('Failed to connect to MCP server:', error);
      connecting = null;
      throw error;
    });
  }
  return connecting;
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'mermaid-mcp-connector' });
});

// Get available tools
app.get('/api/tools', async (req: Request, res: Response) => {
  try {
    await ensureConnected();
    const tools = await connector.listTools();
    res.json({ success: true, tools });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate diagram
app.post('/api/diagram/generate', async (req: Request, res: Response) => {
  try {
    const { description, code, type, filename } = req.body;
    
    if (!description && !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either description or code is required' 
      });
    }

    await ensureConnected();
    const result = await connector.generateDiagram({
      description,
      code,
      type,
      filename
    });

    // Extract SVG and Mermaid code from MCP response
    let svg = '';
    let mermaidCode = code || '';
    let metadata: any = {};

    // Parse MCP response content
    if (result.content && Array.isArray(result.content)) {
      for (const item of result.content) {
        if (item.type === 'text' && item.text) {
          // Extract SVG from markdown code block
          const svgMatch = item.text.match(/```svg\n([\s\S]*?)\n```/);
          if (svgMatch) {
            svg = svgMatch[1];
          }
          
          // Extract Mermaid code from markdown code block
          const mermaidMatch = item.text.match(/```mermaid\n([\s\S]*?)\n```/);
          if (mermaidMatch) {
            mermaidCode = mermaidMatch[1];
          }
          
          // Extract metadata (Type, Dimensions, etc.)
          const typeMatch = item.text.match(/\*\*Type:\*\*\s*(\w+)/);
          const dimensionsMatch = item.text.match(/\*\*Dimensions:\*\*\s*(\d+)x(\d+)px/);
          const renderTimeMatch = item.text.match(/\*\*Render Time:\*\*\s*(\d+)ms/);
          const nodesMatch = item.text.match(/\*\*Nodes:\*\*\s*(\d+)/);
          const edgesMatch = item.text.match(/\*\*Edges:\*\*\s*(\d+)/);
          const fileMatch = item.text.match(/\*\*File:\*\*\s*(.+)/);
          
          if (typeMatch || dimensionsMatch || renderTimeMatch) {
            metadata = {
              diagramType: typeMatch ? typeMatch[1] : 'unknown',
              width: dimensionsMatch ? parseInt(dimensionsMatch[1]) : 800,
              height: dimensionsMatch ? parseInt(dimensionsMatch[2]) : 600,
              renderTime: renderTimeMatch ? parseInt(renderTimeMatch[1]) : 0,
              nodeCount: nodesMatch ? parseInt(nodesMatch[1]) : 0,
              edgeCount: edgesMatch ? parseInt(edgesMatch[1]) : 0,
              filepath: fileMatch ? fileMatch[1].trim() : undefined,
              timestamp: new Date().toISOString()
            };
          }
        }
      }
    }

    // Enhanced response format for frontend integration
    const enhancedResponse = {
      success: true,
      
      // Raw SVG markup for inline rendering (dangerouslySetInnerHTML)
      svg: svg,
      
      // Base64 Data URL for <img> tags
      svgDataUrl: svg ? `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` : '',
      
      // Mermaid code for editing/re-rendering
      mermaidCode: mermaidCode,
      
      // Metadata for display
      metadata: metadata,
      
      // Original MCP response (for debugging/advanced use)
      raw: result
    };

    res.json(enhancedResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get diagram types
app.get('/api/diagram/types', async (req: Request, res: Response) => {
  try {
    await ensureConnected();
    const result = await connector.getDiagramTypes();
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get templates
app.get('/api/templates', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    await ensureConnected();
    const result = await connector.getTemplates(category);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate syntax
app.post('/api/diagram/validate', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code is required' 
      });
    }

    await ensureConnected();
    const result = await connector.validateSyntax(code);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export diagram
app.post('/api/diagram/export', async (req: Request, res: Response) => {
  try {
    const { code, format, filename } = req.body;
    
    if (!code || !format) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code and format are required' 
      });
    }

    if (!['svg', 'png', 'pdf'].includes(format)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Format must be svg, png, or pdf' 
      });
    }

    await ensureConnected();
    const result = await connector.exportDiagram({
      code,
      format,
      filename
    });

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// OpenAPI spec for ChatGPT plugin
app.get('/openapi.json', (req: Request, res: Response) => {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Mermaid MCP Connector API',
      description: 'REST API for generating Mermaid diagrams via MCP',
      version: '1.0.0'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`
      }
    ],
    paths: {
      '/api/diagram/generate': {
        post: {
          summary: 'Generate a Mermaid diagram',
          operationId: 'generateDiagram',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    description: {
                      type: 'string',
                      description: 'Natural language description of the diagram'
                    },
                    code: {
                      type: 'string',
                      description: 'Mermaid code to render'
                    },
                    type: {
                      type: 'string',
                      description: 'Type of diagram (flowchart, sequence, etc.)'
                    },
                    filename: {
                      type: 'string',
                      description: 'Output filename'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Diagram generated successfully'
            }
          }
        }
      },
      '/api/diagram/types': {
        get: {
          summary: 'Get available diagram types',
          operationId: 'getDiagramTypes',
          responses: {
            '200': {
              description: 'List of diagram types'
            }
          }
        }
      },
      '/api/templates': {
        get: {
          summary: 'Get available templates',
          operationId: 'getTemplates',
          parameters: [
            {
              name: 'category',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Template category'
            }
          ],
          responses: {
            '200': {
              description: 'List of templates'
            }
          }
        }
      }
    }
  };

  res.json(spec);
});

// ChatGPT plugin manifest
app.get('/.well-known/ai-plugin.json', (req: Request, res: Response) => {
  const manifest = {
    schema_version: 'v1',
    name_for_human: 'Mermaid Diagram Generator',
    name_for_model: 'mermaid_diagram',
    description_for_human: 'Generate professional Mermaid diagrams from natural language',
    description_for_model: 'Generate flowcharts, sequence diagrams, architecture diagrams, and more using Mermaid syntax. Supports 22+ diagram types and 50+ templates.',
    auth: {
      type: 'none'
    },
    api: {
      type: 'openapi',
      url: `http://localhost:${PORT}/openapi.json`
    },
    logo_url: 'https://mermaid.js.org/favicon.svg',
    contact_email: 'narasimha.ponnada@hotmail.com',
    legal_info_url: 'https://github.com/Narasimhaponnada/mermaid-mcp'
  };

  res.json(manifest);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await connector.disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mermaid MCP Connector API running on http://localhost:${PORT}`);
  console.log(`📚 OpenAPI spec: http://localhost:${PORT}/openapi.json`);
  console.log(`🤖 ChatGPT manifest: http://localhost:${PORT}/.well-known/ai-plugin.json`);
});

export default app;
