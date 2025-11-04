#!/usr/bin/env node

/**
 * Mermaid MCP Connector
 * Universal connector for integrating Mermaid MCP Server with various AI assistants
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class MermaidMCPConnector {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private connected: boolean = false;

  constructor(
    private serverCommand: string = 'node',
    private serverArgs: string[] = [
      process.env.MCP_SERVER_PATH || '/Users/narasimharao.ponnada/Documents/Mermaid/mermaid-mcp-server/dist/index.js'
    ]
  ) {}

  /**
   * Connect to the Mermaid MCP Server
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    this.transport = new StdioClientTransport({
      command: this.serverCommand,
      args: this.serverArgs
    });

    this.client = new Client(
      {
        name: 'mermaid-mcp-connector',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    await this.client.connect(this.transport);
    this.connected = true;
    console.log('✅ Connected to Mermaid MCP Server');
  }

  /**
   * Disconnect from the MCP Server
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.connected = false;
      console.log('✅ Disconnected from Mermaid MCP Server');
    }
  }

  /**
   * List all available tools from the MCP server
   */
  async listTools(): Promise<any[]> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to MCP server. Call connect() first.');
    }

    const response = await this.client.listTools();
    return response.tools;
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName: string, args: Record<string, any>): Promise<any> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to MCP server. Call connect() first.');
    }

    const response = await this.client.callTool({
      name: toolName,
      arguments: args
    });

    return response;
  }

  /**
   * Generate a Mermaid diagram
   */
  async generateDiagram(params: {
    description?: string;
    code?: string;
    type?: string;
    filename?: string;
  }): Promise<any> {
    return this.callTool('generateDiagram', params);
  }

  /**
   * Get available diagram types
   */
  async getDiagramTypes(): Promise<any> {
    return this.callTool('listSupportedTypes', {});
  }

  /**
   * Get available templates
   */
  async getTemplates(category?: string): Promise<any> {
    return this.callTool('listTemplates', category ? { category } : {});
  }

  /**
   * Validate Mermaid syntax
   */
  async validateSyntax(code: string): Promise<any> {
    return this.callTool('validateDiagram', { code });
  }

  /**
   * Export diagram to different format
   */
  async exportDiagram(params: {
    code: string;
    format: 'svg' | 'png' | 'pdf';
    filename?: string;
  }): Promise<any> {
    return this.callTool('convertDiagram', params);
  }
}

export default MermaidMCPConnector;
