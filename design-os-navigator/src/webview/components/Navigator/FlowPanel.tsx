import React from 'react';
import type { GraphData, DesignOsNode } from '../../../types-legacy';
import { getMaturityLabel } from './utils';
import './FlowPanel.css';

// ── Flow layout definition ──

type FlowStep =
  | { type: 'single'; nodeId: string }
  | { type: 'branch'; nodeIds: string[] };

const FLOW_LAYOUT: FlowStep[] = [
  { type: 'single', nodeId: 'material' },
  { type: 'single', nodeId: 'strategy' },
  { type: 'single', nodeId: 'discovery' },
  { type: 'branch', nodeIds: ['design-system', 'ux', 'lab'] },
  { type: 'branch', nodeIds: ['spec', 'ui'] },
  { type: 'single', nodeId: 'build' },
  { type: 'single', nodeId: 'review' },
];

const NODE_ICONS: Record<string, string> = {
  material: '▣',
  strategy: '◆',
  discovery: '◎',
  'design-system': '▢',
  ux: '◇',
  lab: '⚡',
  spec: '▶',
  ui: '●',
  build: '⚙',
  review: '✓',
};

// ── FlowNodeCard (inline component) ──

interface FlowNodeCardProps {
  node: DesignOsNode;
  selected: boolean;
  onSelect: () => void;
}

function FlowNodeCard({ node, selected, onSelect }: FlowNodeCardProps) {
  const alertCount = node.signals.hypothesisCount + node.signals.contradictionCount;
  const hasAlert = alertCount > 0;
  const metGates = node.gates.filter(g => g.met).length;
  const totalGates = node.gates.length;

  const maturityClass = node.maturity.toLowerCase().replace(' ', '-');

  return (
    <div
      className={`flow-node ${selected ? 'selected' : ''} ${hasAlert ? 'has-alert' : ''}`}
      onClick={onSelect}
    >
      <div className="flow-node-top">
        <span className="flow-node-icon">{NODE_ICONS[node.id] || '○'}</span>
        <span className="flow-node-name">{node.label}</span>
        {hasAlert && (
          <span className="flow-node-alert">{alertCount}</span>
        )}
      </div>
      <div className="flow-node-bottom">
        <span className={`flow-node-tag ${maturityClass}`}>
          {getMaturityLabel(node.maturity)}
        </span>
        <span className="flow-node-gates">
          {node.gates.map((g, i) => (
            <span key={i} className={`flow-gate-dot ${g.met ? 'met' : 'unmet'}`} />
          ))}
        </span>
        <span className="flow-node-files">{metGates}/{totalGates}</span>
      </div>
    </div>
  );
}

// ── Connector ──

function Connector({ active }: { active: boolean }) {
  return <div className={`flow-connector ${active ? 'active' : ''}`} />;
}

// ── BranchRow ──

interface BranchRowProps {
  nodes: DesignOsNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

function BranchRow({ nodes, selectedNodeId, onSelectNode }: BranchRowProps) {
  return (
    <div className="flow-branch-row">
      {nodes.map(node => (
        <FlowNodeCard
          key={node.id}
          node={node}
          selected={node.id === selectedNodeId}
          onSelect={() => onSelectNode(node.id)}
        />
      ))}
    </div>
  );
}

// ── FlowPanel ──

interface FlowPanelProps {
  data: GraphData;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

export function FlowPanel({ data, selectedNodeId, onSelectNode }: FlowPanelProps) {
  const nodeMap = new Map<string, DesignOsNode>();
  for (const n of data.nodes) {
    nodeMap.set(n.id, n);
  }

  return (
    <div className="flow-graph-area">
      <div className="flow-container">
        {FLOW_LAYOUT.map((step, i) => {
          const isLast = i === FLOW_LAYOUT.length - 1;

          if (step.type === 'single') {
            const node = nodeMap.get(step.nodeId);
            if (!node) return null;
            const isActive = node.readiness > 0;

            return (
              <React.Fragment key={step.nodeId}>
                <FlowNodeCard
                  node={node}
                  selected={node.id === selectedNodeId}
                  onSelect={() => onSelectNode(node.id === selectedNodeId ? null : node.id)}
                />
                {!isLast && <Connector active={isActive} />}
              </React.Fragment>
            );
          }

          // Branch
          const branchNodes = step.nodeIds
            .map(id => nodeMap.get(id))
            .filter((n): n is DesignOsNode => n !== undefined);

          if (branchNodes.length === 0) return null;
          const anyActive = branchNodes.some(n => n.readiness > 0);

          return (
            <React.Fragment key={step.nodeIds.join('-')}>
              <BranchRow
                nodes={branchNodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => onSelectNode(id === selectedNodeId ? null : id)}
              />
              {!isLast && <Connector active={anyActive} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
