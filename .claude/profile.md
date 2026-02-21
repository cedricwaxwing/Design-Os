# Profil utilisateur

> Ce fichier est auto-genere par `/onboarding`. Il calibre le comportement de l'orchestrateur et des agents.

## Profil actif

```yaml
profile:              # designer | founder | pm | dev | other
checkpoint_mode:      # auto-set — granular (designer) | minimal (founder) | standard (pm/dev)
communication_style:  # visual (designer) | strategic (founder) | structured (pm) | technical (dev)
detail_level:         # high (designer/dev) | medium (pm) | low (founder)
```

## Agents preferes (auto-set, modifiable)

```yaml
preferred_agents: []
# designer  → [ux, ui, explore]
# founder   → [o, ux]
# pm        → [spec, review, screen-map]
# dev       → [build, review, spec]
```

## Impact sur l'orchestrateur

| Profil | Checkpoint | Style | Detail | Focus |
|--------|-----------|-------|--------|-------|
| **designer** | `granular` — checkpoint sur chaque decision de design | Exploration visuelle, solution trees, critiques de layout | Haut | Alternatives visuelles, mockups, lois UX |
| **founder** | `minimal` — checkpoint sur decisions strategiques uniquement | Vue d'ensemble, decisions binaires GO/NO-GO | Bas | Impact business, ROI, simplification |
| **pm** | `standard` — checkpoint entre phases | Specs structurees, suivi de conformite | Moyen | Couverture stories, Screen Map, acceptance criteria |
| **dev** | `standard` — checkpoint sur spec, autonome sur build | Faisabilite technique, types, patterns de code | Haut | TypeScript, composants, edge cases, tests |
| **other** | `standard` — calibration manuelle | Adaptatif | Moyen | Selon les preferences exprimees |

## Comment modifier

Edite les valeurs ci-dessus manuellement, ou relance `/onboarding` pour reconfigurer.
L'orchestrateur lit ce fichier a chaque invocation de `/o`.
