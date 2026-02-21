# Design System — Composants

> Composants atomiques reutilisables. Code d'implementation adapte a la stack du projet.
> Remplis ce fichier manuellement ou via `/onboarding` qui genere les composants pour ta stack.

---

## Boutons

### Primary
<!-- Adapte a ta stack (Tailwind, CSS Modules, Styled Components...) -->
```
[Code du bouton primaire — couleur primary, texte blanc, hover, active, disabled]
```

### Secondary
```
[Code du bouton secondaire — bordure, fond transparent, hover]
```

### Ghost
```
[Code du bouton ghost — pas de fond, pas de bordure, hover subtil]
```

### Danger
```
[Code du bouton danger — fond rouge, texte blanc]
```

### Regles
- Hauteur minimum : 36px (primaire), 32px (secondaire)
- Toujours un etat hover, active, focus, disabled
- Le bouton primaire est visuellement distinct (Von Restorff Effect)
- Les actions destructives sont eloignees des actions principales

---

## Inputs

### Text Input
```
[Code de l'input texte — fond, bordure, placeholder, focus ring, error state]
```

### Select
```
[Code du select — meme style que l'input, chevron, dropdown]
```

### Textarea
```
[Code du textarea — meme style, auto-resize optionnel]
```

### Regles
- Label au-dessus du champ (convention standard)
- Placeholder descriptif (pas juste le nom du champ)
- Etat erreur : bordure rouge + message sous le champ
- Focus : ring de couleur primaire

---

## Cards

### Card standard
```
[Code de la card — fond surface, bordure subtile, radius, padding]
```

### Card interactive
```
[Code de la card cliquable — hover, cursor pointer, transition]
```

### Regles
- Padding interne : 24px (space-6)
- Radius : 12px
- Gap entre cards : 16px (space-4)
- Separateur interne optionnel entre header et body

---

## Badges

### Badge de statut
```
[Code des badges — Success (vert), Warning (ambre), Error (rouge), Info (bleu), Neutral (gris)]
```

### Badge de role
```
[Code du badge de role — couleur selon le role (voir tokens.md)]
```

### Regles
- Hauteur : 20px
- Padding horizontal : 8px
- Radius : 4px
- Fond : couleur a 15% d'opacite
- Texte : couleur pleine

---

## Alertes

### Info / Warning / Error
```
[Code des alertes — icone + message + action optionnelle, bordure et fond colores]
```

### Regles
- Toujours une icone contextuelle
- Message specifique (pas generique)
- Action optionnelle (dismiss, retry, link)

---

## Tables

### Table standard
```
[Code de la table — header, rows, hover, alternance optionnelle]
```

### Regles
- Header fixe (sticky) si > 10 lignes
- Hover sur les lignes cliquables
- Colonnes triables si pertinent
- Responsive : scroll horizontal sur mobile

---

## Navigation

### Sidebar
```
[Code de la sidebar — items, active state, icons, collapse optionnel]
```

### Breadcrumb
```
[Code du breadcrumb — separateurs, lien actif]
```

---

## Modales

### Modal standard
```
[Code de la modale — overlay, container, header, body, footer, close button]
```

### Regles
- Fermeture : bouton X + clic outside + touche Escape
- Max-width : 480px (petit), 640px (moyen), 960px (large)
- Radius : 16px
- Overlay : fond noir a 50% opacite

---

## Icones

Librairie : <!-- definie a l'onboarding (Lucide, Heroicons, Material Icons...) -->

### Regles
- Taille standard : 16px (inline), 20px (boutons), 24px (standalone)
- Couleur : herite du texte parent
- Toujours un `aria-label` si l'icone est seule (pas de texte adjacent)
