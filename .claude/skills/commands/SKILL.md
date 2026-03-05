---
name: commands
user-invocable: true
panel-description: Show all available commands.
description: >
  Display the list of all available commands (agents and override commands).
  No tools, no logic — just a fast static listing.
allowed-tools: ""
category: Navigation
tags:
  - help
  - commands
  - navigation
  - reference
---

# Commands Agent — Quick list

> Display all available commands at any time.

---

## Instruction

When the user invokes `/commands`, display **exactly** the block below (no file reads, no logic, no dynamic content):

```text
=== Available commands ===

--- Agents ---
| Command    | Agent              | Description                                              |
|-----------|--------------------|----------------------------------------------------------|
| /o        | Orchestrator       | Coordinates agents and proposes an execution plan       |
| /discovery| Guided workshop    | Enriches user/domain understanding                      |
| /ideate   | Idea vault         | Free-form brainstorm, persists ALL ideas                |
| /ux       | UX sparring partner| Explores UX directions, challenges hypotheses           |
| /spec     | Spec guardian      | Generates a complete spec from user stories             |
| /build    | TDD builder        | Codes in TDD from a validated spec                      |
| /review   | Conformity reviewer| Scores code vs spec (GO/NO-GO)                          |
| /ui       | Visual expert      | Generates mockups (SVG, HTML, React)                    |
| /wireframe| Layout architect   | Low‑fi wireframes, juxtaposed boards, navigation flows  |
| /explore  | Rapid prototype    | Throwaway prototype, happy path, mock data              |
| /screen-map | Mapping diagnostic | Audits coherence between screens, specs, and stories  |
| /health   | Global diagnostic  | Project health check (score + actions)                  |
| /onboarding | Project setup    | Step‑by‑step project configuration                      |
| /export   | Config exporter    | Exports project config to JSON (for collaboration)      |
| /import   | Config importer    | Bootstraps a project from a collaborator export         |

--- Override commands (usable at any time) ---
| Command        | Effect                                  |
|----------------|-----------------------------------------|
| /stop          | Immediate pause                         |
| /back          | Go back to the previous step           |
| /skip          | Skip the current step                   |
| /variants [n]  | Generate n alternatives (default: 3)    |
| /inject [agent]| Insert an agent into the current flow   |
| /why           | Explain the reasoning                   |
| /fork [name]   | Create a parallel variant               |
| /status        | Show the status of the current flow     |
| /reset         | Abandon the flow and restart from scratch |
| /commands      | Display this list                       |
```

## Rules

1. **No file reads** — The content is static, defined in this file.
2. **No modifications** — This skill never changes any project file.
3. **Fast** — Response is immediate; no processing.
4. **Manual updates** — If a new agent is added, this file must be updated accordingly.

