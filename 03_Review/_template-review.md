# Review — [X.Y] [Nom du composant/page]

**Spec source** : `01_Product/05 Specs/{module}/specs/X.Y-nom.spec.md`
**Code** : `02_Build/{module}/src/...`
**Tests** : `02_Build/{module}/tests/...`
**Date** : [YYYY-MM-DD]
**Reviewer** : `/review`

---

## Score de conformite : X/Y

| # | Critere (Gherkin) | Statut | Detail |
|---|-------------------|--------|--------|
| 1 | Given [contexte] When [action] Then [resultat attendu] | PASSE / ECHOUE | [explication si echoue] |
| 2 | Given [...] When [...] Then [...] | PASSE / ECHOUE | [detail] |
| 3 | Given [...] When [...] Then [...] | PASSE / ECHOUE | [detail] |

---

## Verifications complementaires

| Verification | Statut | Detail |
|--------------|--------|--------|
| Etat vide | PASSE / ECHOUE | [rendu conditionnel quand data est vide] |
| Etat chargement | PASSE / ECHOUE | [skeleton loader ou spinner] |
| Etat erreur | PASSE / ECHOUE | [message d'erreur + retry] |
| Etat succes | PASSE / ECHOUE | [rendu avec donnees] |
| Responsive | PASSE / ECHOUE | [breakpoints dans les classes] |
| Accessibilite | PASSE / ECHOUE | [aria-*, role=, tabIndex] |
| Types stricts | PASSE / ECHOUE | [pas de any / @ts-ignore] |
| Design system (tokens) | PASSE / ECHOUE | [pas de hardcode couleurs/spacing] |
| Tests complets | PASSE / ECHOUE | [un test par AC + un test par etat] |

## Verifications UX

| Verification | Loi UX | Statut | Detail |
|--------------|--------|--------|--------|
| Charge cognitive | Miller, Chunking | PASSE / ECHOUE | [info groupee en blocs vs liste plate > 7] |
| Choix utilisateur | Hick | PASSE / ECHOUE | [<= 5 actions visibles vs > 5 CTAs] |
| Cibles cliquables | Fitts | PASSE / ECHOUE | [CTAs >= 36px vs boutons < 32px] |
| Feedback latence | Doherty | PASSE / ECHOUE | [skeleton loader vs pas de feedback] |
| Coherence patterns | Jakob | PASSE / ECHOUE | [patterns du DS vs patterns inventes] |
| Element distinctif | Von Restorff | PASSE / ECHOUE | [CTA primaire distinct vs boutons identiques] |
| Progression | Goal-Gradient | PASSE / ECHOUE | [barre de progression si multi-step] |
| Experience de fin | Peak-End | PASSE / ECHOUE | [succes gratifiant vs redirect sans feedback] |

## Verifications Design System

| # | Check | Statut | Detail |
|---|-------|--------|--------|
| DS-1 | Couleurs hex hardcodees | PASSE / ECHOUE | [0 occurrence dans .tsx] |
| DS-2 | Couleurs rgb/rgba inline | PASSE / ECHOUE | [0 occurrence] |
| DS-3 | Valeurs arbitraires | PASSE / ECHOUE | [0 occurrence de `[#` `[Npx]`] |
| DS-4 | Composants DS reutilises | PASSE / ECHOUE | [composants existants utilises] |
| DS-5 | Spacing hardcode | PASSE / ECHOUE | [0 inline margin/padding] |
| DS-6 | Font hardcodee | PASSE / ECHOUE | [0 fontSize inline] |

---

## Verdict : GO / NO-GO

### Si NO-GO — Ecarts identifies

| # | Ecart | Type | Action requise |
|---|-------|------|---------------|
| 1 | [description de l'ecart] | IMPL / SPEC / DESIGN / DISCOVERY | [action concrete] |
| 2 | [description] | [type] | [action] |

**Legende des types :**
- **IMPL** — Fix dans le code → `/build`
- **SPEC** — Fix dans la spec → `/spec`
- **DESIGN** — Pattern UX a revoir → `/ux`
- **DISCOVERY** — Hypothese utilisateur fausse → `/discovery`

**Priorite des retours** : DISCOVERY > DESIGN > SPEC > IMPL

**Type dominant** : [type] → Recommandation : relancer [agent]
