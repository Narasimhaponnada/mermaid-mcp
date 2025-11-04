#!/usr/bin/env node

/**
 * WebSocket Adapter for Mermaid MCP Connector
 * Real-time bidirectional communication for AI assistants
 */

import { WebSocketServer, WebSocket } from 'ws';
import { MermaidMCPConnector } from './index.js';

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001;

// Initialize MCP Connector
const connector = new MermaidMCPConnector();

// Connect to MCP server
connector.connect().then(() => {
  console.log('✅ Connected to Mermaid MCP Server');
}).catch((error) => {
  console.error('Failed to connect to MCP server:', error);
  process.exit(1);
});

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  console.log('🔗 New client connected');

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📩 Received:', message);

      const { action, params } = message;

      let result;

      switch (action) {
        case 'list_tools':
          result = await connector.listTools();
          break;

        case 'generate_diagram':
          result = await connector.generateDiagram(params);
          break;

        case 'get_diagram_types':
          result = await connector.getDiagramTypes();
          break;

        case 'get_templates':
          result = await connector.getTemplates(params?.category);
          break;

        case 'validate_syntax':
          result = await connector.validateSyntax(params.code);
          break;

        case 'export_diagram':
          result = await connector.exportDiagram(params);
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      ws.send(JSON.stringify({
        success: true,
        action,
        result
      }));

    } catch (error: any) {
      ws.send(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Mermaid MCP Connector',
    version: '1.0.0'
  }));
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down WebSocket server...');
  
  wss.clients.forEach((client) => {
    client.close();
  });
  
  wss.close();
  await connector.disconnect();
  process.exit(0);
});
