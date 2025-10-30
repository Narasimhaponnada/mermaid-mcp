/**
 * Type definitions for Mermaid MCP Server
 * Enhanced with features from mermaid-live-editor analysis
 */

export interface DiagramConfig {
  theme?: 'default' | 'dark' | 'forest' | 'neutral' | 'base';
  startOnLoad?: boolean;
  securityLevel?: 'strict' | 'loose' | 'antiscript' | 'sandbox';
  fontFamily?: string;
  fontSize?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  suppressErrorRendering?: boolean;
  maxTextSize?: number;
  maxEdges?: number;
}

export interface LayoutConfig {
  engine?: 'elk' | 'dagre' | 'tidy-tree';
  direction?: 'TB' | 'TD' | 'BT' | 'RL' | 'LR';
  spacing?: number;
  padding?: number;
  hierarchical?: boolean;
  algorithm?: string;
}

export interface RenderOptions {
  config?: DiagramConfig;
  layout?: LayoutConfig;
  format?: 'svg' | 'png' | 'pdf';
  quality?: number;
  width?: number;
  height?: number;
  background?: string;
  scale?: number;
}

export interface DiagramState {
  code: string;
  mermaid: DiagramConfig;
  layout?: LayoutConfig;
  pan?: { x: number; y: number };
  zoom?: number;
  autoSync?: boolean;
  rough?: boolean;
  updateDiagram?: boolean;
  editorMode?: 'code' | 'config';
}

export interface SerializedState {
  code: string;
  mermaid?: DiagramConfig;
  layout?: LayoutConfig;
  autoSync?: boolean;
  rough?: boolean;
  updateDiagram?: boolean;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  code: string;
  config?: DiagramConfig;
  layout?: LayoutConfig;
  tags?: string[];
  category?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    message: string;
    line?: number;
    column?: number;
    severity: 'error' | 'warning' | 'info';
  }>;
  suggestions?: Array<{
    message: string;
    fix?: string;
  }>;
}

export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  errors?: string[];
  warnings?: string[];
  metadata?: {
    diagramType: string;
    nodeCount: number;
    edgeCount: number;
    renderTime: number;
  };
}

export interface ExportOptions {
  format: 'svg' | 'png' | 'pdf';
  filename?: string;
  path?: string;
  quality?: number;
  width?: number;
  height?: number;
  background?: string;
  scale?: number;
}

export interface MermaidError extends Error {
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
  code?: string;
}

export interface DiagramInfo {
  type: string;
  title?: string;
  description?: string;
  nodeCount: number;
  edgeCount: number;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedRenderTime: number;
}

export interface MCPToolRequest {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

// Layout Engine Types
export interface ElkOptions {
  algorithm?: 'layered' | 'stress' | 'mrtree' | 'radial' | 'force' | 'disco';
  direction?: 'RIGHT' | 'LEFT' | 'DOWN' | 'UP';
  spacing?: {
    nodeNode?: number;
    edgeNode?: number;
    edgeEdge?: number;
  };
  layering?: {
    strategy?: 'NETWORK_SIMPLEX' | 'LONGEST_PATH' | 'COFFMAN_GRAHAM';
    layerConstraint?: 'NONE' | 'FIRST' | 'FIRST_SEPARATE' | 'LAST' | 'LAST_SEPARATE';
  };
}

export interface DagreOptions {
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  align?: 'UL' | 'UR' | 'DL' | 'DR';
  nodesep?: number;
  edgesep?: number;
  ranksep?: number;
  marginx?: number;
  marginy?: number;
  acyclicer?: 'greedy' | undefined;
  ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
}

export interface TidyTreeOptions {
  orientation?: 'horizontal' | 'vertical';
  layerGap?: number;
  nodeGap?: number;
  rootPadding?: number;
}

// Animation Types
export interface AnimationConfig {
  enabled?: boolean;
  duration?: number;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
}

// Interactive Features
export interface InteractiveConfig {
  panZoom?: boolean;
  clickHandlers?: boolean;
  tooltips?: boolean;
  animations?: AnimationConfig;
}

// Supported Diagram Types
export type DiagramType = 
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'state'
  | 'er'
  | 'gantt'
  | 'pie'
  | 'journey'
  | 'gitgraph' 
  | 'requirement'
  | 'mindmap'
  | 'timeline'
  | 'zenuml'
  | 'sankey'
  | 'xy'
  | 'quadrant'
  | 'packet'
  | 'architecture'
  | 'c4'
  | 'block'
  | 'kanban'
  | 'gitgraph';

export const SUPPORTED_DIAGRAM_TYPES: DiagramType[] = [
  'flowchart', 'sequence', 'class', 'state', 'er', 'gantt', 'pie',
  'journey', 'gitgraph', 'requirement', 'mindmap', 'timeline', 
  'zenuml', 'sankey', 'xy', 'quadrant', 'packet', 'architecture',
  'c4', 'block', 'kanban'
];

export const LAYOUT_ENGINES = ['elk', 'dagre', 'tidy-tree'] as const;
export const EXPORT_FORMATS = ['svg', 'png', 'pdf'] as const;
export const THEMES = ['default', 'dark', 'forest', 'neutral', 'base'] as const;