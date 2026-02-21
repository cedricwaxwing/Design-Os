# Design System — Tokens

> Remplis ce fichier lors de l'onboarding (`/onboarding`) ou manuellement.
> Source de verite pour les couleurs, typographie, spacing, bordures et ombres.

---

## Couleurs

### Palette principale

| Token | Valeur | Usage |
|-------|--------|-------|
| `primary` | `#______` | Couleur primaire, CTA, liens |
| `primary-light` | `#______` | Hover, accents legers |
| `primary-dark` | `#______` | Active/pressed |

<!-- Ajoute ta palette complete ici -->

### Palette de fond

<!-- Adapte selon dark mode ou light mode -->

| Token | Valeur | Usage |
|-------|--------|-------|
| `bg-base` | `#______` | Fond de page |
| `bg-surface` | `#______` | Fond des cartes, conteneurs |
| `bg-elevated` | `#______` | Fond des modales, drawers |
| `bg-input` | `#______` | Fond des champs de saisie |

### Couleurs semantiques

| Token | Valeur | Usage |
|-------|--------|-------|
| `success` | `#22c55e` | Succes, validation, done |
| `warning` | `#f59e0b` | Attention, pending, draft |
| `error` | `#ef4444` | Erreur, danger, rejected |
| `info` | `#3b82f6` | Information, liens secondaires |

### Couleurs de texte

| Token | Valeur | Usage |
|-------|--------|-------|
| `text-primary` | `#______` | Texte principal |
| `text-secondary` | `#______` | Texte secondaire, metadata |
| `text-tertiary` | `#______` | Texte desactive, placeholder |
| `text-on-primary` | `#______` | Texte sur fond primaire (CTAs) |

### Couleurs de bordure

| Token | Valeur | Usage |
|-------|--------|-------|
| `border-default` | `#______` | Bordures standards |
| `border-subtle` | `#______` | Bordures legeres, separateurs |

### Couleurs des roles

<!-- Genere par /onboarding — une couleur par role du projet -->

| Role | Cle technique | Couleur badge |
|------|--------------|---------------|
| {role_1} | `{key}` | `#______` |
| {role_2} | `{key}` | `#______` |

---

## Typographie

### Font

- **Famille** : <!-- ta font ici, ex: Inter, Geist, System -->
- **Fallback** : `-apple-system, BlinkMacSystemFont, sans-serif`
- **Chargement** : <!-- via @theme, Google Fonts, local, etc. -->

### Echelle typographique

| Niveau | Taille | Poids | Line-height | Usage |
|--------|--------|-------|-------------|-------|
| H1 | 24px | 700 | 32px | Titre de page |
| H2 | 18px | 600 | 24px | Titre de section |
| H3 | 16px | 600 | 24px | Titre de card |
| H4 | 14px | 600 | 20px | Sous-titre, label important |
| Body | 14px | 400 | 20px | Texte courant |
| Caption | 12px | 400 | 16px | Texte secondaire, metadata |
| Micro | 10px | 500 | 14px | Badges, tags, annotations |

---

## Spacing

Base : **4px** (compatible avec Tailwind par defaut).

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| `space-1` | 4px | `p-1` / `gap-1` | Micro-spacing (icon-label) |
| `space-2` | 8px | `p-2` / `gap-2` | Spacing interne compact |
| `space-3` | 12px | `p-3` / `gap-3` | Spacing interne standard |
| `space-4` | 16px | `p-4` / `gap-4` | Entre elements relies |
| `space-5` | 20px | `p-5` / `gap-5` | Entre groupes |
| `space-6` | 24px | `p-6` / `gap-6` | Spacing de section |
| `space-8` | 32px | `p-8` / `gap-8` | Spacing majeur |
| `space-10` | 40px | `p-10` / `gap-10` | Separation de zones |
| `space-12` | 48px | `p-12` / `gap-12` | Marge de page |

**Regle** : Tous les spacings sont des multiples de 4px. Pas de valeurs arbitraires.

---

## Bordures et arrondis

| Token | Valeur | Usage |
|-------|--------|-------|
| `radius-sm` | 4px | Badges, tags |
| `radius-md` | 6px | Inputs |
| `radius-lg` | 8px | Boutons |
| `radius-xl` | 12px | Cards |
| `radius-2xl` | 16px | Modales |
| `radius-full` | 9999px | Pills, chips, avatars |

---

## Ombres

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Elevation legere (cards) |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Elevation moyenne (dropdowns) |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.15)` | Elevation forte (modales) |

---

## Breakpoints

| Token | Valeur | Usage |
|-------|--------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablette |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop large |
| `2xl` | 1536px | Ultra-wide |
