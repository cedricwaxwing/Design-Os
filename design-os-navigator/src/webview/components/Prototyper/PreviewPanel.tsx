import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Artifact } from '../../../types/artifact';
import './PreviewPanel.css';

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

interface PreviewPanelProps {
  artifact: Artifact | undefined;
  onClose: () => void;
}

export function PreviewPanel({ artifact, onClose }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100);

  if (!artifact) {
    return (
      <div className="preview-panel empty">
        <div className="preview-empty-state">
          <span className="preview-empty-icon">◇</span>
          <p>Select an artifact to preview it</p>
        </div>
      </div>
    );
  }

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 50));
  const handleZoomReset = () => setZoom(100);

  return (
    <div className="preview-panel">
      {/* Header */}
      <div className="preview-header">
        <div className="preview-info">
          <span className="preview-title">{artifact.title}</span>
          <span className="preview-phase">{artifact.phase}</span>
        </div>
        <div className="preview-controls">
          <button className="zoom-btn" onClick={handleZoomOut}>−</button>
          <span className="zoom-level" onClick={handleZoomReset}>{zoom}%</span>
          <button className="zoom-btn" onClick={handleZoomIn}>+</button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      {/* Content */}
      <div className="preview-content">
        <div
          className="preview-viewport"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center top' }}
        >
          {artifact.type === 'svg' && (() => {
            const cid = `preview-${artifact.title.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 30)}`;
            return (
              <div
                id={cid}
                className="svg-preview"
                dangerouslySetInnerHTML={{ __html: prepareSvg(artifact.content, cid) }}
              />
            );
          })()}

          {artifact.type === 'html' && (
            <iframe
              className="html-preview-frame"
              srcDoc={artifact.content}
              sandbox="allow-scripts"
              title={artifact.title}
            />
          )}

          {artifact.type === 'doc' && (
            <div className="doc-preview markdown-body">
              <Markdown remarkPlugins={[remarkGfm]}>
                {artifact.content}
              </Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
