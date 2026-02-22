// ── Content analysis signals ──

export interface ContentSignals {
  hypothesisCount: number;
  contradictionCount: number;
  validatedCount: number;
  tbdCount: number;
  placeholderCount: number;
  uncheckedCount: number;
  checkedCount: number;
  status: DocStatus;
  sectionsFilled: number;
  sectionsTotal: number;
  completeness: number;   // 0–1
  reliability: number;    // 0–1
}

export interface SectionDetail {
  name: string;
  filled: boolean;
  hasHypothesis: boolean;
  hasContradiction: boolean;
}

export interface RecommendedAction {
  command: string;
  label: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface HistoryEntry {
  date: string;
  agent: string;
  action: string;
}

export type DocStatus = 'DRAFT' | 'VALIDEE' | 'EN COURS' | 'LIVREE' | undefined;

// ── Flow graph types (User Journey) ──

export interface FlowNode {
  id: string;
  label: string;
  type: 'screen' | 'decision' | 'terminal' | 'error';
  color?: string;
  x?: number;
  y?: number;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowGraph {
  name: string;
  path: string;
  direction: 'LR' | 'TD';
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// ── Gate-based maturity system ──

export interface GateCondition {
  id: string;
  label: string;
  met: boolean;
  command?: string;  // skill to run if not met
}

export type MaturityTag = 'VIDE' | 'AMORCE' | 'EN COURS' | 'COMPLET' | 'VALIDE';

export function deriveMaturity(gates: GateCondition[]): MaturityTag {
  if (gates.length === 0) { return 'VIDE'; }
  const ratio = gates.filter(g => g.met).length / gates.length;
  if (ratio === 0) { return 'VIDE'; }
  if (ratio < 0.4) { return 'AMORCE'; }
  if (ratio < 0.8) { return 'EN COURS'; }
  if (ratio < 1) { return 'COMPLET'; }
  return 'VALIDE';
}

// ── File & node types ──

export interface FileInfo {
  name: string;
  path: string;
  type: FileType;
  hasHypothesis: boolean;
  status: DocStatus;
  signals: ContentSignals;
  modifiedAt: number;  // timestamp ms from fs.statSync().mtimeMs
  isScaffold?: boolean;  // true = framework/template file, not user content
}

export type FileType =
  | 'spec' | 'screen' | 'persona' | 'insight' | 'interview'
  | 'domain' | 'token' | 'review' | 'code' | 'test' | 'brief'
  | 'journey' | 'material' | 'other';

export interface DesignOsNode {
  id: string;
  label: string;
  phase: Phase;
  readiness: number;
  isEstimated?: boolean;
  previousReadiness?: number;
  fileCount: number;
  files: FileInfo[];
  signals: ContentSignals;
  sections: SectionDetail[];
  commands: CommandInfo[];
  dependsOn: string[];
  unlocks: string[];
  children?: DesignOsNode[];
  recommendedAction?: RecommendedAction;
  status: 'ready' | 'active' | 'blocked' | 'empty';
  contextData?: Record<string, unknown>;
  gates: GateCondition[];
  maturity: MaturityTag;
}

export interface CommandInfo {
  command: string;
  label: string;
  description: string;
}

export type Phase =
  | 'strategy'
  | 'discovery'
  | 'ux'
  | 'spec'
  | 'ui'
  | 'build'
  | 'review'
  | 'lab';

export interface ProjectContext {
  module: string;
  moduleLabel: string;
  pillar: string;
  intent: string;
  profile: string;
  language: string;
}

export interface ReadinessSnapshot {
  timestamp: number;
  globalScore: number;
  scores: Record<string, number>;
}

export interface GraphData {
  context: ProjectContext;
  nodes: DesignOsNode[];
  edges: GraphEdge[];
  globalReadiness: number;
  history: HistoryEntry[];
  readinessHistory: ReadinessSnapshot[];
  sectionOrder?: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'flow' | 'dependency' | 'nogo';
  nogoGapType?: string;
  nogoGapCount?: number;
}

// ── Helpers ──

export function emptySignals(): ContentSignals {
  return {
    hypothesisCount: 0,
    contradictionCount: 0,
    validatedCount: 0,
    tbdCount: 0,
    placeholderCount: 0,
    uncheckedCount: 0,
    checkedCount: 0,
    status: undefined,
    sectionsFilled: 0,
    sectionsTotal: 0,
    completeness: 0,
    reliability: 1,
  };
}

export function aggregateSignals(files: FileInfo[]): ContentSignals {
  const agg = emptySignals();
  for (const f of files) {
    const s = f.signals;
    agg.hypothesisCount += s.hypothesisCount;
    agg.contradictionCount += s.contradictionCount;
    agg.validatedCount += s.validatedCount;
    agg.tbdCount += s.tbdCount;
    agg.placeholderCount += s.placeholderCount;
    agg.uncheckedCount += s.uncheckedCount;
    agg.checkedCount += s.checkedCount;
    agg.sectionsFilled += s.sectionsFilled;
    agg.sectionsTotal += s.sectionsTotal;
  }

  // Aggregate completeness
  if (agg.sectionsTotal > 0) {
    agg.completeness = agg.sectionsFilled / agg.sectionsTotal;
  } else if (files.length > 0) {
    agg.completeness = files.reduce((s, f) => s + f.signals.completeness, 0) / files.length;
  }

  // Aggregate reliability
  if (files.length > 0) {
    agg.reliability = files.reduce((s, f) => s + f.signals.reliability, 0) / files.length;
  }

  // Aggregate status: worst status wins
  const statuses = files.map(f => f.signals.status).filter(Boolean) as Exclude<DocStatus, undefined>[];
  if (statuses.includes('DRAFT')) { agg.status = 'DRAFT'; }
  else if (statuses.includes('EN COURS')) { agg.status = 'EN COURS'; }
  else if (statuses.includes('VALIDEE')) { agg.status = 'VALIDEE'; }
  else if (statuses.includes('LIVREE')) { agg.status = 'LIVREE'; }

  return agg;
}
