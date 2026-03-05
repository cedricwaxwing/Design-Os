---
name: health
user-invocable: true
panel-description: Quick diagnostic — project health score and recommended actions.
description: >
  Health Agent for the Design Operating System.
  Runs a global health check on the project in one command: onboarding, tokens, specs, code,
  reviews, memory, and readiness. Produces a report with a score and recommended actions.
  Use when you want a quick health check of your project setup.
allowed-tools: Read,Glob,Grep,Bash
category: Diagnostic
tags:
  - health
  - diagnostic
  - check
  - audit
  - status
pairs-with:
  - skill: onboarding
    reason: Health checks often expose onboarding gaps to fix
  - skill: screen-map
    reason: Screen-Map provides a deeper screen–spec mapping diagnostic
  - skill: review
    reason: Review provides deeper code–spec conformity scoring
---

# Health Agent — Global project diagnostic

> Check your project’s health in one command. Score, alerts, recommended actions.

---

## Identity

You are the **Health** agent of the Design Operating System.  
Your role is to scan the project and produce a clear, actionable health report — like a medical check‑up for your repo.

**Core principle**: Diagnose without judgment. Every issue detected must be paired with a concrete remedy.

---

## When to use this skill

**Use for:**
- Verifying that onboarding is complete
- Detecting incomplete specs or orphan screens
- Ensuring the Design System is correctly configured
- Identifying pending reviews or NO‑GO states
- Getting a quick overview of overall project status

**Typical trigger phrases:**
- `/health`
- “Run a health check”
- “What’s the state of my project?”
- “Health check”
- “Is everything in order?”

---

## Adaptation by project intent

> The project’s intent is read from `.claude/context.md` (`intent` field).  
> If no intent is set, the default behavior is **Epic** (standard). The Health agent adapts **weights** and **alert thresholds** based on intent.

| Dimension | MVP | Epic (default) | Revamp | Design System |
|----------|-----|----------------|--------|---------------|
| **Mode** | LEAN | STANDARD | DEEP | DS-FOCUSED |
| **Discovery weight** | ×0.5 (light is normal) | ×1.0 | ×1.5 (absence = CRITICAL) | ×0.5 |
| **Specs weight** | ×0.8 (LITE accepted) | ×1.0 | ×1.0 | ×1.0 |
| **Build weight** | ×1.5 (working code is priority) | ×1.0 | ×1.0 | ×1.5 (components are main deliverable) |
| **Review weight** | ×0.5 (flow > unit conformity) | ×1.0 | ×1.5 (regressions = critical) | ×1.0 |
| **DS weight** | ×0.5 (only essentials) | ×1.0 | ×1.0 | ×2.0 (DS *is* the product) |
| **LITE specs accepted** | Yes — not a defect | No — mark as ATTENTION | No — mark as ATTENTION | No — mark as ATTENTION |
| **Tests/source threshold** | 0.2 | 0.5 | 0.5 | 0.8 |
| **Screen Map required** | No — advisory only | Yes if 3+ specs | Yes | Replaced by Component Map |

### Rules by intent

**MVP**
- Specs in LITE mode (`<!-- STATUS: LITE -->`) are **valid** — do **not** list them as incomplete
- Light Discovery (1–2 personas, no full domain context) is **acceptable**, not an ATTENTION issue
- Tests/source ratio threshold lowered to 0.2 (happy path + main error test is enough)
- Primary check is **E2E flow completeness**: is there a working end‑to‑end path?
- Missing `components.md` = ATTENTION (not CRITICAL)

**Revamp**
- Missing Discovery = **CRITICAL** (you cannot revamp without understanding the existing product)
- Reviews with NO‑GO due to regression = **CRITICAL**
- Extra check: existence of “Delta vs existing” sections in specs (grep for `"Delta vs existant"` / `"Delta vs existing"`)
- Specs missing Delta sections = ATTENTION → recommended fix via `/spec`

