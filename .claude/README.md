# .claude/ — Design OS Agent System

> Configuration and AI agents for the Design Operating System.

---

## Configuration files

| File | Role | Modified by |
|------|------|------------|
| `context.md` | Active module (slug, label, pillar) | `/onboarding`, manual edits |
| `profile.md` | User profile (designer, founder, PM, dev) | `/onboarding` Phase 2b |
| `memory.md` | Persistent session journal (contextual memory) | `/o` automatically (append‑only) |
| `flow-state.yaml` | Orchestrator flow state (current session) | `/o` automatically |

## `skills/` folder

Each subfolder contains a `SKILL.md` that defines an agent (slash command):

| Agent | Command | Role |
|-------|--------|------|
| **Onboarding** | `/onboarding` | Configures the project (first thing to run) |
| **Orchestrator** | `/o` | Coordinates agents, proposes plans |
| **Discovery** | `/discovery` | Deepens user/domain understanding, structures hypotheses |
| **UX Design** | `/ux` | Explores UX directions, challenges hypotheses |
| **Spec** | `/spec` | Generates complete specs (9 sections) |
| **Build** | `/build` | Codes in TDD from a validated spec |
| **Review** | `/review` | Scores code conformity vs spec |
| **Explore** | `/explore` | Quick prototype (happy path) |
| **UI Designer** | `/ui` | SVG, HTML, React mockups |
| **Screen‑Map** | `/screen-map` | Diagnoses screen/spec/story coherence |
| **Health** | `/health` | Global project diagnostic (score + recommended actions) |

## How it works

1. The user runs a command (e.g. `/ux`)
2. Claude Code reads the corresponding `SKILL.md`
3. The agent follows the workflow defined in that SKILL file
4. It reads `context.md` to know which module to work on
5. It reads `profile.md` to adapt its communication style

## External skills

The `skills-registry.md` file (project root) lists external skills that can be loaded on demand.
The `/build` and `/review` agents load them automatically from GitHub based on the project stack.
See the registry for activation conditions and how to add a new skill.

## How to change behavior

- **Change module**: Edit `context.md`
- **Change profile**: Edit `profile.md` or run `/onboarding` again
- **Customize an agent**: Edit its corresponding `SKILL.md`
- **Add an external skill**: Add a row in `skills-registry.md`
