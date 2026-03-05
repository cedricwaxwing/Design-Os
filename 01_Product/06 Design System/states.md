# Design System — Standard States

<!-- VERSION: 1 | 2026-03-05 | /manual-edit | Initial English translation -->

> Every component and page MUST handle these 4 states + key edge cases.  
> The Build agent checks that all states are implemented.  
> The Review agent checks that all states are tested.

---

## Empty state

When there is no data to display.

```tsx
<div className="flex flex-col items-center justify-center py-16 px-4">
  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
    <IconRelevant className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
  </div>
  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
    No [items] yet
  </h3>
  <p className="text-sm text-neutral-500 text-center max-w-sm mb-4">
    [Explain why it’s empty and what the user can do next]
  </p>
  <button className="bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2 rounded-md transition-colors">
    [CTA: Create the first one, Add, Invite…]
  </button>
</div>
```

### Rules
- Always show a contextual icon (not a generic one)
- Always show an explanatory message (not just “Empty”)
- Always show a CTA if the user can act
- The CTA should be the main action of the page

---

## Loading state

When data is currently being loaded.

### Skeleton loader (preferred)
```tsx
<div className="animate-pulse space-y-4">
  {/* Skeleton pour une carte */}
  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 space-y-3">
    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
  </div>

  {/* Skeleton pour une liste */}
  {[...Array(3)].map((_, i) => (
    <div key={i} className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 flex items-center gap-3">
      <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
      </div>
    </div>
  ))}
</div>
```

### Spinner (for short‑lived actions)
```tsx
<div className="flex items-center justify-center py-8">
  <div className="w-6 h-6 border-2 border-neutral-200 dark:border-neutral-700 border-t-primary rounded-full animate-spin" />
</div>
```

### Rules
- Skeleton > Spinner for initial page load
- The skeleton should roughly match the shape of the final content
- Use a spinner only for short actions (submit, refresh)
- Avoid plain “Loading…” text on its own

---

## Error state

When a load or action has failed.

### Page-level error
```tsx
<div className="flex flex-col items-center justify-center py-16 px-4">
  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
    <AlertTriangle className="w-6 h-6 text-red-400" />
  </div>
  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
    Unable to load [data]
  </h3>
  <p className="text-sm text-neutral-500 text-center max-w-sm mb-4">
    [Explanation: network issue, server unavailable, etc.]
  </p>
  <button className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium px-4 py-2 rounded-md border border-neutral-200 dark:border-neutral-700 transition-colors">
    Retry
  </button>
</div>
```

### Inline error (form)
```tsx
<div className="space-y-1.5">
  <label className="text-sm font-medium text-red-400">Field label</label>
  <input className="w-full bg-white dark:bg-neutral-800 border border-red-500 rounded-md px-3 py-2 text-neutral-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none" />
  <p className="text-xs text-red-400 flex items-center gap-1">
    <XCircle className="w-3 h-3" />
    This field is required
  </p>
</div>
```

### Error toast
```tsx
<div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 shadow-lg max-w-sm">
  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
  <p className="text-sm text-red-300">The action failed. Please try again.</p>
  <button className="text-red-400 hover:text-red-300 ml-auto">
    <X className="w-4 h-4" />
  </button>
</div>
```

### Rules
- Always show a **Retry** button when relevant
- Use a specific message (not just "An error occurred")
- Form errors should be inline, not only in a toast
- API errors can be shown in a toast or full page depending on severity

---

## Success state

When an action has succeeded.

### Success toast
```tsx
<div className="fixed bottom-4 right-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2 shadow-lg max-w-sm">
  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
  <p className="text-sm text-green-300">[Item] created successfully</p>
</div>
```

### Inline confirmation
```tsx
<div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
    [Action] completed
  </h3>
  <p className="text-sm text-neutral-500 mb-4">
    [Next step or consequence]
  </p>
  <button className="...primary">
    [Next CTA]
  </button>
</div>
```

### Rules
- Use a toast for common actions (save, update)
- Use inline confirmation for important actions (submit, validate)
- Always propose the next logical action
- The toast should disappear automatically after 3–5 seconds

---

## Summary: per‑component checklist

Before shipping a component, check:

- [ ] **Empty**: message + icon + CTA if the user can act
- [ ] **Loading**: skeleton that mirrors the final content shape
- [ ] **Success**: content rendered + interactions working
- [ ] **Error**: specific message + retry when relevant
- [ ] **Edge cases**: identified and handled (see spec section 3)
