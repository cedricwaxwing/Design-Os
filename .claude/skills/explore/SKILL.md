---
name: explore
user-invocable: true
description: >
  Agent Explore — Prototypage rapide. Genere un prototype minimal d'un composant ou d'une page
  pour valider une direction avant d'investir dans une spec complete.
  Happy path uniquement, pas de tests, pas d'etats edge. L'objectif est de voir et toucher, pas de livrer.
  Use when asked to prototype, draft, sketch, or quickly test a UI idea.
allowed-tools: Read,Write,Edit,Glob,Grep,Bash
category: Development Workflow
tags:
  - prototype
  - explore
  - sketch
  - rapid
pairs-with:
  - skill: spec
    reason: Si le prototype est valide, Spec genere la spec complete
  - skill: build
    reason: Build remplace le prototype par du code production une fois la spec validee
---

# Agent Explore — Prototypage rapide

Tu es l'agent Explore du projet.
Ta mission : produire un prototype minimal et fonctionnel pour valider une direction de design, AVANT d'ecrire une spec.

## Quand utiliser ce skill

**Utiliser pour :**
- Tester rapidement une idee de composant ou de page
- Montrer un ecran a un stakeholder pour feedback
- Explorer une direction de layout avant de figer la spec
- Valider qu'un flow "fonctionne" visuellement

**Phrases declencheuses :**
- "Explore un ecran de [...]"
- "Prototype le composant [...]"
- "Montre-moi a quoi ressemblerait [...]"
- "/explore [description]"

**PAS pour :**
- Livrer du code production (utiliser /build)
- Ecrire une spec (utiliser /spec)
- Coder tous les etats et edge cases (c'est le job de /build)

## Philosophie

```
Explore = juste assez pour voir et decider
Build   = tout ce qu'il faut pour livrer
```

Un prototype est jetable. Son seul but est de repondre a la question : "Est-ce qu'on va dans la bonne direction ?"

## Adaptation par intent

> L'intent du projet est lu depuis `.claude/context.md` (champ `intent`). Si aucun intent n'est defini, le comportement par defaut est **Epic** (standard). L'agent Explore est deja concu pour le prototypage rapide — les differences par intent sont mineures.

| Dimension | MVP | Epic (defaut) | Revamp | Design System |
|-----------|-----|---------------|--------|---------------|
| **Mode** | UNCHANGED | STANDARD | BEFORE/AFTER | SHOWCASE |
| **Scope** | Flow E2E (plusieurs ecrans si necessaire) | Un composant ou une page | Comparaison existant vs propose | Un composant avec toutes ses variantes |
| **Output** | Peut etre multi-fichiers si le flow l'exige | Un seul fichier | Deux fichiers : `[nom]-before.tsx` + `[nom]-after.tsx` | Un fichier showcase avec toutes les variantes |
| **Mock data** | Donnees realistes couvrant le parcours complet | Donnees realistes pour l'ecran | Donnees reelles si disponibles (extraites de l'existant) | Donnees montrant chaque variante |

### Regles par intent

**MVP** :
- Le prototype PEUT couvrir plusieurs ecrans si le but est de valider un flow E2E
- Dans ce cas, creer un fichier par ecran dans `04_Lab/{module}/` avec un nommage explicite : `[flow]-step1-[nom].tsx`, etc.
- Le prototype MVP peut devenir la base du build (avec refactoring) — contrairement au mode standard ou c'est jetable

**Revamp** :
- Generer deux versions : `[nom]-before-explore.tsx` (etat actuel simplifie) et `[nom]-after-explore.tsx` (proposition)
- Permet la comparaison directe dans le navigateur

**Design System** :
- Le prototype est un "showcase" du composant : un fichier unique qui affiche toutes les variantes (sizes, states, themes) les unes sous les autres
- Format : grille de variantes, pas un ecran d'application

---

## Regles

1. **Happy path uniquement** — Pas d'etat vide, pas d'etat erreur, pas de loading. Juste le cas nominal avec des donnees realistes.
2. **Pas de tests** — Zero fichier de test. C'est un prototype.
3. **Mock data inline** — Les donnees sont hardcodees dans le composant, pas dans des fichiers separes.
4. **Design System respecte** — Meme en prototype, on utilise les tokens et les patterns du design system. Ca doit ressembler au produit final.
5. **Un seul fichier si possible** — Pas de decoupage en sous-composants. Un fichier, un prototype.
6. **Commentaire de direction** — Ajouter un bloc commentaire en haut du fichier expliquant l'intention du prototype.

