import { DesignOsNode, ContentSignals, emptySignals } from './types';

/**
 * Extra context passed from the parser that isn't stored on nodes directly.
 */
export interface ReadinessContext {
  claudeSignals: ContentSignals;
  screenMapSignals: ContentSignals;
}

/**
 * Calculates readiness score (0–100) for a node.
 * Uses the orchestrator's Product Readiness weights and reliability factors.
 */
export function calculateReadiness(
  node: DesignOsNode,
  allNodes: DesignOsNode[],
  ctx: ReadinessContext = { claudeSignals: emptySignals(), screenMapSignals: emptySignals() },
): number {
  switch (node.id) {
    case 'strategy': return scoreStrategy(node, ctx);
    case 'discovery': return scoreDiscovery(node, allNodes);
    case 'ux': return scoreUx(node, allNodes, ctx);
    case 'spec': return scoreSpec(node, allNodes, ctx);
    case 'ui': return scoreUi(node, allNodes);
    case 'design-system': return scoreDesignSystem(node);
    case 'build': return scoreBuild(node, allNodes);
    case 'review': return scoreReview(node, allNodes);
    case 'lab': return scoreLab(node);
    default: return 0;
  }
}

// ── Utility ──

/** Weighted contribution: value (0–1 or boolean) × weight × reliability */
function w(value: boolean | number, weight: number, reliability: number = 1): number {
  const v = typeof value === 'boolean' ? (value ? 1 : 0) : Math.min(1, Math.max(0, value));
  return v * weight * reliability;
}

/** Get a node's readiness by id */
function getReadiness(allNodes: DesignOsNode[], id: string): number {
  return allNodes.find(n => n.id === id)?.readiness ?? 0;
}

/** Get a child node by id */
function getChild(node: DesignOsNode, childId: string): DesignOsNode | undefined {
  return node.children?.find(c => c.id === childId);
}

/** Average completeness of files in a node, falling back to 0 */
function avgCompleteness(node: DesignOsNode): number {
  if (node.files.length === 0) return 0;
  return node.files.reduce((s, f) => s + f.signals.completeness, 0) / node.files.length;
}

/** Average reliability of files in a node */
function avgReliability(node: DesignOsNode): number {
  if (node.files.length === 0) return 1;
  return node.files.reduce((s, f) => s + f.signals.reliability, 0) / node.files.length;
}

/** Proportion of files with a given status */
function statusRatio(node: DesignOsNode, status: string): number {
  if (node.files.length === 0) return 0;
  return node.files.filter(f => f.status === status).length / node.files.length;
}

// ═══════════════════════════════════════════════════════
// SCORING FUNCTIONS — Orchestrator weights
// ═══════════════════════════════════════════════════════

/**
 * Strategy: 30% brief, 30% CLAUDE.md, 20% context.md, 20% material
 */
function scoreStrategy(node: DesignOsNode, ctx: ReadinessContext): number {
  // Brief: check if strategy files have real content
  const briefFiles = node.files.filter(f => f.type === 'brief' || f.name.toLowerCase().includes('brief'));
  const hasBrief = briefFiles.length > 0;
  const briefCompleteness = hasBrief
    ? briefFiles.reduce((s, f) => s + f.signals.completeness, 0) / briefFiles.length
    : 0;
  const briefReliability = hasBrief
    ? briefFiles.reduce((s, f) => s + f.signals.reliability, 0) / briefFiles.length
    : 1;

  // CLAUDE.md: check how configured it is (low placeholder count = good)
  const claudeConfigured = ctx.claudeSignals.placeholderCount === 0
    ? 1
    : Math.max(0, 1 - ctx.claudeSignals.placeholderCount / 20);

  // Material
  const materialFiles = node.files.filter(f => f.type === 'material');
  const hasMaterial = materialFiles.length > 0;

  // Context.md: if module is defined, it's configured
  // We don't have direct access to context.md content here, but claudeSignals
  // reflects CLAUDE.md completeness. For context.md, we check if module is defined
  // by looking at whether the node label implies it's set up.
  const contextConfigured = ctx.claudeSignals.completeness > 0.3 ? 1 : 0.2;

  const score =
    w(briefCompleteness, 30, briefReliability) +
    w(claudeConfigured, 30) +
    w(contextConfigured, 20) +
    w(hasMaterial, 20);

  return clamp(score);
}

/**
 * Discovery: 20% personas, 10% validated personas, 20% domain context,
 *            15% insights, 15% interviews, 10% material, 10% brief
 */