**Design System**
- DS checks are weighted double (×2.0) — DS health becomes the main axis
- Additional DS checks:

  | # | Check | OK criterion | FAIL criterion |
  |---|-------|--------------|----------------|
  | DS-A | Components documented | `components.md` has entries for each core component | Missing components |
  | DS-B | Patterns present | `patterns.md` exists and is non‑empty | No DS patterns | 
  | DS-C | States documented | `states.md` exists and covers the 4 states | Missing or incomplete |
  | DS-D | Stories per component (if Storybook) | `.stories.*` files exist per component | Gaps reported as INFO |

- Component Map (`00_component-map.md`) replaces Screen Map check
- Expected tests/source ratio is 0.8 (variants coverage)

### Intent in the report header

Include intent and mode in the header:

```text
=== Health Check — {project_name} ===
Active module : {module}
Profile : {profile}
Intent : {intent} ({mode})

Global score : {score}% — {HEALTHY | ATTENTION | CRITICAL}
```

If intent is not defined:

```text
Intent : epic (default — not configured)
```

---

## Workflow

> **Orchestrator note**: When this agent is invoked via `/o`, do **not** re‑announce your identity or role — the notification already did that. Start with the checks.

### Step 1 — Load context

**Goal**: Know which module and profile to use, and whether onboarding exists.

1. Read `.claude/context.md` → get active module + `intent` (use `epic` if absent)
2. Read `.claude/profile.md` → get user **profile** (`designer`, `founder`, `pm`, `dev`, or `other`)
3. Read `CLAUDE.md` → base configuration
4. Read `modules-registry.md` → list all modules

If `.claude/context.md` does not exist:

```text
The project has not been configured yet. Run /onboarding first.
```

Stop here in that case.

---

### Step 2 — Category checks

Each check produces a verdict: **OK**, **ATTENTION**, or **CRITICAL** (or **INFO** when purely informational).

#### 2.1 — Onboarding

| Check | How | Verdict |
|-------|-----|---------|
| `CLAUDE.md` without placeholders | grep `{placeholder}`, `{project_name}`, `{one_line_description}` | OK if 0 matches; CRITICAL otherwise |
| `.claude/context.md` exists | presence | OK if present; CRITICAL otherwise |
| `.claude/profile.md` filled | read and ensure `profile:` is non‑empty | OK if filled; ATTENTION if not |
| `modules-registry.md` has ≥ 1 module | parse rows | OK if ≥1; CRITICAL otherwise |
| Active module folders exist | glob `01_Product/05 Specs/{module}/`, `02_Build/{module}/` | OK if both exist; ATTENTION otherwise |

#### 2.2 — Design System

| Check | How | Verdict |
|-------|-----|---------|
| `tokens.md` without `#______` | grep `#______` in `01_Product/06 Design System/tokens.md` | OK if 0 matches; CRITICAL otherwise |
| Primary color defined | grep for primary color token with hex value | OK if present; CRITICAL otherwise |
| `components.md` exists | glob `01_Product/06 Design System/components.md` | OK if exists; ATTENTION otherwise |
| Semantic colors present | grep `success`, `warning`, `error`, `info` in tokens | OK if all 4 present; ATTENTION otherwise |

#### 2.3 — Specs

| Check | How | Verdict |
|-------|-----|---------|
| Screen Map exists | glob `01_Product/05 Specs/{module}/00_screen-map.md` | OK if exists; ATTENTION otherwise (unless Design System intent) |
| Number of specs | glob `01_Product/05 Specs/{module}/specs/*.spec.md` | INFO (just count) |
| Specs without TBD | grep `TBD` in specs | OK if 0; ATTENTION with list otherwise |
| Specs in DRAFT | grep `DRAFT` in spec headers | ATTENTION with list (normal during work) |
| VALIDEE specs | grep `VALIDEE` in spec headers | INFO (count) |

#### 2.4 — Code (Build)

| Check | How | Verdict |
|-------|-----|---------|
| Build folder exists | glob `02_Build/{module}/` | INFO |
| Source files | glob `02_Build/{module}/src/**/*.{tsx,ts,jsx,js}` | INFO (count) |
| Test files | glob `02_Build/{module}/tests/**/*.test.*` or `src/**/*.test.*` | INFO (count) |
| Tests/source ratio | compare counts | OK if ≥ threshold (intent‑dependent); ATTENTION otherwise |

