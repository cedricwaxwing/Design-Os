/**
 * Review Node Gates
 * 3 gates for the review phase
 */

import type { GateDefinition } from '../schema';
import { hasRealFiles, countRealFiles } from '../conditions/fileConditions';
import { hasGoVerdict } from '../conditions/contentConditions';

export const reviewGates: GateDefinition[] = [
  {
    id: 'review-exists',
    label: 'Review existe',
    command: '/review',
    condition: (ctx) => {
      return hasRealFiles(ctx.reviewFiles);
    },
  },
  {
    id: 'review-complete',
    label: 'Review complete',
    command: '/review',
    condition: (ctx) => {
      const realReviews = ctx.reviewFiles.filter(f => !f.isScaffold);
      // Check if review has sufficient content
      return realReviews.some(f => f.signals.sectionsFilled >= 3);
    },
  },
  {
    id: 'review-go',
    label: 'Verdict GO',
    command: '/review',
    condition: (ctx) => {
      return ctx.reviewFiles.some(f => {
        const content = f.signals.status || '';
        return hasGoVerdict(content);
      });
    },
  },
];
