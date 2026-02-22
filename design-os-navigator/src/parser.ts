import * as fs from 'fs';
import * as path from 'path';
import {
  ProjectContext, DesignOsNode, FileInfo, FileType, CommandInfo,
  GraphEdge, GraphData, ContentSignals, SectionDetail, HistoryEntry,
  RecommendedAction, emptySignals, aggregateSignals, DocStatus,
  FlowNode, FlowEdge, FlowGraph,
} from './types';
import { loadReadiness, getNodeScore, getNodeChildren, getGlobalScore, ReadinessData, loadReadinessHistory } from './readiness';

// ═══════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════

export function parseProject(workspaceRoot: string): GraphData {
  const context = parseContext(workspaceRoot);
  const readinessData = loadReadiness(workspaceRoot);
  const nodes = buildNodes(workspaceRoot, context, readinessData);
  const edges = buildEdges(nodes);
  const history = parseHistory(workspaceRoot);
  const globalReadiness = getGlobalScore(readinessData);
  const readinessHistory = loadReadinessHistory(workspaceRoot);
  return { context, nodes, edges, globalReadiness, history, readinessHistory };
}

// ═══════════════════════════════════════════════════════
// CONTENT SIGNALS — Deep file scanning
// ═══════════════════════════════════════════════════════

export function scanContentSignals(content: string, templateType?: string): ContentSignals {
  if (!content) { return emptySignals(); }

  const hypothesisCount = (content.match(/\[HYPOTHESE\]/gi) || []).length;
  const contradictionCount = (content.match(/\[CONTRADICTOIRE/gi) || []).length;
  const validatedCount = (content.match(/\[VALID[EÉ]\s*[—–-]/gi) || []).length;
  const tbdCount = (content.match(/\bTBD\b|[ÀA]\s*DEFINIR/gi) || []).length;

  // Placeholders: {field_name} but not {module} (legitimate variable)
  const templatePlaceholders = (content.match(/\{[a-z_]+\}/g) || [])
    .filter(p => p !== '{module}').length;
  const blankTokens = (content.match(/#______/g) || []).length;
  // HTML comment blocks that look like template instructions
  const commentBlocks = (content.match(/<!--\s*(GENERATED|Replace|END GENERATED|Add|Fill)[^>]*-->/gi) || []).length;
  const placeholderCount = templatePlaceholders + blankTokens + commentBlocks;

  const uncheckedCount = (content.match(/- \[ \]/g) || []).length;
  const checkedCount = (content.match(/- \[[xX]\]/g) || []).length;

  const status = extractDocStatus(content);

  // Section analysis
  const sectionResult = templateType
    ? countTemplateSections(content, templateType)
    : countGenericSections(content);

  const { filled: sectionsFilled, total: sectionsTotal } = sectionResult;

  // Completeness: ratio of filled to total elements
  const totalElements = sectionsTotal + uncheckedCount + checkedCount + placeholderCount;
  const filledElements = sectionsFilled + checkedCount;
  let completeness = 0;
  if (totalElements > 0) {
    completeness = filledElements / totalElements;
  } else if (content.trim().length > 100) {
    // Has real content but no measurable structure — give partial credit
    completeness = placeholderCount > 0 ? 0.3 : 0.7;
  }

  // Reliability factor
  const reliability = calculateReliability({
    hypothesisCount, contradictionCount, status,
    sectionsTotal: sectionsTotal || 1,
  });

  return {
    hypothesisCount, contradictionCount, validatedCount, tbdCount,
    placeholderCount, uncheckedCount, checkedCount, status,
    sectionsFilled, sectionsTotal, completeness, reliability,
  };
}

function calculateReliability(params: {
  hypothesisCount: number;
  contradictionCount: number;
  status: DocStatus;
  sectionsTotal: number;
}): number {
  let base = 1.0;
  const { hypothesisCount, contradictionCount, status, sectionsTotal } = params;

  if (hypothesisCount > 0) {
    base *= Math.pow(0.5, hypothesisCount / Math.max(sectionsTotal, 1));
  }
  if (contradictionCount > 0) {
    base *= Math.pow(0.25, contradictionCount / Math.max(sectionsTotal, 1));
  }
  if (status === 'DRAFT') { base *= 0.7; }
  // VALIDEE keeps base unchanged (×1.0)

  return Math.max(0, Math.min(1, base));
}

function extractDocStatus(content: string): DocStatus {
  // Check for explicit status lines
  if (/status\s*:\s*VALIDEE|Statut\s*:\s*VALIDEE|\bVALIDEE\b/i.test(content)) { return 'VALIDEE'; }
  if (/status\s*:\s*LIVREE|Statut\s*:\s*LIVREE/i.test(content)) { return 'LIVREE'; }
  if (/status\s*:\s*EN COURS|Statut\s*:\s*EN COURS/i.test(content)) { return 'EN COURS'; }
  if (/status\s*:\s*DRAFT|Statut\s*:\s*DRAFT|\bDRAFT\b/i.test(content)) { return 'DRAFT'; }
  return undefined;
}

// ═══════════════════════════════════════════════════════
// TEMPLATE SECTION COUNTING
// ═══════════════════════════════════════════════════════

interface SectionCount {
  filled: number;
  total: number;
  sections: SectionDetail[];
}

function countTemplateSections(content: string, templateType: string): SectionCount {
  switch (templateType) {
    case 'persona': return countPersonaSections(content);
    case 'spec': return countSpecSections(content);
    case 'domain': return countDomainSections(content);
    case 'review': return countReviewSections(content);
    case 'token': return countTokenSections(content);
    default: return countGenericSections(content);
  }
}

function countPersonaSections(content: string): SectionCount {
  const expectedSections = [
    'Role', 'Key Need', 'Pain', 'Context', 'Goals', 'Frustrations', 'Quote',
  ];
  return matchExpectedSections(content, expectedSections);
}

function countSpecSections(content: string): SectionCount {
  const expectedSections = [
    'Vue d\'ensemble', 'Acceptance criteria', 'Layout', 'Etats', 'Navigation',
    'Donnees', 'Design System', 'Roles', 'Hors perimetre',
  ];
  return matchExpectedSections(content, expectedSections);
}

function countDomainSections(content: string): SectionCount {
  return countGenericSections(content);
}

function countReviewSections(content: string): SectionCount {
  const expectedSections = ['Criteres', 'Scores', 'Gaps', 'Verdict'];
  return matchExpectedSections(content, expectedSections);
}

function countTokenSections(content: string): SectionCount {
  // Count color groups: Primary, Secondary, Neutral, Success/Error/Warning, etc.
  const totalTokenSlots = (content.match(/#______/g) || []).length;
  const filledTokens = (content.match(/#[0-9A-Fa-f]{6}\b/g) || []).length;
  const total = totalTokenSlots + filledTokens;
  const filled = filledTokens;

  const sections: SectionDetail[] = [];
  // Detect token groups by ## headers
  const headers = content.match(/^##\s+(.+)$/gm) || [];
  for (const h of headers) {
    const name = h.replace(/^##\s+/, '');
    const idx = content.indexOf(h);
    const nextHeader = content.indexOf('\n## ', idx + 1);
    const sectionContent = content.slice(idx, nextHeader === -1 ? undefined : nextHeader);
    const hasBlank = sectionContent.includes('#______');
    sections.push({
      name,
      filled: !hasBlank && sectionContent.length > h.length + 10,
      hasHypothesis: /\[HYPOTHESE\]/i.test(sectionContent),
      hasContradiction: /\[CONTRADICTOIRE/i.test(sectionContent),
    });
  }

  return { filled, total: total || sections.length, sections };
}

function matchExpectedSections(content: string, expectedSections: string[]): SectionCount {
  const contentLower = content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const sections: SectionDetail[] = [];
  let filled = 0;

  for (const name of expectedSections) {
    const nameLower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const found = contentLower.includes(nameLower);
    let isFilled = false;
    let hasHypothesis = false;
    let hasContradiction = false;

    if (found) {
      // Find section content after the header
      const idx = contentLower.indexOf(nameLower);
      const afterHeader = content.slice(idx + name.length, idx + name.length + 500);
      const contentAfter = afterHeader.replace(/^[#\s:\-|]+/, '').trim();
      // Check if section has real content (not just placeholders)
      isFilled = contentAfter.length > 20
        && !contentAfter.startsWith('{')
        && !contentAfter.startsWith('#______')
        && !contentAfter.startsWith('<!-- ');
      hasHypothesis = /\[HYPOTHESE\]/i.test(afterHeader);
      hasContradiction = /\[CONTRADICTOIRE/i.test(afterHeader);
    }

    if (isFilled) { filled++; }
    sections.push({ name, filled: isFilled, hasHypothesis, hasContradiction });
  }

  return { filled, total: expectedSections.length, sections };
}

function countGenericSections(content: string): SectionCount {
  const headers = content.match(/^##\s+(.+)$/gm) || [];
  const sections: SectionDetail[] = [];
  let filled = 0;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    const name = h.replace(/^##\s+/, '');
    const idx = content.indexOf(h);
    const nextIdx = i + 1 < headers.length ? content.indexOf(headers[i + 1], idx + 1) : content.length;
    const sectionContent = content.slice(idx + h.length, nextIdx).trim();

    const hasRealContent = sectionContent.length > 30
      && !/^\{[a-z_]+\}/.test(sectionContent)
      && !sectionContent.startsWith('#______')
      && !sectionContent.startsWith('<!-- GENERATED');

    const hasHypothesis = /\[HYPOTHESE\]/i.test(sectionContent);
    const hasContradiction = /\[CONTRADICTOIRE/i.test(sectionContent);

    if (hasRealContent) { filled++; }
    sections.push({ name, filled: hasRealContent, hasHypothesis, hasContradiction });
  }

  return { filled, total: headers.length, sections };
}

// ═══════════════════════════════════════════════════════
// CONTEXT & HISTORY PARSING
// ═══════════════════════════════════════════════════════

function parseContext(root: string): ProjectContext {
  const contextPath = path.join(root, '.claude', 'context.md');
  const profilePath = path.join(root, '.claude', 'profile.md');

  const context: ProjectContext = {
    module: '', moduleLabel: '', pillar: '', intent: '', profile: '', language: 'fr',
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
    context.language = extractYamlField(content, 'language') || 'fr';
  }

  return context;
}

function extractYamlField(content: string, field: string): string {
  const regex = new RegExp(`^${field}:[ \\t]*(.+)$`, 'm');
  const match = content.match(regex);
  if (!match) { return ''; }
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

export function parseHistory(root: string): HistoryEntry[] {
  const memoryPath = path.join(root, '.claude', 'memory.md');
  if (!fs.existsSync(memoryPath)) { return []; }

  const content = fs.readFileSync(memoryPath, 'utf-8');
  const entries: HistoryEntry[] = [];

  // Format: ### YYYY-MM-DD  or lines like  - [/agent] description
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

  return entries.slice(-20); // last 20 entries
}

// ═══════════════════════════════════════════════════════
// FILE LISTING WITH SIGNAL SCANNING
// ═══════════════════════════════════════════════════════

function listFiles(dirPath: string): FileInfo[] {
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

      files.push({
        name: entry.name,
        path: filePath,
        type: fileType,
        hasHypothesis: signals.hypothesisCount > 0,
        status: signals.status,
        signals,
        modifiedAt,
      });
    }
  }

  return files;
}

function listFilesRecursive(dirPath: string): FileInfo[] {
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

        files.push({
          name: entry.name,
          path: fullPath,
          type: fileType,
          hasHypothesis: signals.hypothesisCount > 0,
          status: signals.status,
          signals,
          modifiedAt,
        });
      }
    }
  }

  walk(dirPath);
  return files;
}

function safeRead(filePath: string): string {
  try { return fs.readFileSync(filePath, 'utf-8'); }
  catch { return ''; }
}

function safeStatMtime(filePath: string): number {
  try { return fs.statSync(filePath).mtimeMs; }
  catch { return 0; }
}

function fileTypeToTemplateType(type: FileType): string | undefined {
  switch (type) {
    case 'persona': return 'persona';
    case 'spec': return 'spec';
    case 'domain': return 'domain';
    case 'review': return 'review';
    case 'token': return 'token';
    default: return undefined;
  }
}

function inferFileType(filename: string, dirPath: string): FileType {
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

// ═══════════════════════════════════════════════════════
// SKILL DISCOVERY — Dynamic scanning of .claude/skills/
// ═══════════════════════════════════════════════════════

interface DiscoveredSkill {
  command: string;       // e.g. "/discovery"
  name: string;          // e.g. "discovery"
  label: string;         // First sentence of description
  description: string;   // Full description
  tags: string[];
}

/** Tag-to-node mapping for skills whose name doesn't match a node ID directly. */
const TAG_TO_NODES: Record<string, string[]> = {
  'onboarding': ['strategy', 'design-system'],
  'setup': ['strategy'],
  'orchestrator': ['strategy'],
  'coordination': ['strategy'],
  'wireframe': ['ux'],
  'layout': ['ux'],
  'explore': ['lab'],
  'prototype': ['lab'],
  'health': ['review'],
  'diagnostic': ['review'],
  'screen-map': ['ux'],
  'mapping': ['ux'],
};

/** Known node IDs in the graph */
const NODE_IDS = ['material', 'strategy', 'discovery', 'ux', 'design-system', 'spec', 'ui', 'build', 'review', 'lab'];

/**
 * Scan .claude/skills/ and parse YAML frontmatter from each SKILL.md.
 * Returns only user-invocable skills.
 */
function discoverSkills(root: string): DiscoveredSkill[] {
  const skillsDir = path.join(root, '.claude', 'skills');
  if (!fs.existsSync(skillsDir)) { return []; }

  const skills: DiscoveredSkill[] = [];
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) { continue; }
    const skillPath = path.join(skillsDir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) { continue; }

    const content = safeRead(skillPath);
    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) { continue; }

    const name = extractFmField(frontmatter, 'name');
    if (!name) { continue; }

    // Only include user-invocable skills
    const invocable = extractFmField(frontmatter, 'user-invocable');
    if (invocable === 'false') { continue; }

    // Extract panel-description (dedicated UX copy) or fallback to parsed description
    const panelDesc = extractFmField(frontmatter, 'panel-description');
    let desc: string;
    let label: string;

    if (panelDesc) {
      desc = panelDesc;
      label = panelDesc;
    } else {
      const description = extractFmMultiline(frontmatter, 'description');
      const sentences = description.split(/\.\s/);
      label = sentences.length > 1
        ? sentences[1].trim()
        : sentences[0].replace(/^Agent .+? — /, '').trim();
      desc = sentences.length > 2
        ? sentences.slice(2).join('. ').replace(/\s*Use when .+$/i, '').trim()
        : '';
    }

    // Extract tags
    const tags = extractFmList(frontmatter, 'tags');

    skills.push({
      command: '/' + name,
      name,
      label: label || name,
      description: desc.slice(0, 140),
      tags,
    });
  }

  return skills;
}

/**
 * Map discovered skills to graph node IDs.
 * Returns a Record<nodeId, CommandInfo[]>.
 */
function mapSkillsToNodes(skills: DiscoveredSkill[]): Record<string, CommandInfo[]> {
  const result: Record<string, CommandInfo[]> = {};

  for (const skill of skills) {
    const targetNodes: string[] = [];

    // Step 1: Direct name match
    if (NODE_IDS.includes(skill.name)) {
      targetNodes.push(skill.name);
    }

    // Step 2: Tag-based mapping (additive — can add to MORE nodes)
    for (const tag of skill.tags) {
      const mapped = TAG_TO_NODES[tag];
      if (mapped) {
        for (const nodeId of mapped) {
          if (!targetNodes.includes(nodeId)) {
            targetNodes.push(nodeId);
          }
        }
      }
    }

    // Step 3: No match → skip (global skill)
    if (targetNodes.length === 0) { continue; }

    const cmdInfo: CommandInfo = {
      command: skill.command,
      label: skill.label,
      description: skill.description,
    };

    for (const nodeId of targetNodes) {
      if (!result[nodeId]) { result[nodeId] = []; }
      result[nodeId].push(cmdInfo);
    }
  }

  return result;
}

// ── Frontmatter parsing helpers (no external YAML dependency) ──

function extractFrontmatter(content: string): string | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function extractFmField(fm: string, field: string): string {
  const regex = new RegExp(`^${field}:[ \\t]*(.+)$`, 'm');
  const match = fm.match(regex);
  return match ? match[1].trim() : '';
}

function extractFmMultiline(fm: string, field: string): string {
  // Handle YAML multi-line with > indicator
  const regex = new RegExp(`^${field}:\\s*>\\s*\\n((?:  .+\\n?)*)`, 'm');
  const match = fm.match(regex);
  if (match) {
    return match[1].replace(/^  /gm, '').replace(/\n/g, ' ').trim();
  }
  // Fallback: single-line
  return extractFmField(fm, field);
}

function extractFmList(fm: string, field: string): string[] {
  const regex = new RegExp(`^${field}:\\s*\\n((?:  - .+\\n?)*)`, 'm');
  const match = fm.match(regex);
  if (!match) { return []; }
  return match[1]
    .split('\n')
    .map(line => line.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);
}

// ═══════════════════════════════════════════════════════
// CONTEXTUAL DATA EXTRACTION
// ═══════════════════════════════════════════════════════

function extractStrategyContext(strategyDir: string): Record<string, unknown> {
  const northstarPath = path.join(strategyDir, 'northstar-vision.md');
  const ctx: Record<string, unknown> = { northStar: '', principles: [] as string[], antiGoals: [] as string[], successCriteria: [] as string[] };

  if (!fs.existsSync(northstarPath)) { return ctx; }
  const content = safeRead(northstarPath);
  if (!content) { return ctx; }

  // Extract North Star: first blockquote (> line)
  const quoteMatch = content.match(/^>\s*(.+)$/m);
  if (quoteMatch) { ctx.northStar = quoteMatch[1].trim(); }

  // Extract Principles: lines like "1. **Name** — explanation" or "- **Name** — explanation"
  const principleMatches = content.match(/^(?:\d+\.\s+|\-\s+)\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/gm);
  if (principleMatches) {
    ctx.principles = principleMatches.map(p => {
      const m = p.match(/\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/);
      return m ? m[1].trim() : p.replace(/^[\d.\-\s]+/, '').trim();
    });
  }

  // Extract Anti-Goals: bullets after "## Anti-Goals"
  const antiSection = content.match(/##\s*Anti.?Goals[\s\S]*?(?=\n##|\n$|$)/i);
  if (antiSection) {
    const bullets = antiSection[0].match(/^[-*]\s+(.+)$/gm);
    if (bullets) {
      ctx.antiGoals = bullets.map(b => b.replace(/^[-*]\s+/, '').trim()).filter(b => b.length > 1);
    }
  }

  // Extract Success Looks Like: bullets after "## Success"
  const successSection = content.match(/##\s*Success[\s\S]*?(?=\n##|\n$|$)/i);
  if (successSection) {
    const bullets = successSection[0].match(/^[-*]\s+(.+)$/gm);
    if (bullets) {
      ctx.successCriteria = bullets.map(b => b.replace(/^[-*]\s+/, '').trim()).filter(b => b.length > 1);
    }
  }

  return ctx;
}

function extractDiscoveryContext(files: FileInfo[]): Record<string, unknown> {
  let patternCount = 0;
  let jtbdCount = 0;
  let opportunityCount = 0;

  for (const f of files) {
    if (!f.name.endsWith('.md')) { continue; }
    const content = safeRead(f.path);
    if (!content) { continue; }
    patternCount += (content.match(/\[PATTERN\]/gi) || []).length;
    jtbdCount += (content.match(/\[JTBD\]/gi) || []).length;
    opportunityCount += (content.match(/\[OPPORTUNIT/gi) || []).length;
  }

  return {
    patternCount,
    jtbdCount,
    opportunityCount,
    // hypothesisCount and contradictionCount already in signals
  };
}

function extractDesignSystemContext(dsBase: string, dsFiles: FileInfo[]): Record<string, unknown> {
  const tokensPath = path.join(dsBase, 'tokens.md');
  let tokensDefined = 0;
  let tokensPlaceholder = 0;
  let componentCount = 0;

  if (fs.existsSync(tokensPath)) {
    const content = safeRead(tokensPath);
    if (content) {
      tokensPlaceholder = (content.match(/#______/g) || []).length;
      tokensDefined = (content.match(/#[0-9A-Fa-f]{6}\b/g) || []).length;
    }
  }

  // Count components from components.md sections (## headers)
  const componentsPath = path.join(dsBase, 'components.md');
  if (fs.existsSync(componentsPath)) {
    const content = safeRead(componentsPath);
    if (content) {
      const headers = content.match(/^##\s+/gm);
      componentCount = headers ? headers.length : 0;
    }
  }

  const tokensTotal = tokensDefined + tokensPlaceholder;
  const tokenFillPct = tokensTotal > 0 ? Math.round((tokensDefined / tokensTotal) * 100) : 0;

  return {
    tokensDefined,
    tokensPlaceholder,
    tokensTotal,
    tokenFillPct,
    componentCount,
    fileCount: dsFiles.length,
  };
}

function extractSpecContext(
  specFiles: FileInfo[],
  screenFiles: FileInfo[],
  buildFileNames: string[],
  reviewFileNames: string[],
): Record<string, unknown> {
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const buildNamesLower = buildFileNames.map(n => n.toLowerCase());
  const reviewNamesLower = reviewFileNames.map(n => n.toLowerCase());

  // Build pipeline items
  const pipeline: Array<{
    id: string; name: string; label: string; path: string;
    status: string; completeness: number;
    hasBuilt: boolean; hasReview: boolean; isStale: boolean;
  }> = [];

  for (const f of specFiles) {
    const match = f.name.match(/^(\d+\.\d+)-(.+)\.spec\.md$/);
    if (!match) { continue; }
    const specId = match[1];
    const specSlug = match[2];

    // Cross-ref build: check if any build file contains the slug
    const slugVariants = [
      specSlug.toLowerCase(),                                    // overview-page
      specSlug.replace(/-/g, '').toLowerCase(),                  // overviewpage
    ];
    const hasBuilt = buildNamesLower.some(bn =>
      slugVariants.some(sv => bn.includes(sv))
    );

    // Cross-ref review: check if any review file contains the spec ID or slug
    const hasReview = reviewNamesLower.some(rn =>
      rn.includes(specId) || rn.includes(specSlug.toLowerCase())
    );

    // Determine effective stage
    let stage: string = f.status || 'DRAFT';
    if (hasReview) { stage = 'REVIEWED'; }
    else if (hasBuilt && (f.status === 'VALIDEE' || f.status === 'LIVREE')) { stage = 'BUILT'; }

    pipeline.push({
      id: specId,
      name: specSlug,
      label: specId + '-' + specSlug,
      path: f.path,
      status: stage,
      completeness: f.signals ? f.signals.completeness : 0,
      hasBuilt,
      hasReview,
      isStale: f.status === 'DRAFT' && f.modifiedAt > 0 && f.modifiedAt < sevenDaysAgo,
    });
  }

  // Sort by spec ID
  pipeline.sort((a, b) => {
    const [aMaj, aMin] = a.id.split('.').map(Number);
    const [bMaj, bMin] = b.id.split('.').map(Number);
    return aMaj !== bMaj ? aMaj - bMaj : aMin - bMin;
  });

  return {
    screenCount: screenFiles.length,
    specCount: specFiles.length,
    pipeline,
    staleCount: pipeline.filter(p => p.isStale).length,
  };
}

function extractMaterialContext(materialFiles: FileInfo[], discoveryFiles: FileInfo[]): Record<string, unknown> {
  let latestDiscovery = 0;
  for (const f of discoveryFiles) {
    if (f.modifiedAt > latestDiscovery) { latestDiscovery = f.modifiedAt; }
  }

  const newFiles: string[] = [];
  for (const f of materialFiles) {
    if (latestDiscovery === 0 || f.modifiedAt > latestDiscovery) {
      newFiles.push(f.name);
    }
  }

  return {
    totalFiles: materialFiles.length,
    newFiles,
    newCount: newFiles.length,
  };
}

// ═══════════════════════════════════════════════════════
// MERMAID FLOW PARSING
// ═══════════════════════════════════════════════════════

/** Parse a mermaid flowchart block into FlowNode[] + FlowEdge[]. */
export function parseMermaidFlow(mermaidCode: string): { direction: 'LR' | 'TD'; nodes: FlowNode[]; edges: FlowEdge[] } {
  const lines = mermaidCode.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
  let direction: 'LR' | 'TD' = 'LR';
  const nodesMap = new Map<string, FlowNode>();
  const edges: FlowEdge[] = [];

  // Detect direction
  const dirLine = lines.find(l => /^flowchart\s+(LR|TD|TB|RL)/i.test(l));
  if (dirLine) {
    const m = dirLine.match(/flowchart\s+(LR|TD|TB|RL)/i);
    if (m) direction = (m[1] === 'TB' ? 'TD' : m[1]) as 'LR' | 'TD';
  }

  function addNode(id: string, label: string, type: FlowNode['type']) {
    if (!nodesMap.has(id)) {
      nodesMap.set(id, { id, label, type });
    }
  }

  function detectNodeType(id: string, label: string, bracket: string): FlowNode['type'] {
    if (bracket === '(' || bracket === '([') return 'terminal';
    if (bracket === '{') return 'decision';
    if (/erreur|error/i.test(label)) return 'error';
    return 'screen';
  }

  // Node patterns: A[text], A([text]), A{text}, A(text)
  const nodePatterns = [
    { re: /([A-Za-z_]\w*)\(\[([^\]]*)\]\)/g, bracket: '([' },   // A([text])
    { re: /([A-Za-z_]\w*)\{([^}]*)\}/g, bracket: '{' },          // A{text}
    { re: /([A-Za-z_]\w*)\[([^\]]*)\]/g, bracket: '[' },          // A[text]
    { re: /([A-Za-z_]\w*)\(([^)]*)\)/g, bracket: '(' },           // A(text)
  ];

  // Edge patterns: A -->|label| B or A --> B
  const edgeRe = /([A-Za-z_]\w*)\s*-->(?:\|([^|]*)\|)?\s*([A-Za-z_]\w*)/g;

  for (const line of lines) {
    if (/^flowchart|^graph|^style|^classDef|^class\s/i.test(line)) {
      // Parse style lines for color
      const styleMatch = line.match(/^style\s+(\w+)\s+fill:(#[0-9A-Fa-f]+)/);
      if (styleMatch) {
        const node = nodesMap.get(styleMatch[1]);
        if (node) node.color = styleMatch[2];
      }
      continue;
    }

    // Extract nodes from the line
    for (const pat of nodePatterns) {
      let m;
      pat.re.lastIndex = 0;
      while ((m = pat.re.exec(line)) !== null) {
        addNode(m[1], m[2], detectNodeType(m[1], m[2], pat.bracket));
      }
    }

    // Extract edges from the line
    let em;
    edgeRe.lastIndex = 0;
    while ((em = edgeRe.exec(line)) !== null) {
      edges.push({ from: em[1], to: em[3], label: em[2] || undefined });
      // Ensure nodes exist even if defined inline without brackets
      if (!nodesMap.has(em[1])) addNode(em[1], em[1], 'screen');
      if (!nodesMap.has(em[3])) addNode(em[3], em[3], 'screen');
    }
  }

  return { direction, nodes: Array.from(nodesMap.values()), edges };
}

/** Auto-layout flow nodes using BFS layers. */
export function layoutFlowNodes(nodes: FlowNode[], edges: FlowEdge[], direction: 'LR' | 'TD'): void {
  if (nodes.length === 0) return;

  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    const list = adj.get(e.from);
    if (list) list.push(e.to);
  }

  // Find root: node with no incoming edges
  const hasIncoming = new Set(edges.map(e => e.to));
  let root = nodes.find(n => !hasIncoming.has(n.id));
  if (!root) root = nodes[0];

  // BFS layering
  const layers: string[][] = [];
  const visited = new Set<string>();
  const queue: { id: string; depth: number }[] = [{ id: root.id, depth: 0 }];
  visited.add(root.id);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (!layers[depth]) layers[depth] = [];
    layers[depth].push(id);

    for (const next of (adj.get(id) || [])) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push({ id: next, depth: depth + 1 });
      }
    }
  }

  // Add unvisited nodes to last layer
  for (const n of nodes) {
    if (!visited.has(n.id)) {
      if (!layers[layers.length - 1]) layers.push([]);
      layers[layers.length - 1].push(n.id);
    }
  }

  // Assign positions
  const nodeW = 180;
  const nodeH = 70;
  const gapX = direction === 'LR' ? 220 : 120;
  const gapY = direction === 'LR' ? 100 : 140;

  for (let d = 0; d < layers.length; d++) {
    const layer = layers[d];
    const totalHeight = layer.length * (direction === 'LR' ? gapY : gapX);
    const startOffset = -(totalHeight - (direction === 'LR' ? gapY : gapX)) / 2;

    for (let i = 0; i < layer.length; i++) {
      const node = nodes.find(n => n.id === layer[i]);
      if (!node) continue;

      if (direction === 'LR') {
        node.x = 40 + d * gapX;
        node.y = 60 + startOffset + i * gapY + totalHeight / 2;
      } else {
        node.x = 40 + startOffset + i * gapX + totalHeight / 2;
        node.y = 60 + d * gapY;
      }
    }
  }
}

/** Extract UX context: count journeys (SVG) and flows (MD with mermaid). */
function extractUxContext(journeyFiles: FileInfo[]): Record<string, unknown> {
  const journeys = journeyFiles.filter(f =>
    f.name.endsWith('.svg') && !f.name.startsWith('_template')
  );
  const flowFiles = journeyFiles.filter(f =>
    f.name.endsWith('.md') && !f.name.startsWith('_template') && !f.name.startsWith('README')
  );

  const flows: { name: string; path: string; nodeCount: number }[] = [];
  for (const f of flowFiles) {
    const content = safeRead(f.path);
    const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)```/);
    if (mermaidMatch) {
      const parsed = parseMermaidFlow(mermaidMatch[1]);
      flows.push({
        name: f.name.replace(/\.md$/, '').replace(/^flow-/, ''),
        path: f.path,
        nodeCount: parsed.nodes.length,
      });
    }
  }

  return {
    journeyCount: journeys.length,
    flowCount: flows.length,
    flows,
  };
}

// ═══════════════════════════════════════════════════════
// NODE BUILDING
// ═══════════════════════════════════════════════════════

function buildNodes(root: string, context: ProjectContext, readinessData: ReadinessData | null): DesignOsNode[] {
  const mod = context.module;
  const nodes: DesignOsNode[] = [];

  // ── Discover skills dynamically ──
  const skills = discoverSkills(root);
  const skillMap = mapSkillsToNodes(skills);

  // --- Material ---
  const materialFiles = listFilesRecursive(path.join(root, '01_Product', '00 Material'));

  // --- Strategy ---
  const strategyFiles = listFilesRecursive(path.join(root, '01_Product', '01 Strategy'));
  const strategySig = aggregateSignals(strategyFiles);

  // Extract strategy context from northstar-vision.md
  const strategyContext = extractStrategyContext(path.join(root, '01_Product', '01 Strategy'));

  nodes.push({
    id: 'strategy',
    label: 'Strategy',
    phase: 'strategy',
    readiness: 0,
    fileCount: strategyFiles.length,
    files: strategyFiles,
    signals: strategySig,
    sections: [],
    commands: skillMap['strategy'] || [],
    dependsOn: ['material'],
    unlocks: ['discovery'],
    status: strategyFiles.length > 0 ? 'ready' : 'empty',
    contextData: strategyContext,
  });

  // --- Discovery ---
  const discoveryBase = path.join(root, '01_Product', '02 Discovery');
  const domainFiles = listFilesRecursive(path.join(discoveryBase, '01 Domain Context'));
  const interviewFiles = listFilesRecursive(path.join(discoveryBase, '02 User Interviews'));
  const insightFiles = listFilesRecursive(path.join(discoveryBase, '03 Research Insights'));
  const personaFiles = listFilesRecursive(path.join(discoveryBase, '04 Personas'));
  const allDiscoveryFiles = [...domainFiles, ...interviewFiles, ...insightFiles, ...personaFiles];
  const discoverySig = aggregateSignals(allDiscoveryFiles);
  const discoverySections: SectionDetail[] = [];

  // Count discovery-specific markers across all files
  const discoveryContext = extractDiscoveryContext(allDiscoveryFiles);

  nodes.push({
    id: 'discovery',
    label: 'Discovery',
    phase: 'discovery',
    readiness: 0,
    fileCount: allDiscoveryFiles.length,
    files: allDiscoveryFiles,
    signals: discoverySig,
    sections: discoverySections,
    commands: skillMap['discovery'] || [],
    dependsOn: ['strategy'],
    unlocks: ['ux'],
    children: (() => {
      const dc = getNodeChildren(readinessData, 'discovery');
      return [
        makeChildNode('discovery-domain', 'Domain Context', 'discovery', domainFiles, dc['discovery-domain']?.score ?? 0),
        makeChildNode('discovery-personas', 'Personas', 'discovery', personaFiles, dc['discovery-personas']?.score ?? 0),
        makeChildNode('discovery-interviews', 'Interviews', 'discovery', interviewFiles, dc['discovery-interviews']?.score ?? 0),
        makeChildNode('discovery-insights', 'Research Insights', 'discovery', insightFiles, dc['discovery-insights']?.score ?? 0),
      ];
    })(),
    status: allDiscoveryFiles.length > 0 ? 'active' : 'empty',
    contextData: discoveryContext,
  });

  // --- Material (inserted after discovery so we can compare mtimes) ---
  const matCtx = extractMaterialContext(materialFiles, allDiscoveryFiles);
  const matNewCount = (matCtx.newCount as number) || 0;
  const materialCmds = skillMap['material'] || [];
  const discoveryCmd = (skillMap['discovery'] || []).find(c => c.command === '/discovery');
  if (discoveryCmd && !materialCmds.some(c => c.command === '/discovery')) {
    materialCmds.push(discoveryCmd);
  }

  nodes.unshift({
    id: 'material',
    label: 'Material',
    phase: 'strategy',
    readiness: 0,
    fileCount: materialFiles.length,
    files: materialFiles,
    signals: aggregateSignals(materialFiles),
    sections: [],
    commands: materialCmds,
    dependsOn: [],
    unlocks: ['strategy', 'discovery'],
    status: materialFiles.length === 0 ? 'empty' : (matNewCount > 0 ? 'blocked' : 'ready'),
    contextData: matCtx,
  });

  // --- UX Design ---
  const uxBase = path.join(root, '01_Product', '03 User Journeys');
  const uxFiles = listFilesRecursive(uxBase);
  const screenMapPath = mod
    ? path.join(root, '01_Product', '04 Specs', mod, '00_screen-map.md')
    : '';
  const hasScreenMap = screenMapPath ? fs.existsSync(screenMapPath) : false;
  const screenMapSignals = hasScreenMap
    ? scanContentSignals(safeRead(screenMapPath))
    : emptySignals();
  const allUxFiles = [...uxFiles];
  if (hasScreenMap) {
    allUxFiles.push({
      name: '00_screen-map.md',
      path: screenMapPath,
      type: 'other',
      hasHypothesis: screenMapSignals.hypothesisCount > 0,
      status: screenMapSignals.status,
      signals: screenMapSignals,
      modifiedAt: safeStatMtime(screenMapPath),
    });
  }

  const uxContext = extractUxContext(uxFiles);

  nodes.push({
    id: 'ux',
    label: 'UX Design',
    phase: 'ux',
    readiness: 0,
    fileCount: allUxFiles.length,
    files: allUxFiles,
    signals: aggregateSignals(allUxFiles),
    sections: [],
    commands: skillMap['ux'] || [],
    dependsOn: ['discovery'],
    unlocks: ['spec', 'ui'],
    status: hasScreenMap || uxFiles.length > 0 ? 'active' : 'empty',
    contextData: uxContext,
  });

  // --- Spec ---
  const specBase = mod ? path.join(root, '01_Product', '04 Specs', mod, 'specs') : '';
  const specFiles = specBase ? listFilesRecursive(specBase) : [];
  const screenBase = mod ? path.join(root, '01_Product', '04 Specs', mod, 'screens') : '';
  const screenFiles = screenBase ? listFilesRecursive(screenBase) : [];
  const allSpecFiles = [...specFiles, ...screenFiles];
  const specSections = collectSectionsFromFiles(specFiles);

  // Collect build/review file names early for spec cross-reference
  const buildDir = mod ? path.join(root, '02_Build', mod, 'src') : '';
  const srcFileNames = buildDir && fs.existsSync(buildDir)
    ? listFilesRecursive(buildDir).map(f => f.name) : [];
  const reviewDir = mod ? path.join(root, '03_Review', mod) : '';
  const reviewFileNames = reviewDir && fs.existsSync(reviewDir)
    ? listFilesRecursive(reviewDir).map(f => f.name) : [];

  const specContext = extractSpecContext(specFiles, screenFiles, srcFileNames, reviewFileNames);

  nodes.push({
    id: 'spec',
    label: 'Spec',
    phase: 'spec',
    readiness: 0,
    fileCount: allSpecFiles.length,
    files: allSpecFiles,
    signals: aggregateSignals(allSpecFiles),
    sections: specSections,
    commands: skillMap['spec'] || [],
    dependsOn: ['ux'],
    unlocks: ['build'],
    status: specFiles.length > 0 ? 'active' : 'empty',
    contextData: specContext,
  });

  // --- UI ---
  nodes.push({
    id: 'ui',
    label: 'UI Design',
    phase: 'ui',
    readiness: 0,
    fileCount: screenFiles.length,
    files: screenFiles,
    signals: aggregateSignals(screenFiles),
    sections: [],
    commands: skillMap['ui'] || [],
    dependsOn: ['ux'],
    unlocks: ['spec'],
    status: screenFiles.length > 0 ? 'active' : 'empty',
  });

  // --- Design System ---
  const dsBase = path.join(root, '01_Product', '05 Design System');
  const dsFiles = listFiles(dsBase);

  // Extract design system context (token fill rate, component count)
  const dsContext = extractDesignSystemContext(dsBase, dsFiles);

  nodes.push({
    id: 'design-system',
    label: 'Design System',
    phase: 'strategy',
    readiness: 0,
    fileCount: dsFiles.length,
    files: dsFiles,
    signals: aggregateSignals(dsFiles),
    sections: [],
    commands: skillMap['design-system'] || [],
    dependsOn: [],
    unlocks: ['ui', 'build'],
    status: dsFiles.length > 0 ? 'ready' : 'empty',
    contextData: dsContext,
  });

  // --- Build ---
  const buildBase = mod ? path.join(root, '02_Build', mod) : '';
  const srcFiles = buildBase ? listFilesRecursive(path.join(buildBase, 'src')) : [];
  const testFiles = buildBase ? listFilesRecursive(path.join(buildBase, 'tests')) : [];
  const allBuildFiles = [...srcFiles, ...testFiles];

  nodes.push({
    id: 'build',
    label: 'Build',
    phase: 'build',
    readiness: 0,
    fileCount: allBuildFiles.length,
    files: allBuildFiles,
    signals: aggregateSignals(allBuildFiles),
    sections: [],
    commands: skillMap['build'] || [],
    dependsOn: ['spec'],
    unlocks: ['review'],
    status: srcFiles.length > 0 ? 'active' : 'empty',
  });

  // --- Review ---
  const reviewBase = mod ? path.join(root, '03_Review', mod) : '';
  const reviewFiles = reviewBase ? listFilesRecursive(reviewBase) : [];

  nodes.push({
    id: 'review',
    label: 'Review',
    phase: 'review',
    readiness: 0,
    fileCount: reviewFiles.length,
    files: reviewFiles,
    signals: aggregateSignals(reviewFiles),
    sections: collectSectionsFromFiles(reviewFiles),
    commands: skillMap['review'] || [],
    dependsOn: ['build'],
    unlocks: [],
    status: reviewFiles.length > 0 ? 'active' : 'empty',
  });

  // --- Lab ---
  const labBase = mod ? path.join(root, '04_Lab', mod) : path.join(root, '04_Lab');
  const labFiles = listFilesRecursive(labBase);

  nodes.push({
    id: 'lab',
    label: 'Lab',
    phase: 'lab',
    readiness: 0,
    fileCount: labFiles.length,
    files: labFiles,
    signals: aggregateSignals(labFiles),
    sections: [],
    commands: skillMap['lab'] || [],
    dependsOn: [],
    unlocks: ['discovery', 'ux', 'spec'],
    status: labFiles.length > 0 ? 'active' : 'empty',
  });

  // ── Load readiness from persisted .claude/readiness.json ──
  for (const node of nodes) {
    node.readiness = getNodeScore(readinessData, node.id);
  }

  // Assign recommended actions based on lowest-scoring upstream
  assignRecommendedActions(nodes);

  return nodes;
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function makeChildNode(id: string, label: string, phase: Phase, files: FileInfo[], readinessScore: number): DesignOsNode {
  return {
    id, label, phase,
    readiness: readinessScore,
    fileCount: files.length,
    files,
    signals: emptySignals(),
    sections: [],
    commands: [],
    dependsOn: [],
    unlocks: [],
    status: files.length > 0 ? 'ready' : 'empty',
  };
}

function collectSectionsFromFiles(files: FileInfo[]): SectionDetail[] {
  const all: SectionDetail[] = [];
  for (const f of files) {
    if (f.signals.sectionsTotal > 0) {
      const content = safeRead(f.path);
      const templateType = fileTypeToTemplateType(f.type);
      const result = templateType
        ? countTemplateSections(content, templateType)
        : countGenericSections(content);
      all.push(...result.sections);
    }
  }
  return all;
}

function assignRecommendedActions(nodes: DesignOsNode[]): void {
  // Find the first node in the pipeline that is below 80%
  const pipeline = ['strategy', 'discovery', 'ux', 'spec', 'build', 'review'];
  const actionMap: Record<string, RecommendedAction> = {
    strategy: {
      command: '/onboarding', label: 'Configurer le projet',
      reason: 'Le contexte strategique est incomplet', priority: 'high',
    },
    discovery: {
      command: '/discovery', label: 'Enrichir la discovery',
      reason: 'Personas et/ou domain context insuffisants', priority: 'high',
    },
    ux: {
      command: '/ux', label: 'Explorer des directions UX',
      reason: 'Pas de screen map ou journey defini', priority: 'medium',
    },
    spec: {
      command: '/spec', label: 'Generer les specs',
      reason: 'Specs manquantes ou en DRAFT', priority: 'medium',
    },
    build: {
      command: '/build', label: 'Coder en TDD',
      reason: 'Code source manquant', priority: 'medium',
    },
    review: {
      command: '/review', label: 'Lancer la review',
      reason: 'Code non review', priority: 'low',
    },
  };

  for (const phaseId of pipeline) {
    const node = nodes.find(n => n.id === phaseId);
    if (node && node.readiness < 80) {
      node.recommendedAction = actionMap[phaseId];

      // Customize reason based on signals
      if (phaseId === 'discovery' && node.signals.hypothesisCount > 0) {
        node.recommendedAction = {
          ...actionMap[phaseId],
          command: '/discovery hypotheses',
          reason: `${node.signals.hypothesisCount} hypothese(s) a valider`,
        };
      }
      break; // Only one recommended action at a time
    }
  }

  // Material: separate from main pipeline — recommend if new files exist
  const materialNode = nodes.find(n => n.id === 'material');
  if (materialNode && materialNode.contextData) {
    const newCount = (materialNode.contextData as Record<string, unknown>).newCount as number || 0;
    if (newCount > 0 && !materialNode.recommendedAction) {
      materialNode.recommendedAction = {
        command: '/discovery',
        label: 'Traiter le material',
        reason: `${newCount} fichier(s) non traite(s) dans Material`,
        priority: 'high',
      };
    }
  }
}

type Phase = import('./types').Phase;

function buildEdges(nodes: DesignOsNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [
    // Main flow
    { from: 'material', to: 'strategy', type: 'flow' },
    { from: 'strategy', to: 'discovery', type: 'flow' },
    { from: 'discovery', to: 'ux', type: 'flow' },
    { from: 'ux', to: 'spec', type: 'flow' },
    { from: 'ux', to: 'ui', type: 'flow' },
    { from: 'ui', to: 'spec', type: 'dependency' },
    { from: 'spec', to: 'build', type: 'flow' },
    { from: 'build', to: 'review', type: 'flow' },
    // Design system feeds into UI and Build
    { from: 'design-system', to: 'ui', type: 'dependency' },
    { from: 'design-system', to: 'build', type: 'dependency' },
    // Lab influences Discovery, UX and Spec (experimentation space)
    { from: 'lab', to: 'discovery', type: 'dependency' },
    { from: 'lab', to: 'ux', type: 'dependency' },
    { from: 'lab', to: 'spec', type: 'dependency' },
  ];

  // Check for NO-GO in review files — add nogo edges
  const reviewNode = nodes.find(n => n.id === 'review');
  if (reviewNode) {
    const hasNoGo = reviewNode.files.some(f => {
      const content = safeRead(f.path);
      return /NO-GO|NO_GO/i.test(content);
    });
    if (hasNoGo) {
      edges.push({ from: 'review', to: 'build', type: 'nogo' });
    }
  }

  return edges;
}
