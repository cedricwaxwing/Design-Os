/** Map internal maturity tag to user-visible English label */
export function getMaturityLabel(tag: string | undefined): string {
  const t = (tag ?? '').trim();
  switch (t) {
    case 'VIDE':
      return 'Empty';
    case 'AMORCE':
      return 'Started';
    case 'EN COURS':
      return 'In progress';
    case 'COMPLET':
      return 'Complete';
    case 'VALIDE':
      return 'Validated';
    default:
      return t || 'Empty';
  }
}