function scoreDiscovery(node: DesignOsNode, allNodes: DesignOsNode[]): number {
  const personas = getChild(node, 'discovery-personas');
  const domain = getChild(node, 'discovery-domain');
  const interviews = getChild(node, 'discovery-interviews');
  const insights = getChild(node, 'discovery-insights');

  const hasPersonas = (personas?.fileCount ?? 0) > 0;
  const personaReliability = personas ? avgReliability(personas) : 1;
  const personaCompleteness = personas ? avgCompleteness(personas) : 0;

  // Validated personas: those with [VALIDE —] marker
  const validatedPersonas = personas
    ? personas.files.filter(f => f.signals.validatedCount > 0).length / Math.max(1, personas.fileCount)
    : 0;

  const domainCompleteness = domain ? avgCompleteness(domain) : 0;
  const domainReliability = domain ? avgReliability(domain) : 1;

  const hasInsights = (insights?.fileCount ?? 0) > 0;
  const insightReliability = insights ? avgReliability(insights) : 1;

  const hasInterviews = (interviews?.fileCount ?? 0) > 0;
  const interviewReliability = interviews ? avgReliability(interviews) : 1;

  // Material: check strategy node
  const strategyNode = allNodes.find(n => n.id === 'strategy');
  const hasMaterial = strategyNode
    ? strategyNode.files.some(f => f.type === 'material')
    : false;

  // Brief
  const hasBrief = strategyNode
    ? strategyNode.files.some(f => f.type === 'brief' || f.name.toLowerCase().includes('brief'))
    : false;

  const score =
    w(hasPersonas && personaCompleteness > 0.3, 20, personaReliability) +
    w(validatedPersonas, 10) +
    w(domainCompleteness, 20, domainReliability) +
    w(hasInsights, 15, insightReliability) +
    w(hasInterviews, 15, interviewReliability) +
    w(hasMaterial, 10) +
    w(hasBrief, 10);

  return clamp(score);
}

/**
 * UX: 30% discovery≥50%, 15% personas, 15% brief, 15% screen map, 15% DS tokens, 10% journeys
 */
function scoreUx(node: DesignOsNode, allNodes: DesignOsNode[], ctx: ReadinessContext): number {
  const discoveryReady = getReadiness(allNodes, 'discovery') >= 50;
  const discoveryPartial = getReadiness(allNodes, 'discovery') >= 25;

  const discovery = allNodes.find(n => n.id === 'discovery');
  const hasPersonas = (getChild(discovery!, 'discovery-personas')?.fileCount ?? 0) > 0;

  const strategyNode = allNodes.find(n => n.id === 'strategy');
  const hasBrief = strategyNode
    ? strategyNode.files.some(f => f.type === 'brief' || f.name.toLowerCase().includes('brief'))
    : false;

  // Screen map completeness
  const screenMapComplete = ctx.screenMapSignals.completeness;
  const hasScreenMap = ctx.screenMapSignals.sectionsTotal > 0 || ctx.screenMapSignals.completeness > 0;

  const ds = allNodes.find(n => n.id === 'design-system');
  const hasDsTokens = (ds?.fileCount ?? 0) > 0 && (ds?.signals.completeness ?? 0) > 0.3;

  const hasJourneys = node.files.some(f => f.type === 'journey');

  const score =
    w(discoveryReady ? 1 : discoveryPartial ? 0.5 : 0, 30) +
    w(hasPersonas, 15) +
    w(hasBrief, 15) +
    w(hasScreenMap ? screenMapComplete : 0, 15) +
    w(hasDsTokens, 15) +
    w(hasJourneys, 10);

  return clamp(score);
}

/**
 * Spec: 25% ux≥50%, 20% screen map, 15% explored screens, 15% validated personas,
 *       10% DS complete, 15% user stories
 */
function scoreSpec(node: DesignOsNode, allNodes: DesignOsNode[], ctx: ReadinessContext): number {
  const uxReady = getReadiness(allNodes, 'ux') >= 50;

  const hasScreenMap = ctx.screenMapSignals.completeness > 0;
  const screenMapScore = ctx.screenMapSignals.completeness;

  // Explored screens = screen files in spec screens folder
  const screenCount = node.files.filter(f => f.type === 'screen').length;
  const hasScreens = screenCount > 0;

  // Validated personas
  const discovery = allNodes.find(n => n.id === 'discovery');
  const personas = getChild(discovery!, 'discovery-personas');
  const hasValidatedPersonas = personas
    ? personas.files.some(f => f.signals.validatedCount > 0)
    : false;

  // DS completeness
  const ds = allNodes.find(n => n.id === 'design-system');
  const dsComplete = (ds?.signals.completeness ?? 0) > 0.5;

  // User stories / specs
  const specFiles = node.files.filter(f => f.type === 'spec');
  const hasSpecs = specFiles.length > 0;
  const specCompleteness = hasSpecs
    ? specFiles.reduce((s, f) => s + f.signals.completeness, 0) / specFiles.length
    : 0;
  const specReliability = hasSpecs
    ? specFiles.reduce((s, f) => s + f.signals.reliability, 0) / specFiles.length
    : 1;

  const score =
    w(uxReady, 25) +
    w(screenMapScore, 20) +
    w(hasScreens, 15) +
    w(hasValidatedPersonas, 15) +
    w(dsComplete, 10) +
    w(specCompleteness, 15, specReliability);

  return clamp(score);
}

