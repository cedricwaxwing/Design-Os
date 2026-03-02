# Design OS Navigator — Architecture

> Guide technique pour les modifications par IA (Claude)

## Vue d'ensemble

```
design-os-navigator/
├── src/
│   ├── extension/           # Entry point + commands (TODO: migrate)
│   │   └── index.ts         # Future entry point
│   │
│   ├── services/            # État encapsulé
│   │   ├── StateManager.ts  # Singleton — tout l'état en un seul endroit
│   │   ├── TerminalService.ts
│   │   └── ArtifactService.ts
│   │
│   ├── parser/              # Scanning modularisé
│   │   ├── index.ts         # Re-exports (API publique)
│   │   ├── signals.ts       # scanContentSignals(), emptySignals()
│   │   ├── files.ts         # listFiles(), detectScaffold()
│   │   └── context.ts       # parseContext(), parseHistory()
│   │
│   ├── gates/               # Système déclaratif (28 gates)
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
│   │   └── conditions/      # Fonctions réutilisables
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
│   ├── types/               # Types partagés
│   │   ├── index.ts         # Re-exports
│   │   └── messages.ts      # ExtensionMessage, WebviewMessage
│   │
│   ├── extension-legacy.ts  # Ancien extension.ts (à migrer)
│   ├── parser-legacy.ts     # Ancien parser.ts (partiellement migré)
│   └── types-legacy.ts      # Anciens types (à consolider)
│
├── webview/dist/            # Build React (généré)
├── out/                     # Build extension (généré)
│
├── esbuild.config.mjs       # Bundler extension
├── vite.config.ts           # Bundler webview React
├── vitest.config.ts         # Config tests
├── tsconfig.json            # Config TS extension
└── tsconfig.webview.json    # Config TS React/JSX
```

## Principes clés

### 1. Un fichier = Une responsabilité

| Besoin | Fichier à modifier |
|--------|-------------------|
| Ajouter un gate | `src/gates/definitions/{node}.gates.ts` |
| Changer un composant UI | `src/webview/components/{Section}/{Name}.tsx` |
| Modifier la logique de parsing | `src/parser/{module}.ts` |
| Changer l'état global | `src/services/StateManager.ts` |
| Ajouter un type de message | `src/types/messages.ts` |

### 2. Gates déclaratifs

Chaque gate est une config de ~5 lignes :

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
// Exemple: src/webview/components/Navigator/NodeCard.tsx
interface NodeCardProps {
  node: DesignOsNode;
  selected: boolean;
  onClick: () => void;
}

export function NodeCard({ node, selected, onClick }: NodeCardProps) {
  // ...
}
```

### 4. Messages typés

Communication extension ↔ webview via discriminated union :

```typescript
// src/types/messages.ts
export type ExtensionMessage =
  | { type: 'graphData'; data: GraphData }
  | { type: 'addArtifact'; artifact: Artifact }
  | { type: 'toast'; message: string; variant: 'success' | 'error' };
```

## Commandes de développement

```bash
# Build complet
npm run compile

# Dev mode (watch extension + webview)
npm run dev

# Type check seulement
npm run typecheck

# Tests
npm run test
```

## Migration incrémentale

Les fichiers `-legacy` contiennent l'ancien code. La migration se fait progressivement :

1. **Déjà migrés** :
   - Gates → `src/gates/`
   - Parser signals/files/context → `src/parser/`
   - Webview → `src/webview/` (React)
   - Types messages → `src/types/messages.ts`

2. **À migrer** :
   - `extension-legacy.ts` → `src/extension/` + `src/services/`
   - Reste de `parser-legacy.ts` → `src/parser/nodes/`
   - `types-legacy.ts` → `src/types/`

## Design System

Tokens CSS dans `src/webview/styles/tokens.css` :

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

Palette : Catppuccin Mocha
