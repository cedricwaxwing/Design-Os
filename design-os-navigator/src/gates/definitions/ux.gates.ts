/**
 * UX Node Gates
 * 4 gates for the UX design phase
 */

import type { GateDefinition } from '../schema';
import { hasRealFiles } from '../conditions/fileConditions';
import { noHypotheses, avgCompleteness } from '../conditions/contentConditions';

export const uxGates: GateDefinition[] = [
  {
    id: 'ux-files',
    label: '1+ UX file',
    command: '/ux',
    condition: (ctx) => {
      return hasRealFiles(ctx.uxFiles);
    },
  },
  {
    id: 'ux-screen-map',
    label: 'Screen-map defined',
    command: '/ux',
    condition: (ctx) => {
      return ctx.hasScreenMap && ctx.screenMapContent.length > 100;
    },
  },
  {
    id: 'ux-hypotheses',
    label: 'UX hypotheses validated',
    command: '/ux',
    condition: (ctx) => {
      const realFiles = ctx.uxFiles.filter(f => !f.isScaffold);
      if (realFiles.length === 0) return false;
      return noHypotheses(realFiles);
    },
  },
  {
    id: 'ux-complete',
    label: 'UX documentation complete (80%+)',
    command: '/ux',
    condition: (ctx) => {
      return avgCompleteness(ctx.uxFiles, 0.8);
    },
  },
];
