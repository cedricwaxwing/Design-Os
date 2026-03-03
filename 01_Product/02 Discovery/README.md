# 02 Discovery — Understanding Users and Domain

> Everything related to user research and domain understanding.

---

## Subfolders

| Folder | Content | When to fill |
|--------|---------|--------------|
| `01 Domain Context/` | Business rules, terminology, existing processes | At project start |
| `02 User Interviews/` | Interview reports, verbatims | During Discovery phase |
| `03 Research Insights/` | Syntheses, identified patterns, hypotheses | After interviews |
| `04 Personas/` | Persona cards (template provided) | During onboarding or Discovery |

## How to Feed Discovery

### Option 1 — Material Pipeline (recommended if you have documents)
Place your documents in `00 Material/`, then:
- **`/onboarding`** (Phase 7) scans, converts, and extracts automatically
- **`/discovery`** (Step 0b) detects unexploited material and offers ingestion

| Document type in Material | Extracted to |
|---------------------------|--------------|
| Business documents, rules, processes | `01 Domain Context/` |
| Interviews, verbatims, transcripts | `02 User Interviews/` |
| Benchmarks, surveys, analytics | `03 Research Insights/` |
| User descriptions, feedback | `04 Personas/` |

### Option 2 — With agents (recommended if starting from scratch)
- **`/discovery`** — Complete guided workshop to build context through conversation
- **`/discovery personas`** — Deepen existing personas
- **`/discovery hypotheses`** — Map and prioritize hypotheses

### Option 3 — Manually
Create files directly in the subfolders below. Each subfolder contains a template (`_template-*.md`) to guide the structure.

## Available Templates

| Subfolder | Template | Content |
|-----------|----------|---------|
| `01 Domain Context/` | `_template-domain-context.md` | Glossary, business rules, processes, constraints, ecosystem |
| `02 User Interviews/` | `_template-interview.md` | Metadata, key points, verbatims, pain points, needs |
| `03 Research Insights/` | `_template-insight.md` | Finding, product impact, evidence, recommendation |
| `03 Research Insights/` | `_template-synthesis.md` | Patterns, JTBD, opportunities (cross-interview synthesis) |
| `04 Personas/` | `_template-persona.md` | Profile, typical day, frustrations, goals, tools |

## Impact on Agents

Agents consult this section for:
- **`/ux`** — Anchor design hypotheses in real insights
- **`/spec`** — Reference business constraints in dependencies
- **`/onboarding`** — Generate personas and product brief
- **`/discovery`** — Enrich and structure research content
- **`/review`** — Identify DISCOVERY-type gaps

## Tip

The richer the Discovery, the better the agent outputs. An empty folder = agents work on assumptions.
