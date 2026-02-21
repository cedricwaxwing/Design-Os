# 03 User Journeys — Parcours utilisateurs

> Visualisations des parcours utilisateurs par module. Generes par `/ux` (etape 3.7).

---

## Formats disponibles

### User Journey (SVG)
Vue d'ensemble en colonnes : chaque EPIC = une colonne, les user stories dessous.
Visualisable directement dans Cursor/VS Code.

```
journey-[nom].svg
```

**Utile pour** : vue d'ensemble d'un EPIC, mapping stories → ecrans, presentation a l'equipe.

### User Flow (Mermaid)
Diagramme flowchart du parcours utilisateur avec decisions et branchements.

```
flow-[nom].md
```

**Utile pour** : detailler un parcours precis, documenter les edge cases, montrer les embranchements.

## Structure

```
03 User Journeys/
└── {module}/
    ├── journey-onboarding.svg       ← Vue EPIC en colonnes
    ├── journey-collaboration.svg
    ├── flow-creation-study.md       ← Flowchart Mermaid
    └── flow-review-process.md
```

## Comment generer

1. Lance `/ux` sur ton module
2. Apres la creation du Screen Map (etape 3.5), l'agent propose de generer des visualisations
3. Choisis le format adapte :
   - **SVG** pour une vue d'ensemble
   - **Mermaid** pour un parcours detaille
   - **Les deux** si tu veux les deux perspectives

## Templates

Deux templates sont disponibles pour demarrer ou comprendre le format attendu :

- **`_template-journey.svg`** — Template SVG de user journey en colonnes (EPICs → stories). Ouvre-le dans Cursor/VS Code pour voir le rendu visuel.
- **`_template-flow.md`** — Template Mermaid de user flow avec decisions, branches et edge cases.

Ces templates montrent la structure attendue. Les vrais journeys/flows sont generes automatiquement par `/ux` (etape 3.7) ou creables manuellement.

## Formats alternatifs

En plus du SVG et du Mermaid, tu peux aussi :
- Exporter un diagramme depuis Figma/FigJam et le placer ici en `.png` ou `.svg`
- Utiliser d'autres outils (Whimsical, Miro) et exporter le resultat
- Decrire le flow en texte brut dans un `.md` — les agents `/spec` et `/ux` le liront aussi

Le SVG est le format recommande car il est versionnable (Git), visualisable dans l'IDE, et genereable par les agents.

## Ce dossier est vide ?

Normal si tu n'as pas encore lance `/ux`. Les user journeys sont generes pendant l'exploration UX, apres la creation du Screen Map.
