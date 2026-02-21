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

// ── File & node types ──

export interface FileInfo {
  name: string;
  path: string;
  type: FileType;
  hasHypothesis: boolean;
  status: DocStatus;
  signals: ContentSignals;
  modifiedAt: number;  // timestamp ms from fs.statSync().mtimeMs
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

export interface GraphData {
  context: ProjectContext;
  nodes: DesignOsNode[];
  edges: GraphEdge[];
  globalReadiness: number;
  history: HistoryEntry[];
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'flow' | 'dependency' | 'nogo';
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
