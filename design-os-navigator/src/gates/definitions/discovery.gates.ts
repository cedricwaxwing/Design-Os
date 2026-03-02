/**
 * Discovery Node Gates
 * 5 gates for the discovery phase
 */

import type { GateDefinition } from '../schema';
import { hasRealFiles, countRealFiles } from '../conditions/fileConditions';
import { noHypotheses, hasHypotheses } from '../conditions/contentConditions';

export const discoveryGates: GateDefinition[] = [
  {
    id: 'disc-domain',
    label: 'Contexte domaine documente',
    command: '/discovery',
    condition: (ctx) => {
      return hasRealFiles(ctx.domainFiles);
    },
  },
  {
    id: 'disc-personas',
    label: '1+ persona defini',
    command: '/discovery personas',
    condition: (ctx) => {
      return countRealFiles(ctx.personaFiles) >= 1;
    },
  },
  {
    id: 'disc-interviews',
    label: 'Interviews documentes',
    command: '/discovery',
    condition: (ctx) => {
      return hasRealFiles(ctx.interviewFiles);
    },
  },
  {
    id: 'disc-insights',
    label: 'Insights synthetises',
    command: '/discovery',
    condition: (ctx) => {
      return hasRealFiles(ctx.insightFiles);
    },
  },
  {
    id: 'disc-no-hypothesis',
    label: 'Hypotheses validees (0 restantes)',
    command: '/discovery hypotheses',
    condition: (ctx) => {
      const realFiles = ctx.allDiscoveryFiles.filter(f => !f.isScaffold);
      if (realFiles.length === 0) return false;
      return noHypotheses(realFiles);
    },
  },
];
