import * as fs from 'fs';
import * as path from 'path';
import {
  ProjectContext, DesignOsNode, FileInfo, FileType, CommandInfo,
  GraphEdge, GraphData, ContentSignals, SectionDetail, HistoryEntry,
  RecommendedAction, emptySignals, aggregateSignals, DocStatus,
} from './types';
import { calculateReadiness } from './readiness';

// ═══════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════

export function parseProject(workspaceRoot: string): GraphData {
  const context = parseContext(workspaceRoot);
  const nodes = buildNodes(workspaceRoot, context);
  const edges = buildEdges(nodes);
  const history = parseHistory(workspaceRoot);
  const globalReadiness = Math.round(
    nodes.reduce((sum, n) => sum + n.readiness, 0) / nodes.length
  );

  return { context, nodes, edges, globalReadiness, history };
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
  const regex = new RegExp(`^${field}:\\s*(.+)$`, 'm');
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
const NODE_IDS = ['strategy', 'discovery', 'ux', 'design-system', 'spec', 'ui', 'build', 'review', 'lab'];

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

    // Extract description (may be multi-line with > indicator)
    const description = extractFmMultiline(frontmatter, 'description');
    // Label = first sentence
    const label = description.split(/\.\s/)[0].replace(/^Agent \w+ — /, '').trim();

    // Extract tags
    const tags = extractFmList(frontmatter, 'tags');

    skills.push({
      command: '/' + name,
      name,
      label: label || name,
      description: description.slice(0, 120),
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
  const regex = new RegExp(`^${field}:\\s*(.+)$`, 'm');
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
// NODE BUILDING
// ═══════════════════════════════════════════════════════

function buildNodes(root: string, context: ProjectContext): DesignOsNode[] {
  const mod = context.module;
  const nodes: DesignOsNode[] = [];

  // ── Discover skills dynamically ──
  const skills = discoverSkills(root);
  const skillMap = mapSkillsToNodes(skills);

  // --- Strategy ---
  const strategyFiles = listFilesRecursive(path.join(root, '01_Product', '01 Strategy'));
  const materialFiles = listFilesRecursive(path.join(root, '01_Product', '00 Material'));
  const allStrategyFiles = [...strategyFiles, ...materialFiles];
  const strategySig = aggregateSignals(allStrategyFiles);

  // Also scan CLAUDE.md for strategy completeness
  const claudeMdPath = path.join(root, 'CLAUDE.md');
  const claudeSignals = fs.existsSync(claudeMdPath)
    ? scanContentSignals(safeRead(claudeMdPath))
    : emptySignals();

  nodes.push({
    id: 'strategy',
    label: 'Strategy',
    phase: 'strategy',
    readiness: 0,
    fileCount: allStrategyFiles.length,
    files: allStrategyFiles,
    signals: strategySig,
    sections: [],
    commands: skillMap['strategy'] || [],
    dependsOn: [],
    unlocks: ['discovery'],
    status: allStrategyFiles.length > 0 ? 'ready' : 'empty',
  });

  // --- Discovery ---
  const discoveryBase = path.join(root, '01_Product', '02 Discovery');
  const domainFiles = listFilesRecursive(path.join(discoveryBase, '01 Domain Context'));
  const interviewFiles = listFilesRecursive(path.join(discoveryBase, '02 User Interviews'));
  const insightFiles = listFilesRecursive(path.join(discoveryBase, '03 Research Insights'));
  const personaFiles = listFilesRecursive(path.join(discoveryBase, '04 Personas'));
  const allDiscoveryFiles = [...domainFiles, ...interviewFiles, ...insightFiles, ...personaFiles];
  const discoverySig = aggregateSignals(allDiscoveryFiles);
  const discoverySections = collectSectionsFromFiles([...personaFiles, ...domainFiles]);

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
    children: [
      makeChildNode('discovery-domain', 'Domain Context', 'discovery', domainFiles),
      makeChildNode('discovery-personas', 'Personas', 'discovery', personaFiles),
      makeChildNode('discovery-interviews', 'Interviews', 'discovery', interviewFiles),
      makeChildNode('discovery-insights', 'Research Insights', 'discovery', insightFiles),
    ],
    status: allDiscoveryFiles.length > 0 ? 'active' : 'empty',
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
  });

  // --- Spec ---
  const specBase = mod ? path.join(root, '01_Product', '04 Specs', mod, 'specs') : '';
  const specFiles = specBase ? listFilesRecursive(specBase) : [];
  const screenBase = mod ? path.join(root, '01_Product', '04 Specs', mod, 'screens') : '';
  const screenFiles = screenBase ? listFilesRecursive(screenBase) : [];
  const allSpecFiles = [...specFiles, ...screenFiles];
  const specSections = collectSectionsFromFiles(specFiles);

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

  nodes.push({
    id: 'design-system',
    label: 'Design System',
    phase: 'strategy',
    readiness: 0,
    fileCount: dsFiles.length,
    files: dsFiles,
    signals: aggregateSignals(dsFiles),
    sections: collectSectionsFromFiles(dsFiles.filter(f => f.type === 'token')),
    commands: skillMap['design-system'] || [],
    dependsOn: [],
    unlocks: ['ui', 'build'],
    status: dsFiles.length > 0 ? 'ready' : 'empty',
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
    unlocks: [],
    status: labFiles.length > 0 ? 'active' : 'empty',
  });

  // ── Calculate readiness & recommended actions ──
  for (const node of nodes) {
    node.readiness = calculateReadiness(node, nodes, { claudeSignals, screenMapSignals });
  }

  // Assign recommended actions based on lowest-scoring upstream
  assignRecommendedActions(nodes);

  return nodes;
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function makeChildNode(id: string, label: string, phase: Phase, files: FileInfo[]): DesignOsNode {
  return {
    id, label, phase,
    readiness: 0,
    fileCount: files.length,
    files,
    signals: aggregateSignals(files),
    sections: collectSectionsFromFiles(files),
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
}

type Phase = import('./types').Phase;

function buildEdges(nodes: DesignOsNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [
    // Main flow
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
