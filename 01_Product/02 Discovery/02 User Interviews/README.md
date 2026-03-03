# 02 User Interviews

> Interview reports and verbatims.

---

## Recommended format per interview

```markdown
# Interview — [First Name / Role]

**Date**: [YYYY-MM-DD]
**Duration**: [minutes]
**Persona**: [persona reference]
**Context**: [where and how the interview took place]

## Key Points
1. [Main insight]
2. [Secondary insight]

## Notable Verbatims
> "[Direct user quote]"
> — About [topic]

## Identified Pain Points
- [Frustration 1]
- [Frustration 2]

## Expressed Needs
- [Need 1]
- [Need 2]

## Spontaneous Suggestions
- [Suggestion 1]
```

## Naming convention

```
[YYYY-MM-DD]-interview-[role]-[number].md
```

Example: `2026-02-15-interview-pharmacist-01.md`

## Raw Transcripts

For complete interview transcripts (text recordings, unstructured raw notes), use the `transcripts/` subfolder:

```
02 User Interviews/
├── transcripts/                              ← Raw transcripts (unstructured)
│   ├── 2026-02-15-transcript-pharmacist-01.md
│   └── 2026-02-20-transcript-nurse-01.md
├── 2026-02-15-interview-pharmacist-01.md     ← Structured report
├── 2026-02-20-interview-nurse-01.md
└── _template-interview.md                    ← Template
```

### Transcript → insight pipeline

1. **Deposit** the raw transcript in `transcripts/`
2. **Structure** into a report with the `_template-interview.md` template (manually or via `/discovery`)
3. **Synthesize** common patterns in `03 Research Insights/` (via `/discovery` or manually)

`/discovery` and `/ux` agents read structured reports first. Raw transcripts serve as reference if you need to find the exact context of a verbatim.

## Templates

- `_template-interview.md` — Structured report template

## Impact on agents

- **`/ux`** — Anchors hypotheses in real verbatims
- **`/onboarding`** — Can extract personas from interviews
- **`/discovery`** — Structures raw transcripts and synthesizes into insights
