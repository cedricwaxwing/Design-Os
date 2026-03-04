import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Artifact } from '../../../types/artifact';
import './ArtifactCard.css';

/** Scope SVG <style> selectors and force width="100%" for proper scaling */
function prepareSvg(svgContent: string, containerId: string): string {
  // 1. Scope CSS selectors to container ID
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
  // 2. Force SVG to fill container width (replace or add width/height)
  result = result.replace(
    /<svg([^>]*)>/i,
    (_m, attrs: string) => {
      let a = attrs.replace(/\s*width\s*=\s*["'][^"']*["']/gi, '').replace(/\s*height\s*=\s*["'][^"']*["']/gi, '');
      return `<svg${a} width="100%" height="auto">`;
    }
  );
  return result;
}

interface ArtifactCardProps {
  artifact: Artifact;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onPin: () => void;
  onRegenerate: (mode: 'same' | 'prompt' | 'variant', prompt?: string) => void;
  // Feed mode props
  mode?: 'sidebar' | 'feed';
  onOpen?: () => void;
  regenOpen?: boolean;
  onRegenToggle?: () => void;
  menuOpen?: boolean;
  onMenuToggle?: () => void;
}

export function ArtifactCard({
  artifact,
  isSelected,
  isLoading,
  onSelect,
  onCopy,
  onDelete,
  onPin,
  onRegenerate,
  mode = 'sidebar',
  onOpen,
  regenOpen,
  onRegenToggle,
  menuOpen,
  onMenuToggle,
}: ArtifactCardProps) {
  const [showActions, setShowActions] = useState(false);

  const typeIcon = {
    doc: '▤',
    svg: '◇',
    html: '▣',
  }[artifact.type];

  const phaseColor = {
    spec: 'var(--accent)',
    design: 'var(--mauve)',
    prototype: 'var(--peach)',
  }[artifact.phase];

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const badgeClass: Record<string, string> = {
    doc: 'feed-badge-doc',
    svg: 'feed-badge-svg',
    html: 'feed-badge-html',
    server: 'feed-badge-server',
  };

  // ── FEED MODE ──
  if (mode === 'feed') {
    return (
      <article
        className={`artifact-card-feed ${isLoading ? 'loading' : ''} ${artifact.isPinned ? 'pinned' : ''}`}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="feed-loading-overlay">
            <span className="spinner" />
            <span className="feed-loading-text">Generating...</span>
          </div>
        )}

        {/* Header */}
        <div className="feed-header">
          <div className="feed-header-left">
            {artifact.isPinned && <span className="feed-pin">📌</span>}
            <span className={`feed-badge ${badgeClass[artifact.type] || ''}`}>
              {artifact.type.toUpperCase()}
            </span>
            <span className="feed-title">{artifact.title}</span>
          </div>
          <div className="feed-actions" onClick={e => e.stopPropagation()}>
            <button className="feed-action-btn" onClick={onOpen}>
              ↗ Open
            </button>
            <button className="feed-action-btn" onClick={onCopy}>
              📋 Copy
            </button>
            <div className="feed-dropdown-wrapper" onClick={e => e.stopPropagation()}>
              <button
                className="feed-action-btn"
                onClick={(e) => { e.stopPropagation(); onRegenToggle?.(); }}
              >
                🔄 Regenerate ▾
              </button>
              {regenOpen && (
                <div className="feed-dropdown">
                  <button className="feed-dropdown-item" onClick={() => onRegenerate('same')}>
                    <span className="feed-dropdown-icon">🔄</span> Regenerate
                  </button>
                  <button className="feed-dropdown-item" onClick={() => onRegenerate('prompt')}>
                    <span className="feed-dropdown-icon">✏️</span> With prompt...
                  </button>
                  <button className="feed-dropdown-item" onClick={() => onRegenerate('variant')}>
                    <span className="feed-dropdown-icon">✧</span> Variant
                  </button>
                </div>
              )}
            </div>
            <div className="feed-dropdown-wrapper" onClick={e => e.stopPropagation()}>
              <button
                className="feed-menu-btn"
                onClick={(e) => { e.stopPropagation(); onMenuToggle?.(); }}
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="feed-dropdown feed-dropdown-right">
                  <button className="feed-dropdown-item" onClick={onPin}>
                    <span className="feed-dropdown-icon">{artifact.isPinned ? '📍' : '📌'}</span>
                    {artifact.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <div className="feed-dropdown-divider" />
                  <button className="feed-dropdown-item feed-danger" onClick={onDelete}>
                    <span className="feed-dropdown-icon">🗑</span> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content — full-size rendering */}
        <div className="feed-content">
          {artifact.type === 'svg' && (() => {
            const cid = `svg-${artifact.id.replace(/[^a-zA-Z0-9-]/g, '')}`;
            return (
              <div
                id={cid}
                className="feed-render-svg"
                dangerouslySetInnerHTML={{ __html: prepareSvg(artifact.content, cid) }}
              />
            );
          })()}
          {artifact.type === 'html' && (
            <iframe
              className="feed-render-html"
              srcDoc={artifact.content}
              sandbox="allow-scripts"
              title={artifact.title}
            />
          )}
          {artifact.type === 'doc' && (
            <div className="feed-render-doc">
              <Markdown className="markdown-body" remarkPlugins={[remarkGfm]}>
                {artifact.content}
              </Markdown>
            </div>
          )}
          {!['svg', 'html', 'doc'].includes(artifact.type) && artifact.content && (
            <div className="feed-render-doc">
              <Markdown className="markdown-body" remarkPlugins={[remarkGfm]}>
                {artifact.content}
              </Markdown>
            </div>
          )}
        </div>
      </article>
    );
  }

  // ── SIDEBAR MODE (default — unchanged) ──
  return (
    <div
      className={`artifact-card ${isSelected ? 'selected' : ''} ${artifact.isPinned ? 'pinned' : ''} ${isLoading ? 'loading' : ''}`}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Pin indicator */}
      {artifact.isPinned && <span className="pin-indicator">📌</span>}

      {/* Loading overlay */}
      {isLoading && <div className="loading-overlay"><span className="spinner" /></div>}

      {/* Header */}
      <div className="artifact-header">
        <span className="artifact-type-icon" style={{ color: phaseColor }}>{typeIcon}</span>
        <span className="artifact-title">{artifact.title}</span>
      </div>

      {/* Meta */}
      <div className="artifact-meta">
        <span className="artifact-skill">{artifact.skill}</span>
        <span className="artifact-time">{formatTime(artifact.createdAt)}</span>
      </div>

      {/* Preview thumbnails */}
      {artifact.type === 'svg' && (() => {
        const cid = `thumb-${artifact.id.replace(/[^a-zA-Z0-9-]/g, '')}`;
        return (
          <div
            id={cid}
            className="artifact-preview svg-thumbnail"
            dangerouslySetInnerHTML={{ __html: prepareSvg(artifact.content, cid) }}
          />
        );
      })()}
      {artifact.type === 'html' && (
        <div className="artifact-preview html-thumbnail">
          <span className="html-badge">HTML</span>
          <span className="html-snippet">
            {artifact.content.replace(/<[^>]*>/g, '').substring(0, 80)}
          </span>
        </div>
      )}
      {artifact.type === 'doc' && (
        <div className="artifact-preview doc-thumbnail">
          <pre className="doc-preview-text">
            {artifact.content.split('\n').slice(0, 3).join('\n').substring(0, 150)}
          </pre>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="artifact-actions" onClick={e => e.stopPropagation()}>
          <button className="action-btn" onClick={onCopy} title="Copy">
            📋
          </button>
          <button className="action-btn" onClick={onPin} title={artifact.isPinned ? 'Unpin' : 'Pin'}>
            {artifact.isPinned ? '📍' : '📌'}
          </button>
          <button className="action-btn" onClick={() => onRegenerate('same')} title="Regenerate">
            🔄
          </button>
          <button className="action-btn delete" onClick={onDelete} title="Delete">
            🗑
          </button>
        </div>
      )}
    </div>
  );
}
