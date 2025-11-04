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
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                          '/usr/bin/chromium' || 
                          '/usr/bin/chromium-browser' || 
                          undefined;
    
    console.log('🏷️  CODE VERSION: 1.0.0-umd-static-dockerhub-v2 🏷️');
    console.log('🔍 Puppeteer executable path:', executablePath);
    console.log('🔍 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD:', process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD);
    console.log('🔍 PUPPETEER_SKIP_DOWNLOAD:', process.env.PUPPETEER_SKIP_DOWNLOAD);
    console.log('🔍 Node version:', process.version);
    console.log('🔍 Working directory:', process.cwd());
    
    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-crash-reporter',
        '--no-crash-upload',
        '--disable-breakpad',
        '--disable-extensions'
      ]
    });
    console.log('✅ Browser launched successfully');
  }
  return browser;
}

/**
 * Render diagram using Puppeteer
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function renderDiagramWithPuppeteer(
  code: string,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const startTime = Date.now();
  
  console.log('🎨 Starting diagram render...');
  console.log('📝 Diagram code:', code.substring(0, 100) + (code.length > 100 ? '...' : ''));
  
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  // Enable console logs from the browser page
  page.on('console', msg => console.log('🌐 Browser console:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('❌ Browser error:', error.message));
  page.on('requestfailed', request => console.error('❌ Request failed:', request.url(), request.failure()?.errorText));
  
  try {
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    console.log('✅ Viewport set');
    
    // Load Mermaid UMD bundle from local node_modules (NO internet required!)
    console.log('📦 Loading Mermaid from local UMD bundle...');
    const mermaidPath = join(__dirname, '../../node_modules/mermaid/dist/mermaid.min.js');
    const mermaidCode = readFileSync(mermaidPath, 'utf-8');
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script>
    // Inline Mermaid UMD library (no CDN dependency, no module resolution issues)
    ${mermaidCode}
    
    // Initialize mermaid (it's now available as global)
    mermaid.initialize({
      startOnLoad: false,
      theme: '${options.config?.theme || 'default'}',
      securityLevel: 'loose',
      fontFamily: '${options.config?.fontFamily || 'Arial, sans-serif'}',
      logLevel: 'error'
    });
    
    window.renderReady = true;
  </script>
</head>
<body>
  <div id="diagram"></div>
</body>
</html>
    `;
    
    console.log('📄 Setting page content...');
    await page.setContent(html);
    console.log('✅ Page content set');
    
    // Wait for Mermaid to be ready
    console.log('⏳ Waiting for Mermaid to load from CDN...');
    await page.waitForFunction('window.renderReady === true', { timeout: 30000 });
    console.log('✅ Mermaid loaded and ready');
    
    // Render the diagram
    console.log('🎨 Rendering diagram with Mermaid...');
    const result = await page.evaluate(async (diagramCode) => {
      try {
        console.log('Evaluating in browser context...');
        const diagramId = 'mermaid-diagram';
        const { svg } = await (window as any).mermaid.render(diagramId, diagramCode);
        console.log('SVG rendered, length:', svg.length);
        
        // Extract dimensions
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        
        const width = parseInt(svgEl?.getAttribute('width') || '800');
        const height = parseInt(svgEl?.getAttribute('height') || '600');
        console.log('Dimensions:', width, 'x', height);
        
        return { svg, width, height };
      } catch (error: any) {
        console.error('Rendering error in browser:', error);
        throw new Error(error.message || 'Rendering failed');
      }
    }, code);
    console.log('✅ Diagram rendered successfully');
    
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
