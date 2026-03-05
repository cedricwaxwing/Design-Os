# Skills Registry — External Skills Catalog

> This registry lists available external skills. Agents load them on demand
> from GitHub when the project context requires it. No external skill is active by default.

---

## Source

Repository: https://github.com/vercel-labs/agent-skills  
Base URL: `https://raw.githubusercontent.com/vercel-labs/agent-skills/refs/heads/main/skills/`

---

## Catalog

| Skill | Fichier | Active quand | Agent consommateur |
|-------|---------|-------------|-------------------|
| React Best Practices | `{base}/react-best-practices/SKILL.md` | Framework = React, Next.js | `/build` |
| React Native Guidelines | `{base}/react-native-guidelines/SKILL.md` | Platform = mobile-native, mobile-cross | `/build` |
| Composition Patterns | `{base}/composition-patterns/SKILL.md` | Framework = React (tous) + composant complexe | `/build` |
| Web Design Guidelines | `{base}/web-design-guidelines/SKILL.md` | Platform = web, both + review UI | `/review` |

> `{base}` = Base URL above.

---

## Activation rules

1. **Never loaded by default** — only when an agent needs it
2. **Read‑only** — the skill is read via WebFetch, not copied locally
3. **Session cache** — once loaded in the session, no need to refetch
4. **Stack‑driven** — activation depends on the stack in `CLAUDE.md` (Tech Stack + Platform)
5. **Non‑blocking** — if fetch fails (offline, 404), the agent continues without the skill
6. **Extensible** — add a row to the table for a new skill

---

## How to add an external skill

1. Find the source `SKILL.md` (GitHub, custom, etc.)
2. Add a row in the table above
3. Specify the activation condition (stack, phase, agent)
4. The agent will load it automatically in the next session

---

## How it works

```
Build/Review demarre
    │
    ▼
Lit CLAUDE.md → extrait Framework, Platform
    │
    ▼
Lit skills-registry.md → filtre les skills qui matchent
    │
    ▼
WebFetch du SKILL.md depuis GitHub (silencieux)
    │
         ├─ Success → integrates rules into the context
         └─ Failure → continues without (graceful degradation)
```

Rules from external skills are **additional** — they do not replace the Design System, the spec, or the TDD workflow.
