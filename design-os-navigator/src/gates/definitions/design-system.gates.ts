/**
 * Design System Node Gates
 * 4 gates for the design system phase
 */

import type { GateDefinition } from '../schema';
import { hasRealFiles, countRealFiles } from '../conditions/fileConditions';

export const designSystemGates: GateDefinition[] = [
  {
    id: 'ds-tokens',
    label: 'Tokens definis',
    command: '/onboarding',
    condition: (ctx) => {
      const hasTokens = ctx.dsContext.tokensDefined === true ||
        (ctx.dsContext.tokens as Record<string, unknown> || {}).colors !== undefined;
      return hasTokens;
    },
  },
  {
    id: 'ds-components',
    label: 'Composants documentes',
    command: '/onboarding',
    condition: (ctx) => {
      const components = ctx.dsContext.components as unknown[];
      return Array.isArray(components) && components.length > 0;
    },
  },
  {
    id: 'ds-patterns',
    label: 'Patterns definis',
    command: '/onboarding',
    condition: (ctx) => {
      const patterns = ctx.dsContext.patterns as unknown[];
      return Array.isArray(patterns) && patterns.length > 0;
    },
  },
  {
    id: 'ds-states',
    label: 'Etats UI documentes',
    command: '/onboarding',
    condition: (ctx) => {
      const states = ctx.dsContext.states as unknown[];
      return Array.isArray(states) && states.length > 0;
    },
  },
];
