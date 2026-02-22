---
name: commands
user-invocable: true
panel-description: Affiche toutes les commandes disponibles.
description: >
  Affiche la liste de toutes les commandes disponibles (agents et overrides).
  Aucun outil, aucune logique — juste un affichage rapide.
allowed-tools: ""
category: Navigation
tags:
  - help
  - commands
  - navigation
  - reference
---

# Agent Commands — Liste rapide

> Affiche toutes les commandes disponibles a tout moment.

---

## Instruction

Quand l'utilisateur invoque `/commands`, affiche **exactement** le bloc ci-dessous (pas de lecture de fichier, pas de logique) :

```
=== Commandes disponibles ===

--- Agents ---
| Commande | Agent | Description |
|----------|-------|-------------|
| /o | Orchestrateur | Coordonne les agents, propose un plan d'execution |
| /discovery | Workshop guide | Enrichit la comprehension utilisateurs et domaine |
| /ux | Sparring partner UX | Explore les directions UX, challenge les hypotheses |
| /spec | Gardien de la spec | Genere une spec complete depuis les user stories |
| /build | Builder TDD | Code en TDD depuis une spec validee |
| /review | Reviewer de conformite | Score de conformite code vs spec (GO/NO-GO) |
| /ui | Expert visuel | Genere des mockups (SVG, HTML, React) |
| /wireframe | Architecte de layout | Wireframes low-fi, boards juxtaposes, navigation |
| /explore | Prototypage rapide | Prototype jetable, happy path, mock data |
| /screen-map | Diagnostic d'integrite | Audit coherence ecrans-specs-stories |
| /health | Diagnostic global | Bilan de sante du projet (score + actions) |
| /onboarding | Configuration projet | Configure le projet pas a pas |

--- Commandes d'override (utilisables a tout moment) ---
| Commande | Effet |
|----------|-------|
| /stop | Pause immediate |
| /back | Revient a l'etape precedente |
| /skip | Saute l'etape courante |
| /variants [n] | Genere n alternatives (defaut: 3) |
| /inject [agent] | Insere un agent dans le flow |
| /why | Explique le raisonnement |
| /fork [nom] | Cree une variante parallele |
| /status | Affiche l'etat du flow en cours |
| /reset | Abandonne le flow, repart de zero |
| /commands | Affiche cette liste |
```

## Regles

1. **Aucune lecture de fichier** — Le contenu est statique, defini ci-dessus.
2. **Aucune modification** — Ce skill ne modifie rien.
3. **Rapide** — Affichage immediat, pas de traitement.
4. **Mise a jour manuelle** — Si un nouvel agent est ajoute au projet, mettre a jour ce fichier.
