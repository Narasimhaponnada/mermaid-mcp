/**
 * File system utilities for Mermaid MCP Server
 */

import fs from 'fs/promises';
import path from 'path';
import { ExportOptions } from '../types/index.js';

/**
 * Save SVG content to file
 */
export async function saveSVG(
  svgContent: string, 
  filePath: string
): Promise<string> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write SVG file
    await fs.writeFile(filePath, svgContent, 'utf-8');
    
    return filePath;
  } catch (error) {
    console.error('Error saving SVG:', error);
    throw new Error(`Failed to save SVG: ${error}`);
  }
}

/**
 * Save binary content (PNG, PDF) to file
 */
export async function saveBinary(
  content: Buffer, 
  filePath: string
): Promise<string> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write binary file
    await fs.writeFile(filePath, content);
    
    return filePath;
  } catch (error) {
    console.error('Error saving binary file:', error);
    throw new Error(`Failed to save binary file: ${error}`);
  }
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error(`Failed to read file: ${error}`);
  }
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats
 */
export async function getFileStats(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    console.error('Error getting file stats:', error);
    throw new Error(`Failed to get file stats: ${error}`);
  }
}

/**
 * Generate output path for diagram
 */
export function generateOutputPath(
  options: ExportOptions,
  fallbackName: string = 'diagram'
): string {
  const filename = options.filename || `${fallbackName}.${options.format}`;
  const outputPath = options.path || process.cwd();
  
  return path.resolve(outputPath, filename);
}

/**
 * Ensure output directory exists
 */
export async function ensureOutputDirectory(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

/**
 * List files in directory with extension filter
 */
export async function listFiles(
  dirPath: string, 
  extensions?: string[]
): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    
    if (!extensions) {
      return files;
    }
    
    return files.filter((file: string) => {
      const ext = path.extname(file).toLowerCase();
      return extensions.includes(ext);
    });
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error(`Failed to list files: ${error}`);
  }
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(tempDir: string): Promise<void> {
  try {
    const files = await fs.readdir(tempDir);
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      // Remove files older than 1 hour
      if (Date.now() - stats.mtime.getTime() > 3600000) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.warn('Warning: Could not clean up temp files:', error);
  }
}