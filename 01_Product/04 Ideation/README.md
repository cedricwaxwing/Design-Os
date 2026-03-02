# 04 Ideation — Coffre-fort a idees

> Brainstorming creatif avec persistance obligatoire. Toutes les idees sont ecrites — retenues, ecartees, parquees — avec leur raisonnement.

---

## Principe

**Zero jugement en phase libre, structure apres.** Tout ce qui est dit est ecrit, rien ne disparait avec la session.

## Structure

```
04 Ideation/
└── {module}/
    └── ideation-log.md       ← Append-only, genere par /ideate
```

Chaque module a son propre `ideation-log.md`. Les idees sont ajoutees en append-only (jamais de suppression).

## Systeme de tags

Chaque idee recoit un tag qui trace son cycle de vie :

| Tag | Signification | Raisonnement requis |
|-----|--------------|---------------------|
| `IDEE` | Brute, pas encore evaluee | Non |
| `EXPLOREE` | Discutee, avec contexte et consequences | Non |
| `RETENUE` | Selectionnee pour /ux ou /spec | **Oui** — pourquoi cette idee |
| `ECARTEE` | Rejetee consciemment | **Oui** — pourquoi pas |
| `PARQUEE` | Bonne idee, pas maintenant | **Oui** — condition de reprise |

**Transitions** : `IDEE` -> `EXPLOREE` -> `RETENUE` | `ECARTEE` | `PARQUEE`

## Comment generer

### Option 1 — Avec l'agent (recommande)
- **`/ideate`** — Brainstorm complet : divergence libre puis convergence structuree
- **`/ideate quick`** — Capture rapide d'idees sans phase de tri
- **`/ideate review`** — Relecture du parking lot (idees `PARQUEE`)

### Option 2 — Manuellement
Cree un fichier `ideation-log.md` dans le sous-dossier du module et suis le format :

```markdown
## Session — {YYYY-MM-DD} — {sujet}

### Idees

- **[IDEE]** {description}
- **[RETENUE]** {description}
  > Raisonnement : {pourquoi}
- **[ECARTEE]** {description}
  > Raisonnement : {pourquoi pas}
```

## Impact sur les agents

Les agents consultent ce dossier pour :
- **`/ux`** — Nourrir l'exploration des solutions avec les idees brutes et les pistes ecartees
- **`/spec`** — Tracer le raisonnement derriere les choix de design (section "Decisions")
- **`/review`** — Verifier que les idees `RETENUE` sont bien implementees
- **`/o`** — Inserer `/ideate` entre Discovery et UX dans le flow

## Ce dossier est vide ?

Normal si tu n'as pas encore lance `/ideate`. Le brainstorm se fait generalement apres la Discovery et avant l'exploration UX.