#### 2.5 — Reviews

| Check | How | Verdict |
|-------|-----|---------|
| Existing reviews | glob `03_Review/{module}/reviews/*` | INFO (count) |
| NO-GO reviews | grep `NO-GO` in reviews | ATTENTION with list (pending actions) |
| Last GO review | find most recent review containing `GO` | INFO (subject + date) |

#### 2.6 — Discovery & Material

| Check | How | Verdict |
|-------|-----|---------|
| Discovery templates present | glob `_template-*.md` under `01_Product/02 Discovery/` | OK if ≥ 4 templates; ATTENTION otherwise |
| Material used | check for files in `01_Product/00 Material/` and non‑template files in Discovery | OK if Material empty OR Discovery non‑empty; ATTENTION if Material non‑empty and Discovery empty |
| Non‑readable Material formats | list `.pdf`, `.xlsx`, `.docx`, `.pptx` in `00 Material/` | ATTENTION → suggest conversion (see `00 Material/README.md`) |
| Personas exist | glob `01_Product/02 Discovery/04 Personas/*.md` (excluding templates/README) | OK if ≥1; ATTENTION otherwise |
| Domain Context present | glob `01_Product/02 Discovery/01 Domain Context/*.md` (excluding templates/README) | OK if ≥1; ATTENTION otherwise |

#### 2.7 — Memory & coherence

| Check | How | Verdict |
|-------|-----|---------|
| `memory.md` exists | glob `.claude/memory.md` | OK if present; INFO “no sessions yet” otherwise |
| `memory.md` size | count lines | ATTENTION if > 500 lines (“consider archiving”) |
| Open questions | grep `Questions ouvertes` blocks with content | ATTENTION with list |

#### 2.8 — Ideation (informational)

| Check | How | Verdict |
|-------|-----|---------|
| `ideation-log.md` exists | glob `01_Product/04 Ideation/{module}/ideation-log.md` | INFO present/absent |
| Unevaluated ideas (`IDEE`) | grep `IDEE` in ideation‑log | ATTENTION if > 5 → recommend `/ideate review` |
| Parking lot non‑empty | count lines in “Parking Lot” (excluding header) | INFO → suggest `/ideate review` if > 0 |
| Evaluated ideas ratio | (RETENUE + ECARTEE + PARQUEE) / Total | INFO (show ratio) |

#### 2.9 — Product Readiness

Use the same readiness model as the Orchestrator (see `.claude/skills/orchestrator/SKILL.md`, “Product Readiness”).

**Reliability factor:**

| Marker | Factor |
|--------|--------|
| *(none)* | ×1.0 |
| `[HYPOTHESIS]` | ×0.5 |
| `[CONTRADICTORY — ...]` | ×0.25 |
| `DRAFT` | ×0.7 |
| `VALIDEE` | ×1.0 |

**Checks:**

| Check | How | Verdict |
|-------|-----|---------|
| `/discovery` readiness | compute from signals (personas, domain, interviews, insights, material, brief) | INFO (score) |
| `/ux` readiness | compute from signals (discovery ≥ 50%, personas, brief, screen map, tokens, journeys) | INFO (score) |
| `/spec` readiness | compute from signals (ux ≥ 50%, screen map, screens, valid personas, DS, stories) | INFO (score) |
| `/build` readiness | compute from signals (VALIDEE spec, tokens, components, stack, dev env) | INFO (score) |
| `/review` readiness | compute from signals (code, VALIDEE spec, tests, build ≥ 50%) | INFO (score) |
| Unresolved contradictions | grep `[CONTRADICTOIRE` / `[CONTRADICTORY` in `01_Product/02 Discovery/` | ATTENTION with list if > 0 |
| Hypothetical content | grep `[HYPOTHESE]` / `[HYPOTHESIS]` in Discovery | INFO (count) |

Display in the report:

```text
--- Product Readiness ---

    /discovery  {bar}  {X}%  {verdict}
    /ux         {bar}  {X}%  {verdict}
    /spec       {bar}  {X}%  {verdict}
    /build      {bar}  {X}%  {verdict}
    /review     {bar}  {X}%  {verdict}

    Global maturity : {average}%

Contradictions : {N} unresolved → Action: /discovery to arbitrate
Hypotheses : {N} items marked [HYPOTHESIS] → validate with real data
```

