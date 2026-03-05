# Module Registry

> Fill this file with your modules. Generated automatically by `/onboarding`.

| # | Module | Slug | Pillar | Status | Current phase |
|---|--------|------|--------|--------|----------------|
| 1 | Core | `core` |  | Actif | Discovery |

---

## How to use

1. Add a module: insert a row in the table above
2. Activate a module: edit `.claude/context.md` with the module slug
3. Only one module is active at a time — agents resolve paths via `{module}`

## Conventions

- **Slug**: kebab‑case, no spaces, no capitals (e.g. `study-cockpit`, `user-dashboard`)
- **Pillar**: Logical grouping of modules (optional). Example: "Collaboration", "Analytics", "Admin"
- **Status**: `Active` | `Planned` | `Archived`
- **Phase**: `Discovery` | `Design` | `Spec` | `Build` | `Review` | `Done`

---

## When to create a module

A module represents an **autonomous functional area** of the product. Decision rules:

| Situation | Decision | Reason |
|-----------|----------|--------|
| 2 features share 80%+ of screens | **Same module** | Screens and specs are mostly shared |
| 2 features have distinct personas and separate journeys | **Separate modules** | Users and flows are different |
| A feature has its own dashboard/landing | **Separate module** | Independent entry point |
| A feature is a subset of an existing screen | **Same module** | It is a component, not a module |
| You are unsure | **Start with 1 module** | You can always split later |

### Inter‑module dependencies

Modules are designed to be independent, but dependencies can exist:
- Documented in **section 7 (Dependencies)** of each spec
- Shared components live in the Design System (`05 Design System/`)
- If module A depends on a screen in module B, module A’s Screen Map references it

### Example

```
Pillar "Collaboration":
  ├── Module "dashboard" — Overview for the Manager
  └── Module "study-cockpit" — Workspace for the Researcher

Pillar "Admin":
  └── Module "settings" — Configuration for the Admin
```
