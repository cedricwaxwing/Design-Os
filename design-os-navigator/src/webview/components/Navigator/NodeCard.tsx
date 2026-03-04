import React from 'react';
import type { DesignOsNode, GateCondition } from '../../../types-legacy';
import './NodeCard.css';

// Node icons (same as legacy)
const NODE_ICONS: Record<string, string> = {
  'material': '▣',
  'strategy': '◆',
  'discovery': '◎',
  'ux': '◇',
  'design-system': '▢',
  'spec': '▶',
  'ui': '●',
  'build': '⚙',
  'review': '✓',
  'lab': '⚡',
};

interface NodeWithPosition extends DesignOsNode {
  x: number;
  y: number;
  isChild?: boolean;
  parentId?: string;
}

interface NodeCardProps {
  node: NodeWithPosition;
  selected: boolean;
  onSelect: () => void;
}

export function NodeCard({ node, selected, onSelect }: NodeCardProps) {
  const hasAction = node.recommendedAction !== undefined;
  const isChild = node.isChild === true;

  // For child nodes, use a simpler icon
  const icon = isChild ? '◦' : (NODE_ICONS[node.id] || '○');

  return (
    <div
      className={`node status-${node.status} ${selected ? 'selected' : ''} ${hasAction ? 'has-action' : ''} ${isChild ? 'child-node' : ''}`}
      style={{ left: node.x, top: node.y }}
      onClick={onSelect}
    >
      <div className="node-header">
        <span className="node-icon">{icon}</span>
        <span className="node-label">{node.label}</span>
      </div>

      <div className="node-meta">
        <span className="node-files">{node.fileCount} files</span>
        <GateDots gates={node.gates} />
      </div>

      <MaturityBadge maturity={node.maturity} />
    </div>
  );
}

// Gate dots visualization
function GateDots({ gates }: { gates: GateCondition[] }) {
  if (gates.length === 0) return null;

  return (
    <div className="gate-dots">
      {gates.map(gate => (
        <span
          key={gate.id}
          className={`gate-dot ${gate.met ? 'met' : 'unmet'}`}
          title={gate.label}
        />
      ))}
    </div>
  );
}

// Maturity badge
function MaturityBadge({ maturity }: { maturity: string }) {
  return (
    <span className={`maturity-badge maturity-${maturity.toLowerCase().replace(' ', '-')}`}>
      {maturity}
    </span>
  );
}
