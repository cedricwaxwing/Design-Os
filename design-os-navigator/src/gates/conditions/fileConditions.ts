/**
 * File-based gate conditions
 * Reusable condition functions for checking file existence, content, etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { GateEvalContext } from '../schema';
import type { FileInfo } from '../../types-legacy';

/**
 * Check if a file exists at the given relative path.
 */
export function fileExists(ctx: GateEvalContext, relativePath: string): boolean {
  const fullPath = path.join(ctx.root, relativePath);
  return fs.existsSync(fullPath);
}

/**
 * Check if a file has meaningful content (not just template/scaffold).
 */
export function fileHasContent(ctx: GateEvalContext, relativePath: string, minLength = 100): boolean {
  const fullPath = path.join(ctx.root, relativePath);
  if (!fs.existsSync(fullPath)) return false;

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const stripped = content
      .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
      .replace(/^#.*$/gm, '')          // Remove headings
      .replace(/^\s*[-*]\s*$/gm, '')   // Remove empty list items
      .trim();
    return stripped.length >= minLength;
  } catch {
    return false;
  }
}

/**
 * Check if files exist and are not scaffolds.
 */
export function hasRealFiles(files: FileInfo[]): boolean {
  return files.some(f => !f.isScaffold);
}

/**
 * Count files that are not scaffolds.
 */
export function countRealFiles(files: FileInfo[]): number {
  return files.filter(f => !f.isScaffold).length;
}

/**
 * Check if any file has the given status.
 */
export function anyFileHasStatus(files: FileInfo[], status: string): boolean {
  return files.some(f => f.status === status);
}

/**
 * Check if all non-scaffold files have a specific status.
 */
export function allFilesHaveStatus(files: FileInfo[], status: string): boolean {
  const realFiles = files.filter(f => !f.isScaffold);
  return realFiles.length > 0 && realFiles.every(f => f.status === status);
}

/**
 * Read file content safely.
 */
export function safeRead(ctx: GateEvalContext, relativePath: string): string {
  const fullPath = path.join(ctx.root, relativePath);
  try {
    return fs.readFileSync(fullPath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Check if file matches a pattern.
 */
export function fileMatchesPattern(ctx: GateEvalContext, relativePath: string, pattern: RegExp): boolean {
  const content = safeRead(ctx, relativePath);
  return pattern.test(content);
}
