/**
 * Material Node Gates
 * 3 gates for the material/raw sources phase
 */

import type { GateDefinition } from '../schema';
import { hasRealFiles, countRealFiles } from '../conditions/fileConditions';

export const materialGates: GateDefinition[] = [
  {
    id: 'mat-exists',
    label: 'Material existe',
    command: '/discovery',
    condition: (ctx) => {
      return hasRealFiles(ctx.materialFiles);
    },
  },
  {
    id: 'mat-processed',
    label: 'Material traite (dispatche)',
    command: '/discovery',
    condition: (ctx) => {
      // Material is processed when we have discovery files derived from it
      const hasDiscoveryContent = hasRealFiles(ctx.allDiscoveryFiles);
      return hasDiscoveryContent;
    },
  },
  {
    id: 'mat-no-new',
    label: 'Pas de nouveau material non traite',
    command: '/discovery',
    condition: (ctx) => {
      // No new unprocessed material
      return ctx.matNewCount === 0;
    },
  },
];
