import React, { useState, useEffect, useRef } from 'react';
import { ArtifactCard } from './ArtifactCard';
import { PreviewPanel } from './PreviewPanel';
import type { Artifact } from '../../../types/artifact';
import './ArtifactFeed.css';

function prepareSvg(svgContent: string, containerId: string): string {
  let result = svgContent.replace(
    /<style[^>]*>([\s\S]*?)<\/style>/gi,
    (_match, cssContent: string) => {
      const scoped = cssContent.replace(
        /([^{}]+)\{/g,
        (_r: string, sel: string) => {
          const t = sel.trim();
          if (t.startsWith('@')) return `${sel}{`;
          return t.split(',').map((s: string) => `#${containerId} ${s.trim()}`).join(', ') + ' {';
        }
      );
      return `<style>${scoped}</style>`;
    }
  );
  result = result.replace(/<svg([^>]*)>/i, (_m, attrs: string) => {
    let a = attrs.replace(/\s*width\s*=\s*["'][^"']*["']/gi, '').replace(/\s*height\s*=\s*["'][^"']*["']/gi, '');
    return `<svg${a} width="100%" height="auto">`;
  });
  return result;
}

interface ArtifactFeedProps {
  artifacts: Artifact[];
  loadingIds: Set<string>;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onRegenerate: (id: string, mode: 'same' | 'prompt' | 'variant', prompt?: string) => void;
}

type ViewMode = 'cards' | 'realsize' | 'compact';

export function ArtifactFeed({
  artifacts,
  loadingIds,
  onCopy,
  onDelete,
  onPin,
  onRegenerate,
}: ArtifactFeedProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [actionMode, setActionMode] = useState<'flow' | 'variants' | 'compare'>('flow');
  const [regenOpenId, setRegenOpenId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = () => {
      setRegenOpenId(null);
      setMenuOpenId(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Scroll to bottom on mount (newest items are at the bottom)
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [artifacts.length]);

  // Escape key closes inline preview
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewId) {
        setPreviewId(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [previewId]);

  // Sort: pinned first, then by createdAt asc (newest at bottom)
  const sortedArtifacts = [...artifacts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return a.createdAt - b.createdAt;
  });

  // Filter by type (doc, svg, html)
  const filteredByType = filterType
    ? sortedArtifacts.filter(a => a.type === filterType)
    : sortedArtifacts;

  // Filter out artifacts with empty content (they render as invisible border lines)
  const filteredArtifacts = filteredByType.filter(a => a.content?.trim().length > 0);

  // Count non-empty artifacts for the counter
  const totalNonEmpty = sortedArtifacts.filter(a => a.content?.trim().length > 0).length;

  const selectedArtifact = artifacts.find(a => a.id === selectedId);

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const typeIcon: Record<string, string> = {
    doc: '▤',
    svg: '◇',
    html: '▣',
  };

  const phaseColor: Record<string, string> = {
    spec: 'var(--accent)',
    design: 'var(--mauve)',
    prototype: 'var(--peach)',
  };

  // Render Real Size layout — inline preview or feed using ArtifactCard mode="feed"
  const renderRealSize = () => {
    const previewArtifact = artifacts.find(a => a.id === previewId);

    // Inline preview mode
    if (previewArtifact) {
      const previewBadgeClass: Record<string, string> = {
        doc: 'rs-badge-doc', svg: 'rs-badge-svg', html: 'rs-badge-html', server: 'rs-badge-server',
      };
      return (
        <div className="rs-preview-mode">
          <div className="rs-preview-header">
            <div className="rs-preview-header-left">
              <button className="rs-back-btn" onClick={() => setPreviewId(null)}>
                ← Retour
              </button>
              <span className={`rs-badge ${previewBadgeClass[previewArtifact.type] || ''}`}>
                {previewArtifact.type.toUpperCase()}
              </span>
              <span className="rs-preview-title">{previewArtifact.title}</span>
            </div>
            <div className="rs-preview-actions">
              <button className="rs-action-btn" onClick={() => onCopy(previewArtifact.id)}>
                📋 Copier
              </button>
            </div>
          </div>
          <div className="rs-preview-content">
            {previewArtifact.type === 'svg' && (() => {
              const cid = `rsp-${previewArtifact.id.replace(/[^a-zA-Z0-9-]/g, '')}`;
              return (
                <div
                  id={cid}
                  className="rs-preview-svg"
                  dangerouslySetInnerHTML={{ __html: prepareSvg(previewArtifact.content, cid) }}
                />
              );
            })()}
            {previewArtifact.type === 'html' && (
              <iframe
                className="rs-preview-iframe"
                srcDoc={previewArtifact.content}
                sandbox="allow-scripts"
                title={previewArtifact.title}
              />
            )}
            {previewArtifact.type === 'doc' && (
              <div className="rs-preview-doc">
                <pre>{previewArtifact.content}</pre>
              </div>
            )}
          </div>
          <div className="rs-preview-hint">Echap pour revenir au feed</div>
        </div>
      );
    }

    // Feed mode — uses ArtifactCard with mode="feed"
    const pinnedArtifacts = filteredArtifacts.filter(a => a.isPinned);
    const regularArtifacts = filteredArtifacts.filter(a => !a.isPinned);

    const renderFeedCard = (artifact: Artifact) => (
      <ArtifactCard
        key={artifact.id}
        artifact={artifact}
        isSelected={false}
        isLoading={loadingIds.has(artifact.id)}
        mode="feed"
        onSelect={() => {}}
        onOpen={() => setPreviewId(artifact.id)}
        onCopy={() => onCopy(artifact.id)}
        onDelete={() => { onDelete(artifact.id); setMenuOpenId(null); }}
        onPin={() => { onPin(artifact.id); setMenuOpenId(null); }}
        onRegenerate={(mode, prompt) => { onRegenerate(artifact.id, mode, prompt); setRegenOpenId(null); }}
        regenOpen={regenOpenId === artifact.id}
        onRegenToggle={() => {
          setRegenOpenId(regenOpenId === artifact.id ? null : artifact.id);
          setMenuOpenId(null);
        }}
        menuOpen={menuOpenId === artifact.id}
        onMenuToggle={() => {
          setMenuOpenId(menuOpenId === artifact.id ? null : artifact.id);
          setRegenOpenId(null);
        }}
      />
    );

    return (
      <div className="rs-feed" ref={feedRef}>
        {filteredArtifacts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">◇</span>
            <p>Aucun artefact</p>
            <p className="empty-hint">Les fichiers crees par les skills apparaitront ici</p>
          </div>
        ) : (
          <>
            {pinnedArtifacts.length > 0 && (
              <div className="rs-pinned-section">
                <div className="rs-pinned-label">📌 Epingles</div>
                {pinnedArtifacts.map(renderFeedCard)}
              </div>
            )}
            {regularArtifacts.map(renderFeedCard)}
          </>
        )}
      </div>
    );
  };

  // Render Compact layout
  const renderCompact = () => (
    <div className="compact-layout">
      {filteredArtifacts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◇</span>
          <p>Aucun artefact</p>
          <p className="empty-hint">Les fichiers crees par les skills apparaitront ici</p>
        </div>
      ) : (
        filteredArtifacts.map(artifact => (
          <div
            key={artifact.id}
            className={`compact-row ${selectedId === artifact.id ? 'selected' : ''}`}
            onClick={() => setSelectedId(artifact.id)}
          >
            <span
              className="compact-dot"
              style={{ background: phaseColor[artifact.phase] }}
            />
            <span className="compact-icon">{typeIcon[artifact.type]}</span>
            <span className="compact-title">{artifact.title}</span>
            {artifact.isPinned && <span className="compact-pin">📌</span>}
            <span className="compact-skill">{artifact.skill}</span>
            <span className="compact-time">{formatTime(artifact.createdAt)}</span>
          </div>
        ))
      )}
    </div>
  );

  // Render Cards layout (default)
  const renderCards = () => (
    <div className="prototyper-container">
      {/* Sidebar with artifact list */}
      <div className="artifact-sidebar">
        {/* Artifact cards */}
        <div className="artifact-list">
          {filteredArtifacts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">◇</span>
              <p>Aucun artefact</p>
              <p className="empty-hint">Les fichiers crees par les skills apparaitront ici</p>
            </div>
          ) : (
            filteredArtifacts.map(artifact => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                isSelected={artifact.id === selectedId}
                isLoading={loadingIds.has(artifact.id)}
                onSelect={() => setSelectedId(artifact.id)}
                onCopy={() => onCopy(artifact.id)}
                onDelete={() => onDelete(artifact.id)}
                onPin={() => onPin(artifact.id)}
                onRegenerate={(mode, prompt) => onRegenerate(artifact.id, mode, prompt)}
              />
            ))
          )}
        </div>
      </div>

      {/* Preview panel */}
      <PreviewPanel
        artifact={selectedArtifact}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );

  return (
    <div className="prototyper-wrapper">
      {/* Sub-header with filters, action mode, and view mode switch */}
      <div className="prototyper-subheader">
        {/* Filter by type */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${!filterType ? 'active' : ''}`}
            onClick={() => setFilterType(null)}
          >
            Tous ({totalNonEmpty})
          </button>
          <button
            className={`filter-tab ${filterType === 'doc' ? 'active' : ''}`}
            onClick={() => setFilterType('doc')}
          >
            Docs
          </button>
          <button
            className={`filter-tab ${filterType === 'svg' ? 'active' : ''}`}
            onClick={() => setFilterType('svg')}
          >
            SVG
          </button>
          <button
            className={`filter-tab ${filterType === 'html' ? 'active' : ''}`}
            onClick={() => setFilterType('html')}
          >
            HTML
          </button>
        </div>

        {/* Action mode pills */}
        <div className="action-mode-pills">
          <button
            className={`action-pill ${actionMode === 'flow' ? 'active' : ''}`}
            onClick={() => setActionMode('flow')}
          >
            Flow
          </button>
          <button
            className={`action-pill disabled`}
            disabled
            title="Bientôt disponible"
          >
            Variants
          </button>
          <button
            className={`action-pill disabled`}
            disabled
            title="Bientôt disponible"
          >
            Compare
          </button>
        </div>

        {/* View mode switch */}
        <div className="view-mode-switch">
          <button
            className={`view-mode-btn ${viewMode === 'realsize' ? 'active' : ''}`}
            onClick={() => setViewMode('realsize')}
            title="Taille réelle"
          >
            ▢
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Cartes"
          >
            ▦
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'compact' ? 'active' : ''}`}
            onClick={() => setViewMode('compact')}
            title="Compact"
          >
            ≡
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'cards' && renderCards()}
      {viewMode === 'realsize' && renderRealSize()}
      {viewMode === 'compact' && renderCompact()}
    </div>
  );
}
