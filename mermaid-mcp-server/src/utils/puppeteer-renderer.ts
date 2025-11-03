/**
 * Puppeteer-based Mermaid renderer
 * Uses a real browser to render diagrams, avoiding DOMPurify issues
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { RenderOptions, RenderResult } from '../types/index.js';
import { detectDiagramType } from './mermaid.js';

let browser: Browser | null = null;

/**
 * Initialize Puppeteer browser
 */
async function initBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
  }
  return browser;
}

/**
 * Render diagram using Puppeteer
 */
export async function renderDiagramWithPuppeteer(
  code: string,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const startTime = Date.now();
  
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  try {
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Create HTML with Mermaid
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    
    mermaid.initialize({
      startOnLoad: false,
      theme: '${options.config?.theme || 'default'}',
      securityLevel: 'loose',
      fontFamily: '${options.config?.fontFamily || 'Arial, sans-serif'}',
      logLevel: 'error'
    });
    
    window.mermaid = mermaid;
    window.renderReady = true;
  </script>
</head>
<body>
  <div id="diagram"></div>
</body>
</html>
    `;
    
    await page.setContent(html);
    
    // Wait for Mermaid to be ready
    await page.waitForFunction('window.renderReady === true', { timeout: 10000 });
    
    // Render the diagram
    const result = await page.evaluate(async (diagramCode) => {
      try {
        const diagramId = 'mermaid-diagram';
        const { svg } = await (window as any).mermaid.render(diagramId, diagramCode);
        
        // Extract dimensions
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        
        const width = parseInt(svgEl?.getAttribute('width') || '800');
        const height = parseInt(svgEl?.getAttribute('height') || '600');
        
        return { svg, width, height };
      } catch (error: any) {
        throw new Error(error.message || 'Rendering failed');
      }
    }, code);
    
    const renderTime = Date.now() - startTime;
    
    // Generate metadata
    const diagramType = detectDiagramType(code);
    const nodeCount = (code.match(/\w+(?:\[.*?\])?/g) || []).length;
    const edgeCount = (code.match(/--[->]?|==>[>]?|\.\.[->]?/g) || []).length;
    
    return {
      svg: result.svg,
      width: result.width,
      height: result.height,
      errors: [],
      warnings: [],
      metadata: {
        diagramType: diagramType || 'unknown',
        nodeCount,
        edgeCount,
        renderTime
      }
    };
    
  } catch (error: any) {
    throw new Error(`Puppeteer rendering failed: ${error.message}`);
  } finally {
    await page.close();
  }
}

/**
 * Cleanup browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
