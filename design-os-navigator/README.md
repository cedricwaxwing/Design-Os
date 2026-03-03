# Design OS

**Un système d'exploitation pour le design produit** — pilotez vos projets de la discovery au code avec une méthodologie spec-driven.

## Fonctionnalités

### Navigator
Visualisez la structure de votre projet Design OS sous forme de graphe interactif :
- **Vue globale** des modules, specs et fichiers
- **Score de readiness** par module et global
- **Navigation rapide** vers les specs, screens et code
- **Lancement des commandes** (`/spec`, `/build`, `/review`...) en un clic

### Prototyper
Gérez vos artefacts générés par Claude :
- **Feed d'artefacts** avec prévisualisation
- **Copie rapide** du code généré
- **Régénération** avec variantes ou prompts personnalisés

### Console
Lancez Claude Code directement depuis VS Code/Cursor avec le contexte de votre projet.

## Installation

1. Installez l'extension depuis le marketplace
2. Ouvrez un projet contenant un fichier `CLAUDE.md` ou `.claude/context.md`
3. L'icône Design OS apparaît dans la barre d'activité

## Prérequis

- VS Code 1.85+ ou Cursor
- [Claude Code](https://claude.com/claude-code) installé
- Le template **Design OS** complet (voir ci-dessous)

## Installation du template Design OS

Cette extension fonctionne avec le template Design OS qui inclut :

```
.claude/
├── context.md           ← Module actif et intent
├── profile.md           ← Profil utilisateur
├── memory.md            ← Journal de session
└── skills/              ← Skills Claude Code (obligatoires)
    ├── discovery/       ← /discovery
    ├── ux-design/       ← /ux
    ├── spec/            ← /spec
    ├── build/           ← /build
    ├── review/          ← /review
    └── ...
```

**Les skills sont co-dépendants** — l'extension et les skills forment un système intégré.

Clonez le template complet : [Design OS Template](https://github.com/MehdiVilquin/design-os)

## Méthodologie Design OS

Design OS est un framework spec-driven en 3 phases :

```
Discovery → Spec → Build → Review
```

- **Discovery** : Comprendre utilisateurs et domaine
- **Spec** : Spécifications validées avant tout code
- **Build** : Code TDD depuis les specs
- **Review** : Conformité code vs spec

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `/discovery` | Workshop de découverte produit |
| `/ux` | Co-création UX et validation hypothèses |
| `/spec` | Génération de spec depuis les EPICs |
| `/build` | Code TDD depuis spec validée |
| `/review` | Score de conformité code vs spec |
| `/health` | Diagnostic santé du projet |

## Licence

MIT

---

**Auteur** : Mehdi Vilquin
**Version** : 0.7.0