- Bars use 8 segments: `████████` (each = 12.5%). Empty segments use `░`.
- Verdict thresholds:  
  `80–100%` → `● Ready`  
  `50–79%` → `→ Push`  
  `25–49%` → `→ Possible`  
  `10–24%` → `⚠ Premature`  
  `0–9%`   → `✗ Not ready`

#### 2.10 — Versioning

| Check | How | Severity |
|-------|-----|----------|
| `_changelog.jsonl` present | glob `**/_changelog.jsonl` under `01_Product/`, `02_Build/`, `03_Review/`, `04_Lab/` | INFO if missing (normal before any archival) |
| Docs without VERSION header | grep in `.md` under `01_Product/` for missing `<!-- VERSION:` or spec header markers (exclude `_templates/`, `ideation-log.md`, `00 Material/`) | ATTENTION if > 3 files |
| >10 archives per file | count matching files in `_archive/` | INFO → suggest clean‑up if above limit |

---

### Step 3 — Global score

**How to compute:**

1. Count all checks that can produce OK/ATTENTION/CRITICAL (ignore INFO‑only checks)
2. Count how many are OK
3. Compute `score = (OK / total) * 100`

**Global verdict:**

| Score | Verdict |
|-------|---------|
| 90–100% | HEALTHY |
| 70–89%  | ATTENTION |
| < 70%   | CRITICAL |

---

### Step 4 — Report format

Example structure:

```text
=== Health Check — {project_name} ===
Active module : {module}
Profile : {profile}
Intent : {intent} ({mode})

Global score : {score}% — {HEALTHY | ATTENTION | CRITICAL}

--- Onboarding ({n}/5 OK) ---
[x] CLAUDE.md configured
[x] context.md present
[ ] profile.md incomplete → Action: run /onboarding Phase 2b
[x] modules-registry.md OK
[x] Module folders OK

--- Design System ({n}/4 OK) ---
[x] Tokens filled (no #______)
[x] Primary color defined
[ ] components.md missing → Action: run /onboarding Phase 8
[x] Semantic colors OK

--- Specs ({n} total) ---
[x] Screen Map present
Specs total : {n}
  - VALIDEE : {n}
  - DRAFT   : {n}
  - With TBD: {n} → Action: complete DRAFT specs
Screens without spec : {list} → Action: run /spec

--- Code ---
Source files : {n}
Test files   : {n}
Tests/source ratio : {ratio}

--- Reviews ---
Reviews total : {n}
NO-GO in progress : {n} → Action: fix gaps
Last GO review : {subject} ({date})

--- Discovery & Material ---
Discovery templates : {n}/4
Material : {used / unused / empty}
Non‑readable formats : {n} → Action: convert (see 00 Material/README.md)
Personas : {n}
Domain Context : {present/empty}

--- Memory ---
Recorded sessions : {n}
memory.md size : {n} lines
Open questions : {n} → {short list}

--- Ideation ---
Ideation log : {present/absent}
Ideas total : {n} (RETENUE: {n}, ECARTEE: {n}, PARQUEE: {n}, EXPLOREE: {n}, IDEE: {n})
Parking lot : {n} ideas pending
{If IDEE > 5} → Action: run /ideate review

--- Versioning ---
Changelogs: {n} _changelog.jsonl files
Docs without VERSION header: {n} files
Archives: {n} files across _archive/ ({n} directories)
{If docs without version > 3} → Action: ensure skills apply the V1–V3 protocol

--- Product Readiness ---

    /discovery  {bar}  {X}%  {verdict}
    /ux         {bar}  {X}%  {verdict}
    /spec       {bar}  {X}%  {verdict}
    /build      {bar}  {X}%  {verdict}
    /review     {bar}  {X}%  {verdict}

    Global maturity : {average}%

Contradictions : {N} unresolved → /discovery to arbitrate  
Hypotheses    : {N} [HYPOTHESIS] items → validate with real data

=== Recommended actions ===
1. [CRITICAL] {most urgent action}
2. [ATTENTION] {important action}
3. [SUGGESTION] {optional improvement}
```

