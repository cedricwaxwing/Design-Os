# [ID] — [Titre de la story]

> Version : 1.0
> Statut : DRAFT | VALIDEE | EN COURS | LIVREE
> Derniere modification : [date]

---

## 1. User Story

> En tant que **[Role]**, je veux **[action]** pour **[benefice]**.

**EPIC source** : [EPIC X — Nom]
**Story reference** : [X.Y dans le backlog]
**Screen Map reference** : `00_screen-map.md` — Ecran #[N] "[Nom]" (si applicable — pas pour les composants atomiques)

---

## 2. Acceptance Criteria (Gherkin)

Chaque critere est binaire : passe ou echoue.

- [ ] **Given** [contexte initial] **When** [action utilisateur] **Then** [resultat attendu]
- [ ] **Given** [contexte initial] **When** [action utilisateur] **Then** [resultat attendu]
- [ ] **Given** [contexte initial] **When** [action utilisateur] **Then** [resultat attendu]

> REGLE : Si un critere contient "a definir", "TBD", "TODO" ou "?" → la spec n'est PAS validee.

---

## 3. Etats d'ecran

| Etat | Description | Comportement |
|------|-------------|--------------|
| Vide | Aucune donnee a afficher | Message explicatif + CTA pour creer/ajouter |
| Chargement | Donnees en cours de chargement | Skeleton loader sur les zones de contenu |
| Succes | Donnees chargees et affichees | Vue principale avec toutes les interactions |
| Erreur | Echec de chargement ou de validation | Message d'erreur contextualise + bouton Reessayer |
| Edge case | [decrire le cas limite] | [decrire le comportement] |

---

## 4. Layout

> Description textuelle de la disposition visuelle du composant.

```
+--------------------------------------------------+
|  [Zone 1 — decrire]                              |
+--------------------------------------------------+
|  [Zone 2 — decrire]          |  [Zone 3]         |
|                               |                   |
+--------------------------------------------------+
```

**Regles de disposition :**
- [ex: Le formulaire est en 2 colonnes sur desktop, 1 colonne sur mobile]
- [ex: Le CTA principal est ancre en bas a droite]
- [ex: Le breadcrumb est en haut, au-dessus du titre]

**Hierarchie visuelle :**
1. [Element le plus important — ex: le titre]
2. [Second — ex: les metadata cles]
3. [Tertiaire — ex: les actions secondaires]

---

## 5. Donnees entree/sortie

### Input
```typescript
// Modele de donnees en entree
interface [NomInput] {
  // champs avec types
}
```

### Output
```typescript
// Ce que le composant rend/retourne
interface [NomOutput] {
  // champs avec types
}
```

### API
| Methode | Endpoint | Payload | Reponse |
|---------|----------|---------|---------|
| GET/POST/PUT/DELETE | `/api/...` | `{ ... }` | `{ ... }` |

---

## 6. Design System

### Tokens utilises
- **Couleurs** : [ex: primary-600, neutral-100, semantic-error]
- **Spacing** : [ex: space-4, space-8]
- **Typographie** : [ex: heading-lg, body-md]

### Composants atomiques
- [ex: Button/primary, Input/text, Card, Badge, Alert]

### Responsive
| Breakpoint | Comportement |
|------------|--------------|
| Mobile (< 768px) | [decrire] |
| Tablet (768-1024px) | [decrire] |
| Desktop (> 1024px) | [decrire] |

---

## 7. Dependances

### Specs requises
- [X.Y — Nom de la spec] — [pourquoi]

### APIs externes
- [Nom de l'API] — [endpoint]

### Modules/composants partages
- [Nom du composant] — [chemin dans src/]

---

## 8. Roles et permissions

<!-- Remplis avec les roles definis dans CLAUDE.md (section Target Users > Roles) -->
| Role | Voir | Creer | Modifier | Supprimer |
|------|------|-------|----------|-----------|
| [Role 1] | | | | |
| [Role 2] | | | | |
| [Role 3] | | | | |
| [Role 4] | | | | |

---

## 9. Hors perimetre

- [Ce que cette spec ne couvre PAS explicitement]
- [Fonctionnalites reportees a une autre spec]
- [Cas non geres dans cette iteration]
