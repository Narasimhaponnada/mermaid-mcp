#!/usr/bin/env node

/**
 * CLI for Mermaid MCP Connector
 * Command-line interface for running the connector in various modes
 */

import { MermaidMCPConnector } from './index.js';

const args = process.argv.slice(2);
const command = args[0];

async function runCLI() {
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Mermaid MCP Connector CLI

Usage:
  mermaid-connector <command> [options]

Commands:
  rest              Start REST API server (for ChatGPT integration)
  websocket, ws     Start WebSocket server (for real-time integrations)
  test              Test connection to MCP server
  generate <desc>   Generate a diagram from description
  types             List available diagram types
  templates         List available templates

Options:
  --port <port>     Port for REST API (default: 3000)
  --ws-port <port>  Port for WebSocket (default: 3001)
  --help, -h        Show this help message
  --version, -v     Show version

Examples:
  # Start REST API for ChatGPT
  mermaid-connector rest

  # Start WebSocket server
  mermaid-connector websocket --ws-port 8080

  # Generate a diagram
  mermaid-connector generate "Create a flowchart for user login"

  # List diagram types
  mermaid-connector types

Environment Variables:
  PORT              Port for REST API
  WS_PORT           Port for WebSocket server
  MCP_SERVER_CMD    Command to start MCP server (default: mermaid-mcp)
`);
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log('mermaid-mcp-connector v1.0.0');
    return;
  }

  switch (command) {
    case 'rest':
      console.log('Starting REST API server...');
      await import('./rest-api.js');
      break;

    case 'websocket':
    case 'ws':
      console.log('Starting WebSocket server...');
      await import('./websocket.js');
      break;

    case 'test':
      await testConnection();
      break;

    case 'generate':
      const description = args.slice(1).join(' ');
      if (!description) {
        console.error('Error: Description required');
        console.log('Usage: mermaid-connector generate <description>');
        process.exit(1);
      }
      await generateDiagram(description);
      break;

    case 'types':
      await listDiagramTypes();
      break;

    case 'templates':
      await listTemplates();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run "mermaid-connector --help" for usage information');
      process.exit(1);
  }
}

async function testConnection() {
  console.log('Testing connection to Mermaid MCP Server...');
  
  const connector = new MermaidMCPConnector();
  
  try {
    await connector.connect();
    const tools = await connector.listTools();
    
    console.log('✅ Connection successful!');
    console.log(`\nAvailable tools: ${tools.length}`);
    tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    
    await connector.disconnect();
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

async function generateDiagram(description: string) {
  const connector = new MermaidMCPConnector();
  
  try {
    await connector.connect();
    console.log(`Generating diagram: "${description}"\n`);
    
    const result = await connector.generateDiagram({ description });
    
    console.log('✅ Diagram generated successfully!');
    console.log('\nResult:', JSON.stringify(result, null, 2));
    
    await connector.disconnect();
  } catch (error: any) {
    console.error('❌ Generation failed:', error.message);
    await connector.disconnect();
    process.exit(1);
  }
}

async function listDiagramTypes() {
  const connector = new MermaidMCPConnector();
  
  try {
    await connector.connect();
    const result = await connector.getDiagramTypes();
    
    console.log('Available Diagram Types:\n');
    console.log(JSON.stringify(result, null, 2));
    
    await connector.disconnect();
  } catch (error: any) {
    console.error('❌ Failed to get diagram types:', error.message);
    await connector.disconnect();
    process.exit(1);
  }
}

async function listTemplates() {
  const connector = new MermaidMCPConnector();
  
  try {
    await connector.connect();
    const result = await connector.getTemplates();
    
    console.log('Available Templates:\n');
    console.log(JSON.stringify(result, null, 2));
    
    await connector.disconnect();
  } catch (error: any) {
    console.error('❌ Failed to get templates:', error.message);
    await connector.disconnect();
    process.exit(1);
  }
}

// Run CLI
runCLI().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
