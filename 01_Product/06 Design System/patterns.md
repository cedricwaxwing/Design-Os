# Design System — Composition Patterns

<!-- VERSION: 1 | 2026-03-05 | /manual-edit | Initial English translation -->

> Reusable patterns for complex layouts. Each pattern combines atomic components.  
> Fill this file with the patterns specific to your project.

---

## Forms

### Standard layout
```
[Form layout — labels above fields, columns, logical groups, consistent spacing]
```

### Validation
```
[Validation pattern — inline errors, submit disabled until valid, error summary]
```

### Rules
- Group fields by task (not by technical type)
- Inline, real‑time validation (not only on submit)
- Action buttons aligned bottom‑right (convention)
- If > 7 fields: split into steps (wizard)

---

## Lists with filters

### Layout
```
[List with filters — filter bar + list/table + pagination + empty state]
```

### Rules
- Max 4 visible filters (beyond that: “More filters”)
- Always show total results count
- Sorting: at least by date and by name
- Use pagination or infinite scroll depending on volume

---

## KPI dashboard

### Layout
```
[Dashboard — KPI cards row + charts + activity feed]
```

### Rules
- Max 4 KPI cards per row (ideally 4 + “view all”)
- Each KPI: value, label, optional trend
- The most important KPIs appear first

---

## Stepper / wizard

### Layout
```
[Stepper — progress indicator + step content + navigation buttons]
```

### Rules
- Visible progression (horizontal or vertical stepper)
- Back and next navigation
- Validate each step before continuing
- Summary of previous choices remains accessible

---

## Timeline

### Layout
```
[Timeline — vertical line + event cards + dates]
```

### Rules
- Chronological order (most recent at the top by default)
- Each event: date, title, short description, type badge
- Important events are visually distinct
