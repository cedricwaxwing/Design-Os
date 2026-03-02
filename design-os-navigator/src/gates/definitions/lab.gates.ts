/**
 * Lab Node Gates
 * 2 gates for the lab/sandbox phase
 */

import type { GateDefinition } from '../schema';
import { hasRealFiles, countRealFiles } from '../conditions/fileConditions';

export const labGates: GateDefinition[] = [
  {
    id: 'lab-exists',
    label: 'Prototypes existent',
    command: '/explore',
    condition: (ctx) => {
      return hasRealFiles(ctx.labFiles);
    },
  },
  {
    id: 'lab-active',
    label: 'Experimentation active',
    command: '/explore',
    condition: (ctx) => {
      // Lab is active if we have recent lab files
      const recentThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
      return ctx.labFiles.some(f => f.modifiedAt > recentThreshold);
    },
  },
];
