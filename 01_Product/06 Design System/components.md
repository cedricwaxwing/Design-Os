# Design System — Components

<!-- VERSION: 1 | 2026-03-05 | /manual-edit | Initial English translation -->

> Reusable atomic components. Implementation code should match your project stack.  
> Fill this file manually or via `/onboarding`, which can generate components for your stack.

---

## Buttons

### Primary
<!-- Adapt to your stack (Tailwind, CSS Modules, Styled Components, etc.) -->
```
[Primary button code — primary color background, white text, hover, active, disabled]
```

### Secondary
```
[Secondary button code — border, transparent background, hover]
```

### Ghost
```
[Ghost button code — no background, no border, subtle hover state]
```

### Danger
```
[Danger button code — red background, white text]
```

### Rules
- Minimum height: 36px (primary), 32px (secondary)
- Always define hover, active, focus, and disabled states
- The primary button must be visually distinct (Von Restorff effect)
- Destructive actions should be visually and spatially separated from primary actions

---

## Inputs

### Text input
```
[Text input code — background, border, placeholder, focus ring, error state]
```

### Select
```
[Select code — same style as input, chevron icon, dropdown list]
```

### Textarea
```
[Textarea code — same style as input, optional auto-resize]
```

### Rules
- Label above the field (standard web convention)
- Descriptive placeholder (not just the field name)
- Error state: red border + message under the field
- Focus: ring in primary color

---

## Cards

### Standard card
```
[Card code — surface background, subtle border, radius, padding]
```

### Interactive card
```
[Clickable card code — hover state, pointer cursor, transition]
```

### Rules
- Inner padding: 24px (`space-6`)
- Radius: 12px
- Gap between cards: 16px (`space-4`)
- Optional internal separator between header and body

---

## Badges

### Status badge
```
[Badge code — Success (green), Warning (amber), Error (red), Info (blue), Neutral (gray)]
```

### Role badge
```
[Role badge code — color per role (see tokens.md)]
```

### Rules
- Height: 20px
- Horizontal padding: 8px
- Radius: 4px
- Background: role color at ~15% opacity
- Text: solid role color

---

## Alertes

### Info / Warning / Error
```
[Alert code — icon + message + optional action, colored border and background]
```

### Rules
- Always include a contextual icon
- Specific message (never generic "An error occurred")
- Optional action (dismiss, retry, link)

---

## Tables

### Standard table
```
[Table code — header, rows, hover, optional row striping]
```

### Rules
- Sticky header if > 10 rows
- Hover state on clickable rows
- Sortable columns when relevant
- Responsive: horizontal scroll on mobile

---

## Navigation

### Sidebar
```
[Sidebar code — items, active state, icons, optional collapse]
```

### Breadcrumb
```
[Breadcrumb code — separators, active link]
```

---

## Modales

### Standard modal
```
[Modal code — overlay, container, header, body, footer, close button]
```

### Rules
- Close: X button + outside click + Escape key
- Max-width: 480px (small), 640px (medium), 960px (large)
- Radius: 16px
- Overlay: black background at 50% opacity

---

## Icons

Library: <!-- defined during onboarding (Lucide, Heroicons, Material Icons...) -->

### Rules
- Standard sizes: 16px (inline), 20px (buttons), 24px (standalone)
- Color: inherit from parent text color
- Always provide an `aria-label` if the icon is alone (no adjacent text)
