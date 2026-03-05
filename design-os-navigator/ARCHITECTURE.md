# Design OS Navigator — Architecture

> Technical guide for AI‑driven changes (Cursor / Claude)

## Overview

```
design-os-navigator/
├── src/
│   ├── extension/           # Entry point + commands (TODO: migrate)
│   │   └── index.ts         # Future entry point
│   │
│   ├── services/            # Encapsulated state
│   │   ├── StateManager.ts  # Singleton — all state in one place
│   │   ├── TerminalService.ts
│   │   └── ArtifactService.ts
│   │
│   ├── parser/              # Modular scanning
│   │   ├── index.ts         # Re-exports (API publique)
│   │   ├── signals.ts       # scanContentSignals(), emptySignals()
│   │   ├── files.ts         # listFiles(), detectScaffold()
│   │   └── context.ts       # parseContext(), parseHistory()
│   │
│   ├── gates/               # Declarative system (28 gates)
│   │   ├── index.ts         # evaluateGates(), calculateReadiness()
│   │   ├── schema.ts        # Types GateDefinition, GateResult
│   │   ├── definitions/     # 1 fichier par node (9 fichiers)
│   │   │   ├── strategy.gates.ts    # 5 gates
│   │   │   ├── discovery.gates.ts   # 5 gates
│   │   │   ├── ux.gates.ts          # 4 gates
│   │   │   ├── spec.gates.ts        # 4 gates
│   │   │   ├── design-system.gates.ts # 4 gates
│   │   │   ├── build.gates.ts       # 4 gates
│   │   │   ├── review.gates.ts      # 3 gates
│   │   │   ├── material.gates.ts    # 3 gates
│   │   │   └── lab.gates.ts         # 2 gates
│   │   └── conditions/      # Reusable predicate functions
│   │       ├── fileConditions.ts    # hasRealFiles(), countRealFiles()
│   │       └── contentConditions.ts # fileHasContent(), sectionsFilled()
│   │
│   ├── webview/             # React + Vite
│   │   ├── index.tsx        # Entry React
│   │   ├── App.tsx          # Root component
│   │   ├── components/
│   │   │   ├── Navigator/   # Vue graphe
│   │   │   │   ├── GraphPanel.tsx
│   │   │   │   ├── NodeCard.tsx
│   │   │   │   ├── EdgesSvg.tsx
│   │   │   │   └── DetailPanel.tsx
│   │   │   ├── Prototyper/  # Vue artifacts
│   │   │   │   ├── ArtifactFeed.tsx
│   │   │   │   ├── ArtifactCard.tsx
│   │   │   │   └── PreviewPanel.tsx
│   │   │   └── shared/      # Composants communs
│   │   │       ├── CollapsibleSection.tsx
│   │   │       └── Toast.tsx
│   │   ├── hooks/
│   │   │   └── useVSCode.ts # Bridge messages VS Code
│   │   └── styles/
│   │       └── tokens.css   # Design tokens Catppuccin
│   │
│   ├── types/               # Shared types
│   │   ├── index.ts         # Re-exports
│   │   └── messages.ts      # ExtensionMessage, WebviewMessage
│   │
│   ├── extension-legacy.ts  # Old extension.ts (to migrate)
│   ├── parser-legacy.ts     # Old parser.ts (partially migrated)
│   └── types-legacy.ts      # Old types (to consolidate)
│
├── webview/dist/            # React build output (generated)
├── out/                     # Extension build output (generated)
│
├── esbuild.config.mjs       # Bundler extension
├── vite.config.ts           # Bundler webview React
├── vitest.config.ts         # Config tests
├── tsconfig.json            # Config TS extension
└── tsconfig.webview.json    # Config TS React/JSX
```

## Key principles

### 1. One file = one responsibility

| Need | File to change |
|------|----------------|
| Add a gate | `src/gates/definitions/{node}.gates.ts` |
| Change a UI component | `src/webview/components/{Section}/{Name}.tsx` |
| Change parsing logic | `src/parser/{module}.ts` |
| Change global state | `src/services/StateManager.ts` |
| Add a message type | `src/types/messages.ts` |

### 2. Declarative gates

Each gate is a ~5‑line config:

```typescript
// src/gates/definitions/strategy.gates.ts
{
  id: 'strat-brief',
  label: 'Product brief rempli',
  command: '/onboarding',
  condition: (ctx) => hasRealFiles(ctx.strategyFiles),
}
```

Pour ajouter un gate :
1. Ouvrir `src/gates/definitions/{node}.gates.ts`
2. Ajouter un objet au tableau
3. Utiliser les conditions de `conditions/fileConditions.ts` ou `contentConditions.ts`

### 3. Composants React isolés

Chaque composant est autonome :
- Props typées
- Pas de state global (utilise `useVSCode` hook)
- CSS via classes (tokens.css)

```typescript
// Example: src/webview/components/Navigator/NodeCard.tsx
interface NodeCardProps {
  node: DesignOsNode;
  selected: boolean;
  onClick: () => void;
}

export function NodeCard({ node, selected, onClick }: NodeCardProps) {
  // ...
}
```

### 4. Typed messages

Extension ↔ webview communicate via a discriminated union:

```typescript
// src/types/messages.ts
export type ExtensionMessage =
  | { type: 'graphData'; data: GraphData }
  | { type: 'addArtifact'; artifact: Artifact }
  | { type: 'toast'; message: string; variant: 'success' | 'error' };
```

## Development commands

```bash
# Full build
npm run compile

# Dev mode (watch extension + webview)
npm run dev

# Type check only
npm run typecheck

# Tests
npm run test
```

## Incremental migration

The `*-legacy` files contain the old code. Migration is done progressively:

1. **Already migrated**:
   - Gates → `src/gates/`
   - Parser signals/files/context → `src/parser/`
   - Webview → `src/webview/` (React)
   - Message types → `src/types/messages.ts`

2. **To migrate**:
   - `extension-legacy.ts` → `src/extension/` + `src/services/`
   - Remaining `parser-legacy.ts` → `src/parser/nodes/`
   - `types-legacy.ts` → `src/types/`

## Design System

CSS tokens in `src/webview/styles/tokens.css`:

```css
:root {
  --color-base: #1e1e2e;
  --color-surface: #313244;
  --color-accent: #89b4fa;
  --color-text: #cdd6f4;
  --radius-md: 8px;
  --space-md: 16px;
}
```

Palette: Catppuccin Mocha
