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
    label: 'Domain context documented',
    command: '/discovery',
    condition: (ctx) => {
      return hasRealFiles(ctx.domainFiles);
    },
  },
  {
    id: 'disc-personas',
    label: '1+ persona defined',
    command: '/discovery personas',
    condition: (ctx) => {
      return countRealFiles(ctx.personaFiles) >= 1;
    },
  },
  {
    id: 'disc-interviews',
    label: 'Interviews documented',
    command: '/discovery',
    condition: (ctx) => {
      return hasRealFiles(ctx.interviewFiles);
    },
  },
  {
    id: 'disc-insights',
    label: 'Insights synthesized',
    command: '/discovery',
    condition: (ctx) => {
      return hasRealFiles(ctx.insightFiles);
    },
  },
  {
    id: 'disc-no-hypothesis',
    label: 'Hypotheses validated (0 remaining)',
    command: '/discovery hypotheses',
    condition: (ctx) => {
      const realFiles = ctx.allDiscoveryFiles.filter(f => !f.isScaffold);
      if (realFiles.length === 0) return false;
      return noHypotheses(realFiles);
    },
  },
];
