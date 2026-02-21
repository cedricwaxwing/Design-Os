import * as fs from 'fs';
import * as path from 'path';

/**
 * Readiness data persisted by /o and /health in .claude/readiness.json.
 * The extension reads this file — it never calculates readiness itself.
 */

export interface NodeReadiness {
  score: number;
  verdict: string;
  action: string | null;
}

export interface ReadinessData {
  module: string;
  updatedAt: string;
  updatedBy: string;
  globalScore: number;
  nodes: Record<string, NodeReadiness>;
}

/**
 * Load readiness from .claude/readiness.json.
 * Returns null if file doesn't exist or is invalid → all scores default to 0.
 */
export function loadReadiness(root: string): ReadinessData | null {
  const filePath = path.join(root, '.claude', 'readiness.json');
  if (!fs.existsSync(filePath)) { return null; }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch { return null; }
}

/** Get a node's readiness score (0–100). Returns 0 if no data. */
export function getNodeScore(data: ReadinessData | null, nodeId: string): number {
  if (!data) { return 0; }
  return data.nodes[nodeId]?.score ?? 0;
}

/** Get a node's verdict string. Returns 'not-ready' if no data. */
export function getNodeVerdict(data: ReadinessData | null, nodeId: string): string {
  if (!data) { return 'not-ready'; }
  return data.nodes[nodeId]?.verdict ?? 'not-ready';
}

/** Get a node's recommended action. Returns null if no data. */
export function getNodeAction(data: ReadinessData | null, nodeId: string): string | null {
  if (!data) { return null; }
  return data.nodes[nodeId]?.action ?? null;
}

/** Get global readiness score. Returns 0 if no data. */
export function getGlobalScore(data: ReadinessData | null): number {
  if (!data) { return 0; }
  return data.globalScore ?? 0;
}
