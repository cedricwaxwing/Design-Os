/**
 * Build Node Gates
 * 4 gates for the build phase
 */

import type { GateDefinition } from '../schema';
import { hasRealFiles, countRealFiles } from '../conditions/fileConditions';
import { hasGoVerdict } from '../conditions/contentConditions';

export const buildGates: GateDefinition[] = [
  {
    id: 'build-src',
    label: 'Source code exists',
    command: '/build',
    condition: (ctx) => {
      return hasRealFiles(ctx.srcFiles);
    },
  },
  {
    id: 'build-tests',
    label: 'Tests exist',
    command: '/build',
    condition: (ctx) => {
      return hasRealFiles(ctx.testFiles);
    },
  },
  {
    id: 'build-coverage',
    label: 'Specs covered by code',
    command: '/build',
    condition: (ctx) => {
      // Check if we have at least as many src files as specs
      const specCount = countRealFiles(ctx.specFiles);
      const srcCount = countRealFiles(ctx.srcFiles);
      return specCount > 0 && srcCount >= specCount;
    },
  },
  {
    id: 'build-review-go',
    label: 'Review GO obtained',
    command: '/review',
    condition: (ctx) => {
      // Check if any review file has GO verdict
      return ctx.reviewFiles.some(f => {
        const content = f.signals.status || '';
        return hasGoVerdict(content);
      });
    },
  },
];
