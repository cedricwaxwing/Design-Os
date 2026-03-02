/**
 * File Operations Module
 *
 * File listing, type inference, and scaffold detection.
 * Extracted from parser-legacy for modularity.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { FileInfo, FileType, ContentSignals } from '../types';
import { scanContentSignals } from './signals';

/**
 * List files in a directory with content signals
 */
export function listFiles(dirPath: string): FileInfo[] {
  if (!fs.existsSync(dirPath)) { return []; }

  const files: FileInfo[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
      const filePath = path.join(dirPath, entry.name);
      const content = entry.name.endsWith('.md') ? safeRead(filePath) : '';
      const fileType = inferFileType(entry.name, dirPath);
      const signals = scanContentSignals(content, fileTypeToTemplateType(fileType));
      const modifiedAt = safeStatMtime(filePath);
      const isScaffold = entry.name.endsWith('.md') ? detectScaffold(entry.name, content, signals) : false;

      files.push({
        name: entry.name,
        path: filePath,
        type: fileType,
        hasHypothesis: signals.hypothesisCount > 0,
        status: signals.status,
        signals,
        modifiedAt,
        isScaffold,
      });
    }
  }

  return files;
}

/**
 * List files recursively with content signals
 */
export function listFilesRecursive(dirPath: string): FileInfo[] {
  if (!fs.existsSync(dirPath)) { return []; }

  const files: FileInfo[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_')) {
        walk(fullPath);
      } else if (entry.isFile() && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
        const content = entry.name.endsWith('.md') ? safeRead(fullPath) : '';
        const fileType = inferFileType(entry.name, dir);
        const signals = scanContentSignals(content, fileTypeToTemplateType(fileType));
        const modifiedAt = safeStatMtime(fullPath);
        const isScaffold = entry.name.endsWith('.md') ? detectScaffold(entry.name, content, signals) : false;

        files.push({
          name: entry.name,
          path: fullPath,
          type: fileType,
          hasHypothesis: signals.hypothesisCount > 0,
          status: signals.status,
          signals,
          modifiedAt,
          isScaffold,
        });
      }
    }
  }

  walk(dirPath);
  return files;
}

/**
 * Count only real (non-scaffold) files
 */
export function countRealFiles(files: FileInfo[]): number {
  return files.filter(f => !f.isScaffold).length;
}

/**
 * Check if there are any real (non-scaffold) files
 */
export function hasRealFiles(files: FileInfo[]): boolean {
  return countRealFiles(files) > 0;
}

/**
 * Detect if a file is scaffold/framework (not user-generated content)
 */
export function detectScaffold(filename: string, content: string, signals: ContentSignals): boolean {
  if (filename === 'README.md') { return true; }
  if (!content || content.trim().length === 0) { return true; }

  const hasFrameworkHeader = /^>\s*(Source de verite|Remplis ce fichier|Ce fichier est auto-gen|Composants atomiques|Patterns reutilisables|Chaque composant.*DOIT|Les agents.*DOIVENT)/mi.test(content);
  if (hasFrameworkHeader) { return true; }

  if (signals.sectionsTotal > 0 && signals.sectionsFilled === 0) { return true; }
  if (signals.placeholderCount > 0 && signals.sectionsFilled === 0) { return true; }

  const hasTemplateMarkers = /\{[a-z_]+\}|\[Principle \d\]|\[explanation\]|\[terme\]|\[definition\]/.test(content);
  if (hasTemplateMarkers && signals.sectionsFilled <= 1) { return true; }

  const instructionComments = (content.match(/<!--\s*(?:GENERATED|Replace|END GENERATED|One sentence|[A-Z][a-z].*?\?|What|How|Who|In \d)/gi) || []).length;
  if (instructionComments >= 2 && signals.sectionsFilled <= 1) { return true; }

  const stripped = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\[(?:Principle \d|explanation|terme|definition|Regle \d|explication|description|.*?\.\.\.)\]/gi, '')
    .replace(/\{[a-z_]+\}/g, '')
    .replace(/^#+\s+.*$/gm, '')
    .replace(/^\s*[-|>\s*]+\s*$/gm, '')
    .replace(/\|\s*\|/g, '')
    .replace(/#______/g, '')
    .replace(/>\s*$/gm, '')
    .replace(/---/g, '')
    .replace(/\*\*\[.*?\]\*\*/g, '')
    .trim();
  if (stripped.length < 50) { return true; }

  return false;
}

/**
 * Infer file type from filename and directory path
 */
export function inferFileType(filename: string, dirPath: string): FileType {
  const dir = dirPath.toLowerCase();
  if (dir.includes('persona')) { return 'persona'; }
  if (dir.includes('interview') || dir.includes('transcripts')) { return 'interview'; }
  if (dir.includes('insight') || dir.includes('research')) { return 'insight'; }
  if (dir.includes('domain')) { return 'domain'; }
  if (dir.includes('material')) { return 'material'; }
  if (dir.includes('strategy') && filename.includes('brief')) { return 'brief'; }
  if (dir.includes('journey') || filename.includes('journey') || filename.includes('flow')) { return 'journey'; }
  if (dir.includes('screens') || filename.endsWith('.svg')) { return 'screen'; }
  if (dir.includes('specs') || filename.endsWith('.spec.md')) { return 'spec'; }
  if (dir.includes('design system') || dir.includes('tokens') || filename.includes('token')) { return 'token'; }
  if (dir.includes('review')) { return 'review'; }
  if (dir.includes('tests') || filename.includes('.test.') || filename.includes('.spec.')) { return 'test'; }
  if (dir.includes('src')) { return 'code'; }
  return 'other';
}

/**
 * Map file type to template type for signal scanning
 */
export function fileTypeToTemplateType(type: FileType): string | undefined {
  switch (type) {
    case 'persona': return 'persona';
    case 'spec': return 'spec';
    case 'domain': return 'domain';
    case 'review': return 'review';
    case 'token': return 'token';
    default: return undefined;
  }
}

/**
 * Safely read file content
 */
export function safeRead(filePath: string): string {
  try { return fs.readFileSync(filePath, 'utf-8'); }
  catch { return ''; }
}

/**
 * Safely get file modification time
 */
export function safeStatMtime(filePath: string): number {
  try { return fs.statSync(filePath).mtimeMs; }
  catch { return 0; }
}
