# 02 User Interviews — Entretiens utilisateurs

> Comptes-rendus d'entretiens et verbatims.

---

## Format recommande par entretien

```markdown
# Interview — [Prenom / Role]

**Date** : [YYYY-MM-DD]
**Duree** : [minutes]
**Persona** : [reference persona]
**Contexte** : [ou et comment l'entretien a eu lieu]

## Points cles
1. [Insight principal]
2. [Insight secondaire]

## Verbatims marquants
> "[Citation directe de l'utilisateur]"
> — A propos de [sujet]

## Pain points identifies
- [Frustration 1]
- [Frustration 2]

## Besoins exprimes
- [Besoin 1]
- [Besoin 2]

## Suggestions spontanees
- [Suggestion 1]
```

## Convention de nommage

```
[YYYY-MM-DD]-interview-[role]-[numero].md
```

Exemple : `2026-02-15-interview-pharmacist-01.md`

## Transcripts bruts

Pour les transcripts complets d'interviews (enregistrements textuels, notes brutes non structurees), utilise le sous-dossier `transcripts/` :

```
02 User Interviews/
├── transcripts/                              ← Transcripts bruts (non structures)
│   ├── 2026-02-15-transcript-pharmacist-01.md
│   └── 2026-02-20-transcript-nurse-01.md
├── 2026-02-15-interview-pharmacist-01.md     ← Compte-rendu structure
├── 2026-02-20-interview-nurse-01.md
└── _template-interview.md                    ← Template
```

### Pipeline transcript → insight

1. **Deposer** le transcript brut dans `transcripts/`
2. **Structurer** en compte-rendu avec le template `_template-interview.md` (manuellement ou via `/discovery`)
3. **Synthetiser** les patterns communs dans `03 Research Insights/` (via `/discovery` ou manuellement)

Les agents `/discovery` et `/ux` lisent les comptes-rendus structures en priorite. Les transcripts bruts servent de reference si besoin de retrouver le contexte exact d'un verbatim.

## Templates

- `_template-interview.md` — Template de compte-rendu structure

## Impact sur les agents

- **`/ux`** — Ancre les hypotheses dans les verbatims reels
- **`/onboarding`** — Peut extraire des personas depuis les interviews
- **`/discovery`** — Structure les transcripts bruts et synthetise en insights
