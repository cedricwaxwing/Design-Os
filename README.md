# Design Operating System

> A spec-driven framework for designing and building digital products with Claude Code agents.

## What is this?

Design OS is an AI-native product development framework. It structures how you think, spec, build, and review digital products using specialized Claude Code agents. Each agent handles a phase of the product lifecycle — from UX exploration to spec writing, coding, and conformity review.

**Core philosophy**: Spec before code. Explore before converging. Review before shipping.

```
Strategy → Discovery (/discovery) → Design (/ux) → Spec (/spec) → Build (/build) → Review (/review)
                                          ↑                                              │
                                          └────────────── NO-GO triage ────────────────┘
```

## Quick Start

1. **Clone** this repository
2. **Install** [Claude Code](https://claude.com/code)
3. **Run** `/onboarding` — the onboarding agent will configure your project interactively

That's it. The onboarding agent asks about your project, personas, tech stack, and design tokens — then writes all configuration files automatically.

> In a hurry? Run `/onboarding express` for a 30-second setup with smart defaults.

**New here?** Read the [Getting Started walkthrough](./GETTING-STARTED.md) — a complete step-by-step story from first launch to shipped screen.

**Lost on a term?** Check the [Glossary](./GLOSSARY.md) — every technical term explained in plain language.

## Available Agents

| Agent | Command | What it does | Mode |
|-------|---------|-------------|------|
| Onboarding | `/onboarding` | Configure your project interactively | Guided |
| Orchestrator | `/o` | Coordinate multi-agent workflows, propose plans | Coordination |
| Discovery | `/discovery` | Build user/domain understanding, structure hypotheses | Guided exploration |
| UX Design | `/ux` | Explore UX directions, challenge hypotheses | Exploration (2+ options) |
| Spec | `/spec` | Generate complete specs from user stories | Execution |
| Build | `/build` | Code in TDD from validated specs | Execution |
| Review | `/review` | Score code conformity vs spec (GO/NO-GO) | Execution |
| Explore | `/explore` | Quick prototype (happy path only) | Execution |
| UI Designer | `/ui` | Generate mockups (SVG, HTML, React) | Exploration |
| Screen Map | `/screen-map` | Diagnose screen-spec-story mapping integrity | Diagnostic |
| Health | `/health` | Run a full project health check (score + actions) | Diagnostic |

## Methodology

### Spec-Driven Development
No code is written without a validated spec. The cycle:
1. **Strategy** — Define vision, brief, roadmap
2. **Discovery** (`/discovery`) — User research, personas, domain context, hypothesis mapping
3. **Design** (`/ux`) — Explore UX solutions, challenge hypotheses, define key screens
4. **Spec** (`/spec`) — Generate complete specs (9 mandatory sections, zero ambiguity)
5. **Build** (`/build`) — TDD from spec (tests first, then code)
6. **Review** (`/review`) — Score conformity, classify gaps, triage NO-GO

### Key Principle: Screens ≠ User Stories
Multiple stories often converge on the same screen. The Screen Map (`00_screen-map.md`) maps N stories → M screens. Always start by identifying key screens, not by splitting per story.

### Checkpoint Modes
| Mode | Behavior |
|------|----------|
| `minimal` | Checkpoint only at end of full cycle |
| `standard` | Checkpoint between each phase (default) |
| `granular` | Checkpoint at every significant decision |

## Folder Structure

```
Design-OS/
├── CLAUDE.md                  ← Project instructions for Claude Code
├── GETTING-STARTED.md         ← Narrative walkthrough (start here!)
├── GLOSSARY.md                ← Technical terms explained simply
├── modules-registry.md        ← Registry of product modules
├── .claude/
│   ├── context.md             ← Active module context
│   └── skills/                ← Agent definitions (slash commands)
├── 01_Product/
│   ├── 00 Material/           ← Raw source materials
│   ├── 01 Strategy/           ← Vision, brief, roadmap
│   ├── 02 Discovery/          ← User research, personas
│   ├── 03 User Journeys/      ← User flows per module
│   ├── 04 Ideation/           ← Brainstorm logs per module
│   ├── 05 Specs/              ← Validated specs per module
│   │   ├── _templates/        ← Spec templates
│   │   └── {module}/          ← Specs for active module
│   └── 06 Design System/      ← Tokens, components, patterns, UX laws
├── 02_Build/                  ← Source code per module
├── 03_Review/                 ← Conformity reviews per module
└── 04_Lab/                    ← Sandbox prototypes
```

## Customization

### Change the Design System
Edit files in `01_Product/06 Design System/`:
- `tokens.md` — Colors, typography, spacing
- `components.md` — Reusable UI components
- `patterns.md` — Composition patterns
- `states.md` — Empty, loading, error, success states

### Add a Module
1. Edit `modules-registry.md` to add the module
2. Update `.claude/context.md` to activate it
3. The agents will auto-create the folder structure on first use

### Switch Active Module
Edit `.claude/context.md`:
```markdown
module: your-module-slug
module-label: Your Module Name
pillar: Your Pillar
```

## UX Laws Reference

The framework includes 30 UX laws (from lawsofux.com) integrated into agent workflows. Agents use these laws to:
- `/ux` — Justify design recommendations
- `/spec` — Validate spec quality
- `/build` — Guide implementation choices
- `/review` — Score UX conformity

See `01_Product/06 Design System/ux-laws.md` for the full reference.

## License

MIT — see [LICENSE](./LICENSE)

---

*Built with [Claude Code](https://claude.com/code).*
