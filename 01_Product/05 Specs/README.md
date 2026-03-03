# 05 Specs — Specifications validees

> Specs generees par `/spec`. Source de verite pour `/build`.

---

## Structure

```
05 Specs/
├── _templates/                    ← Templates de spec (cross-module)
│   ├── component-spec.md         ← Pour un composant (modal, formulaire, card...)
│   └── page-spec.md              ← Pour une page complete (dashboard, liste, detail...)
│
└── {module}/                      ← Specs par module actif
    ├── 00_screen-map.md          ← Mapping N stories → M ecrans (source de verite)
    ├── specs/                     ← Fichiers de spec
    │   ├── 1.1-overview-page.spec.md
    │   ├── 1.2-detail-modal.spec.md
    │   └── 2.1-filter-sidebar.spec.md
    └── screens/                   ← References visuelles SVG
        ├── overview.svg
        └── detail.svg
```

## Deux templates disponibles

| Template | Quand l'utiliser |
|----------|-----------------|
| **component-spec.md** | Composant reutilisable : modal, formulaire, carte, sidebar |
| **page-spec.md** | Page complete avec route : dashboard, liste, page de detail |

Les deux ont 9 sections obligatoires (en mode VALIDEE).

## Modes de spec

| Mode | Sections | TBD autorises | Accepte par /build |
|------|----------|---------------|-------------------|
| **VALIDEE** | 9 obligatoires | Non | Oui |
| **DRAFT** | 3 minimum (Story + Criteria + Layout) | Oui | Non |

Le mode DRAFT permet d'iterer rapidement en phase exploratoire. Pour passer en VALIDEE, completer les 9 sections et eliminer tous les TBD.

## Convention de nommage

```
{X.Y}-{nom}.spec.md
```

- **X** = numero d'EPIC
- **Y** = numero de story/ecran dans l'EPIC
- **nom** = description courte en kebab-case

Exemples : `1.1-overview-page.spec.md`, `2.3-user-modal.spec.md`

## Screen Map

Le fichier `00_screen-map.md` est le pivot central. Il mappe N user stories vers M ecrans reels.

**Regle** : `/spec` consulte TOUJOURS le Screen Map avant de creer une spec. Si une story n'est pas mappee, `/spec` bloque et redirige vers `/ux`.

## Ce dossier est vide ?

Normal. Lance `/ux` pour creer le Screen Map, puis `/spec` pour generer les specs.
