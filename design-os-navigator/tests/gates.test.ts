/**
 * Gate System Tests
 */

import { describe, it, expect } from 'vitest';
import { evaluateGates, calculateReadiness, getRecommendedAction } from '../src/gates';
import type { GateEvalContext, GateResult } from '../src/gates/schema';

describe('Gate Evaluation System', () => {
  describe('evaluateGates', () => {
    it('returns empty array for unknown node', () => {
      const ctx = createEmptyContext();
      const results = evaluateGates('unknown-node', ctx);
      expect(results).toEqual([]);
    });

    it('evaluates strategy gates', () => {
      const ctx = createEmptyContext();
      const results = evaluateGates('strategy', ctx);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('label');
      expect(results[0]).toHaveProperty('met');
    });

    it('evaluates lab gates', () => {
      const ctx = createEmptyContext();
      const results = evaluateGates('lab', ctx);
      expect(results.length).toBe(2);
    });
  });

  describe('calculateReadiness', () => {
    it('returns 0 for empty gates', () => {
      expect(calculateReadiness([])).toBe(0);
    });

    it('returns 100 when all gates met', () => {
      const gates: GateResult[] = [
        { id: 'g1', label: 'Gate 1', met: true },
        { id: 'g2', label: 'Gate 2', met: true },
      ];
      expect(calculateReadiness(gates)).toBe(100);
    });

    it('returns 50 when half gates met', () => {
      const gates: GateResult[] = [
        { id: 'g1', label: 'Gate 1', met: true },
        { id: 'g2', label: 'Gate 2', met: false },
      ];
      expect(calculateReadiness(gates)).toBe(50);
    });

    it('returns 0 when no gates met', () => {
      const gates: GateResult[] = [
        { id: 'g1', label: 'Gate 1', met: false },
        { id: 'g2', label: 'Gate 2', met: false },
      ];
      expect(calculateReadiness(gates)).toBe(0);
    });
  });

  describe('getRecommendedAction', () => {
    it('returns null when all gates met', () => {
      const gates: GateResult[] = [
        { id: 'g1', label: 'Gate 1', met: true, command: '/cmd1' },
      ];
      expect(getRecommendedAction(gates)).toBeNull();
    });

    it('returns first unmet gate with command', () => {
      const gates: GateResult[] = [
        { id: 'g1', label: 'Gate 1', met: true },
        { id: 'g2', label: 'Gate 2', met: false, command: '/cmd2' },
        { id: 'g3', label: 'Gate 3', met: false, command: '/cmd3' },
      ];
      const action = getRecommendedAction(gates);
      expect(action).toEqual({ command: '/cmd2', label: 'Gate 2' });
    });

    it('skips unmet gates without command', () => {
      const gates: GateResult[] = [
        { id: 'g1', label: 'Gate 1', met: false }, // no command
        { id: 'g2', label: 'Gate 2', met: false, command: '/cmd2' },
      ];
      const action = getRecommendedAction(gates);
      expect(action).toEqual({ command: '/cmd2', label: 'Gate 2' });
    });
  });
});

// Helper to create empty context with all required fields
function createEmptyContext(): GateEvalContext {
  return {
    root: '/tmp/test-project',
    module: 'test-module',
    strategyFiles: [],
    domainFiles: [],
    personaFiles: [],
    interviewFiles: [],
    insightFiles: [],
    allDiscoveryFiles: [],
    uxFiles: [],
    specFiles: [],
    dsFiles: [],
    srcFiles: [],
    testFiles: [],
    reviewFiles: [],
    materialFiles: [],
    labFiles: [],
    hasScreenMap: false,
    screenMapContent: '',
    dsContext: {},
    matNewCount: 0,
  };
}
