import React from 'react';
import type { DesignOsNode } from '../../../types-legacy';
import { getMaturityLabel } from './utils';
import './SidePanel.css';

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

interface SidePanelProps {
  node: DesignOsNode | null;
  allNodes: DesignOsNode[];
  onClose: () => void;
  onRunCommand: (command: string) => void;
  onOpenFile: (path: string) => void;
  onPreviewFile: (path: string) => void;
}

export function SidePanel({
  node,
  allNodes,
  onClose,
  onRunCommand,
  onOpenFile,
  onPreviewFile,
}: SidePanelProps) {
  if (!node) {
    return <div className="side-panel" />;
  }

  const metGates = node.gates.filter(g => g.met).length;
  const totalGates = node.gates.length;

  // Resolve connection labels
  const dependsLabels = node.dependsOn
    .map(id => allNodes.find(n => n.id === id))
    .filter((n): n is DesignOsNode => !!n)
    .map(n => ({ id: n.id, label: `← ${n.label}` }));

  const unlocksLabels = node.unlocks
    .map(id => allNodes.find(n => n.id === id))
    .filter((n): n is DesignOsNode => !!n)
    .map(n => ({ id: n.id, label: `→ ${n.label}` }));

  const connections = [...dependsLabels, ...unlocksLabels];

  return (
    <div className="side-panel open">
      {/* Header */}
      <div className="sp-header">
        <h3 className="sp-title">
          <span className="sp-icon">{NODE_ICONS[node.id] || '○'}</span>
          {node.label}
        </h3>
        <button className="sp-close" onClick={onClose}>×</button>
      </div>

      {/* Body */}
      <div className="sp-body">
        {/* Section: STATUS (spec 1.2) */}
        <div className="sp-section">
          <div className="sp-section-title">STATUS</div>
          <div className="sp-stat">
            <span className="sp-stat-label">Maturity</span>
            <span className="sp-stat-value">{getMaturityLabel(node.maturity)}</span>
          </div>
          <div className="sp-stat">
            <span className="sp-stat-label">Files</span>
            <span className="sp-stat-value">{node.fileCount}</span>
          </div>
          <div className="sp-stat">
            <span className="sp-stat-label">Gates</span>
            <span className="sp-stat-value">{metGates}/{totalGates}</span>
          </div>
        </div>

        {/* Section: ACTIONS (spec 1.2) */}
        {node.commands.length > 0 && (
          <div className="sp-section">
            <div className="sp-section-title">ACTIONS</div>
            {node.commands.map((cmd, i) => (
              <button
                key={cmd.command}
                className={`sp-action ${i === 0 ? 'primary' : 'secondary'}`}
                onClick={() => onRunCommand(cmd.command)}
                title={cmd.description}
              >
                {cmd.label}
              </button>
            ))}
          </div>
        )}

        {/* Section: FILES (spec 1.2) */}
        {node.files.length > 0 && (
          <div className="sp-section">
            <div className="sp-section-title">FILES</div>
            {node.files.slice(0, 10).map(file => (
              <div
                key={file.path}
                className="sp-file"
                onClick={() => onOpenFile(file.path)}
                onContextMenu={(e) => { e.preventDefault(); onPreviewFile(file.path); }}
              >
                <span className="sp-file-icon">📄</span>
                <span className="sp-file-name">{file.name}</span>
                {file.status && (
                  <span className={`sp-file-badge ${file.status.toLowerCase().replace(' ', '-')}`}>
                    {file.status}
                  </span>
                )}
              </div>
            ))}
            {node.files.length > 10 && (
              <div className="sp-more">+{node.files.length - 10} files</div>
            )}
          </div>
        )}

        {/* Section: CONNECTIONS (spec 1.2) */}
        {connections.length > 0 && (
          <div className="sp-section">
            <div className="sp-section-title">CONNECTIONS</div>
            {connections.map(conn => (
              <div key={conn.id} className="sp-connection">
                {conn.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
