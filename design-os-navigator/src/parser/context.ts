/**
 * Context Parsing Module
 *
 * Parse project context, history, and memory entries.
 * Extracted from parser-legacy for modularity.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ProjectContext, HistoryEntry, MemoryEntry } from '../types';

/**
 * Parse project context from .claude/context.md and .claude/profile.md
 */
export function parseContext(root: string): ProjectContext {
  const contextPath = path.join(root, '.claude', 'context.md');
  const profilePath = path.join(root, '.claude', 'profile.md');

  const context: ProjectContext = {
    module: '', moduleLabel: '', pillar: '', intent: '', profile: '', language: 'en',
  };

  if (fs.existsSync(contextPath)) {
    const content = fs.readFileSync(contextPath, 'utf-8');
    context.module = extractYamlField(content, 'module');
    context.moduleLabel = extractYamlField(content, 'module-label');
    context.pillar = extractYamlField(content, 'pillar');
    context.intent = extractYamlField(content, 'intent') || 'epic';
  }

  if (fs.existsSync(profilePath)) {
    const content = fs.readFileSync(profilePath, 'utf-8');
    context.profile = extractYamlField(content, 'profile') || 'designer';
    context.language = extractYamlField(content, 'language') || 'en';
  }

  return context;
}

/**
 * Extract YAML-style field from content
 */
export function extractYamlField(content: string, field: string): string {
  const regex = new RegExp(`^${field}:[ \\t]*(.+)$`, 'm');
  const match = content.match(regex);
  if (!match) { return ''; }
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

/**
 * Parse history entries from memory.md
 */
export function parseHistory(root: string): HistoryEntry[] {
  const memoryPath = path.join(root, '.claude', 'memory.md');
  if (!fs.existsSync(memoryPath)) { return []; }

  const content = fs.readFileSync(memoryPath, 'utf-8');
  const entries: HistoryEntry[] = [];

  let currentDate = '';
  for (const line of content.split('\n')) {
    const dateMatch = line.match(/^###?\s+(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      currentDate = dateMatch[1];
      continue;
    }
    const entryMatch = line.match(/^-\s+\[?\/?(\w[\w-]*)\]?\s*[—–:-]\s*(.+)/);
    if (entryMatch && currentDate) {
      entries.push({
        date: currentDate,
        agent: entryMatch[1],
        action: entryMatch[2].trim(),
      });
    }
  }

  return entries.slice(-20);
}

/**
 * Parse full memory.md entry blocks for the Activity Log feed
 */
export function parseMemoryEntries(root: string): MemoryEntry[] {
  const memoryPath = path.join(root, '.claude', 'memory.md');
  if (!fs.existsSync(memoryPath)) { return []; }

  const content = fs.readFileSync(memoryPath, 'utf-8');
  const entries: MemoryEntry[] = [];

  const headerRe = /^##\s+\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\]\s+(\S+)\s+[—–-]\s+(\S+)/gm;
  let match: RegExpExecArray | null;
  const headers: { index: number; date: string; module: string; agent: string; fullMatch: string }[] = [];

  while ((match = headerRe.exec(content)) !== null) {
    headers.push({
      index: match.index,
      date: match[1],
      module: match[2],
      agent: match[3],
      fullMatch: match[0],
    });
  }

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    const start = h.index + h.fullMatch.length;
    const end = i + 1 < headers.length ? headers[i + 1].index : content.length;
    const blockContent = content.slice(start, end).trim();
    const title = `[${h.date}] ${h.module} — ${h.agent}`;
    const id = `${h.date}-${h.module}-${h.agent}`.replace(/[^a-zA-Z0-9-]/g, '_');

    entries.push({
      id,
      date: h.date,
      module: h.module,
      agent: h.agent,
      title,
      content: blockContent,
    });
  }

  return entries;
}

/**
 * Extract frontmatter from markdown content
 */
export function extractFrontmatter(content: string): string | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

/**
 * Extract field from frontmatter
 */
export function extractFmField(fm: string, field: string): string {
  const regex = new RegExp(`^${field}:[ \\t]*(.+)$`, 'm');
  const match = fm.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Extract multiline field from frontmatter (with > indicator)
 */
export function extractFmMultiline(fm: string, field: string): string {
  const regex = new RegExp(`^${field}:\\s*>\\s*\\n((?:  .+\\n?)*)`, 'm');
  const match = fm.match(regex);
  if (match) {
    return match[1].replace(/^  /gm, '').replace(/\n/g, ' ').trim();
  }
  return extractFmField(fm, field);
}

/**
 * Extract list from frontmatter
 */
export function extractFmList(fm: string, field: string): string[] {
  const regex = new RegExp(`^${field}:\\s*\\n((?:  - .+\\n?)*)`, 'm');
  const match = fm.match(regex);
  if (!match) { return []; }
  return match[1]
    .split('\n')
    .map(line => line.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);
}
