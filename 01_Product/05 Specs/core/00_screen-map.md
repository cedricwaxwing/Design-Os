# Screen Map — Core (Design OS template)

<!-- VERSION: 1 | 2026-03-05 | /ux | MVP FAST — E2E flow for template user -->

> Source of truth for key screens. Consumed by `/spec`, `/wireframe`, `/screen-map`.

---

## Intent

**Module**: core  
**Intent**: MVP  
**E2E flow**: Template user opens the project → uses the Navigator to see readiness and run commands → opens a node’s detail panel → runs an action. Success = one full loop (e.g. /o → /discovery → /ux) with visible readiness.

---

## Screen Map — User journey (linear E2E)

| Screen | Purpose | Type | Persona | Main objective | Primary CTAs |
|--------|---------|------|---------|----------------|---------------|
| **Navigator (home)** | Entry; see flow graph, readiness, run commands | Main view | Template user | See project status and next step | Open node, switch tab (Prototyper/Navigator), Launch console |
| **Node detail panel** | See node status, gates, actions, files | Side panel | Template user | Decide and run next action | Run command, open file, preview file, close panel |

### Consolidations

- “Run command” is an action from the panel or from the graph; not a separate screen.
- Readiness footer and AI bar are part of the Navigator home view.

### Stories covered (mapping)

| Story | Screen(s) |
|-------|-----------|
| User sees project readiness at a glance | Navigator (home) |
| User runs a phase command (e.g. /discovery, /ux) | Navigator (home) → Node detail panel |
| User opens a file from the panel | Node detail panel |
| User closes the panel to return to the graph | Node detail panel → Navigator (home) |

---

## Design hypotheses (MVP)

| # | Hypothesis | Confidence | Note |
|---|------------|------------|------|
| H1 | One main view (graph) + one side panel (detail) is enough for the template user. | MOYEN | [HYPOTHESIS] — Standard for tool UIs; keeps context visible. |
| H2 | Linear flow (open → select node → act) has no need for extra screens. | MOYEN | [HYPOTHESIS] — Validated by “single objective per screen” lean rule. |

---

## Navigation architecture

**App type**: Internal tool (VS Code / Cursor webview).

**Decisions** [HYPOTHESIS — MVP] :

- **Primary navigation**: Single main view (Navigator graph) with no sidebar; top-level tabs: Prototyper | Navigator.
- **Secondary**: Right-side detail panel (slide-over) when a node is selected; close returns to graph.
- **Panel width**: Fixed (e.g. 300px); no collapse.
- **No global search**: Out of scope for MVP.
- **Responsive**: Desktop-only for MVP; webview is embedded in the IDE.

**Recommendation**: Main view + side panel (current pattern).  
**Alternative**: Modal for node detail instead of panel — rejected for MVP because it hides the graph and breaks “see status and act” in one glance.

**Confidence**: MOYEN  
**Justification**: Keeps the graph visible while acting; matches common IDE/dashboard patterns.

---

## Specs (generated)

| Screen | Spec file |
|--------|-----------|
| Navigator (home) | `specs/1.1-navigator-home.spec.md` |
| Node detail panel | `specs/1.2-node-detail-panel.spec.md` |

---

## Next steps

- **/build**: Implement or refine from existing Navigator code against these specs.
- **/review**: After build, score conformity vs specs.
