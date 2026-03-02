/**
 * Gate System
 *
 * Declarative gate evaluation system.
 * Each node has a set of gates that determine its readiness.
 */

import type { GateDefinition, GateEvalContext, GateResult, NodeGates } from './schema';

// Import gate definitions
import { strategyGates } from './definitions/strategy.gates';
import { discoveryGates } from './definitions/discovery.gates';
import { uxGates } from './definitions/ux.gates';
import { specGates } from './definitions/spec.gates';
import { designSystemGates } from './definitions/design-system.gates';
import { buildGates } from './definitions/build.gates';
import { reviewGates } from './definitions/review.gates';
import { materialGates } from './definitions/material.gates';
import { labGates } from './definitions/lab.gates';

// Gate registry by node ID
const gateRegistry: NodeGates = {
  'strategy': strategyGates,
  'discovery': discoveryGates,
  'ux': uxGates,
  'spec': specGates,
  'design-system': designSystemGates,
  'build': buildGates,
  'review': reviewGates,
  'material': materialGates,
  'lab': labGates,
  // UI node uses spec gates (same file structure)
  'ui': specGates,
};

/**
 * Evaluate all gates for a specific node.
 */
export function evaluateGates(nodeId: string, ctx: GateEvalContext): GateResult[] {
  const definitions = gateRegistry[nodeId];
  if (!definitions) {
    return [];
  }

  return definitions.map(def => ({
    id: def.id,
    label: def.label,
    met: safeEvaluate(def, ctx),
    command: def.command,
  }));
}

/**
 * Safely evaluate a gate condition, catching any errors.
 */
function safeEvaluate(def: GateDefinition, ctx: GateEvalContext): boolean {
  try {
    return def.condition(ctx);
  } catch (error) {
    console.warn(`Gate evaluation failed for ${def.id}:`, error);
    return false;
  }
}

/**
 * Calculate readiness percentage from gate results.
 */
export function calculateReadiness(gates: GateResult[]): number {
  if (gates.length === 0) return 0;
  const metCount = gates.filter(g => g.met).length;
  return (metCount / gates.length) * 100;
}

/**
 * Get the recommended action based on unmet gates.
 */
export function getRecommendedAction(gates: GateResult[]): { command: string; label: string } | null {
  const unmet = gates.find(g => !g.met && g.command);
  if (!unmet) return null;

  return {
    command: unmet.command!,
    label: unmet.label,
  };
}

// Export schema types
export * from './schema';

// Export condition functions for custom gates
export * from './conditions/fileConditions';
export * from './conditions/contentConditions';
