# Design System — Tokens

> Ce fichier est auto-genere par `/onboarding` avec des couleurs hex reelles.
> Source de verite pour les couleurs, typographie, spacing, bordures et ombres.
> Modifiable manuellement a tout moment.

---

## Couleurs

### Palette principale

| Token | Valeur | Usage |
|-------|--------|-------|
| `primary` | `#3B82F6` | Couleur primaire, CTA, liens |
| `primary-light` | `#60A5FA` | Hover, accents legers |
| `primary-dark` | `#1D4ED8` | Active/pressed |
| `primary-50` | `#EFF6FF` | Fond tres leger (badges, highlights) |

<!-- INSTRUCTIONS POUR /onboarding :
     A partir de la couleur primaire fournie par l'utilisateur, generer :
     - primary : la couleur donnee
     - primary-light : +15% luminosite (HSL L+15)
     - primary-dark : -15% luminosite (HSL L-15)
     - primary-50 : meme teinte, saturation 20%, luminosite 95%
     Toutes les valeurs DOIVENT etre des hex reels (#RRGGBB), jamais #______ -->

### Palette de fond

| Token | Valeur | Usage |
|-------|--------|-------|
| `bg-base` | `#0F172A` | Fond de page |
| `bg-surface` | `#1E293B` | Fond des cartes, conteneurs |
| `bg-elevated` | `#334155` | Fond des modales, drawers |
| `bg-input` | `#1E293B` | Fond des champs de saisie |

<!-- INSTRUCTIONS POUR /onboarding :
     Light mode : bg-base=#FFFFFF, bg-surface=#F9FAFB, bg-elevated=#FFFFFF, bg-input=#F3F4F6
     Dark mode  : bg-base=#0F172A, bg-surface=#1E293B, bg-elevated=#334155, bg-input=#1E293B -->

### Couleurs semantiques

| Token | Valeur | Usage |
|-------|--------|-------|
| `success` | `#22C55E` | Succes, validation, done |
| `warning` | `#F59E0B` | Attention, pending, draft |
| `error` | `#EF4444` | Erreur, danger, rejected |
| `info` | `#3B82F6` | Information, liens secondaires |

<!-- Ces valeurs sont universelles — l'onboarding les conserve telles quelles -->

### Couleurs de texte

| Token | Valeur | Usage |
|-------|--------|-------|
| `text-primary` | `#F9FAFB` | Texte principal |
| `text-secondary` | `#9CA3AF` | Texte secondaire, metadata |
| `text-tertiary` | `#6B7280` | Texte desactive, placeholder |
| `text-on-primary` | `#FFFFFF` | Texte sur fond primaire (CTAs) |

<!-- INSTRUCTIONS POUR /onboarding :
     Light mode : text-primary=#111827, text-secondary=#6B7280, text-tertiary=#9CA3AF, text-on-primary=#FFFFFF
     Dark mode  : text-primary=#F9FAFB, text-secondary=#9CA3AF, text-tertiary=#6B7280, text-on-primary=#FFFFFF -->

### Couleurs de bordure

| Token | Valeur | Usage |
|-------|--------|-------|
| `border-default` | `#1F2937` | Bordures standards |
| `border-subtle` | `#111827` | Bordures legeres, separateurs |

### Couleurs des roles

<!-- Genere par /onboarding — une couleur par role du projet -->

| Role | Cle technique | Couleur badge |
|------|--------------|---------------|
| {role_1} | `{key}` | `#______` |
| {role_2} | `{key}` | `#______` |

---

## Typographie

### Font

- **Famille** : Outfit, -apple-system, BlinkMacSystemFont, system-ui, sans-serif
- **Fallback** : `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`
- **Chargement** : Google Fonts (Outfit)

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

## Icones

### Librairie

- **Librairie** : Lucide
- **Style** : outline
- **Import** : `import { IconName } from 'lucide-react'`
- **Taille par defaut** : 20px
- **Taille compacte** : 16px
- **Taille large** : 24px
- **Couleur** : Herite de `currentColor` (suit la couleur du texte parent)

<!-- INSTRUCTIONS POUR /onboarding :
     Poser 2 questions en Phase 6 :
     1. "Quelle librairie d'icones ?" (Lucide, Heroicons, Phosphor, Material Symbols, Tabler Icons, Font Awesome, autre)
        → Defaut : Lucide (coherent avec shadcn/ui)
     2. "Tu preferes des icones outline (contour fin) ou filled (remplies) ?"
        → Outline : style epure, moderne, aerien — recommande pour la plupart des interfaces
        → Filled : style affirme, dense, lisible en petit — ideal pour les apps data-heavy ou mobile
        → Defaut : outline
     Remplir les champs ci-dessus avec les reponses. -->

### Regles d'usage

| Contexte | Taille | Style | Exemple |
|----------|--------|-------|---------|
| Bouton avec texte | 16-20px | Meme que le DS | `<Button><Icon /> Label</Button>` |
| Bouton icon-only | 20-24px | Meme que le DS | `<IconButton><Icon /></IconButton>` |
| Navigation / sidebar | 20px | Meme que le DS | Items de menu |
| Badge / tag | 14-16px | Meme que le DS | Indicateurs inline |
| Illustration / empty state | 32-48px | Meme que le DS | Grandes icones decoratives |

### Anti-patterns

- **JAMAIS d'emoji** (😀, 📊, ✅, etc.) comme substitut d'icone — les emojis varient selon l'OS, ne respectent ni la couleur ni la taille du design system, et brisent la coherence visuelle
- **JAMAIS de mix** outline + filled dans le meme ecran sauf cas explicitement prevu dans le DS
- **JAMAIS de SVG inline ad hoc** si une icone equivalente existe dans la librairie

---

## Breakpoints

| Token | Valeur | Usage |
|-------|--------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablette |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop large |
| `2xl` | 1536px | Ultra-wide |
