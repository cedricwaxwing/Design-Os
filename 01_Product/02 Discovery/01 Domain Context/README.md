# 01 Domain Context — Business Context

> Business rules, terminology, and domain processes.

---

## What to put here

| Type | Examples |
|------|----------|
| **Glossary** | Domain-specific terms, acronyms, definitions |
| **Business rules** | Regulatory constraints, validation rules, business workflows |
| **Existing processes** | How users work today (before the product) |
| **Domain map** | Entities, relationships, data flows |

## Recommended format

```markdown
# Domain — [Domain Name]

## Glossary
| Term | Definition |
|------|------------|
| [term] | [definition] |

## Business Rules
1. [Rule 1 — e.g., "A study cannot be published without PI validation"]
2. [Rule 2]

## Current Process
[Description or diagram of the existing process]
```

## Impact on agents

- **`/spec`** — References business rules in the Dependencies section
- **`/ux`** — Verifies that journeys respect business processes
- **`/build`** — Implements business validations in code
