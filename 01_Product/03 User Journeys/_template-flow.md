# User Flow — [Nom du parcours]

**Module** : [module]
**Persona** : [persona principal]
**EPIC** : [reference EPIC]
**Date** : [YYYY-MM-DD]
**Genere par** : `/ux` (etape 3.7) ou manuellement

---

## Diagramme

```mermaid
flowchart LR
    Start([Utilisateur arrive]) --> A[Ecran 1 — Page principale]
    A --> B{Action utilisateur}
    B -->|CTA principal| C[Ecran 2 — Formulaire]
    B -->|Navigation| D[Ecran 3 — Liste]
    B -->|Menu| E[Ecran 4 — Settings]

    C --> F{Validation}
    F -->|Succes| G[Ecran 5 — Confirmation]
    F -->|Erreur| H[Message erreur]
    H --> C

    D --> I{Selection}
    I -->|Item| J[Ecran 6 — Detail]
    J --> K{Actions}
    K -->|Modifier| C
    K -->|Supprimer| L{Confirmation suppression}
    L -->|Oui| D
    L -->|Non| J
    K -->|Retour| D

    G --> End([Fin du parcours])

    style Start fill:#10B981,color:#fff
    style End fill:#10B981,color:#fff
    style H fill:#EF4444,color:#fff
```

## Etapes du parcours

| # | Ecran | Action | Transition | Etat |
|---|-------|--------|-----------|------|
| 1 | [Ecran 1] | [Action principale] | → [Ecran suivant] | Happy path |
| 2 | [Ecran 2] | [Action] | → Succes / Erreur | Validation |
| 3 | [Ecran 3] | [Action] | → [Detail] | Navigation |

## Edge cases

| # | Cas | Depuis | Comportement | Resolution |
|---|-----|--------|-------------|------------|
| 1 | [Formulaire invalide] | Ecran 2 | Message d'erreur inline | L'utilisateur corrige |
| 2 | [Donnees vides] | Ecran 3 | Etat vide avec CTA de creation | Redirige vers Ecran 2 |
| 3 | [Perte de connexion] | Tout ecran | Toast d'erreur + retry auto | Retry apres 3s |

## Notes

[Decisions de design prises, alternatives explorees, references aux hypotheses]
