/**
 * Strategy Node Gates
 * 5 gates for the strategy phase
 */

import type { GateDefinition } from '../schema';
import { fileExists, fileHasContent, safeRead } from '../conditions/fileConditions';
import { sectionHasContent, hasValideeStatus } from '../conditions/contentConditions';

export const strategyGates: GateDefinition[] = [
  {
    id: 'strat-brief',
    label: 'Product brief rempli',
    command: '/onboarding',
    condition: (ctx) => {
      const briefPath = '01_Product/01 Strategy/product-brief.md';
      if (!fileExists(ctx, briefPath)) return false;
      return fileHasContent(ctx, briefPath, 100);
    },
  },
  {
    id: 'strat-vision',
    label: 'Vision North Star definie',
    command: '/onboarding',
    condition: (ctx) => {
      const visionPath = '01_Product/01 Strategy/northstar-vision.md';
      if (!fileExists(ctx, visionPath)) return false;
      const content = safeRead(ctx, visionPath);
      return sectionHasContent(content, '## North Star Statement', 10);
    },
  },
  {
    id: 'strat-personas',
    label: 'Personas references',
    command: '/onboarding',
    condition: (ctx) => {
      // Check if personas exist in discovery
      return ctx.personaFiles.filter(f => !f.isScaffold).length > 0;
    },
  },
  {
    id: 'strat-roadmap',
    label: 'Roadmap definie',
    command: '/onboarding',
    condition: (ctx) => {
      const roadmapPath = '01_Product/01 Strategy/roadmap.md';
      if (!fileExists(ctx, roadmapPath)) return false;
      return fileHasContent(ctx, roadmapPath, 50);
    },
  },
  {
    id: 'strat-validated',
    label: 'Brief valide (status VALIDEE)',
    command: '/onboarding',
    condition: (ctx) => {
      const briefPath = '01_Product/01 Strategy/product-brief.md';
      const content = safeRead(ctx, briefPath);
      return hasValideeStatus(content);
    },
  },
];
