import React, { useState } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import type { DesignOsNode, FileInfo, GateCondition } from '../../../types-legacy';
import { getMaturityLabel } from './utils';
import './DetailPanel.css';

interface DetailPanelProps {
  node: DesignOsNode | null;
  onClose: () => void;
  onRunCommand: (command: string) => void;
  onOpenFile: (path: string) => void;
  onPreviewFile: (path: string) => void;
  width: number;
  onWidthChange: (width: number) => void;
}

export function DetailPanel({
  node,
  onClose,
  onRunCommand,
  onOpenFile,
  onPreviewFile,
  width,
  onWidthChange,
}: DetailPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  if (!node) {
    return <div className="detail-panel hidden" />;
  }

  // Resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newWidth = window.innerWidth - e.clientX;
      onWidthChange(Math.min(Math.max(newWidth, 300), 600));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <>
      {/* Resize handle */}
      <div
        className={`resize-handle ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      />

      <div className="detail-panel" style={{ width }}>
        {/* Header */}
        <div className="detail-header">
          <div className="detail-header-info">
            <h2 className="detail-title">{node.label}</h2>
            <span className={`maturity-badge maturity-${node.maturity.toLowerCase().replace(' ', '-')}`}>
              {getMaturityLabel(node.maturity)}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Readiness score */}
        <div className="detail-readiness">
          <span className="readiness-label">Readiness</span>
          <div className="readiness-bar">
            <div
              className="readiness-fill"
              style={{ width: `${node.readiness}%` }}
            />
          </div>
          <span className="readiness-score">{Math.round(node.readiness)}%</span>
        </div>

        {/* Gates section */}
        <CollapsibleSection title="Gates" defaultOpen>
          <GateList
            gates={node.gates}
            onRunCommand={onRunCommand}
          />
        </CollapsibleSection>

        {/* Commands section */}
        {node.commands.length > 0 && (
          <CollapsibleSection title="Commandes" defaultOpen>
            <div className="commands-list">
              {node.commands.map(cmd => (
                <button
                  key={cmd.command}
                  className="command-btn"
                  onClick={() => onRunCommand(cmd.command)}
                >
                  <span className="command-name">{cmd.command}</span>
                  <span className="command-desc">{cmd.description}</span>
                </button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Files section */}
        {node.files.length > 0 && (
          <CollapsibleSection title={`Fichiers (${node.files.length})`}>
            <FileList
              files={node.files}
              onOpenFile={onOpenFile}
              onPreviewFile={onPreviewFile}
            />
          </CollapsibleSection>
        )}

        {/* Recommended action */}
        {node.recommendedAction && (
          <div className="recommended-action">
            <span className="action-label">Action recommandee</span>
            <button
              className="action-btn"
              onClick={() => onRunCommand(node.recommendedAction!.command)}
            >
              {node.recommendedAction.command}
            </button>
            <p className="action-reason">{node.recommendedAction.reason}</p>
          </div>
        )}
      </div>
    </>
  );
}

// Gate list component
function GateList({
  gates,
  onRunCommand,
}: {
  gates: GateCondition[];
  onRunCommand: (cmd: string) => void;
}) {
  return (
    <div className="gates-list">
      {gates.map(gate => (
        <div key={gate.id} className={`gate-item ${gate.met ? 'met' : 'unmet'}`}>
          <span className="gate-indicator">{gate.met ? '✓' : '○'}</span>
          <span className="gate-label">{gate.label}</span>
          {!gate.met && gate.command && (
            <button
              className="gate-action"
              onClick={() => onRunCommand(gate.command!)}
            >
              {gate.command}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// File list component
function FileList({
  files,
  onOpenFile,
  onPreviewFile,
}: {
  files: FileInfo[];
  onOpenFile: (path: string) => void;
  onPreviewFile: (path: string) => void;
}) {
  const previewableTypes = ['.svg', '.html', '.htm'];

  return (
    <div className="files-list">
      {files.slice(0, 10).map(file => {
        const ext = file.name.substring(file.name.lastIndexOf('.'));
        const isPreviewable = previewableTypes.includes(ext.toLowerCase());

        return (
          <div
            key={file.path}
            className="file-item"
            onClick={() => isPreviewable ? onPreviewFile(file.path) : onOpenFile(file.path)}
          >
            <span className="file-icon">{getFileIcon(file.type)}</span>
            <span className="file-name">{file.name}</span>
            {file.hasHypothesis && (
              <span className="file-badge hypothesis" title="Contient des hypotheses">H</span>
            )}
            {file.status && (
              <span className={`file-badge status-${file.status.toLowerCase().replace(' ', '-')}`}>
                {file.status}
              </span>
            )}
          </div>
        );
      })}
      {files.length > 10 && (
        <div className="files-more">+{files.length - 10} fichiers</div>
      )}
    </div>
  );
}

function getFileIcon(type: string): string {
  const icons: Record<string, string> = {
    spec: '▶',
    screen: '□',
    persona: '◎',
    insight: '◇',
    interview: '◆',
    domain: '▣',
    token: '●',
    review: '✓',
    code: '⚙',
    test: '⚡',
    brief: '◆',
    journey: '→',
    material: '▣',
    other: '○',
  };
  return icons[type] || '○';
}
