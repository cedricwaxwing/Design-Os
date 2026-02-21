# Registre des modules

> Remplis ce fichier avec tes modules. Genere automatiquement par `/onboarding`.

| # | Module | Slug | Pilier | Statut | Phase actuelle |
|---|--------|------|--------|--------|----------------|
| 1 | {premier module} | `{slug}` | {pilier} | Actif | - |

---

## Comment utiliser

1. Ajouter un module : inserer une ligne dans le tableau ci-dessus
2. Activer un module : modifier `.claude/context.md` avec le slug du module
3. Un seul module actif a la fois — les agents resolvent les chemins via `{module}`

## Conventions

- **Slug** : kebab-case, pas d'espaces, pas de majuscules (ex: `study-cockpit`, `user-dashboard`)
- **Pilier** : Regroupement logique de modules (optionnel). Ex: "Collaboration", "Analytics", "Admin"
- **Statut** : `Actif` | `Planifie` | `Archive`
- **Phase** : `Discovery` | `Design` | `Spec` | `Build` | `Review` | `Done`

---

## Quand creer un module

Un module represente une **zone fonctionnelle autonome** du produit. Voici les regles de decision :

| Situation | Decision | Raison |
|-----------|----------|--------|
| 2 features partagent 80%+ des ecrans | **Meme module** | Les ecrans sont communs, les specs aussi |
| 2 features ont des personas distincts et des parcours separes | **Modules distincts** | Les utilisateurs et les flows sont differents |
| Une feature a son propre dashboard/landing | **Module distinct** | Point d'entree autonome |
| Une feature est un sous-ensemble d'un ecran existant | **Meme module** | C'est un composant, pas un module |
| Tu hesites | **Commence avec 1 module** | Tu pourras toujours splitter plus tard |

### Dependencies inter-modules

Les modules sont concus pour etre independants, mais des dependances peuvent exister :
- Documentees dans la **section 7 (Dependencies)** de chaque spec
- Un composant partage entre modules vit dans le Design System (`05 Design System/`)
- Si un module A depend d'un ecran du module B, le Screen Map du module A le reference

### Exemple

```
Pilier "Collaboration" :
  ├── Module "dashboard" — Vue d'ensemble pour le Manager
  └── Module "study-cockpit" — Espace de travail pour le Researcher

Pilier "Admin" :
  └── Module "settings" — Configuration pour l'Admin
```
