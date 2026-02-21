# 03 Review — Conformite code vs spec

> Rapports de conformite generes par `/review`. Score objectif GO/NO-GO.

---

## Quand lancer une review

- Apres avoir builde un composant avec `/build`
- Quand tu veux verifier qu'un composant existant est conforme a sa spec
- Quand tu doutes de la qualite d'une implementation

**Commande** : `/review`

## Comment ca fonctionne

1. **Prerequis** : Du code dans `02_Build/{module}/` et une spec dans `01_Product/04 Specs/{module}/specs/`
2. **Commande** : `/review` compare le code a la spec
3. **Sortie** : Un rapport de conformite avec score X/Y
4. **Verdict** : GO (100%) ou NO-GO avec la liste des ecarts types

## Structure des dossiers

```
03_Review/
├── README.md                            ← Ce fichier
├── _template-review.md                  ← Template de rapport
└── {module}/
    └── reviews/
        ├── review-1.1-overview-page.md  ← Rapport de review
        ├── review-1.2-detail-panel.md
        └── review-2.1-settings.md
```

## Template

Le fichier `_template-review.md` montre le format complet des rapports. Les rapports sont generes automatiquement par `/review` — pas besoin de remplir manuellement.

## Lire un rapport de review

Chaque review contient 5 niveaux de verification :

| Section | Contenu |
|---------|---------|
| **Score de conformite** | X/Y criteres d'acceptance passes (Gherkin) |
| **Verifications complementaires** | Etats (vide, loading, erreur, succes), responsive, accessibilite, types, tests |
| **Verifications UX** | Lois UX (Miller, Hick, Fitts, Doherty, Jakob, Von Restorff, Goal-Gradient, Peak-End) |
| **Verifications Design System** | Hardcoded values, composants DS, spacing, fonts |
| **Verdict** | **GO** (100%) ou **NO-GO** avec triage des ecarts |

## Triage NO-GO

Si le verdict est NO-GO, chaque ecart est classe par type :

| Type | Signifie | Agent de resolution |
|------|----------|-------------------|
| **IMPL** | Bug ou oubli dans le code | → `/build` |
| **SPEC** | La spec est incomplete ou ambigue | → `/spec` |
| **DESIGN** | Le pattern UX est a revoir | → `/ux` |
| **DISCOVERY** | L'hypothese utilisateur est fausse | → `/discovery` |

**Priorite** : DISCOVERY > DESIGN > SPEC > IMPL
Le type dominant determine vers quel agent la review redirige.

## Ce dossier est vide ?

Normal si tu n'as pas encore lance `/review`. Il faut d'abord avoir du code (`/build`) a comparer a une spec.
