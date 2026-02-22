import * as fs from 'fs';
import * as path from 'path';
import { ReadinessSnapshot, DesignOsNode } from './types';

/**
 * Readiness data persisted by /o and /health in .claude/readiness.json.
 * The extension reads this file — it never calculates readiness itself.
 */

export interface ChildReadiness {
  score: number;
  label: string;
}

export interface NodeReadiness {
  score: number;
  verdict: string;
  action: string | null;
  children?: Record<string, ChildReadiness>;
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

/** Get children readiness for a node. Returns empty record if no data. */
export function getNodeChildren(data: ReadinessData | null, nodeId: string): Record<string, ChildReadiness> {
  if (!data) { return {}; }
  return data.nodes[nodeId]?.children ?? {};
}

/** Get global readiness score. Returns 0 if no data. */
export function getGlobalScore(data: ReadinessData | null): number {
  if (!data) { return 0; }
  return data.globalScore ?? 0;
}

// ── Baseline readiness auto-creation ──

function scoreToVerdict(score: number): string {
  if (score >= 80) { return 'ready'; }
  if (score >= 50) { return 'push'; }
  if (score >= 25) { return 'possible'; }
  if (score >= 10) { return 'premature'; }
  return 'not-ready';
}

/** Write a baseline readiness.json from estimated scores when none exists. */
export function writeBaselineReadiness(root: string, nodes: DesignOsNode[]): void {
  const data: ReadinessData = {
    module: '',
    updatedAt: new Date().toISOString(),
    updatedBy: 'navigator-auto',
    globalScore: Math.round(nodes.reduce((s, n) => s + n.readiness, 0) / nodes.length),
    nodes: {},
  };
  for (const node of nodes) {
    data.nodes[node.id] = {
      score: node.readiness,
      verdict: scoreToVerdict(node.readiness),
      action: null,
    };
  }
  const filePath = path.join(root, '.claude', 'readiness.json');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Readiness history persistence ──

const HISTORY_FILE = 'readiness-history.json';
const MAX_SNAPSHOTS = 50;

/** Load readiness history from .claude/readiness-history.json. */
export function loadReadinessHistory(root: string): ReadinessSnapshot[] {
  const filePath = path.join(root, '.claude', HISTORY_FILE);
  if (!fs.existsSync(filePath)) { return []; }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

/** Append a snapshot to .claude/readiness-history.json. Dedup + cap at 50. */
export function saveReadinessSnapshot(root: string, readinessData: ReadinessData): void {
  const history = loadReadinessHistory(root);

  const scores: Record<string, number> = {};
  for (const [nodeId, nodeData] of Object.entries(readinessData.nodes)) {
    scores[nodeId] = nodeData.score;
  }

  // Dedup: skip if scores identical to last snapshot
  if (history.length > 0) {
    const last = history[history.length - 1];
    const sameGlobal = last.globalScore === readinessData.globalScore;
    const sameScores = Object.keys(scores).length === Object.keys(last.scores).length
      && Object.entries(scores).every(([k, v]) => last.scores[k] === v);
    if (sameGlobal && sameScores) { return; }
  }

  history.push({ timestamp: Date.now(), globalScore: readinessData.globalScore, scores });

  while (history.length > MAX_SNAPSHOTS) { history.shift(); }

  const filePath = path.join(root, '.claude', HISTORY_FILE);
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2), 'utf-8');
}
