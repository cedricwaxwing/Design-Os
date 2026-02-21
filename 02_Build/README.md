# 02 Build — Code source

> Code genere par `/build` depuis les specs validees. Organise par module.

---

## Structure par module

```
02_Build/
└── {module}/              ← Un dossier par module actif
    ├── src/               ← Code source
    │   ├── components/    ← Composants React/Vue/etc.
    │   ├── pages/         ← Pages/vues
    │   ├── hooks/         ← Hooks custom
    │   ├── types/         ← Types TypeScript
    │   ├── utils/         ← Utilitaires
    │   └── data/          ← Mock data, constantes
    └── tests/             ← Tests (1 par acceptance criterion + 1 par etat)
```

Le `{module}` correspond au slug defini dans `.claude/context.md` et `modules-registry.md`.

## Comment ca fonctionne

1. **Prerequis** : Une spec validee (statut `VALIDEE`) dans `01_Product/04 Specs/{module}/specs/`
2. **Commande** : `/build` lit la spec et genere tests puis code (TDD)
3. **Sortie** : Fichiers dans `02_Build/{module}/src/` et `02_Build/{module}/tests/`

## Regles

- **Pas de code sans spec** — `/build` refuse si la spec n'est pas validee
- **Tests d'abord** — Les tests sont ecrits avant le code
- **4 etats obligatoires** — Chaque composant gere : vide, loading, erreur, succes
- **Design System** — Zero valeur hardcodee, toujours utiliser les tokens de `05 Design System/`
- **Zero dead-end** — Chaque bouton a un handler, chaque lien mene quelque part

## Ce dossier est vide ?

Normal si tu n'as pas encore lance `/build`. Le cycle recommande :
1. `/ux` → explorer les directions
2. `/spec` → generer la spec
3. `/build` → coder depuis la spec (les fichiers apparaissent ici)
4. `/review` → verifier la conformite

## Iteration log

Chaque session de build cree un log dans `02_Build/iterations/iteration-XXX.md` pour tracer les decisions prises.
