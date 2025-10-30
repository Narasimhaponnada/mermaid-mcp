/**
 * Core diagram generation MCP tools
 */

import { MCPToolRequest, MCPToolResponse, RenderOptions } from '../types/index.js';
import { 
  renderDiagram, 
  validateDiagram, 
  getDiagramInfo, 
  detectDiagramType,
  getSupportedDiagramTypes,
  sanitizeDiagramCode,
  generateFilename
} from '../utils/mermaid.js';
import { saveSVG, generateOutputPath } from '../utils/filesystem.js';

/**
 * Generate and render a Mermaid diagram to SVG
 */
export async function generateDiagram(request: MCPToolRequest): Promise<MCPToolResponse> {
  try {
    const { code, options = {}, filename, outputPath } = request.arguments as {
      code: string;
      options?: RenderOptions;
      filename?: string;
      outputPath?: string;
    };

    if (!code || typeof code !== 'string') {
      return {
        content: [{
          type: 'text',
          text: 'Error: diagram code is required and must be a string'
        }],
        isError: true
      };
    }

    // Sanitize input
    const sanitizedCode = sanitizeDiagramCode(code);
    
    // Render diagram
    const result = await renderDiagram(sanitizedCode, options);
    
    // Generate filename if not provided
    const finalFilename = filename || generateFilename(sanitizedCode, 'svg');
    const filePath = generateOutputPath(
      { format: 'svg', filename: finalFilename, path: outputPath },
      'diagram'
    );
    
    // Save SVG file
    const savedPath = await saveSVG(result.svg, filePath);
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Diagram generated successfully!\n\n**File:** ${savedPath}\n**Type:** ${result.metadata?.diagramType}\n**Dimensions:** ${result.width}x${result.height}px\n**Render Time:** ${result.metadata?.renderTime}ms\n**Nodes:** ${result.metadata?.nodeCount}, **Edges:** ${result.metadata?.edgeCount}`
        },
        {
          type: 'text',
          text: `\n**SVG Content:**\n\`\`\`svg\n${result.svg.substring(0, 1000)}${result.svg.length > 1000 ? '...' : ''}\n\`\`\``
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error generating diagram: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Validate Mermaid diagram syntax
 */
export async function validateDiagramSyntax(request: MCPToolRequest): Promise<MCPToolResponse> {
  try {
    const { code } = request.arguments as { code: string };

    if (!code || typeof code !== 'string') {
      return {
        content: [{
          type: 'text',
          text: 'Error: diagram code is required and must be a string'
        }],
        isError: true
      };
    }

    const sanitizedCode = sanitizeDiagramCode(code);
    const validation = await validateDiagram(sanitizedCode);
    
    if (validation.valid) {
      const info = getDiagramInfo(sanitizedCode);
      return {
        content: [{
          type: 'text',
          text: `✅ Diagram syntax is valid!\n\n**Type:** ${info.type}\n**Complexity:** ${info.complexity}\n**Nodes:** ${info.nodeCount}, **Edges:** ${info.edgeCount}\n**Estimated Render Time:** ${info.estimatedRenderTime}ms`
        }]
      };
    } else {
      const errorMessages = validation.errors?.map(err => 
        `• ${err.message} ${err.line ? `(Line ${err.line})` : ''}`
      ).join('\n') || 'Unknown validation error';
      
      const suggestions = validation.suggestions?.map(sug => 
        `💡 ${sug.message}${sug.fix ? `\n   Fix: ${sug.fix}` : ''}`
      ).join('\n') || '';

      return {
        content: [{
          type: 'text',
          text: `❌ Diagram validation failed:\n\n**Errors:**\n${errorMessages}\n\n**Suggestions:**\n${suggestions}`
        }],
        isError: true
      };
    }
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error validating diagram: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Get information about a diagram without rendering
 */
export async function getDiagramInformation(request: MCPToolRequest): Promise<MCPToolResponse> {
  try {
    const { code } = request.arguments as { code: string };

    if (!code || typeof code !== 'string') {
      return {
        content: [{
          type: 'text',
          text: 'Error: diagram code is required and must be a string'
        }],
        isError: true
      };
    }

    const sanitizedCode = sanitizeDiagramCode(code);
    const info = getDiagramInfo(sanitizedCode);
    const detectedType = detectDiagramType(sanitizedCode);
    
    return {
      content: [{
        type: 'text',
        text: `📊 **Diagram Information**\n\n` +
              `**Type:** ${detectedType || 'unknown'}\n` +
              `**Complexity:** ${info.complexity}\n` +
              `**Node Count:** ${info.nodeCount}\n` +
              `**Edge Count:** ${info.edgeCount}\n` +
              `**Estimated Render Time:** ${info.estimatedRenderTime}ms\n` +
              `**Code Length:** ${sanitizedCode.length} characters`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error analyzing diagram: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * List all supported diagram types
 */
export async function listSupportedDiagramTypes(request: MCPToolRequest): Promise<MCPToolResponse> {
  try {
    const types = getSupportedDiagramTypes();
    
    const typeList = types.map((type, index) => `${index + 1}. **${type}**`).join('\n');
    
    return {
      content: [{
        type: 'text',
        text: `📋 **Supported Diagram Types** (${types.length} total)\n\n${typeList}\n\n` +
              `Use any of these types in your Mermaid diagrams. Examples:\n` +
              `• \`flowchart TD\` - Top-down flowchart\n` +
              `• \`sequenceDiagram\` - Sequence diagram\n` +
              `• \`classDiagram\` - Class diagram\n` +
              `• \`stateDiagram-v2\` - State diagram\n` +
              `• \`erDiagram\` - Entity relationship diagram`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error listing supported types: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Convert diagram to different format (currently SVG only, extensible)
 */
export async function convertDiagram(request: MCPToolRequest): Promise<MCPToolResponse> {
  try {
    const { code, format = 'svg', options = {}, filename, outputPath } = request.arguments as {
      code: string;
      format?: string;
      options?: RenderOptions;
      filename?: string;
      outputPath?: string;
    };

    if (!code || typeof code !== 'string') {
      return {
        content: [{
          type: 'text',
          text: 'Error: diagram code is required and must be a string'
        }],
        isError: true
      };
    }

    if (format !== 'svg') {
      return {
        content: [{
          type: 'text',
          text: `❌ Format '${format}' not yet supported. Currently supported: svg\n\n🚧 PNG and PDF export coming in future updates!`
        }],
        isError: true
      };
    }

    // Use the generate diagram function for SVG
    return await generateDiagram({
      name: 'generateDiagram',
      arguments: { code, options, filename, outputPath }
    });
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error converting diagram: ${error.message}`
      }],
      isError: true
    };
  }
}