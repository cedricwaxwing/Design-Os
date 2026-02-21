# .claude/ — Systeme d'agents du Design OS

> Configuration et agents IA du Design Operating System.

---

## Fichiers de configuration

| Fichier | Role | Modifie par |
|---------|------|-------------|
| `context.md` | Module actif (slug, label, pilier) | `/onboarding`, manuellement |
| `profile.md` | Profil utilisateur (designer, founder, PM, dev) | `/onboarding` Phase 2b |
| `memory.md` | Journal persistant des sessions (memoire contextuelle) | `/o` automatiquement (append-only) |
| `flow-state.yaml` | Etat du flow orchestrateur (session courante) | `/o` automatiquement |

## Dossier skills/

Chaque sous-dossier contient un `SKILL.md` qui definit un agent (slash command) :

| Agent | Commande | Role |
|-------|----------|------|
| **Onboarding** | `/onboarding` | Configure le projet (premiere chose a lancer) |
| **Orchestrator** | `/o` | Coordonne les agents, propose des plans |
| **Discovery** | `/discovery` | Enrichit la comprehension utilisateurs/domaine, structure les hypotheses |
| **UX Design** | `/ux` | Explore les directions UX, challenge les hypotheses |
| **Spec** | `/spec` | Genere des specs completes (9 sections) |
| **Build** | `/build` | Code en TDD depuis une spec validee |
| **Review** | `/review` | Score la conformite code vs spec |
| **Explore** | `/explore` | Prototype rapide (happy path) |
| **UI Designer** | `/ui` | Mockups SVG, HTML, React |
| **Screen-Map** | `/screen-map` | Diagnostique la coherence ecrans/specs/stories |
| **Health** | `/health` | Diagnostic global du projet (score + actions recommandees) |

## Comment ca marche

1. L'utilisateur lance une commande (ex: `/ux`)
2. Claude Code lit le `SKILL.md` correspondant
3. L'agent suit son workflow defini dans le SKILL.md
4. Il lit `context.md` pour savoir sur quel module travailler
5. Il lit `profile.md` pour adapter son style de communication

## Skills externes

Le fichier `skills-registry.md` (racine du projet) liste les skills externes chargeables a la volee.
Les agents `/build` et `/review` les chargent automatiquement depuis GitHub selon la stack du projet.
Voir le registre pour les conditions d'activation et comment ajouter un skill.

## Modifier le comportement

- **Changer de module** : Editer `context.md`
- **Changer de profil** : Editer `profile.md` ou relancer `/onboarding`
- **Personnaliser un agent** : Editer le `SKILL.md` correspondant
- **Ajouter un skill externe** : Ajouter une ligne dans `skills-registry.md`
