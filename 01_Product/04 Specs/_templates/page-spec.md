# [Page] — [Nom de la page]

> Version : 1.0
> Statut : DRAFT | VALIDEE | EN COURS | LIVREE
> Derniere modification : [date]

---

## 1. Vue d'ensemble

> Cette page permet a **[Role]** de **[objectif principal]**.

**Route** : `/[chemin]`
**Screen Map reference** : `00_screen-map.md` — Ecran #[N] "[Nom]"
**Stories couvertes** : [X.1, X.2, X.3, ...] (toutes les stories mappees a cet ecran)
**EPIC source** : [EPIC X — Nom]

---

## 2. Acceptance Criteria (Gherkin)

Criteres au niveau de la page (les criteres par composant sont dans les specs composant).

- [ ] **Given** [contexte] **When** [action] **Then** [resultat]
- [ ] **Given** [contexte] **When** [action] **Then** [resultat]

---

## 3. Layout et composition

```
+--------------------------------------------------+
|  Header                                          |
+--------+-----------------------------------------+
|        |                                         |
| Side   |  Zone principale                        |
| bar    |                                         |
|        |  +-----------------------------------+  |
|        |  | Composant A (spec X.Y)            |  |
|        |  +-----------------------------------+  |
|        |                                         |
|        |  +-----------------------------------+  |
|        |  | Composant B (spec X.Y)            |  |
|        |  +-----------------------------------+  |
|        |                                         |
+--------+-----------------------------------------+
```

### Composants de la page
| Composant | Spec reference | Description |
|-----------|---------------|-------------|
| [Nom] | [X.Y] | [role dans la page] |

---

## 4. Etats de la page

| Etat | Condition | Comportement |
|------|-----------|--------------|
| Premier acces | Aucune donnee | Empty state + guide de demarrage |
| Charge | Donnees en cours | Skeleton de la page complete |
| Normal | Donnees presentes | Tous les composants actifs |
| Erreur globale | API indisponible | Message + retry |
| Acces refuse | Pas les droits | Redirect ou message 403 |

---

## 5. Navigation et interactions

### Entrees vers cette page
- [Depuis quelle page / quel CTA]

### Sorties depuis cette page
- [Vers quelle page / quelle action]

### Interactions cles
| Action utilisateur | Resultat | Composant concerne |
|-------------------|----------|-------------------|
| [clic, saisie, etc.] | [ce qui se passe] | [quel composant] |

---

## 6. Donnees

### Modele de donnees principal
```typescript
interface [PageData] {
  // champs avec types
}
```

### APIs consommees
| Endpoint | Methode | Utilisation |
|----------|---------|-------------|
| `/api/...` | GET | Chargement initial |

---

## 7. Design System

- **Layout** : [grid/flex, colonnes, spacing]
- **Tokens** : [palette, typo, spacing specifiques]
- **Responsive** : [comportement par breakpoint]

---

## 8. Roles et permissions

<!-- Remplis avec les roles definis dans CLAUDE.md (section Target Users > Roles) -->
| Role | Acceder | Actions disponibles |
|------|---------|-------------------|
| [Role 1] | | |
| [Role 2] | | |
| [Role 3] | | |

---

## 9. Hors perimetre

- [Ce que cette page ne fait PAS]