/**
 * UI: 30% screens, 30% DS, 20% UX decisions, 20% specs
 */
function scoreUi(node: DesignOsNode, allNodes: DesignOsNode[]): number {
  const hasScreens = node.fileCount > 0;
  const ds = allNodes.find(n => n.id === 'design-system');
  const dsReady = (ds?.readiness ?? 0) > 30;
  const uxReady = getReadiness(allNodes, 'ux') >= 50;
  const specExists = (allNodes.find(n => n.id === 'spec')?.fileCount ?? 0) > 0;

  const score =
    w(hasScreens, 30) +
    w(dsReady, 30) +
    w(uxReady, 20) +
    w(specExists, 20);

  return clamp(score);
}

/**
 * Design System: 40% tokens filled, 20% UX laws, 20% components, 20% patterns
 */
function scoreDesignSystem(node: DesignOsNode): number {
  if (node.fileCount === 0) return 0;

  // Token file analysis
  const tokenFiles = node.files.filter(f => f.name.includes('token'));
  let tokenFillRatio = 0;
  if (tokenFiles.length > 0) {
    const totalSlots = tokenFiles.reduce(
      (s, f) => s + f.signals.placeholderCount + f.signals.sectionsFilled, 0
    );
    const filledSlots = tokenFiles.reduce((s, f) => s + f.signals.sectionsFilled, 0);
    tokenFillRatio = totalSlots > 0 ? filledSlots / totalSlots : 0;

    // Alternative: if we can't detect sections, use completeness
    if (totalSlots === 0) {
      tokenFillRatio = tokenFiles.reduce((s, f) => s + f.signals.completeness, 0) / tokenFiles.length;
    }
  }

  const hasUxLaws = node.files.some(f => f.name.includes('ux-law') || f.name.includes('ux_law'));
  const hasComponents = node.files.some(f => f.name.includes('component'));
  const hasPatterns = node.files.some(f => f.name.includes('pattern'));

  const score =
    w(tokenFillRatio, 40) +
    w(hasUxLaws, 20) +
    w(hasComponents, 20) +
    w(hasPatterns, 20);

  return clamp(score);
}

/**
 * Build: 40% validated spec, 15% DS tokens, 15% components, 15% tech stack, 15% dev env
 */
function scoreBuild(node: DesignOsNode, allNodes: DesignOsNode[]): number {
  // Validated spec
  const spec = allNodes.find(n => n.id === 'spec');
  const validatedSpecs = spec?.files.filter(f => f.status === 'VALIDEE') || [];
  const hasValidatedSpec = validatedSpecs.length > 0;
  const specReliability = hasValidatedSpec
    ? validatedSpecs.reduce((s, f) => s + f.signals.reliability, 0) / validatedSpecs.length
    : 1;
  const hasDraftSpec = (spec?.fileCount ?? 0) > 0;

  // DS tokens
  const ds = allNodes.find(n => n.id === 'design-system');
  const dsTokensComplete = (ds?.signals.completeness ?? 0) > 0.5;

  // Components documented
  const hasComponents = ds?.files.some(f => f.name.includes('component')) ?? false;

  // Tech stack and dev env: infer from build files or CLAUDE.md
  const hasSrcFiles = node.files.filter(f => f.type === 'code').length > 0;
  const hasTests = node.files.filter(f => f.type === 'test').length > 0;

  const score =
    w(hasValidatedSpec ? 1 : hasDraftSpec ? 0.3 : 0, 40, specReliability) +
    w(dsTokensComplete, 15) +
    w(hasComponents, 15) +
    w(hasSrcFiles || hasTests, 15) +  // proxy for tech stack being defined
    w(hasSrcFiles, 15);               // proxy for dev env

  return clamp(score);
}

/**
 * Review: 40% code exists, 30% validated spec, 20% tests, 10% build≥50%
 */
function scoreReview(node: DesignOsNode, allNodes: DesignOsNode[]): number {
  const build = allNodes.find(n => n.id === 'build');
  const hasCode = (build?.files.filter(f => f.type === 'code').length ?? 0) > 0;
  const hasTests = (build?.files.filter(f => f.type === 'test').length ?? 0) > 0;

  const spec = allNodes.find(n => n.id === 'spec');
  const hasValidatedSpec = spec?.files.some(f => f.status === 'VALIDEE') ?? false;

  const buildReady = getReadiness(allNodes, 'build') >= 50;

  const score =
    w(hasCode, 40) +
    w(hasValidatedSpec, 30) +
    w(hasTests, 20) +
    w(buildReady, 10);

  return clamp(score);
}

/**
 * Lab: always accessible — 50% base, 100% if has content
 */
function scoreLab(node: DesignOsNode): number {
  return node.fileCount > 0 ? 100 : 50;
}

// ── Helper ──

function clamp(score: number): number {
  return Math.round(Math.min(100, Math.max(0, score)));
}
