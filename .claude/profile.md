# Profil utilisateur

> Ce fichier est auto-genere par `/onboarding`. Il calibre le comportement de l'orchestrateur et des agents.

## Profil actif

```yaml
language:             # fr | en | de | es | pt | ... (set by /onboarding Phase 0)
profile:              # designer | founder | pm | dev | other
checkpoint_mode:      # auto-set — granular (designer) | minimal (founder) | standard (pm/dev)
communication_style:  # visual (designer) | strategic (founder) | structured (pm) | technical (dev)
detail_level:         # high (designer/dev) | medium (pm) | low (founder)
integration_mode:     # zero | material | advanced (set by /onboarding Phase 0b/0c)
output_preference:    # visual (designer) | textual (founder/pm) | code (dev)
review_focus:         # visual_conformity (designer) | spec_conformity (pm/dev) | business_value (founder)
ds_engagement:        # creator (designer) | consumer (dev) | viewer (founder/pm)
artifact_format:      # svg_html (designer) | markdown (pm/founder) | tsx (dev)
guidance_mode:        # wizard | hybrid | freeform (default: hybrid)
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

## Valeurs auto-set par profil

Les champs etendus sont auto-determines par le profil. L'utilisateur peut les overrider manuellement.

| Profil | output_preference | review_focus | ds_engagement | artifact_format |
|--------|------------------|--------------|--------------|----------------|
| **designer** | `visual` | `visual_conformity` | `creator` | `svg_html` |
| **founder** | `textual` | `business_value` | `viewer` | `markdown` |
| **pm** | `textual` | `spec_conformity` | `viewer` | `markdown` |
| **dev** | `code` | `spec_conformity` | `consumer` | `tsx` |
| **other** | `textual` | `spec_conformity` | `consumer` | `markdown` |

**Regle** : Le profil `designer` recoit TOUJOURS le rendu le plus riche (plus d'artefacts visuels, checks DS detailles, precision layout). Les autres profils sont des optimisations de cette experience complete.

## Comment modifier

Edite les valeurs ci-dessus manuellement, ou relance `/onboarding` pour reconfigurer.
L'orchestrateur lit ce fichier a chaque invocation de `/o`.
