/**
 * Example: Basic SDK Usage
 * Demonstrates how to use the MCP Connector SDK
 */

import { MermaidMCPConnector } from '../dist/index.js';

async function main() {
  console.log('🚀 Mermaid MCP Connector - Basic Example\n');

  // Create connector instance
  const connector = new MermaidMCPConnector();

  try {
    // Connect to MCP server
    console.log('Connecting to MCP server...');
    await connector.connect();

    // List available tools
    console.log('\n📚 Available Tools:');
    const tools = await connector.listTools();
    tools.forEach((tool) => {
      console.log(`  - ${tool.name}`);
    });

    // Generate a diagram from description
    console.log('\n🎨 Generating diagram from description...');
    const result1 = await connector.generateDiagram({
      description: 'Create a flowchart showing user authentication with email and password',
      filename: 'auth-flow.svg'
    });
    console.log('Result:', result1);

    // Get available diagram types
    console.log('\n📊 Available Diagram Types:');
    const types = await connector.getDiagramTypes();
    console.log(types);

    // Get templates
    console.log('\n📝 Available Templates (Architecture category):');
    const templates = await connector.getTemplates('architecture');
    console.log(templates);

    // Validate Mermaid syntax
    console.log('\n✅ Validating Mermaid syntax...');
    const validation = await connector.validateSyntax(
      'flowchart TD\\n    A[Start] --> B[Process]\\n    B --> C[End]'
    );
    console.log('Validation:', validation);

    // Disconnect
    await connector.disconnect();
    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
    await connector.disconnect();
    process.exit(1);
  }
}

main();
