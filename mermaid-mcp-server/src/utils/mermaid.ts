/**
 * Mermaid utility functions
 * Enhanced with features from mermaid-live-editor analysis
 */

import mermaid from 'mermaid';
import { JSDOM } from 'jsdom';
import { deflate, inflate } from 'pako';
import DOMPurify from 'dompurify';
import {
  DiagramConfig,
  RenderOptions,
  RenderResult,
  ValidationResult,
  DiagramInfo,
  DiagramType,
  SUPPORTED_DIAGRAM_TYPES
} from '../types/index.js';
import { renderDiagramWithPuppeteer } from './puppeteer-renderer.js';

/**
 * Initialize Mermaid with enhanced configuration
 */
export async function initializeMermaid(config?: DiagramConfig): Promise<void> {
  // Create DOM environment for server-side rendering
  const dom = new JSDOM('<!DOCTYPE html><body></body>');
  const window = dom.window as any;
  (global as any).document = window.document;
  (global as any).window = window;
  (globalThis as any).document = window.document;
  (globalThis as any).window = window;

  // Initialize DOMPurify with the JSDOM window
  const purify = DOMPurify(window);

  // Create a mock DOMPurify that passes through (no-op sanitization for server-side)
  const mockDOMPurify = Object.assign(
    // Make it a callable function
    function(dirty: any) { return dirty; },
    {
      sanitize: (dirty: any) => String(dirty),
      addHook: () => {},
      removeHook: () => {},
      removeHooks: () => {},
      removeAllHooks: () => {},
      setConfig: () => {},
      clearConfig: () => {},
      isValidAttribute: () => true,
      isSupported: true,
      version: '3.3.0',
      removed: []
    }
  );

  // Set mock DOMPurify on all scopes
  window.DOMPurify = mockDOMPurify;
  (global as any).DOMPurify = mockDOMPurify;
  (globalThis as any).DOMPurify = mockDOMPurify;
 
  const defaultConfig: any = {
    theme: 'default',
    startOnLoad: false,
    securityLevel: 'loose', // Changed from 'strict' to avoid DOMPurify issues
    secure: [], // Disable all sanitization checks
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    logLevel: 'error',
    suppressErrorRendering: false,
    maxTextSize: 50000,
    maxEdges: 500,
    ...config
  };
 
  try {
    await mermaid.initialize(defaultConfig);
    console.log('Mermaid initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Mermaid:', error);
    throw new Error(`Mermaid initialization failed: ${error}`);
  }
}/**
 * Detect diagram type from Mermaid code
 */
export function detectDiagramType(code: string): DiagramType | null {
  const trimmed = code.trim();
  
  // Check for explicit diagram type declarations
  const typePatterns: Record<string, DiagramType> = {
    '^flowchart': 'flowchart',
    '^graph': 'flowchart',
    '^sequenceDiagram': 'sequence',
    '^classDiagram': 'class',
    '^stateDiagram': 'state',
    '^erDiagram': 'er',
    '^gantt': 'gantt',
    '^pie': 'pie',
    '^journey': 'journey',
    '^gitGraph': 'gitgraph',
    '^requirementDiagram': 'requirement',
    '^mindmap': 'mindmap',
    '^timeline': 'timeline',
    '^zenuml': 'zenuml',
    '^sankey-beta': 'sankey',
    '^xychart-beta': 'xy',
    '^quadrantChart': 'quadrant',
    '^packet-beta': 'packet',
    '^architecture-beta': 'architecture',
    '^C4': 'c4',
    '^block-beta': 'block',
    '^kanban': 'kanban'
  };

  for (const [pattern, type] of Object.entries(typePatterns)) {
    if (new RegExp(pattern, 'i').test(trimmed)) {
      return type;
    }
  }

  // Default to flowchart if no specific type detected
  return 'flowchart';
}

/**
 * Validate Mermaid diagram code
 */
export async function validateDiagram(code: string): Promise<ValidationResult> {
  try {
    // Use Mermaid's parse function to validate
    await mermaid.parse(code);
    
    return {
      valid: true,
      errors: [],
      suggestions: []
    };
  } catch (error: any) {
    const errors = [{
      message: error.message || 'Invalid diagram syntax',
      severity: 'error' as const,
      line: error.line,
      column: error.column
    }];

    const suggestions = generateSuggestions(code, error);

    return {
      valid: false,
      errors,
      suggestions
    };
  }
}

