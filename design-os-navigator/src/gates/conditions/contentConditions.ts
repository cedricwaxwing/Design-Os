/**
 * Content-based gate conditions
 * Reusable condition functions for checking document content.
 */

import type { FileInfo, ContentSignals } from '../../types-legacy';

/**
 * Check if files have no remaining hypotheses (all validated).
 */
export function noHypotheses(files: FileInfo[]): boolean {
  const realFiles = files.filter(f => !f.isScaffold);
  if (realFiles.length === 0) return false;

  return realFiles.every(f => f.signals.hypothesisCount === 0);
}

/**
 * Check if any file has hypotheses.
 */
export function hasHypotheses(files: FileInfo[]): boolean {
  return files.some(f => f.hasHypothesis || f.signals.hypothesisCount > 0);
}

/**
 * Check if files have sufficient sections filled.
 */
export function sectionsFilled(files: FileInfo[], minSections: number): boolean {
  return files.some(f => f.signals.sectionsFilled >= minSections);
}

/**
 * Check average completeness across files.
 */
export function avgCompleteness(files: FileInfo[], minCompleteness: number): boolean {
  const realFiles = files.filter(f => !f.isScaffold);
  if (realFiles.length === 0) return false;

  const avg = realFiles.reduce((sum, f) => sum + f.signals.completeness, 0) / realFiles.length;
  return avg >= minCompleteness;
}

/**
 * Check average reliability across files.
 */
export function avgReliability(files: FileInfo[], minReliability: number): boolean {
  const realFiles = files.filter(f => !f.isScaffold);
  if (realFiles.length === 0) return false;

  const avg = realFiles.reduce((sum, f) => sum + f.signals.reliability, 0) / realFiles.length;
  return avg >= minReliability;
}

/**
 * Check if content contains a specific pattern.
 */
export function contentContains(content: string, pattern: RegExp): boolean {
  return pattern.test(content);
}

/**
 * Check if content has a section with minimum content length.
 */
export function sectionHasContent(content: string, sectionHeader: string, minLength = 10): boolean {
  const regex = new RegExp(`${sectionHeader}[\\s\\S]*?(?=\\n##|$)`, 'i');
  const match = content.match(regex);
  if (!match) return false;

  const stripped = match[0]
    .replace(new RegExp(`${sectionHeader}`, 'i'), '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^>\s*$/gm, '')
    .trim();

  return stripped.length >= minLength;
}

/**
 * Check for VALIDEE status in content.
 */
export function hasValideeStatus(content: string): boolean {
  return /status\s*:\s*VALIDEE|Statut\s*:\s*VALIDEE|\bVALIDEE\b/i.test(content);
}

/**
 * Check for GO verdict in review content.
 */
export function hasGoVerdict(content: string): boolean {
  return /verdict\s*:\s*GO\b|##.*\bGO\b|\*\*GO\*\*/i.test(content);
}

/**
 * Count pattern occurrences.
 */
export function countPattern(content: string, pattern: RegExp): number {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}