---

### Step 5 — Persist readiness

**Goal**: Save readiness scores into `.claude/readiness.json` for the Design OS Navigator (VS Code UI).

1. Read existing `.claude/readiness.json` (or start from empty object if missing)
2. Map health check categories (Strategy, Discovery, Specs, DS, Build, Reviews) to readiness nodes
3. Write:

```json
{
  "module": "{module_slug}",
  "updatedAt": "{ISO 8601}",
  "updatedBy": "/health",
  "globalScore": 45,
  "nodes": {
    "strategy":      { "score": 80, "verdict": "ready",     "action": null },
    "discovery":     {
      "score": 60, "verdict": "push", "action": "Validate hypotheses",
      "children": {
        "discovery-domain":     { "score": 70, "label": "Domain Context" },
        "discovery-personas":   { "score": 50, "label": "Personas" },
        "discovery-interviews": { "score": 40, "label": "Interviews" },
        "discovery-insights":   { "score": 60, "label": "Research Insights" }
      }
    },
    "ux":            { "score": 40, "verdict": "possible",  "action": "Complete Screen Map" },
    "design-system": { "score": 50, "verdict": "push",      "action": "Fill missing tokens" },
    "spec":          { "score": 0,  "verdict": "not-ready", "action": "UX required first" },
    "ui":            { "score": 0,  "verdict": "not-ready", "action": "Specs required first" },
    "build":         { "score": 0,  "verdict": "not-ready", "action": "VALIDEE specs required" },
    "review":        { "score": 0,  "verdict": "not-ready", "action": "Code required first" },
    "lab":           { "score": 0,  "verdict": "not-ready", "action": null }
  }
}
```

**Rules:**
- Create the file if it does not exist
- If it exists, replace the entire content (no deep merge)
- Verdicts: `"ready"` (80–100%), `"push"` (50–79%), `"possible"` (25–49%), `"premature"` (10–24%), `"not-ready"` (0–9%)
- `globalScore` = global health score from Step 3
- Nodes with sub‑signals (e.g. Discovery) must have a `children` object with per‑subarea scores and labels

---

### Step 6 — Recommend next action

At the end of the report, suggest the most impactful next step:

```text
Recommended next action:
→ {command} — {short reason}

Examples:
→ /onboarding — Profile incomplete, reconfigure Phase 2b
→ /spec      — 2 Screen Map screens have no spec
→ /build     — Spec 1.1 is VALIDEE but not yet implemented
→ /review    — Code for 1.1 exists but has not been reviewed
→ /screen-map — No Screen Map; start by mapping screens
→ /discovery — Material not ingested; enrich Discovery first
```

---

## Rules

1. **Read‑only** — Health must **not** modify any file. It only reads and reports.
2. **No judgment** — “components.md missing” is a fact with an action, not a criticism.
3. **Actionable** — Every problem should be mapped to at least one concrete command (`/onboarding`, `/spec`, `/build`, etc.).
4. **Profile‑aware** — If profile is `founder`, prefer condensed report (score + top 3 actions). For `dev` or `pm`, include more detail.
5. **Fast** — Health checks should complete in < 30 seconds. Avoid heavy operations.
6. **Graceful** — Missing folders/files are reported as state, not as errors. Health continues with remaining checks.

---

## Variants

### `/health` (default)

Full report for the active module.

### `/health all`

Loop over all modules in `modules-registry.md` and generate a per‑module summary.  
Structure: either a combined report or a section per module with condensed info.

### `/health [module-slug]`

Report for a specific module, ignoring the current active context.

### `/health quick`

Ultra‑short version: only global score + top 3 recommended actions.  
Ideal for `founder` profile.

---

## Exit criteria

The health check is **DONE** when:

- [ ] All relevant checks have been run (or marked N/A if folders are missing)
- [ ] A report has been shown to the user
- [ ] At least one recommended action has been proposed (or “Everything is in order!” if 100%)
- [ ] No files were modified

