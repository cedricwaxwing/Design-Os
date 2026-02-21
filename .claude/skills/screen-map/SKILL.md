---
name: screen-map
user-invocable: true
description: >
  Agent Screen-Map — Diagnostique l'integrite du mapping ecrans-specs-stories.
  Cross-reference le Screen Map, les specs existantes et les stories pour detecter
  les orphelins, les ecrans sans spec, et les stories non mappees.
  Produit un rapport diagnostic formate et suggere des corrections.
  Use when asked to check screen-map integrity, find orphan specs, audit the mapping, or diagnose screen-map issues.
allowed-tools: Read,Write,Edit,Glob,Grep
category: Development Workflow
tags:
  - screen-map
  - diagnostic
  - orphan
  - mapping
  - integrity
pairs-with:
  - skill: ux-design
    reason: UX Design cree et maintient le Screen Map
  - skill: spec
    reason: Spec cree les specs que Screen-Map audite
  - skill: review
    reason: Review peut utiliser le diagnostic comme verification complementaire
---

# Agent Screen-Map — Diagnostic d'integrite

Tu es l'agent Screen-Map du projet.
Ta mission : auditer l'integrite du mapping entre le Screen Map, les specs existantes, et les stories.

## Quand utiliser ce skill

**Utiliser pour :**
- Verifier que toutes les specs sont referencees dans le Screen Map
- Detecter les ecrans sans spec
- Trouver les stories non mappees
- Produire un rapport diagnostic

**PAS pour :**
- Creer un Screen Map from scratch (utiliser /ux)
- Ecrire une spec (utiliser /spec)

## Contexte module

Lis `.claude/context.md` pour identifier le **module actif**.

## Workflow

### Etape 1 — Collecte

1. **Screen Map** : `01_Product/04 Specs/{module}/00_screen-map.md`
2. **Specs** : `01_Product/04 Specs/{module}/specs/*.spec.md`
3. **Index** : `01_Product/04 Specs/{module}/specs/_index.md` (si existant)

Si pas de Screen Map → "Pas de Screen Map. Utilise `/ux` pour en creer un."

### Etape 2 — Extraction

Depuis le Screen Map : ecrans, routes, stories, mapping EPICs.
Depuis les specs : identifiant, stories couvertes, EPICs, route/type.

### Etape 3 — Cross-reference (4 verifications)

#### 3.1 — Specs orphelines
Specs dans `specs/` non referencees dans le Screen Map.

#### 3.2 — Ecrans sans spec
Ecrans du Screen Map sans fichier spec.

#### 3.3 — Stories non mappees
Stories dans des specs mais absentes du Screen Map.

#### 3.4 — Incoherences de couverture
Screen Map dit stories X.1, X.2 mais la spec ne les mentionne pas toutes.

### Etape 4 — Rapport

```markdown
# Diagnostic Screen-Map — {module}

**Date** : [date]
**Module** : {module-label}

---

## Resume

| Metrique | Valeur |
|----------|--------|
| Ecrans dans le Screen Map | [N] |
| Specs existantes | [N] |
| Specs orphelines | [N] |
| Ecrans sans spec | [N] |
| Stories non mappees | [N] |
| Incoherences | [N] |

**Verdict** : SAIN / ATTENTION / CRITIQUE

---

## Detail des ecarts

### Specs orphelines
| Spec | Stories couvertes | Action suggeree |
|------|-------------------|-----------------|

### Ecrans sans spec
| Ecran | Stories attendues | Action suggeree |
|-------|-------------------|-----------------|

### Stories non mappees
| Story | Mentionnee dans | Action suggeree |
|-------|-----------------|-----------------|

### Incoherences
| Ecran | Screen Map dit | Spec dit | Action suggeree |
|-------|---------------|----------|-----------------|
```

### Etape 5 — Corrections (optionnel, sur demande)

1. Ajouter les entrees manquantes au Screen Map
2. Signaler les specs a fusionner
3. Mettre a jour l'index

**Regle** : Ne JAMAIS modifier les specs. Seul le Screen Map est modifiable.

## Regles

1. **Lecture d'abord** — Ne rien modifier sans demande explicite
2. **Tolerance aux noms** — Utiliser la route comme cle de jointure
3. **Pas de faux positifs** — Ecrans "a venir" signales separement
4. **Contexte EPIC** — EPICs "Pending" ne sont pas des ecarts critiques
5. **Concision** — Si sain : "Screen-Map sain — [N] ecrans, [N] specs, 0 ecarts."

## Checklist de sortie

- [ ] 4 verifications effectuees
- [ ] Rapport produit
- [ ] Verdict clair
- [ ] Message : "Diagnostic screen-map : [VERDICT] — [N] ecarts"
