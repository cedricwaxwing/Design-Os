# Roadmap

> Plan de route du produit. Reference pour prioriser les modules et les EPICs.

---

## Formats acceptes

| Format | Fichier | Usage |
|--------|---------|-------|
| **Markdown** | `roadmap.md` | Liste structuree par trimestre/phase |
| **Mermaid Gantt** | `roadmap-gantt.md` | Diagramme temporel |
| **Tableau** | `roadmap-table.md` | Vue tabulaire par module |

## Exemple de structure Markdown

```markdown
# Roadmap — {Projet}

## Q1 2026 — Foundation
- [ ] Module "dashboard" — MVP (EPIC 1-3)
- [ ] Design System — Tokens + composants de base

## Q2 2026 — Core Features
- [ ] Module "study-cockpit" — EPIC 1-5
- [ ] Module "dashboard" — EPIC 4-6

## Q3 2026 — Polish & Scale
- [ ] Review de conformite globale
- [ ] Performance + accessibilite
```

## Lien avec le Design OS

- Les modules references ici doivent exister dans `modules-registry.md`
- Les EPICs references ici doivent exister dans la section EPICs de `CLAUDE.md`
- L'orchestrateur (`/o`) peut utiliser la roadmap pour prioriser les suggestions