/**
 * Generate helpful suggestions for common errors
 */
function generateSuggestions(code: string, error: any): Array<{ message: string; fix?: string }> {
  const suggestions: Array<{ message: string; fix?: string }> = [];
  const errorMessage = error.message?.toLowerCase() || '';

  if (errorMessage.includes('parse')) {
    suggestions.push({
      message: 'Check for syntax errors in your diagram definition',
      fix: 'Verify that all nodes and connections use proper syntax'
    });
  }

  if (errorMessage.includes('direction')) {
    suggestions.push({
      message: 'Invalid direction specified',
      fix: 'Use valid directions: TB, TD, BT, LR, RL'
    });
  }

  if (errorMessage.includes('theme')) {
    suggestions.push({
      message: 'Invalid theme specified',
      fix: 'Use valid themes: default, dark, forest, neutral, base'
    });
  }

  return suggestions;
}

/**
 * Render Mermaid diagram to SVG with enhanced options
 * Uses Puppeteer for reliable browser-based rendering
 */
export async function renderDiagram(
  code: string,
  options: RenderOptions = {}
): Promise<RenderResult> {
  // Use Puppeteer-based rendering to avoid DOMPurify issues
  return await renderDiagramWithPuppeteer(code, options);
}

/**
 * Get diagram information without rendering
 */
export function getDiagramInfo(code: string): DiagramInfo {
  const type = detectDiagramType(code) || 'unknown';
  const nodeCount = (code.match(/\w+(?:\[.*?\])?/g) || []).length;
  const edgeCount = (code.match(/--[->]?|==>[>]?|\.\.[->]?/g) || []).length;
  
  // Estimate complexity based on node/edge count
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  const totalElements = nodeCount + edgeCount;
  
  if (totalElements > 50) complexity = 'complex';
  else if (totalElements > 20) complexity = 'medium';
  
  // Estimate render time based on complexity
  const baseTime = 100; // ms
  const complexityMultiplier = complexity === 'complex' ? 3 : complexity === 'medium' ? 2 : 1;
  const estimatedRenderTime = baseTime * complexityMultiplier;

  return {
    type,
    nodeCount,
    edgeCount,
    complexity,
    estimatedRenderTime
  };
}

/**
 * Serialize diagram state with compression
 */
export function serializeState(state: any): string {
  try {
    const json = JSON.stringify(state);
    const compressed = deflate(json, { level: 9 });
    return btoa(String.fromCharCode(...compressed));
  } catch (error) {
    console.error('Serialization error:', error);
    throw new Error('Failed to serialize state');
  }
}

/**
 * Deserialize diagram state with decompression
 */
export function deserializeState(serialized: string): any {
  try {
    const compressed = Uint8Array.from(atob(serialized), c => c.charCodeAt(0));
    const json = inflate(compressed, { to: 'string' });
    return JSON.parse(json);
  } catch (error) {
    console.error('Deserialization error:', error);
    throw new Error('Failed to deserialize state');
  }
}

/**
 * Clean up Mermaid resources
 */
export async function cleanup(): Promise<void> {
  try {
    // Close Puppeteer browser
    const { closeBrowser } = await import('./puppeteer-renderer.js');
    await closeBrowser();
    
    // Clean up DOM
    if ((global as any).document) {
      (global as any).document = undefined;
    }
    if ((global as any).window) {
      (global as any).window = undefined;
    }
    console.log('Mermaid cleanup completed');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

/**
 * Get supported diagram types
 */
export function getSupportedDiagramTypes(): DiagramType[] {
  return [...SUPPORTED_DIAGRAM_TYPES];
}

/**
 * Check if diagram type is supported
 */
export function isDiagramTypeSupported(type: string): boolean {
  return SUPPORTED_DIAGRAM_TYPES.includes(type as DiagramType);
}

/**
 * Generate a safe filename from diagram content
 */
export function generateFilename(code: string, format: string = 'svg'): string {
  const type = detectDiagramType(code) || 'diagram';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const hash = Math.random().toString(36).substr(2, 6);
  return `${type}-${timestamp}-${hash}.${format}`;
}

/**
 * Sanitize diagram code for security
 */
export function sanitizeDiagramCode(code: string): string {
  // Remove potentially dangerous patterns
  return code
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\s*\(/gi, '')
    .trim();
}