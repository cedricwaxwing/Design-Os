# 04 Lab — Sandbox & Prototypes

> Free testing space, outside the Spec/Build/Review cycle.

---

## When to use the Lab

| Usage | Agent | Example |
|-------|-------|---------|
| **Quick prototype** | `/explore` | Validate a layout before investing in a spec |
| **Technical POC** | Manual | Test an API integration, a component pattern |
| **Visual experimentation** | `/ui` | Compare layout variants |
| **Spike** | Manual | Explore a technology before committing |

## Rules

1. **Everything is disposable** — Never depend on the Lab for production
2. **One file = one intention** — Name clearly: `[name]-explore.tsx`, `[name]-poc.tsx`
3. **No tests here** — Tests are in `02_Build/{module}/tests/`
4. **Design system respected** — Even in prototypes, use tokens (no hardcodes)

## Structure

```
04_Lab/
└── {module}/
    ├── [name]-explore.tsx       ← /explore prototype (happy path)
    ├── [name]-poc.tsx           ← Technical POC
    └── [name]-spike/            ← Multi-file spike
```

## Lifecycle

```
Idea → Lab (prototype) → Feedback
  ├── "Good direction" → /spec → /build (prototype gets replaced)
  ├── "Needs changes" → Iterate in Lab
  └── "Wrong approach" → Delete, rethink
```

The Lab is NOT a step in the Spec/Build/Review cycle. It's a parallel space to reduce risk before investing in a complete spec.