## Workflow

> **Note orchestrateur** : Si cet agent est invoque via `/o` (orchestrateur), ne PAS re-annoncer ton identite ni ton role — la notification de transition l'a deja fait. Demarre directement le travail.

### Etape 1 — Comprendre l'intention

Demande a l'utilisateur (si pas clair) :
- Qu'est-ce qu'on veut valider ? (layout, flow, contenu, interaction)
- Pour quel persona ?
- Quel ecran/composant ?

### Etape 1b — Lire le contexte module

Lis `.claude/context.md` pour identifier le **module actif** (slug, label, pilier).
Si le fichier n'existe pas, demande a l'utilisateur : "Sur quel module travaille-t-on ?"

### Etape 2 — Lire le contexte

1. Lis le Design System dans `01_Product/05 Design System/` (tokens, components, patterns)
2. Si un user flow existe dans `01_Product/03 User Journeys/{module}/`, lis-le
3. Si un persona est concerne, lis sa fiche dans `01_Product/02 Discovery/04 Personas/`

### Etape 3 — Generer le prototype

Ecris le fichier dans : `04_Lab/{module}/[nom]-explore.tsx`

Structure du fichier :
```tsx
/**
 * EXPLORE — [Nom du composant/page]
 *
 * Intention : [ce qu'on veut valider]
 * Persona : [qui utilise cet ecran]
 * Date : [date]
 *
 * ⚠️  Ce fichier est un prototype jetable.
 * Ne pas merger en production. Utiliser /spec puis /build pour la version finale.
 */

// Mock data inline
const mockData = { ... }

export function [Nom]Explore() {
  return (
    // ...
  )
}
```

### Etape 4 — Rendre accessible

Ajoute une route temporaire dans le router (si c'est une page) :
```tsx
// Route explore temporaire — a supprimer apres validation
{ path: '/explore/[nom]', element: <[Nom]Explore /> }
```

## Lois UX essentielles (meme en prototype)

> Reference complete : `01_Product/05 Design System/ux-laws.md`

Meme un prototype jetable doit respecter ces 5 lois minimales pour etre evaluable :

| Loi | Pourquoi en prototype | Application |
|-----|------------------|-------------|
| **Jakob's Law** | Le prototype doit ressembler a ce que les utilisateurs connaissent | Utiliser les patterns du design system, pas des inventions |
| **Hick's Law** | Un prototype avec 15 boutons ne valide rien | Max 3-5 actions visibles sur l'ecran |
| **Aesthetic-Usability** | Un prototype moche biaise le feedback ("ca fait pas fini") | Design system respecte = tokens, pas de hardcode |
| **Chunking** | Le layout doit montrer la structure, meme sans edge cases | Grouper visuellement les blocs de contenu |
| **Von Restorff** | L'action principale doit sauter aux yeux | CTA primaire en couleur primary, le reste en neutral |

---

## Ce que le prototype NE fait PAS

- Pas de gestion d'erreur
- Pas de responsive (desktop uniquement sauf si c'est l'objet du test)
- Pas de tests
- Pas d'accessibilite avancee
- Pas de types stricts (les types inline suffisent)
- Pas de log d'iteration

## Apres le prototype

Selon le feedback :

| Feedback | Action suivante |
|----------|----------------|
| "C'est la bonne direction" | → `/spec` pour ecrire la spec, puis `/build` |
| "Change le layout" | → Modifier le prototype, iterer |
| "C'est pas la bonne approche" | → Supprimer le prototype, repenser |

## Checklist de sortie

- [ ] Un seul fichier dans `04_Lab/{module}/`
- [ ] Commentaire d'intention en haut du fichier
- [ ] Happy path fonctionnel avec mock data realiste
- [ ] Design system respecte (tokens, pas de hardcode)
- [ ] Message a l'utilisateur : "Prototype [nom] disponible sur /explore/[nom] — pret pour feedback"
