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
