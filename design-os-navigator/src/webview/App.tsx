import React, { useState, useEffect, useCallback } from 'react';
import { useVSCodeMessage, postMessage } from './hooks/useVSCode';
import { FlowPanel } from './components/Navigator/FlowPanel';
import { SidePanel } from './components/Navigator/SidePanel';
import { ArtifactFeed } from './components/Prototyper/ArtifactFeed';
import { Toast } from './components/shared/Toast';
import { normalizeGraphMaturity } from './components/Navigator/utils';
import type { GraphData, DesignOsNode } from '../types-legacy';
import type { ExtensionMessage } from '../types/messages';
import type { Artifact } from '../types/artifact';

interface AppProps {
  initialData?: unknown;
}

type Tab = 'navigator' | 'prototyper';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  visible: boolean;
}

function initGraphData(initialData: unknown): GraphData | null {
  const d = initialData as GraphData | null;
  if (d?.nodes) normalizeGraphMaturity(d);
  return d;
}

export default function App({ initialData }: AppProps) {
  // VS Code API is managed by useVSCode.ts (single acquireVsCodeApi call)
  // Graph data — normalize maturity to English on load and on every update
  const [graphData, setGraphData] = useState<GraphData | null>(() => initGraphData(initialData));

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('prototyper');
  // detailPanelWidth removed — SidePanel uses fixed 300px

  // Artifacts
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  // Toast
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });

  // Handle messages from extension
  const handleMessage = useCallback((message: ExtensionMessage) => {
    switch (message.type) {
      case 'graphData': {
        const d = message.data as GraphData;
        if (d?.nodes) normalizeGraphMaturity(d);
        setGraphData(d);
        break;
      }

      case 'setArtifacts':
        setArtifacts(message.artifacts);
        break;

      case 'addArtifact':
        setArtifacts(prev => [...prev, message.artifact]);
        break;

      case 'updateArtifact':
        setArtifacts(prev => prev.map(a =>
          a.id === message.artifact.id ? message.artifact : a
        ));
        break;

      case 'removeArtifact':
        setArtifacts(prev => prev.filter(a => a.id !== message.id));
        break;

      case 'setLoading':
        setLoadingIds(prev => {
          const next = new Set(prev);
          if (message.loading) {
            next.add(message.id);
          } else {
            next.delete(message.id);
          }
          return next;
        });
        break;

      case 'protoToast':
        setToast({
          message: message.message,
          type: message.toastType,
          visible: true
        });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
        break;

      case 'readinessChanged':
        // Could add a visual indicator here
        break;
    }
  }, []);

  useVSCodeMessage(handleMessage);

  // Signal to extension that React is ready to receive messages
  // This must be AFTER useVSCodeMessage to ensure listener is setup
  useEffect(() => {
    postMessage({ type: 'webviewReady' });
  }, []);

  // Get selected node
  const selectedNode: DesignOsNode | null = selectedNodeId && graphData
    ? graphData.nodes.find(n => n.id === selectedNodeId) || null
    : null;

  // Actions
  const runCommand = (command: string) => {
    postMessage({ type: 'runCommand', command });
  };

  const openFile = (path: string) => {
    postMessage({ type: 'openFile', path });
  };

  const previewFile = (path: string) => {
    postMessage({ type: 'previewFile', path });
  };

  const [consoleMenuOpen, setConsoleMenuOpen] = useState(false);
  const consoleLauncherRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!consoleMenuOpen) { return; }
    const handleOutsideClick = (e: MouseEvent) => {
      if (consoleLauncherRef.current && !consoleLauncherRef.current.contains(e.target as Node)) {
        setConsoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [consoleMenuOpen]);

  const launchConsole = (cli: string) => {
    postMessage({ type: 'launchConsole', cli });
    setConsoleMenuOpen(false);
  };

  // Artifact actions
  const copyArtifact = (id: string) => {
    postMessage({ type: 'copyArtifact', id });
  };

  const deleteArtifact = (id: string) => {
    postMessage({ type: 'deleteArtifact', id });
  };

  const pinArtifact = (id: string) => {
    postMessage({ type: 'pinArtifact', id });
  };

  const regenerateArtifact = (id: string, mode: 'same' | 'prompt' | 'variant', prompt?: string) => {
    postMessage({ type: 'regenerateArtifact', id, mode, prompt });
  };

  return (
    <div className="app">
      {/* Header with tabs */}
      <header className="app-header">
        <div className="header-tabs">
          <button
            type="button"
            className={`header-tab ${activeTab === 'prototyper' ? 'active' : ''}`}
            onClick={() => setActiveTab('prototyper')}
          >
            Prototyper
            {artifacts.length > 0 && (
              <span className="tab-badge">{artifacts.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`header-tab ${activeTab === 'navigator' ? 'active' : ''}`}
            onClick={() => setActiveTab('navigator')}
          >
            Navigator
          </button>
        </div>
        <div className="console-launcher" ref={consoleLauncherRef}>
          <button type="button" className="launch-console-btn" onClick={() => setConsoleMenuOpen(!consoleMenuOpen)}>
            <span className="icon">◆</span> Launch console ▾
          </button>
          {consoleMenuOpen && (
            <div className="console-dropdown">
              <button type="button" className="console-dropdown-item" onClick={() => launchConsole('claude')}>
                claude
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="app-content">
        {activeTab === 'navigator' && graphData && (
          <>
            <FlowPanel
              data={graphData}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
            <SidePanel
              node={selectedNode}
              allNodes={graphData.nodes}
              onClose={() => setSelectedNodeId(null)}
              onRunCommand={runCommand}
              onOpenFile={openFile}
              onPreviewFile={previewFile}
            />
          </>
        )}

        {activeTab === 'navigator' && !graphData && (
          <div className="navigator-error-state">
            <p className="navigator-error-message">No project data available.</p>
            <p className="navigator-error-hint">Open a workspace that contains CLAUDE.md and .claude/context.md, then reopen the Design OS Navigator.</p>
          </div>
        )}

        {activeTab === 'prototyper' && (
          <ArtifactFeed
            artifacts={artifacts}
            loadingIds={loadingIds}
            onCopy={copyArtifact}
            onDelete={deleteArtifact}
            onPin={pinArtifact}
            onRegenerate={regenerateArtifact}
          />
        )}
      </main>

      {/* Navigator bottom bars */}
      {activeTab === 'navigator' && graphData && (
        <>
          <div className="ai-bar">
            <span className="ai-dot" />
            <span>
              <strong className="ai-label">AI</strong>
              {' — '}
              {graphData.nodes.map(n => n.label).join(' → ')}
            </span>
          </div>
          <div className="readiness-footer">
            <span className="readiness-label">Readiness</span>
            <div className="readiness-track">
              <div
                className="readiness-fill"
                style={{ '--readiness-pct': `${Math.round(graphData.globalReadiness)}%` } as React.CSSProperties}
              />
            </div>
            <span className="readiness-pct">{Math.round(graphData.globalReadiness)}%</span>
            <span className="readiness-stats">
              {graphData.nodes.length} nodes · {graphData.nodes.reduce((s, n) => s + n.fileCount, 0)} files
            </span>
          </div>
        </>
      )}

      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />
    </div>
  );
}
