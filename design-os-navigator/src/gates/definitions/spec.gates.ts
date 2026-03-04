/**
 * Spec Node Gates
 * 4 gates for the spec phase
 */

import type { GateDefinition } from '../schema';
import { hasRealFiles, countRealFiles } from '../conditions/fileConditions';
import { sectionsFilled, avgCompleteness, hasValideeStatus } from '../conditions/contentConditions';

export const specGates: GateDefinition[] = [
  {
    id: 'spec-exists',
    label: '1+ spec exists',
    command: '/spec',
    condition: (ctx) => {
      return hasRealFiles(ctx.specFiles);
    },
  },
  {
    id: 'spec-deep',
    label: 'Spec with 5+ sections filled',
    command: '/spec',
    condition: (ctx) => {
      return sectionsFilled(ctx.specFiles, 5);
    },
  },
  {
    id: 'spec-validated',
    label: 'Spec validated (status VALIDATED)',
    command: '/spec',
    condition: (ctx) => {
      const realSpecs = ctx.specFiles.filter(f => !f.isScaffold);
      return realSpecs.some(f => hasValideeStatus(f.signals.status || ''));
    },
  },
  {
    id: 'spec-complete',
    label: 'Specs complete (80%+)',
    command: '/spec',
    condition: (ctx) => {
      return avgCompleteness(ctx.specFiles, 0.8);
    },
  },
];
