/**
 * Maturity labels (spec 1.1 / 1.2 — Navigator displays English labels).
 * Extension and webview both rely on French tags → English for display.
 */

import { describe, it, expect } from 'vitest';
import { getMaturityLabel } from '../src/maturityLabels';

describe('getMaturityLabel', () => {
  it('maps French VIDE to Empty', () => {
    expect(getMaturityLabel('VIDE')).toBe('Empty');
    expect(getMaturityLabel('Vide')).toBe('Empty');
    expect(getMaturityLabel('vide')).toBe('Empty');
  });

  it('maps French EN COURS to In progress', () => {
    expect(getMaturityLabel('EN COURS')).toBe('In progress');
    expect(getMaturityLabel('En cours')).toBe('In progress');
  });

  it('maps readiness verdicts to English', () => {
    expect(getMaturityLabel('not-ready')).toBe('Not ready');
    expect(getMaturityLabel('push')).toBe('In progress');
    expect(getMaturityLabel('ready')).toBe('Ready');
    expect(getMaturityLabel('possible')).toBe('Possible');
  });

  it('returns Empty for undefined or empty', () => {
    expect(getMaturityLabel(undefined)).toBe('Empty');
    expect(getMaturityLabel('')).toBe('Empty');
    expect(getMaturityLabel('   ')).toBe('Empty');
  });
});
