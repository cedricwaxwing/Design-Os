/**
 * Gate System Schema
 *
 * Gates are declarative conditions that determine node readiness.
 * Each gate has:
 * - id: Unique identifier (e.g., "strat-brief")
 * - label: Human-readable description
 * - command: Skill to run if gate is not met
 * - condition: Function that evaluates if gate is met
 */

import type { FileInfo, ContentSignals } from '../types-legacy';

// Gate evaluation context - all data needed to evaluate gates
export interface GateEvalContext {
  root: string;
  module: string;

  // Pre-loaded file lists by category
  strategyFiles: FileInfo[];
  domainFiles: FileInfo[];
  personaFiles: FileInfo[];
  interviewFiles: FileInfo[];
  insightFiles: FileInfo[];
  allDiscoveryFiles: FileInfo[];
  uxFiles: FileInfo[];
  specFiles: FileInfo[];
  dsFiles: FileInfo[];
  srcFiles: FileInfo[];
  testFiles: FileInfo[];
  reviewFiles: FileInfo[];
  materialFiles: FileInfo[];
  labFiles: FileInfo[];

  // Specific content
  hasScreenMap: boolean;
  screenMapContent: string;

  // Context data
  dsContext: Record<string, unknown>;

  // Counts
  matNewCount: number;
}

// Gate definition
export interface GateDefinition {
  id: string;
  label: string;
  command: string;
  condition: GateConditionFn;
}

// Gate condition function type
export type GateConditionFn = (ctx: GateEvalContext) => boolean;

// Gate evaluation result (matches existing GateCondition interface)
export interface GateResult {
  id: string;
  label: string;
  met: boolean;
  command?: string;
}

// Node gate configuration
export type NodeGates = Record<string, GateDefinition[]>;
