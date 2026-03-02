/**
 * Content Signals Module
 *
 * Deep file scanning for content quality signals.
 * Extracted from parser-legacy for modularity.
 */

import type { ContentSignals, DocStatus, SectionDetail } from '../types';

/**
 * Scan content for quality signals (hypotheses, contradictions, completeness, etc.)
 */
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
  const commentBlocks = (content.match(/<!--\s*(GENERATED|Replace|END GENERATED|Add|Fill)[^>]*-->/gi) || []).length;
  const placeholderCount = templatePlaceholders + blankTokens + commentBlocks;

  const uncheckedCount = (content.match(/- \[ \]/g) || []).length;
  const checkedCount = (content.match(/- \[[xX]\]/g) || []).length;

  const status = extractDocStatus(content);

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
    completeness = placeholderCount > 0 ? 0.3 : 0.7;
  }

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

/**
 * Create empty signals object
 */
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

  return Math.max(0, Math.min(1, base));
}

function extractDocStatus(content: string): DocStatus {
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
  const totalTokenSlots = (content.match(/#______/g) || []).length;
  const filledTokens = (content.match(/#[0-9A-Fa-f]{6}\b/g) || []).length;
  const total = totalTokenSlots + filledTokens;
  const filled = filledTokens;

  const sections: SectionDetail[] = [];
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
      const idx = contentLower.indexOf(nameLower);
      const afterHeader = content.slice(idx + name.length, idx + name.length + 500);
      const contentAfter = afterHeader.replace(/^[#\s:\-|]+/, '').trim();
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

    const stripped = sectionContent
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\[(?:Principle \d|explanation|terme|definition|Regle \d|explication|description|.*?\.\.\.)\]/gi, '')
      .replace(/\{[a-z_]+\}/g, '')
      .replace(/^\s*[-|>\s*]+\s*$/gm, '')
      .replace(/\|\s*\|/g, '')
      .replace(/#______/g, '')
      .trim();

    const hasRealContent = stripped.length > 30;
    const hasHypothesis = /\[HYPOTHESE\]/i.test(sectionContent);
    const hasContradiction = /\[CONTRADICTOIRE/i.test(sectionContent);

    if (hasRealContent) { filled++; }
    sections.push({ name, filled: hasRealContent, hasHypothesis, hasContradiction });
  }

  return { filled, total: headers.length, sections };
}
