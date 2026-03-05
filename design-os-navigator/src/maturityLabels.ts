/**
 * Map internal maturity tag (French) or readiness verdict to English label.
 * Used by the extension when sending data to the webview so the UI always shows English.
 */

export function getMaturityLabel(tag: string | undefined): string {
  const t = (tag ?? '').trim();
  const upper = t.toUpperCase();
  // French gate-derived tags (case-insensitive)
  if (upper === 'VIDE') return 'Empty';
  if (upper === 'AMORCE') return 'Started';
  if (upper === 'EN COURS') return 'In progress';
  if (upper === 'COMPLET') return 'Complete';
  if (upper === 'VALIDE') return 'Validated';
  // Readiness verdicts from .claude/readiness.json
  const verdictLabels: Record<string, string> = {
    'NOT-READY': 'Not ready',
    'PREMATURE': 'Premature',
    'POSSIBLE': 'Possible',
    'PUSH': 'In progress',
    'READY': 'Ready',
  };
  if (verdictLabels[upper]) return verdictLabels[upper];
  // Normalize "en cours" / "vide" etc. if they slip through
  if (/VIDE|EMPTY/i.test(t)) return 'Empty';
  if (/EN\s*COURS|IN\s*PROGRESS/i.test(t)) return 'In progress';
  return t || 'Empty';
}
