# Design System — Patterns de composition

> Patterns reutilisables pour les layouts complexes. Chaque pattern combine des composants atomiques.
> Remplis avec les patterns specifiques a ton projet.

---

## Formulaires

### Layout standard
```
[Form layout — labels au-dessus, colonnes, groupes logiques, spacing]
```

### Validation
```
[Validation pattern — inline errors, submit disabled until valid, error summary]
```

### Regles
- Grouper les champs par tache (pas par type technique)
- Validation inline en temps reel (pas seulement au submit)
- Boutons d'action en bas a droite (convention)
- Si > 7 champs : decomposer en etapes (wizard)

---

## Listes avec filtres

### Layout
```
[List with filters — filter bar + list/table + pagination + empty state]
```

### Regles
- Max 4 filtres visibles (au-dela : "Plus de filtres")
- Resultats : nombre total visible
- Tri : au moins par date et par nom
- Pagination ou infinite scroll selon le volume

---

## Dashboard KPI

### Layout
```
[Dashboard — KPI cards row + charts + activity feed]
```

### Regles
- Max 4 KPI cards par rangee (preferer 4 + "voir tout")
- Chaque KPI : valeur, label, tendance (optionnel)
- Les KPIs les plus importants sont en premiere position

---

## Stepper / Wizard

### Layout
```
[Stepper — progress indicator + step content + navigation buttons]
```

### Regles
- Progression visible (stepper horizontal ou vertical)
- Navigation avant/arriere
- Validation par etape avant de continuer
- Resume des choix precedents accessible

---

## Timeline

### Layout
```
[Timeline — vertical line + event cards + dates]
```

### Regles
- Ordre chronologique (plus recent en haut par defaut)
- Chaque evenement : date, titre, description courte, badge de type
- Les evenements importants sont visuellement distincts
