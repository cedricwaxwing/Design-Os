import { GraphData } from "./types";

/**
 * Generates the full HTML for the webview panel.
 * V3 — Dynamic detail panel: toggle/close, collapsible sections, recent activity, visual hierarchy.
 */
export function getWebviewContent(data: GraphData): string {
  const dataJson = JSON.stringify(data).replace(/</g, "\\u003c");

  return /*html*/ `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Os</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background, #1e1e2e);
      --surface: var(--vscode-sideBar-background, #181825);
      --border: var(--vscode-panel-border, #313244);
      --text: var(--vscode-editor-foreground, #cdd6f4);
      --text-dim: var(--vscode-descriptionForeground, #a6adc8);
      --accent: var(--vscode-textLink-foreground, #89b4fa);
      --success: #a6e3a1;
      --warning: #f9e2af;
      --error: #f38ba8;
      --info: #89b4fa;
      --node-radius: 12px;
      --transition: 0.2s ease;
      --panel-width: 384px;
      --surface-elevated: #313244;
      --text-muted: #6c7086;
      --accent-hover: #b4befe;
      --mauve: #cba6f7;
      --peach: #fab387;
      --overlay0: #6c7086;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--vscode-font-family, 'Segoe UI', system-ui, sans-serif);
      font-size: 13px;
      background: var(--bg);
      color: var(--text);
      overflow: hidden;
      height: 100vh;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* ── Layout ── */
    .app {
      display: flex;
      height: 100vh;
    }

    .graph-panel {
      flex: 1;
      position: relative;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drag-handle {
      width: 4px;
      cursor: col-resize;
      background: transparent;
      transition: background var(--transition);
      flex-shrink: 0;
    }
    .drag-handle:hover,
    .drag-handle.dragging {
      background: var(--accent);
    }

    .detail-panel {
      width: var(--panel-width);
      min-width: 300px;
      max-width: 600px;
      border-left: 1px solid var(--border);
      background: var(--surface);
      overflow-y: auto;
      transition: width 0.2s ease, min-width 0.2s ease, border 0.2s ease;
      padding: 0;
      flex-shrink: 0;
    }

    .detail-panel.hidden {
      width: 0;
      min-width: 0;
      padding: 0;
      border: none;
      overflow: hidden;
    }

    .detail-panel.hidden + .drag-handle,
    .drag-handle.hidden {
      display: none;
    }

    /* ── Layout helpers ── */
    .main-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ── Header ── */
    .header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface);
    }

    .header h1 {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .header .module-badge {
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
    }

    .header .readiness-global {
      font-size: 12px;
      color: var(--text-dim);
    }

    /* ── Graph ── */
    .graph-container {
      position: relative;
      flex-shrink: 0;
    }

    /* ── SVG Edges ── */
    .edges-svg {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
    }

    @keyframes edgeFlow {
      to { stroke-dashoffset: -20; }
    }

    .edge-line {
      stroke: var(--border);
      stroke-width: 1.5;
      fill: none;
      transition: stroke-width 0.3s ease, stroke 0.3s ease, opacity 0.3s ease;
    }
    .edge-line.animated {
      stroke-dasharray: 4 16;
      animation: edgeFlow 1.5s linear infinite;
    }
    .edge-line.dependency {
      stroke-dasharray: 6 4;
    }
    .edge-line.dependency.animated {
      stroke-dasharray: 6 4 2 4;
      animation: edgeFlow 2s linear infinite;
    }
    .edge-line.nogo {
      stroke: var(--error);
      stroke-dasharray: 4 3;
      opacity: 0.8;
      stroke-width: 2;
    }

    /* ── Nodes ── */
    .node {
      position: absolute;
      width: 160px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--node-radius);
      padding: 16px;
      cursor: pointer;
      z-index: 1;
      transition: border-color var(--transition), box-shadow var(--transition), transform 0.15s ease;
      user-select: none;
    }

    .node:hover {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent), 0 4px 16px rgba(0,0,0,0.3);
      transform: translateY(-1px);
    }

    .node.selected {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent), 0 4px 20px rgba(0,0,0,0.4);
    }

    .node.status-empty { border-left: 3px solid var(--border); }
    .node.status-active { border-left: 3px solid var(--warning); }
    .node.status-ready { border-left: 3px solid var(--success); }
    .node.status-blocked { border-left: 3px solid var(--error); }

    .node.has-action {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 transparent; }
      50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent); }
    }

    .node-label {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .node-icon { font-size: 14px; opacity: 0.7; }

    .node-badge {
      font-size: 9px;
      font-weight: 700;
      background: var(--warning);
      color: #1e1e2e;
      border-radius: 50%;
      width: 16px; height: 16px;
      display: flex; align-items: center; justify-content: center;
      margin-left: auto;
    }

    .node-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .node-files {
      font-size: 11px;
      color: var(--text-dim);
    }

    /* ── Gate Dots + Maturity Tag ── */
    .gate-dots {
      display: flex;
      gap: 3px;
      align-items: center;
    }
    .gate-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--text) 15%, transparent);
      transition: background 0.3s;
    }
    .gate-dot.met { background: var(--success); }
    .gate-ratio {
      font-size: 10px;
      font-weight: 600;
      min-width: 24px;
      text-align: right;
      color: var(--text-dim);
    }
    .maturity-tag {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 1px 5px;
      border-radius: 3px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .maturity-tag.VIDE { background: color-mix(in srgb, var(--text) 8%, transparent); color: var(--text-dim); }
    .maturity-tag.AMORCE { background: color-mix(in srgb, var(--error) 15%, transparent); color: var(--error); }
    .maturity-tag.EN-COURS { background: color-mix(in srgb, var(--warning) 15%, transparent); color: var(--warning); }
    .maturity-tag.COMPLET { background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); }
    .maturity-tag.VALIDE { background: color-mix(in srgb, var(--success) 25%, transparent); color: var(--success); }

    /* ── Detail Panel Header ── */
    .detail-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .detail-header-content {
      flex: 1;
      min-width: 0;
    }

    .detail-header h2 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .detail-header .phase-tag {
      font-size: 10px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .close-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      color: var(--text-dim);
      cursor: pointer;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      transition: background var(--transition), color var(--transition);
    }
    .close-btn:hover {
      background: color-mix(in srgb, var(--text) 12%, transparent);
      color: var(--text);
    }

    /* ── Detail Gate Checklist ── */
    .detail-gates {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }
    .detail-gates-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .detail-gates-header .maturity-tag { font-size: 10px; }
    .detail-gates-bar {
      height: 4px;
      background: color-mix(in srgb, var(--text) 10%, transparent);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .detail-gates-fill {
      height: 100%;
      border-radius: 2px;
      background: var(--success);
      transition: width 0.4s ease;
    }
    .gate-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .gate-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;
      color: var(--text);
    }
    .gate-item .gate-icon {
      font-size: 13px;
      width: 16px;
      text-align: center;
      flex-shrink: 0;
    }
    .gate-item.met .gate-icon { color: var(--success); }
    .gate-item.unmet .gate-icon { color: var(--text-dim); }
    .gate-item.unmet .gate-label { color: var(--text-dim); }
    .gate-item .gate-cmd {
      margin-left: auto;
      font-size: 10px;
      color: var(--accent);
      cursor: pointer;
      opacity: 0.7;
      flex-shrink: 0;
    }
    .gate-item .gate-cmd:hover { opacity: 1; text-decoration: underline; }

    .delta { font-weight: 600; margin-left: 8px; }
    .delta.up { color: var(--success); }
    .delta.down { color: var(--error); }

    /* ── Collapsible Sections ── */
    .collapsible {
      border-bottom: 1px solid var(--border);
    }

    .collapsible-header {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      transition: background var(--transition);
    }
    .collapsible-header:hover {
      background: color-mix(in srgb, var(--text) 4%, transparent);
    }

    .chevron {
      font-size: 10px;
      color: var(--text-dim);
      transition: transform 0.2s ease;
      flex-shrink: 0;
      width: 12px;
      text-align: center;
    }
    .collapsible.open .chevron {
      transform: rotate(90deg);
    }

    .collapsible-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-dim);
      flex: 1;
    }

    .collapsible-count {
      font-size: 10px;
      color: var(--text-dim);
      background: color-mix(in srgb, var(--text) 8%, transparent);
      padding: 2px 8px;
      border-radius: 8px;
      font-weight: 500;
    }

    .collapsible-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.25s ease, padding 0.25s ease;
      padding: 0 16px;
    }
    .collapsible.open .collapsible-body {
      max-height: 2000px;
      padding: 8px 16px 16px;
    }

    /* ── Non-collapsible section (recommended action) ── */
    .detail-section-fixed {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }

    /* ── Recommended Action ── */
    .recommended-action {
      background: color-mix(in srgb, var(--accent) 5%, transparent);
    }

    .recommended-action .action-card {
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      border-radius: 10px;
      padding: 12px;
      cursor: pointer;
      transition: background var(--transition), border-color var(--transition);
    }

    .recommended-action .action-card:hover {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      border-color: var(--accent);
    }

    .action-cmd {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 8px;
    }

    .action-reason {
      font-size: 12px;
      color: var(--text);
      margin-bottom: 4px;
    }

    .action-label {
      font-size: 11px;
      color: var(--text-dim);
    }

    /* ── What's Next Lookahead ── */
    .whats-next {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }

    .whats-next-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-dim);
      margin-bottom: 8px;
    }

    .whats-next-step {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0;
    }

    .whats-next-num {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--text) 10%, transparent);
      color: var(--text-dim);
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .whats-next-info {
      flex: 1;
      min-width: 0;
    }

    .whats-next-label {
      font-size: 12px;
      color: var(--text);
      font-weight: 500;
    }

    .whats-next-pct {
      font-size: 10px;
      font-weight: 600;
      flex-shrink: 0;
      min-width: 30px;
      text-align: right;
    }

    .whats-next-cmd {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 10px;
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      padding: 1px 6px;
      border-radius: 3px;
      cursor: pointer;
      flex-shrink: 0;
      transition: background var(--transition);
    }

    .whats-next-cmd:hover {
      background: color-mix(in srgb, var(--accent) 20%, transparent);
    }

    /* ── Sparklines ── */
    .sparkline-container {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      margin-left: 8px;
    }

    .sparkline svg { display: block; }

    .sparkline-line {
      fill: none;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .sparkline-line.up { stroke: var(--success); }
    .sparkline-line.down { stroke: var(--error); }
    .sparkline-line.flat { stroke: var(--text-dim); }

    .sparkline-area { opacity: 0.1; }
    .sparkline-area.up { fill: var(--success); }
    .sparkline-area.down { fill: var(--error); }
    .sparkline-area.flat { fill: var(--text-dim); }

    .sparkline-dot { r: 2; }
    .sparkline-dot.up { fill: var(--success); }
    .sparkline-dot.down { fill: var(--error); }
    .sparkline-dot.flat { fill: var(--text-dim); }

    /* ── Flow list (UX context) ── */
    .flow-list { display: flex; flex-direction: column; gap: 4px; }

    .flow-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: color-mix(in srgb, var(--text) 4%, transparent);
      border-radius: 6px;
      cursor: pointer;
      transition: background var(--transition);
    }
    .flow-item:hover { background: color-mix(in srgb, var(--text) 10%, transparent); }

    .flow-name { flex: 1; font-size: 12px; font-weight: 500; }

    .flow-badge {
      font-size: 10px;
      color: var(--text-dim);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      padding: 1px 6px;
      border-radius: 3px;
    }

    .flow-open {
      font-size: 14px;
      color: var(--accent);
      cursor: pointer;
      opacity: 0.5;
      transition: opacity var(--transition);
    }
    .flow-item:hover .flow-open { opacity: 1; }

    /* ── Drag-and-drop sections ── */
    .draggable-section { position: relative; transition: opacity 0.2s ease; }
    .draggable-section.dragging { opacity: 0.4; }
    .draggable-section.drag-above { border-top: 2px solid var(--accent); }
    .draggable-section.drag-below { border-bottom: 2px solid var(--accent); }

    .drag-handle-icon {
      cursor: grab;
      opacity: 0;
      font-size: 10px;
      color: var(--text-dim);
      margin-right: 4px;
      transition: opacity var(--transition);
      user-select: none;
    }
    .collapsible-header:hover .drag-handle-icon { opacity: 0.5; }
    .drag-handle-icon:hover { opacity: 1 !important; }

    /* ── Confidence signals ── */
    .confidence-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      font-size: 12px;
    }

    .confidence-name {
      width: 100px;
      flex-shrink: 0;
      color: var(--text);
    }

    .confidence-bar {
      flex: 1;
      height: 4px;
      background: color-mix(in srgb, var(--text) 10%, transparent);
      border-radius: 2px;
      overflow: hidden;
    }

    .confidence-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    .confidence-fill.low { background: var(--error); }
    .confidence-fill.medium { background: var(--warning); }
    .confidence-fill.high { background: var(--success); }

    .confidence-pct {
      font-size: 10px;
      font-weight: 600;
      min-width: 32px;
      text-align: right;
      color: var(--text-dim);
    }

    .confidence-badge {
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 8px;
      font-weight: 600;
      white-space: nowrap;
    }

    .confidence-badge.warn {
      background: color-mix(in srgb, var(--warning) 20%, transparent);
      color: var(--warning);
    }

    .confidence-badge.empty {
      background: color-mix(in srgb, var(--error) 20%, transparent);
      color: var(--error);
    }

    /* ── Sections checklist ── */
    .section-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;
    }

    .section-check { opacity: 0.6; }
    .section-check.filled { color: var(--success); opacity: 1; }
    .section-check.empty { color: var(--error); opacity: 1; }

    .section-name { flex: 1; }

    .section-issue {
      font-size: 10px;
      color: var(--warning);
      font-style: italic;
    }

    /* ── File Preview ── */
    .file-preview {
      border-bottom: 1px solid var(--border);
      padding: 16px;
    }

    .file-preview-body {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      min-height: 120px;
      max-height: 300px;
      overflow-y: auto;
    }

    .file-preview-body.has-content {
      background: #ffffff;
      cursor: pointer;
    }

    .file-preview-body.placeholder {
      background: color-mix(in srgb, var(--text) 6%, var(--surface));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .file-preview-placeholder-text {
      font-size: 12px;
      color: var(--text-dim);
      opacity: 0.6;
    }

    .file-preview-body.has-content:hover::after {
      content: 'Ouvrir dans VS Code';
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.75);
      color: #fff;
      font-size: 11px;
      padding: 4px 12px;
      border-radius: 4px;
      pointer-events: none;
      white-space: nowrap;
      z-index: 10;
    }

    .file-preview-body svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .file-preview-body iframe {
      width: 100%;
      height: 260px;
      border: none;
      display: block;
    }

    .file-preview-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }

    .file-preview-name {
      font-size: 11px;
      color: var(--text-dim);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }

    .file-preview-open {
      font-size: 10px;
      color: var(--accent);
      flex-shrink: 0;
      margin-left: 8px;
    }

    /* ── File items (recent activity) ── */
    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      font-size: 12px;
      color: var(--text);
      cursor: pointer;
      border-radius: 4px;
    }

    .file-item:hover { color: var(--accent); }

    .file-icon { opacity: 0.5; font-size: 12px; flex-shrink: 0; }

    .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }

    .file-time {
      font-size: 10px;
      color: var(--text-dim);
      flex-shrink: 0;
      white-space: nowrap;
    }

    .file-completeness {
      width: 40px;
      height: 3px;
      background: color-mix(in srgb, var(--text) 10%, transparent);
      border-radius: 2px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .file-completeness-fill {
      height: 100%;
      border-radius: 2px;
    }

    .file-badge {
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 8px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .file-badge.hypothesis {
      background: color-mix(in srgb, var(--warning) 20%, transparent);
      color: var(--warning);
    }

    .file-badge.validated {
      background: color-mix(in srgb, var(--success) 20%, transparent);
      color: var(--success);
    }

    .file-badge.draft {
      background: color-mix(in srgb, var(--info) 20%, transparent);
      color: var(--info);
    }

    .file-badge.recent {
      background: color-mix(in srgb, var(--accent) 20%, transparent);
      color: var(--accent);
    }

    .empty-state {
      font-size: 12px;
      color: var(--text-dim);
      font-style: italic;
      padding: 4px 0;
    }

    /* ── History ── */
    .history-row {
      display: flex;
      gap: 8px;
      padding: 4px 0;
      font-size: 11px;
    }

    .history-date {
      color: var(--text-dim);
      min-width: 50px;
      flex-shrink: 0;
    }

    .history-agent {
      font-family: var(--vscode-editor-font-family, monospace);
      color: var(--accent);
      min-width: 80px;
      flex-shrink: 0;
    }

    .history-action {
      color: var(--text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Commands ── */
    .command-btn {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      padding: 16px;
      background: color-mix(in srgb, var(--accent) 6%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
      border-radius: 8px;
      color: var(--text);
      cursor: pointer;
      text-align: left;
      margin-bottom: 8px;
      transition: background var(--transition), border-color var(--transition);
    }
    .command-btn:hover {
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      border-color: var(--accent);
    }
    .command-btn:active { transform: scale(0.98); }

    .command-name {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      align-self: flex-start;
    }

    .command-desc {
      font-size: 13px;
      color: var(--text-dim);
      line-height: 1.5;
      margin-top: 4px;
    }

    /* ── Dependencies ── */
    .dep-group { margin-bottom: 8px; }
    .dep-group:last-child { margin-bottom: 0; }
    .dep-label {
      font-size: 10px;
      color: var(--text-dim);
      margin-bottom: 4px;
    }
    .dep-list { display: flex; flex-wrap: wrap; gap: 4px; }

    .dep-chip {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--text) 10%, transparent);
      color: var(--text-dim);
    }

    /* ── Children ── */
    .child-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 12px;
    }
    .child-name { font-weight: 500; }
    .child-count { font-size: 11px; color: var(--text-dim); }
    .child-count.empty { color: var(--error); }

    /* ── Contextual Sections ── */
    .ctx-section {
      border-bottom: 1px solid var(--border);
      padding: 12px 16px;
    }

    .ctx-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-dim);
      margin-bottom: 8px;
    }

    .ctx-north-star {
      font-size: 13px;
      font-style: italic;
      color: var(--text);
      line-height: 1.5;
      padding: 8px 12px;
      border-left: 2px solid var(--accent);
      background: color-mix(in srgb, var(--accent) 5%, transparent);
      border-radius: 0 4px 4px 0;
    }

    .ctx-list {
      list-style: none;
      padding: 0;
    }

    .ctx-list li {
      font-size: 12px;
      color: var(--text);
      padding: 4px 0;
      line-height: 1.4;
    }

    .ctx-list li::before {
      content: '\\25B8 ';
      color: var(--text-dim);
      margin-right: 4px;
    }

    .ctx-list li.anti::before {
      content: '\\2717 ';
      color: var(--error);
    }

    .ctx-counters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .ctx-counter {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 8px;
      background: color-mix(in srgb, var(--text) 8%, transparent);
      color: var(--text);
    }

    .ctx-counter .count {
      font-weight: 600;
    }

    .ctx-counter.warn {
      background: color-mix(in srgb, var(--error) 12%, transparent);
      color: var(--error);
    }

    .ctx-counter.info {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent);
    }

    .ctx-token-bar {
      height: 8px;
      border-radius: 4px;
      background: color-mix(in srgb, var(--text) 12%, transparent);
      overflow: hidden;
      margin-top: 8px;
    }

    .ctx-token-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .ctx-token-fill.high { background: var(--success); }
    .ctx-token-fill.medium { background: var(--warning); }
    .ctx-token-fill.low { background: var(--error); }

    .ctx-token-label {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-dim);
      margin-top: 4px;
    }

    /* ── Spec Pipeline Grid ── */
    .spec-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .spec-cell {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      border: 1px solid transparent;
    }
    .spec-cell:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .spec-cell-id {
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
    }
    .spec-cell-icon {
      font-size: 12px;
      margin-top: 2px;
      line-height: 1;
    }

    .spec-cell.draft {
      background: color-mix(in srgb, var(--info) 15%, transparent);
      color: var(--info);
      border-color: color-mix(in srgb, var(--info) 30%, transparent);
    }
    .spec-cell.en-cours {
      background: color-mix(in srgb, var(--warning) 15%, transparent);
      color: var(--warning);
      border-color: color-mix(in srgb, var(--warning) 30%, transparent);
    }
    .spec-cell.validee {
      background: color-mix(in srgb, var(--success) 12%, transparent);
      color: var(--success);
      border-color: color-mix(in srgb, var(--success) 25%, transparent);
    }
    .spec-cell.built {
      background: color-mix(in srgb, var(--success) 25%, transparent);
      color: var(--success);
      border-color: var(--success);
    }
    .spec-cell.reviewed {
      background: var(--success);
      color: #1e1e2e;
      border-color: var(--success);
    }
    .spec-cell.stale {
      border-color: var(--warning);
      border-style: dashed;
    }

    .spec-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .spec-legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: var(--text-dim);
    }
    .spec-legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 2px;
    }

    /* ── Estimated readiness indicator ── */
    .readiness-pct.estimated,
    .detail-readiness-label .estimated {
      font-style: italic;
      opacity: 0.8;
    }

    /* ── Profile badge ── */
    .profile-badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 4px;
      background: color-mix(in srgb, var(--text) 8%, transparent);
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ── Filter bar ── */
    .filter-bar {
      display: flex;
      gap: 4px;
      padding: 8px 16px;
      background: var(--surface);
    }
    .launch-console-btn {
      background: var(--accent);
      color: var(--bg);
      border: none;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition);
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .launch-console-btn:hover {
      background: var(--accent-hover);
    }
    .node.filtered-out { opacity: 0.12; pointer-events: none; transition: opacity 0.3s ease; }
    .edge-line.filtered-out { opacity: 0.05 !important; transition: opacity 0.3s ease; }

    /* ── Edge highlight ── */
    .edge-line.highlighted {
      stroke: var(--accent) !important;
      opacity: 1 !important;
      stroke-width: 2.5px !important;
      filter: drop-shadow(0 0 4px rgba(137,180,250,0.3));
    }

    /* ── NO-GO edge label ── */
    .nogo-label {
      font-size: 9px;
      fill: var(--error);
      font-weight: 600;
    }

    /* ── Material badges ── */
    .material-status {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
    .material-badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .material-badge.pending {
      background: color-mix(in srgb, var(--warning) 15%, transparent);
      color: var(--warning);
    }
    .material-badge.ok {
      background: color-mix(in srgb, var(--success) 15%, transparent);
      color: var(--success);
    }

    /* ── Toast notification ── */
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(12px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastOut {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
    .toast {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 12px;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: toastIn 0.3s ease;
    }
    .toast.hiding {
      animation: toastOut 0.3s ease forwards;
    }
    .toast-icon { font-size: 14px; }
    .toast-delta.up { color: var(--success); }
    .toast-delta.down { color: var(--error); }

    /* ── Zoom controls ── */
    .zoom-controls {
      position: absolute;
      bottom: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 2px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 3px;
      z-index: 10;
    }
    .zoom-btn {
      width: 26px;
      height: 26px;
      background: transparent;
      border: none;
      color: var(--text);
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .zoom-btn:hover { background: color-mix(in srgb, var(--text) 8%, transparent); }
    .zoom-level {
      font-size: 10px;
      color: var(--text-dim);
      min-width: 36px;
      text-align: center;
    }

    /* ── Header Tabs ── */
    .header-tabs {
      display: flex;
      gap: 2px;
      background: color-mix(in srgb, var(--text) 6%, transparent);
      border-radius: 6px;
      padding: 2px;
    }
    .header-tab {
      padding: 5px 14px;
      border: none;
      background: transparent;
      color: var(--text-dim);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 4px;
      transition: all var(--transition);
    }
    .header-tab.active {
      background: var(--accent);
      color: var(--bg);
    }
    .header-tab:hover:not(.active) {
      color: var(--text);
    }

    /* ── Tab content ── */
    .tab-content { display: none; flex-direction: column; flex: 1; min-height: 0; }
    .tab-content.active { display: flex; }

    /* ── Prototyper Tab ── */
    .proto-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .proto-header-left { display: flex; align-items: center; gap: 10px; }
    .proto-header-title { font-size: 12px; font-weight: 600; }
    .proto-artifact-count {
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
      padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 500;
    }
    .proto-mode-toggle {
      display: flex; gap: 2px;
      background: color-mix(in srgb, var(--text) 6%, transparent);
      border-radius: 5px; padding: 2px;
    }
    .proto-mode-btn {
      padding: 4px 10px; border: none; background: transparent;
      color: var(--text-dim); font-size: 10px; font-weight: 500;
      cursor: pointer; border-radius: 3px; transition: all var(--transition);
    }
    .proto-mode-btn.active { background: var(--accent); color: var(--bg); }
    .proto-mode-btn:hover:not(.active) { color: var(--text); }

    .proto-main { flex: 1; overflow: hidden; position: relative; }

    .proto-feed {
      height: 100%; overflow-y: auto; padding: 10px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .proto-feed::-webkit-scrollbar { width: 4px; }
    .proto-feed::-webkit-scrollbar-track { background: transparent; }
    .proto-feed::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    .proto-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; text-align: center; padding: 24px;
    }
    .proto-empty-icon { width: 40px; height: 40px; margin-bottom: 12px; color: var(--text-muted); }
    .proto-empty-title { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .proto-empty-desc { font-size: 11px; color: var(--text-dim); line-height: 1.5; }

    .proto-pinned { display: none; margin-bottom: 6px; padding-bottom: 10px; border-bottom: 1px dashed var(--border); }
    .proto-pinned.visible { display: block; }
    .proto-section-label {
      font-size: 9px; font-weight: 600; letter-spacing: 0.06em;
      color: var(--warning); text-transform: uppercase; margin-bottom: 8px;
      display: flex; align-items: center; gap: 5px;
    }

    /* Artifact card */
    .art-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; overflow: hidden; transition: all var(--transition); position: relative;
    }
    .art-card:hover { border-color: var(--accent); }
    .art-card.pinned { border-color: var(--warning); box-shadow: 0 0 0 1px var(--warning); }
    .art-card.recent { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
    .art-card.regenerating { opacity: 0.7; pointer-events: none; }

    .art-header {
      padding: 10px 12px; background: var(--surface-elevated);
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      border-bottom: 1px solid var(--border);
    }
    .art-info { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
    .art-pin { color: var(--warning); font-size: 10px; }
    .art-badge {
      padding: 3px 6px; border-radius: 4px; font-size: 9px;
      font-weight: 600; text-transform: uppercase; flex-shrink: 0;
    }
    .art-badge.doc { background: var(--mauve); color: var(--bg); }
    .art-badge.svg { background: var(--peach); color: var(--bg); }
    .art-badge.html { background: #06b6d4; color: var(--bg); }
    .art-badge.server { background: var(--success); color: var(--bg); }
    .art-badge.skill { background: color-mix(in srgb, var(--mauve) 20%, transparent); color: var(--mauve); font-weight: 500; text-transform: none; }
    .art-title { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .art-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .art-btn {
      padding: 4px 8px; border-radius: 5px; font-size: 10px; font-weight: 500;
      cursor: pointer; border: 1px solid var(--border); background: none;
      color: var(--text-dim); transition: all var(--transition);
      display: flex; align-items: center; gap: 3px;
    }
    .art-btn:hover { border-color: var(--accent); color: var(--text); }
    .art-btn.primary { background: var(--accent); border-color: var(--accent); color: var(--bg); }
    .art-btn.primary:hover { background: var(--accent-hover); }
    .art-btn.danger:hover { border-color: var(--error); color: var(--error); }
    .art-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .art-menu-btn { width: 26px; padding: 4px; justify-content: center; }

    /* Dropdown */
    .art-dropdown { position: relative; }
    .art-dropdown-menu {
      display: none; position: absolute; top: 100%; right: 0; margin-top: 4px;
      background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      padding: 4px; min-width: 150px; z-index: 100;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .art-dropdown.open .art-dropdown-menu { display: block; }
    .art-dd-item {
      padding: 8px 10px; font-size: 11px; cursor: pointer; border-radius: 5px;
      transition: background var(--transition); display: flex; align-items: center; gap: 8px;
      color: var(--text-dim); border: none; background: none; width: 100%; text-align: left;
    }
    .art-dd-item:hover { background: var(--surface-elevated); color: var(--text); }
    .art-dd-item.danger:hover { background: rgba(243,139,168,0.1); color: var(--error); }
    .art-dd-icon { width: 14px; text-align: center; }
    .art-dd-divider { height: 1px; background: var(--border); margin: 4px 0; }

    /* Content preview */
    .art-content { background: var(--bg); position: relative; }
    .art-render-md {
      padding: 12px 14px; font-size: 11px; line-height: 1.6;
      color: var(--text-dim); max-height: 150px; overflow: hidden;
    }
    .art-render-md::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0;
      height: 30px; background: linear-gradient(transparent, var(--bg)); pointer-events: none;
    }
    .art-render-md h1 { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
    .art-render-md h2 { font-size: 12px; font-weight: 600; color: var(--text); margin: 10px 0 6px; }
    .art-render-md p { margin-bottom: 8px; }
    .art-render-md strong { color: var(--text); font-weight: 600; }
    .art-render-svg { padding: 12px; background: #fff; display: flex; justify-content: center; max-height: 120px; overflow: hidden; }
    .art-render-svg svg { max-width: 100%; max-height: 100%; }
    .art-render-html iframe { width: 100%; height: 100px; border: none; background: #fff; }
    .art-render-server { padding: 12px; display: flex; align-items: center; gap: 12px; }
    .art-server-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    .art-server-label { font-size: 11px; font-weight: 500; color: var(--text); }
    .art-server-link {
      padding: 6px 10px; background: var(--surface-elevated); border: 1px solid var(--border);
      border-radius: 5px; font-family: monospace; font-size: 10px; color: var(--accent); text-decoration: none;
    }

    /* Loading overlay */
    .art-loading {
      position: absolute; inset: 0; background: rgba(30,30,46,0.9);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 10;
    }
    .art-spinner { width: 24px; height: 24px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .art-loading-text { font-size: 10px; color: var(--text-muted); }

    /* Compact mode */
    .proto-compact .art-card .art-content { display: none; }
    .proto-compact .art-card { border-radius: 8px; }
    .proto-compact .art-header { border-bottom: none; padding: 8px 10px; }
    .proto-compact .art-actions { opacity: 0; transition: opacity var(--transition); }
    .proto-compact .art-card:hover .art-actions { opacity: 1; }
    .proto-compact .phase-group { display: block; margin-bottom: 12px; }
    .phase-group { display: none; }
    .phase-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
    .phase-icon { width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; }
    .phase-icon.spec { background: var(--mauve); color: var(--bg); }
    .phase-icon.design { background: var(--peach); color: var(--bg); }
    .phase-icon.prototype { background: var(--success); color: var(--bg); }
    .phase-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
    .phase-count { font-size: 9px; color: var(--text-muted); background: var(--surface-elevated); padding: 2px 6px; border-radius: 8px; }

    /* Preview panel */
    .proto-preview {
      display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: var(--bg); flex-direction: column; z-index: 50;
    }
    .proto-preview.active { display: flex; }
    .proto-preview-header {
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 8px 12px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .proto-back-btn {
      padding: 5px 10px; border-radius: 5px; font-size: 11px; font-weight: 500;
      cursor: pointer; border: 1px solid var(--border); background: none; color: var(--text-dim);
      display: flex; align-items: center; gap: 5px; transition: all var(--transition);
    }
    .proto-back-btn:hover { border-color: var(--accent); color: var(--text); }
    .proto-preview-title { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
    .proto-preview-actions { display: flex; gap: 6px; }
    .proto-preview-body { flex: 1; overflow: auto; padding: 12px; position: relative; }
    .proto-preview-body .full-render { width: 100%; height: 100%; }
    .proto-preview-body .full-render.art-render-md { max-height: none; padding: 16px; background: var(--surface); border-radius: 8px; font-size: 13px; overflow-y: auto; }
    .proto-preview-body .full-render.art-render-md::after { display: none; }
    .proto-preview-body .full-render.art-render-svg { max-height: none; padding: 16px; overflow: auto; border-radius: 8px; transform-origin: top center; }
    .proto-preview-body .full-render.art-render-html iframe { height: 100%; border-radius: 8px; }

    .proto-zoom {
      position: absolute; bottom: 12px; right: 12px; display: none; gap: 4px;
      background: var(--surface); padding: 5px; border-radius: 6px;
      border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .proto-zoom.visible { display: flex; }
    .proto-zoom-btn {
      width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--border);
      background: var(--bg); color: var(--text); font-size: 12px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all var(--transition);
    }
    .proto-zoom-btn:hover { border-color: var(--accent); color: var(--accent); }
    .proto-zoom-level { padding: 0 8px; font-size: 10px; color: var(--text-dim); display: flex; align-items: center; min-width: 40px; justify-content: center; }

    /* Proto toast */
    .proto-toast-container {
      position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
      z-index: 300; display: flex; flex-direction: column; gap: 6px; pointer-events: none;
    }
    .proto-toast {
      background: var(--surface); border: 1px solid var(--border); padding: 8px 14px;
      border-radius: 8px; font-size: 11px; color: var(--text);
      display: flex; align-items: center; gap: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      animation: protoToastIn 0.2s ease, protoToastOut 0.2s ease 2.5s forwards;
      pointer-events: auto;
    }
    .proto-toast.success { border-color: var(--success); }
    .proto-toast.success .proto-toast-icon { color: var(--success); }
    .proto-toast.error { border-color: var(--error); }
    .proto-toast.error .proto-toast-icon { color: var(--error); }
    .proto-toast.warning { border-color: var(--warning); }
    .proto-toast.warning .proto-toast-icon { color: var(--warning); }
    @keyframes protoToastIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
    @keyframes protoToastOut { from { opacity:1; transform: translateY(0); } to { opacity:0; transform: translateY(-8px); } }

    /* Proto modal */
    .proto-modal-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.6); z-index: 200;
      opacity: 0; visibility: hidden; transition: all 0.2s;
    }
    .proto-modal-backdrop.open { opacity: 1; visibility: visible; }
    .proto-modal {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%) scale(0.95);
      background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
      padding: 20px; width: 280px; max-width: 90%; z-index: 201;
      opacity: 0; visibility: hidden; transition: all 0.2s;
    }
    .proto-modal.open { opacity: 1; visibility: visible; transform: translate(-50%,-50%) scale(1); }
    .proto-modal-icon {
      width: 36px; height: 36px; background: rgba(243,139,168,0.15);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 12px;
    }
    .proto-modal-icon.prompt { background: rgba(137,180,250,0.15); }
    .proto-modal-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
    .proto-modal-message { font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px; }
    .proto-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .proto-modal-btn {
      padding: 8px 14px; border-radius: 6px; font-size: 11px; font-weight: 500;
      border: 1px solid var(--border); background: none; color: var(--text-dim);
      cursor: pointer; transition: all var(--transition);
    }
    .proto-modal-btn:hover { border-color: var(--accent); color: var(--text); }
    .proto-modal-btn.danger { background: var(--error); border-color: var(--error); color: var(--bg); }
    .proto-modal-btn.primary { background: var(--accent); border-color: var(--accent); color: var(--bg); }
    .proto-prompt-textarea {
      width: 100%; min-height: 80px; padding: 10px; background: var(--bg);
      border: 1px solid var(--border); border-radius: 6px; color: var(--text);
      font-family: inherit; font-size: 11px; line-height: 1.5;
      resize: vertical; outline: none; margin-bottom: 16px;
    }
    .proto-prompt-textarea:focus { border-color: var(--accent); }
    .proto-prompt-textarea::placeholder { color: var(--text-muted); }

    /* ── Responsive ── */
    @media (max-width: 700px) {
      .app { flex-direction: column; }
      .detail-panel { width: 100% !important; height: 50vh; border-left: none; border-top: 1px solid var(--border); }
      .drag-handle { display: none; }
    }
  </style>
</head>
<body>
  <div class="app">
    <div class="main-content">
      <div class="header">
        <div class="header-left">
          <h1>Design Os</h1>
          <div class="header-tabs">
            <button class="header-tab active" data-tab="navigator">Navigator</button>
            <button class="header-tab" data-tab="prototyper">Prototyper</button>
          </div>
        </div>
        <div class="header-right-badges">
          <span class="module-badge" id="module-badge" style="display:none;"></span>
          <span class="profile-badge" id="profile-badge" style="display:none;"></span>
        </div>
        <button class="launch-console-btn" id="launchConsoleBtn">&#9654; Lancer Console</button>
      </div>
      <div class="context-bar" id="global-readiness" style="padding:4px 16px;font-size:10px;color:var(--text-dim);border-bottom:1px solid var(--border);"></div>

      <!-- Navigator Tab -->
      <div class="tab-content active" id="navigatorTab">
        <div class="graph-panel" id="graph-panel">
          <div class="graph-container" id="graph-container">
            <svg class="edges-svg" id="edges-svg"></svg>
          </div>
          <div class="zoom-controls" id="zoom-controls">
            <button class="zoom-btn" id="zoom-out" title="Zoom out">&#8722;</button>
            <span class="zoom-level" id="zoom-level">100%</span>
            <button class="zoom-btn" id="zoom-in" title="Zoom in">&#43;</button>
            <button class="zoom-btn" id="zoom-fit" title="Fit to view">&#8862;</button>
          </div>
        </div>
      </div>

      <!-- Prototyper Tab -->
      <div class="tab-content" id="prototyperTab">
        <div class="proto-header">
          <div class="proto-header-left">
            <span class="proto-header-title">Artefacts</span>
            <span class="proto-artifact-count" id="protoCount">0</span>
          </div>
          <div class="proto-mode-toggle">
            <button class="proto-mode-btn active" data-pmode="standard">Standard</button>
            <button class="proto-mode-btn" data-pmode="compact">Compact</button>
          </div>
        </div>
        <div class="proto-main">
          <div class="proto-feed" id="protoFeed">
            <div class="proto-pinned" id="protoPinned">
              <div class="proto-section-label">&#128204; Epingles</div>
              <div id="protoPinnedList"></div>
            </div>
            <div class="proto-empty" id="protoEmpty">
              <svg class="proto-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/><path d="M9 21V9"/>
              </svg>
              <div class="proto-empty-title">No artifacts yet</div>
              <div class="proto-empty-desc">Use the Console to generate<br>specs, wireframes or prototypes.</div>
            </div>
            <div id="protoList"></div>
          </div>

          <!-- Preview panel -->
          <div class="proto-preview" id="protoPreview">
              <div class="proto-preview-header">
              <button class="proto-back-btn" id="protoBackBtn">&#8592; Back</button>
              <span class="art-badge" id="protoPreviewBadge">DOC</span>
              <span class="proto-preview-title" id="protoPreviewTitle">Titre</span>
              <div class="proto-preview-actions">
                <button class="art-btn" id="protoPreviewCopyBtn">Copy</button>
                <button class="art-btn" id="protoPreviewExportBtn">Export</button>
              </div>
            </div>
            <div class="proto-preview-body" id="protoPreviewBody"></div>
            <div class="proto-zoom" id="protoZoom">
              <button class="proto-zoom-btn" id="protoZoomOut">&#8722;</button>
              <span class="proto-zoom-level" id="protoZoomLevel">100%</span>
              <button class="proto-zoom-btn" id="protoZoomIn">&#43;</button>
              <button class="proto-zoom-btn" id="protoZoomReset" title="Reset">&#8635;</button>
            </div>
          </div>

          <!-- Toast -->
          <div class="proto-toast-container" id="protoToastContainer"></div>

          <!-- Delete Modal -->
          <div class="proto-modal-backdrop" id="protoDeleteBackdrop"></div>
          <div class="proto-modal" id="protoDeleteModal">
            <div class="proto-modal-icon">&#128465;</div>
            <div class="proto-modal-title">Delete this artifact?</div>
            <div class="proto-modal-message">This action is irreversible. The artifact "<span id="protoDeleteName"></span>" will be permanently deleted.</div>
            <div class="proto-modal-actions">
              <button class="proto-modal-btn" id="protoDeleteCancel">Cancel</button>
              <button class="proto-modal-btn danger" id="protoDeleteConfirm">Delete</button>
            </div>
          </div>

          <!-- Prompt Modal -->
          <div class="proto-modal-backdrop" id="protoPromptBackdrop"></div>
          <div class="proto-modal" id="protoPromptModal">
            <div class="proto-modal-icon prompt">&#128260;</div>
            <div class="proto-modal-title">Regenerate with instructions</div>
            <div class="proto-modal-message">Describe the changes you want.</div>
            <textarea class="proto-prompt-textarea" id="protoPromptTextarea" placeholder="Ex: Make it more compact, add an FAQ section..."></textarea>
            <div class="proto-modal-actions">
              <button class="proto-modal-btn" id="protoPromptCancel">Cancel</button>
              <button class="proto-modal-btn primary" id="protoPromptConfirm">Regenerate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="drag-handle hidden" id="drag-handle"></div>
    <div class="detail-panel hidden" id="detail-panel"></div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const data = ${dataJson};
    try { // DEBUG WRAPPER

    // ── Node positions ──
    const positions = {
      'material':       { x: 230, y: 50 },
      'strategy':       { x: 230, y: 200 },
      'discovery':      { x: 230, y: 350 },
      'ux':             { x: 230, y: 500 },
      'design-system':  { x: 20,  y: 650 },
      'spec':           { x: 160, y: 800 },
      'ui':             { x: 350, y: 800 },
      'build':          { x: 230, y: 950 },
      'review':         { x: 230, y: 1100 },
      'lab':            { x: 440, y: 650 },
    };

    const nodeIcons = {
      'material': '\\u25A3', 'strategy': '\\u25C6', 'discovery': '\\u25CE', 'ux': '\\u25C7',
      'design-system': '\\u25A0', 'spec': '\\u25B6', 'ui': '\\u25CF',
      'build': '\\u2699', 'review': '\\u2713', 'lab': '\\u26A1',
    };

    let selectedNodeId = null;

    // ── Drag resize ──
    const dragHandle = document.getElementById('drag-handle');
    const detailPanel = document.getElementById('detail-panel');
    let isDragging = false;

    dragHandle.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragHandle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const newWidth = document.body.clientWidth - e.clientX;
      const clamped = Math.min(600, Math.max(300, newWidth));
      detailPanel.style.width = clamped + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        dragHandle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });

    // ── Close panel ──
    function closePanel() {
      selectedNodeId = null;
      document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
      document.querySelectorAll('.edge-line.highlighted').forEach(function(e) { e.classList.remove('highlighted'); });
      detailPanel.classList.add('hidden');
      document.getElementById('drag-handle').classList.add('hidden');
    }

    // Escape key closes panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && selectedNodeId) {
        closePanel();
      }
    });

    // ── Helpers ──
    function cls(pct) {
      if (pct >= 70) return 'high';
      if (pct >= 30) return 'medium';
      return 'low';
    }

    function maturityCls(tag) {
      return (tag || 'VIDE').replace(/\\s+/g, '-');
    }

    function maturityLabel(tag) {
      switch (tag) {
        case 'VIDE': return 'Empty';
        case 'AMORCE': return 'Started';
        case 'EN COURS': return 'In progress';
        case 'COMPLET': return 'Complete';
        case 'VALIDE': return 'Validated';
        default: return tag || 'Empty';
      }
    }

    function gateDots(gates) {
      if (!gates || gates.length === 0) return '';
      var html = '<span class="gate-dots">';
      for (var i = 0; i < gates.length; i++) {
        html += '<span class="gate-dot' + (gates[i].met ? ' met' : '') + '"></span>';
      }
      html += '</span>';
      return html;
    }

    function gateRatio(gates) {
      if (!gates || gates.length === 0) return '0/0';
      return gates.filter(function(g) { return g.met; }).length + '/' + gates.length;
    }

    function formatDate(dateStr) {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length < 3) return dateStr;
      const months = ['jan','fev','mar','avr','mai','juin','jul','aou','sep','oct','nov','dec'];
      return parseInt(parts[2]) + ' ' + (months[parseInt(parts[1])-1] || parts[1]);
    }

    function timeAgo(timestamp) {
      if (!timestamp) return '';
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'maintenant';
      if (minutes < 60) return 'il y a ' + minutes + 'min';
      if (hours < 24) return 'il y a ' + hours + 'h';
      if (days < 7) return 'il y a ' + days + 'j';

      const d = new Date(timestamp);
      const months = ['jan','fev','mar','avr','mai','juin','jul','aou','sep','oct','nov','dec'];
      return d.getDate() + ' ' + months[d.getMonth()];
    }

    function isRecent(timestamp) {
      if (!timestamp) return false;
      return (Date.now() - timestamp) < 86400000; // 24h
    }

    function miniBar(pct, cssClass) {
      return '<div class="confidence-bar"><div class="confidence-fill ' + cssClass + '" style="width:' + pct + '%"></div></div>';
    }

    // ── File Preview helpers ──
    let currentPreviewPath = null;

    function sanitizeSvg(raw) {
      let s = raw.replace(/<script[\\s\\S]*?<\\/script>/gi, '');
      s = s.replace(/\\s+on\\w+\\s*=\\s*["'][^"']*["']/gi, '');
      s = s.replace(/<foreignObject[\\s\\S]*?<\\/foreignObject>/gi, '');
      s = s.replace(/href\\s*=\\s*["']javascript:[^"']*["']/gi, '');
      return s;
    }

    function escapeAttr(str) {
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function requestPreview(filePath) {
      const ext = filePath.split('.').pop().toLowerCase();
      if (ext === 'svg' || ext === 'html' || ext === 'htm') {
        vscode.postMessage({ type: 'previewFile', path: filePath });
      } else {
        vscode.postMessage({ type: 'openFile', path: filePath });
      }
    }

    function renderPreviewContent(msg) {
      const container = document.getElementById('preview-content');
      const footer = document.getElementById('preview-footer');
      const nameEl = document.getElementById('preview-name');
      if (!container) return;

      if (!msg || !msg.previewable) {
        // Reset to placeholder
        container.className = 'file-preview-body placeholder';
        container.innerHTML = '<span class="file-preview-placeholder-text">No preview</span>';
        container.onclick = null;
        if (footer) footer.style.display = 'none';
        currentPreviewPath = null;
        return;
      }

      currentPreviewPath = msg.path;
      container.className = 'file-preview-body has-content';

      if (msg.fileType === 'svg') {
        container.innerHTML = sanitizeSvg(msg.content);
      } else {
        container.innerHTML = '<iframe sandbox="allow-same-origin" srcdoc="' + escapeAttr(msg.content) + '"></iframe>';
      }

      container.onclick = function() {
        vscode.postMessage({ type: 'openFile', path: msg.path });
      };

      if (footer) {
        footer.style.display = 'flex';
        footer.style.cursor = 'pointer';
        footer.onclick = function() {
          vscode.postMessage({ type: 'openFile', path: msg.path });
        };
      }
      if (nameEl) nameEl.textContent = msg.fileName;
    }

    function triggerAutoPreview(node) {
      if (!node.files || node.files.length === 0) return;
      const sorted = node.files.slice().sort(function(a, b) { return (b.modifiedAt || 0) - (a.modifiedAt || 0); });
      for (var i = 0; i < sorted.length; i++) {
        var ext = sorted[i].name.split('.').pop().toLowerCase();
        if (ext === 'svg' || ext === 'html' || ext === 'htm') {
          vscode.postMessage({ type: 'previewFile', path: sorted[i].path });
          return;
        }
      }
    }

    // ── What's Next? Lookahead ──
    function renderWhatsNext(node) {
      var pipeline = ['strategy', 'discovery', 'ux', 'spec', 'build', 'review'];
      var cmdMap = {
        strategy: '/onboarding', discovery: '/discovery', ux: '/ux',
        spec: '/spec', build: '/build', review: '/review',
      };
      var currentIdx = pipeline.indexOf(node.id);
      if (currentIdx === -1) return '';

      var upcoming = [];
      for (var i = currentIdx + 1; i < pipeline.length && upcoming.length < 3; i++) {
        var stepId = pipeline[i];
        var stepNode = data.nodes.find(function(n) { return n.id === stepId; });
        if (!stepNode) continue;
        if (stepNode.readiness >= 100) continue;
        upcoming.push({ id: stepId, label: stepNode.label, readiness: stepNode.readiness, command: cmdMap[stepId] || '' });
      }

      if (upcoming.length === 0) return '';

      var html = '';
      for (var j = 0; j < upcoming.length; j++) {
        var step = upcoming[j];
        var c = cls(step.readiness);
        html += '<div class="whats-next-step">' +
          '<span class="whats-next-num">' + (j + 1) + '</span>' +
          '<div class="whats-next-info"><span class="whats-next-label">' + step.label + '</span></div>' +
          '<span class="whats-next-pct ' + c + '">' + step.readiness + '%</span>' +
          '<span class="whats-next-cmd" data-command="' + step.command + '">' + step.command + '</span>' +
        '</div>';
      }
      return html;
    }

    // ── Sparkline renderer ──
    function sparkline(values, width, height) {
      if (!values || values.length < 2) return '';
      var w = width || 60;
      var h = height || 20;
      var pad = 2;

      var first = values[0];
      var last = values[values.length - 1];
      var trend = last > first ? 'up' : (last < first ? 'down' : 'flat');

      var stepX = (w - 2) / (values.length - 1);
      var points = [];
      for (var i = 0; i < values.length; i++) {
        var x = 1 + i * stepX;
        var y = pad + (h - 2 * pad) * (1 - values[i] / 100);
        points.push(x.toFixed(1) + ',' + y.toFixed(1));
      }
      var polyStr = points.join(' ');

      var areaPoints = points.slice();
      areaPoints.push((1 + (values.length - 1) * stepX).toFixed(1) + ',' + h);
      areaPoints.push('1,' + h);
      var areaStr = areaPoints.join(' ');

      var lastX = 1 + (values.length - 1) * stepX;
      var lastY = pad + (h - 2 * pad) * (1 - last / 100);

      return '<span class="sparkline-container"><svg class="sparkline" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
        '<polygon class="sparkline-area ' + trend + '" points="' + areaStr + '" />' +
        '<polyline class="sparkline-line ' + trend + '" points="' + polyStr + '" />' +
        '<circle class="sparkline-dot ' + trend + '" cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="2" />' +
      '</svg></span>';
    }

    function getSparklineValues(nodeId) {
      var history = data.readinessHistory;
      if (!history || history.length < 2) return [];
      var values = [];
      for (var i = 0; i < history.length; i++) {
        if (nodeId === 'global') {
          values.push(history[i].globalScore || 0);
        } else {
          values.push((history[i].scores && history[i].scores[nodeId]) || 0);
        }
      }
      return values;
    }

    // ── Contextual section renderer ──
    function renderContextSection(node) {
      var ctx = node.contextData;
      if (!ctx) return '';
      var html = '';

      // ── Strategy: North Star + Principles + Anti-Goals (collapsible) ──
      if (node.id === 'strategy') {
        if (ctx.northStar) {
          html += collapsible('north-star', 'North Star', null,
            '<div class="ctx-north-star">' + ctx.northStar + '</div>', false);
        }
        var principles = ctx.principles || [];
        if (principles.length > 0) {
          var pHtml = '<ul class="ctx-list">';
          for (var i = 0; i < principles.length; i++) {
            pHtml += '<li>' + principles[i] + '</li>';
          }
          pHtml += '</ul>';
          html += collapsible('principles', 'Principes directeurs', principles.length, pHtml, false);
        }
        var antiGoals = ctx.antiGoals || [];
        if (antiGoals.length > 0) {
          var agHtml = '<ul class="ctx-list">';
          for (var j = 0; j < antiGoals.length; j++) {
            agHtml += '<li class="anti">' + antiGoals[j] + '</li>';
          }
          agHtml += '</ul>';
          html += collapsible('anti-goals', 'Anti-Goals', antiGoals.length, agHtml, false);
        }
      }

      // ── Discovery: Counters (collapsible) ──
      if (node.id === 'discovery') {
        var sig = node.signals || {};
        var hasAny = (ctx.patternCount || 0) + (ctx.jtbdCount || 0) + (ctx.opportunityCount || 0)
          + (sig.hypothesisCount || 0) + (sig.contradictionCount || 0);
        if (hasAny > 0) {
          var countersHtml = '<div class="ctx-counters">';
          if (sig.hypothesisCount > 0) {
            countersHtml += '<span class="ctx-counter info"><span class="count">' + sig.hypothesisCount + '</span> hypothese' + (sig.hypothesisCount > 1 ? 's' : '') + '</span>';
          }
          if (sig.contradictionCount > 0) {
            countersHtml += '<span class="ctx-counter warn"><span class="count">' + sig.contradictionCount + '</span> contradiction' + (sig.contradictionCount > 1 ? 's' : '') + '</span>';
          }
          if (ctx.patternCount > 0) {
            countersHtml += '<span class="ctx-counter"><span class="count">' + ctx.patternCount + '</span> pattern' + (ctx.patternCount > 1 ? 's' : '') + '</span>';
          }
          if (ctx.jtbdCount > 0) {
            countersHtml += '<span class="ctx-counter"><span class="count">' + ctx.jtbdCount + '</span> JTBD</span>';
          }
          if (ctx.opportunityCount > 0) {
            countersHtml += '<span class="ctx-counter info"><span class="count">' + ctx.opportunityCount + '</span> opportunite' + (ctx.opportunityCount > 1 ? 's' : '') + '</span>';
          }
          countersHtml += '</div>';
          html += collapsible('discovery-signals', 'Signaux discovery', null, countersHtml, false);
        }
      }

      // ── Design System: Token fill rate + component count ──
      if (node.id === 'design-system') {
        var total = ctx.tokensTotal || 0;
        var defined = ctx.tokensDefined || 0;
        var pct = ctx.tokenFillPct || 0;
        var barCls = pct >= 70 ? 'high' : (pct >= 30 ? 'medium' : 'low');

        html += '<div class="ctx-section">' +
          '<div class="ctx-label">Tokens</div>' +
          '<div class="ctx-token-bar"><div class="ctx-token-fill ' + barCls + '" style="width:' + pct + '%"></div></div>' +
          '<div class="ctx-token-label"><span>' + defined + '/' + total + ' definis</span><span>' + pct + '%</span></div>' +
        '</div>';

        if (ctx.componentCount > 0) {
          html += '<div class="ctx-section">' +
            '<div class="ctx-label">Composants</div>' +
            '<div class="ctx-counters">' +
              '<span class="ctx-counter"><span class="count">' + ctx.componentCount + '</span> composant' + (ctx.componentCount > 1 ? 's' : '') + '</span>' +
              '<span class="ctx-counter"><span class="count">' + ctx.fileCount + '</span> fichier' + (ctx.fileCount > 1 ? 's' : '') + '</span>' +
            '</div>' +
          '</div>';
        }
      }

      // ── Spec: pipeline grid ──
      if (node.id === 'spec') {
        var pipeline = ctx.pipeline || [];
        var screenCount = ctx.screenCount || 0;
        var staleCount = ctx.staleCount || 0;

        if (pipeline.length > 0) {
          var stageIcons = { DRAFT: '\\u25CB', 'EN COURS': '\\u29BF', VALIDEE: '\\u25B8', BUILT: '\\u2699', REVIEWED: '\\u2713' };
          var stageLabels = { DRAFT: 'Draft', 'EN COURS': 'In progress', VALIDEE: 'Validated', BUILT: 'Code', REVIEWED: 'Review' };

          html += '<div class="ctx-section">' +
            '<div class="ctx-label">Pipeline specs</div>' +
            '<div class="ctx-counters">' +
              '<span class="ctx-counter"><span class="count">' + pipeline.length + '</span> spec' + (pipeline.length > 1 ? 's' : '') + '</span>' +
              '<span class="ctx-counter"><span class="count">' + screenCount + '</span> screen' + (screenCount > 1 ? 's' : '') + '</span>';
          if (staleCount > 0) {
            html += '<span class="ctx-counter warn"><span class="count">' + staleCount + '</span> stale</span>';
          }
          html += '</div>' +
            '<div class="spec-grid">';

          for (var p = 0; p < pipeline.length; p++) {
            var item = pipeline[p];
            var cellCls = 'spec-cell';
            if (item.status === 'DRAFT') cellCls += ' draft';
            else if (item.status === 'EN COURS') cellCls += ' en-cours';
            else if (item.status === 'VALIDEE') cellCls += ' validee';
            else if (item.status === 'BUILT') cellCls += ' built';
            else if (item.status === 'REVIEWED') cellCls += ' reviewed';
            if (item.isStale) cellCls += ' stale';

            var icon = stageIcons[item.status] || '\\u25CB';
            var tooltip = item.label + ' — ' + (stageLabels[item.status] || item.status);
            if (item.isStale) tooltip += ' (stale)';

            html += '<div class="' + cellCls + '" title="' + tooltip + '" data-spec-path="' + (item.path || '').replace(/"/g, '&quot;') + '">' +
              '<span class="spec-cell-id">' + item.id + '</span>' +
              '<span class="spec-cell-icon">' + icon + '</span>' +
            '</div>';
          }

          html += '</div>' +
            '<div class="spec-legend">' +
              '<span class="spec-legend-item"><span class="spec-legend-dot" style="background:var(--info)"></span>Draft</span>' +
              '<span class="spec-legend-item"><span class="spec-legend-dot" style="background:var(--warning)"></span>En cours</span>' +
              '<span class="spec-legend-item"><span class="spec-legend-dot" style="background:color-mix(in srgb,var(--success) 50%,transparent)"></span>Validee</span>' +
              '<span class="spec-legend-item"><span class="spec-legend-dot" style="background:var(--success)"></span>Code</span>' +
              '<span class="spec-legend-item"><span class="spec-legend-dot" style="background:var(--success);opacity:1"></span>Review</span>' +
            '</div>' +
          '</div>';
        }
      }

      // ── UX: journeys + flows ──
      if (node.id === 'ux') {
        var jCount = ctx.journeyCount || 0;
        var fCount = ctx.flowCount || 0;
        var flows = ctx.flows || [];

        if (jCount > 0 || fCount > 0) {
          html += '<div class="ctx-section"><div class="ctx-label">User journeys</div><div class="ctx-counters">';
          html += '<span class="ctx-counter"><span class="count">' + jCount + '</span> journey' + (jCount > 1 ? 's' : '') + ' SVG</span>';
          html += '<span class="ctx-counter"><span class="count">' + fCount + '</span> flow' + (fCount > 1 ? 's' : '') + '</span>';
          html += '</div></div>';
        }

        if (flows.length > 0) {
          html += '<div class="ctx-section"><div class="ctx-label">Detected flows</div>';
          html += '<div class="flow-list">';
          for (var fi = 0; fi < flows.length; fi++) {
            var flow = flows[fi];
            html += '<div class="flow-item" data-flow-path="' + flow.path + '">' +
              '<span class="flow-name">' + flow.name + '</span>' +
              '<span class="flow-badge">' + flow.nodeCount + ' screens</span>' +
              '<span class="flow-open" title="Open interactive flow">\\u2197</span>' +
            '</div>';
          }
          html += '</div></div>';
        }
      }

      // ── Material: new/unprocessed files ──
      if (node.id === 'material') {
        var totalMat = ctx.totalFiles || 0;
        var newMat = ctx.newFiles || [];
        var newMatCount = ctx.newCount || 0;

        if (totalMat > 0) {
          html += '<div class="ctx-section"><div class="ctx-label">Fichiers source</div><div class="ctx-counters">';
          html += '<span class="ctx-counter"><span class="count">' + totalMat + '</span> fichier' + (totalMat > 1 ? 's' : '') + '</span>';
          if (newMatCount > 0) {
            html += '<span class="ctx-counter warn"><span class="count">' + newMatCount + '</span> non traite' + (newMatCount > 1 ? 's' : '') + '</span>';
          } else {
            html += '<span class="ctx-counter" style="background:color-mix(in srgb,var(--success) 12%,transparent);color:var(--success)">Tous traites</span>';
          }
          html += '</div></div>';

          if (newMatCount > 0 && newMat.length <= 5) {
            html += '<div class="ctx-section"><div class="ctx-label" style="color:var(--warning)">Non traites</div><ul class="ctx-list">';
            for (var m = 0; m < newMat.length; m++) {
              html += '<li class="anti">' + newMat[m] + '</li>';
            }
            html += '</ul></div>';
          }
        }
      }

      return html;
    }

    // ── Collapsible section builder ──
    function collapsible(id, title, count, content, openByDefault) {
      if (!content) return '';
      var isOpen = openByDefault;
      try {
        var saved = JSON.parse(localStorage.getItem('designOs.openSections') || '{}');
        if (saved.hasOwnProperty(id)) isOpen = saved[id];
      } catch(e) {}
      const openCls = isOpen ? ' open' : '';
      const countHtml = count !== null && count !== undefined
        ? '<span class="collapsible-count">' + count + '</span>'
        : '';
      return '<div class="draggable-section" data-section-id="' + id + '" draggable="true">' +
        '<div class="collapsible' + openCls + '" data-section="' + id + '">' +
        '<div class="collapsible-header">' +
          '<span class="drag-handle-icon" title="Deplacer">\\u2807</span>' +
          '<span class="chevron">\\u25B8</span>' +
          '<span class="collapsible-title">' + title + '</span>' +
          countHtml +
        '</div>' +
        '<div class="collapsible-body">' + content + '</div>' +
      '</div></div>';
    }

    // ── Render graph ──
    function renderGraph() {
      const container = document.getElementById('graph-container');
      const svg = document.getElementById('edges-svg');

      const badge = document.getElementById('module-badge');
      const moduleName = data.context.moduleLabel || data.context.module;
      if (moduleName) {
        badge.textContent = moduleName;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }

      // Profile badge
      var profileBadge = document.getElementById('profile-badge');
      if (data.context.profile) {
        profileBadge.textContent = data.context.profile;
        profileBadge.style.display = '';
      } else {
        profileBadge.style.display = 'none';
      }

      // Compute global gate counts
      var totalGatesCount = 0, metGatesCount = 0;
      for (var ni = 0; ni < data.nodes.length; ni++) {
        var ng = data.nodes[ni].gates || [];
        totalGatesCount += ng.length;
        for (var gi2 = 0; gi2 < ng.length; gi2++) { if (ng[gi2].met) metGatesCount++; }
      }
      document.getElementById('global-readiness').innerHTML =
        'Maturite : ' + metGatesCount + '/' + totalGatesCount + ' conditions';

      container.querySelectorAll('.node').forEach(n => n.remove());

      // ── Calculate bounding box and size the container ──
      const nodeWidth = 160;
      const nodeHeight = 60;
      let maxX = 0, maxY = 0;
      for (const node of data.nodes) {
        const pos = positions[node.id];
        if (pos) {
          maxX = Math.max(maxX, pos.x + nodeWidth);
          maxY = Math.max(maxY, pos.y + nodeHeight);
        }
      }
      container.style.width = (maxX + 32) + 'px';
      container.style.height = (maxY + 32) + 'px';

      // Draw edges
      let edgesHtml = '';
      for (const edge of data.edges) {
        const from = positions[edge.from];
        const to = positions[edge.to];
        if (!from || !to) continue;

        const x1 = from.x + 80, y1 = from.y + 50;
        const x2 = to.x + 80, y2 = to.y;
        const midY = (y1 + y2) / 2;

        const sourceNode = data.nodes.find(n => n.id === edge.from);
        const readiness = sourceNode ? sourceNode.readiness : 0;

        // Dynamic color, opacity and width based on source readiness
        let edgeColor, edgeOpacity;
        if (edge.type === 'nogo') {
          edgeColor = 'var(--error)';
          edgeOpacity = 0.8;
        } else if (readiness === 0) {
          edgeColor = 'rgba(255,255,255,0.35)';
          edgeOpacity = 1;
        } else if (readiness < 30) {
          edgeColor = 'var(--error)';
          edgeOpacity = 0.4 + readiness / 100 * 0.4;
        } else if (readiness < 70) {
          edgeColor = 'var(--warning)';
          edgeOpacity = 0.5 + readiness / 100 * 0.4;
        } else {
          edgeColor = 'var(--success)';
          edgeOpacity = 0.6 + readiness / 100 * 0.3;
        }
        const strokeWidth = edge.type === 'nogo' ? 2 : (0.75 + readiness / 100 * 1.75);

        let edgeCls = 'edge-line';
        if (edge.type === 'dependency') edgeCls += ' dependency';
        if (edge.type === 'nogo') edgeCls += ' nogo';
        if (readiness > 0 && edge.type !== 'nogo') edgeCls += ' animated';

        edgesHtml += '<path class="' + edgeCls + '" data-from="' + edge.from + '" data-to="' + edge.to +
          '" style="stroke:' + edgeColor +
          ';stroke-width:' + strokeWidth + ';opacity:' + edgeOpacity + '" d="M' + x1 + ',' + y1 +
          ' C' + x1 + ',' + midY + ' ' + x2 + ',' + midY + ' ' + x2 + ',' + y2 + '" />';

        // NO-GO edge label
        if (edge.type === 'nogo' && edge.nogoGapType) {
          var labelX = (x1 + x2) / 2;
          var labelY = midY - 6;
          edgesHtml += '<text class="nogo-label" x="' + labelX + '" y="' + labelY +
            '" text-anchor="middle">' + edge.nogoGapType +
            (edge.nogoGapCount ? ' (' + edge.nogoGapCount + ')' : '') + '</text>';
        }
      }
      svg.innerHTML = edgesHtml;

      // Draw nodes
      for (const node of data.nodes) {
        const pos = positions[node.id];
        if (!pos) continue;

        const el = document.createElement('div');
        let classes = 'node status-' + node.status;
        if (node.recommendedAction) classes += ' has-action';
        el.className = classes;
        el.dataset.nodeId = node.id;
        el.style.left = pos.x + 'px';
        el.style.top = pos.y + 'px';

        const icon = nodeIcons[node.id] || '\\u25CB';

        const hypCount = node.signals ? node.signals.hypothesisCount : 0;
        const badge = hypCount > 0
          ? '<span class="node-badge">' + hypCount + '</span>'
          : '';

        el.innerHTML =
          '<div class="node-label">' +
            '<span class="node-icon">' + icon + '</span>' +
            node.label + badge +
          '</div>' +
          '<div class="node-meta">' +
            '<span class="maturity-tag ' + maturityCls(node.maturity) + '">' + maturityLabel(node.maturity) + '</span>' +
            gateDots(node.gates) +
            '<span class="gate-ratio">' + gateRatio(node.gates) + '</span>' +
          '</div>';

        el.addEventListener('click', () => selectNode(node.id));
        container.appendChild(el);
      }

    }

    // ── Select node → detail panel (with toggle) ──
    function selectNode(nodeId) {
      // Toggle: re-click same node = close panel
      if (selectedNodeId === nodeId) {
        closePanel();
        return;
      }

      selectedNodeId = nodeId;
      const node = data.nodes.find(n => n.id === nodeId);
      if (!node) return;

      document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
      const nodeEl = document.querySelector('[data-node-id="' + nodeId + '"]');
      if (nodeEl) nodeEl.classList.add('selected');

      // Highlight connected edges
      var svgEl = document.getElementById('edges-svg');
      svgEl.querySelectorAll('.edge-line').forEach(function(e) {
        e.classList.remove('highlighted');
        if (e.getAttribute('data-from') === nodeId || e.getAttribute('data-to') === nodeId) {
          e.classList.add('highlighted');
        }
      });

      const panel = document.getElementById('detail-panel');
      panel.classList.remove('hidden');
      document.getElementById('drag-handle').classList.remove('hidden');

      let html = '';

      // ─── 1. Header with close button ───
      html += '<div class="detail-header">' +
        '<div class="detail-header-content">' +
          '<span class="phase-tag">' + node.phase + '</span>' +
          '<h2>' + (nodeIcons[node.id] || '') + ' ' + node.label + '</h2>' +
        '</div>' +
        '<button class="close-btn" id="close-panel-btn" title="Close (Esc)">\\u2715</button>' +
      '</div>';

      // ─── 2. Gate checklist (always visible) ───
      var gates = node.gates || [];
      var metCount = gates.filter(function(g) { return g.met; }).length;
      var gateTotal = gates.length;
      var gatePct = gateTotal > 0 ? Math.round(metCount / gateTotal * 100) : 0;

      html += '<div class="detail-gates">' +
        '<div class="detail-gates-header">' +
          '<span class="maturity-tag ' + maturityCls(node.maturity) + '">' + maturityLabel(node.maturity) + '</span>' +
          '<span style="font-size:12px;color:var(--text-dim)">' + metCount + '/' + gateTotal + ' conditions</span>' +
        '</div>' +
        '<div class="detail-gates-bar"><div class="detail-gates-fill" style="width:' + gatePct + '%"></div></div>' +
        '<ul class="gate-list">';

      for (var gi = 0; gi < gates.length; gi++) {
        var g = gates[gi];
        var gCls = g.met ? 'met' : 'unmet';
        var gIcon = g.met ? '&#10003;' : '&#10007;';
        var gCmd = (!g.met && g.command) ? '<span class="gate-cmd" data-command="' + g.command + '">' + g.command + '</span>' : '';
        html += '<li class="gate-item ' + gCls + '">' +
          '<span class="gate-icon">' + gIcon + '</span>' +
          '<span class="gate-label">' + g.label + '</span>' +
          gCmd +
        '</li>';
      }

      html += '</ul></div>';

      // ─── 2b. File Preview (right below readiness) ───
      html += '<div class="file-preview">' +
        '<div id="preview-content" class="file-preview-body placeholder">' +
          '<span class="file-preview-placeholder-text">No preview</span>' +
        '</div>' +
        '<div id="preview-footer" class="file-preview-footer" style="display:none;">' +
          '<span id="preview-name" class="file-preview-name"></span>' +
          '<span class="file-preview-open">\u2197</span>' +
        '</div>' +
      '</div>';

      // ─── 3. Recommended action (always visible, not collapsible) ───
      if (node.recommendedAction) {
        const a = node.recommendedAction;
        html += '<div class="detail-section-fixed recommended-action">' +
          '<div class="action-card" data-command="' + a.command + '">' +
            '<span class="action-cmd">' + a.command + '</span>' +
            '<div class="action-reason">' + a.label + '</div>' +
            '<div class="action-label">' + a.reason + '</div>' +
          '</div>' +
        '</div>';
      }

      // ─── 3.1. Commands ───
        if (node.commands.length > 0) {
        let commandsHtml = '';
        for (const cmd of node.commands) {
          commandsHtml += '<button class="command-btn" data-command="' + cmd.command + '">' +
            '<span class="command-name">' + cmd.command + '</span>' +
            '<span class="command-desc">' + cmd.description + '</span>' +
          '</button>';
        }
        html += collapsible('commands', 'Commands', node.commands.length, commandsHtml, false);
      }

      // ─── 3.2. What's Next (collapsible) ───
      var whatsNextContent = renderWhatsNext(node);
      if (whatsNextContent) {
        html += collapsible('whats-next', "What's next", null, whatsNextContent, false);
      }

      // ─── 3.3. Contextual section (node-specific) ───
      html += renderContextSection(node);

      // ─── 4. Recent activity ───
      if (node.files.length > 0) {
        const sorted = node.files.slice().sort((a, b) => (b.modifiedAt || 0) - (a.modifiedAt || 0));
        const maxShow = 8;
        const filesToShow = sorted.slice(0, maxShow);

        let filesHtml = '';
        for (const file of filesToShow) {
          let badges = '';
          if (isRecent(file.modifiedAt)) badges += '<span class="file-badge recent">NEW</span>';
          if (file.hasHypothesis) badges += '<span class="file-badge hypothesis">HYP</span>';
          if (file.status === 'VALIDEE') badges += '<span class="file-badge validated">OK</span>';
          if (file.status === 'DRAFT') badges += '<span class="file-badge draft">DRAFT</span>';

          const comp = Math.round((file.signals ? file.signals.completeness : 0) * 100);
          const compCls = cls(comp);
          const compBar = '<div class="file-completeness"><div class="file-completeness-fill ' + compCls + '" style="width:' + comp + '%"></div></div>';

          filesHtml += '<div class="file-item" data-path="' + file.path.replace(/"/g, '&quot;') + '">' +
            '<span class="file-icon">\\u25A1</span>' +
            '<span class="file-name">' + file.name + '</span>' +
            '<span class="file-time">' + timeAgo(file.modifiedAt) + '</span>' +
            compBar +
            badges +
          '</div>';
        }
        if (node.files.length > maxShow) {
          filesHtml += '<div class="empty-state">+ ' + (node.files.length - maxShow) + ' more files</div>';
        }

        html += collapsible('activity', 'Recent activity', node.files.length, filesHtml, false);
      }

      // ─── 5. Confidence signals (collapsed by default) ───
      if (node.children && node.children.length > 0) {
        let confidenceHtml = '';
        for (const child of node.children) {
          const pct = child.readiness || 0;
          const c2 = cls(pct);
          let badge = '';
          if (child.fileCount === 0 && pct === 0) {
            badge = '<span class="confidence-badge empty">vide</span>';
          }

          confidenceHtml += '<div class="confidence-row">' +
            '<span class="confidence-name">' + child.label + '</span>' +
            miniBar(pct, c2) +
            '<span class="confidence-pct">' + pct + '%</span>' +
            badge +
          '</div>';
        }
        html += collapsible('confidence', 'Confiance', node.children.length, confidenceHtml, false);
      }

      // ─── 6. Sections checklist (collapsed by default) ───
      if (node.sections && node.sections.length > 0) {
        const filled = node.sections.filter(s => s.filled).length;
        let sectionsHtml = '';
        for (const sec of node.sections) {
          const checkCls = sec.filled ? 'filled' : 'empty';
          const checkMark = sec.filled ? '\\u2713' : '\\u2717';
          let issue = '';
          if (sec.hasHypothesis) issue = '[HYPOTHESE]';
          else if (sec.hasContradiction) issue = '[CONTRADICTOIRE]';
          else if (!sec.filled) issue = 'TBD';

          sectionsHtml += '<div class="section-row">' +
            '<span class="section-check ' + checkCls + '">' + checkMark + '</span>' +
            '<span class="section-name">' + sec.name + '</span>' +
            (issue ? '<span class="section-issue">' + issue + '</span>' : '') +
          '</div>';
        }
        html += collapsible('sections', 'Sections', filled + '/' + node.sections.length, sectionsHtml, false);
      }

      // ─── 7. History (collapsed by default) ───
      if (data.history && data.history.length > 0) {
        let historyHtml = '';
        const relevant = data.history.slice(-8);
        for (const entry of relevant) {
          historyHtml += '<div class="history-row">' +
            '<span class="history-date">' + formatDate(entry.date) + '</span>' +
            '<span class="history-agent">/' + entry.agent + '</span>' +
            '<span class="history-action">' + entry.action + '</span>' +
          '</div>';
        }
        html += collapsible('history', 'Historique', data.history.length, historyHtml, false);
      }

      // ─── 8. Dependencies (collapsed by default) ───
      let depsContent = '';
      if (node.dependsOn.length > 0 || node.unlocks.length > 0) {
        if (node.dependsOn.length > 0) {
          depsContent += '<div class="dep-group"><div class="dep-label">Depend de</div><div class="dep-list">';
          for (const dep of node.dependsOn) {
            const depNode = data.nodes.find(n => n.id === dep);
            depsContent += '<span class="dep-chip">' + (depNode ? depNode.label : dep) + '</span>';
          }
          depsContent += '</div></div>';
        }
        if (node.unlocks.length > 0) {
          depsContent += '<div class="dep-group"><div class="dep-label">Debloque</div><div class="dep-list">';
          for (const u of node.unlocks) {
            const uNode = data.nodes.find(n => n.id === u);
            depsContent += '<span class="dep-chip">' + (uNode ? uNode.label : u) + '</span>';
          }
          depsContent += '</div></div>';
        }
        html += collapsible('deps', 'Relations', null, depsContent, false);
      }

      panel.innerHTML = html;

      // ── Bind events ──

      // Close button
      const closeBtn = document.getElementById('close-panel-btn');
      if (closeBtn) closeBtn.addEventListener('click', closePanel);

      // Collapsible toggle with localStorage persistence
      panel.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
          const section = header.parentElement;
          section.classList.toggle('open');
          var sectionId = section.getAttribute('data-section');
          if (sectionId) {
            try {
              var openSections = JSON.parse(localStorage.getItem('designOs.openSections') || '{}');
              openSections[sectionId] = section.classList.contains('open');
              localStorage.setItem('designOs.openSections', JSON.stringify(openSections));
            } catch(e) {}
          }
        });
      });

      // Command buttons
      panel.querySelectorAll('.command-btn, .action-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cmd = btn.getAttribute('data-command');
          if (cmd) vscode.postMessage({ type: 'runCommand', command: cmd });
        });
      });

      // What's Next command spans
      panel.querySelectorAll('.whats-next-cmd').forEach(cmd => {
        cmd.addEventListener('click', (e) => {
          e.stopPropagation();
          const command = cmd.getAttribute('data-command');
          if (command) vscode.postMessage({ type: 'runCommand', command: command });
        });
      });

      // Gate checklist command spans
      panel.querySelectorAll('.gate-cmd').forEach(cmd => {
        cmd.addEventListener('click', (e) => {
          e.stopPropagation();
          const command = cmd.getAttribute('data-command');
          if (command) vscode.postMessage({ type: 'runCommand', command: command });
        });
      });

      // File items — click triggers preview for SVG/HTML, direct open for others
      panel.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
          const filePath = item.getAttribute('data-path');
          if (filePath) requestPreview(filePath);
        });
      });

      // Spec grid cells — click opens the spec file
      panel.querySelectorAll('.spec-cell').forEach(cell => {
        cell.addEventListener('click', () => {
          const specPath = cell.getAttribute('data-spec-path');
          if (specPath) vscode.postMessage({ type: 'openFile', path: specPath });
        });
      });

      // Flow items — click opens the flow in a new interactive panel
      panel.querySelectorAll('.flow-item').forEach(item => {
        item.addEventListener('click', () => {
          const flowPath = item.getAttribute('data-flow-path');
          if (flowPath) vscode.postMessage({ type: 'openFlowPreview', path: flowPath });
        });
      });

      // Auto-preview: show the latest SVG/HTML file for this node
      const currentNode = data.nodes.find(n => n.id === nodeId);
      if (currentNode) triggerAutoPreview(currentNode);
    }

    // ── Message handler ──
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'update') {
        Object.assign(data, msg.data);
        renderGraph();
        if (selectedNodeId) selectNode(selectedNodeId);
      } else if (msg.type === 'filePreview') {
        renderPreviewContent(msg);
      }
    });

    // ── Pan navigation (space+click or right-click drag, like Figma) ──
    (function initPan() {
      let isPanning = false;
      let panStartX = 0, panStartY = 0;
      let scrollStartX = 0, scrollStartY = 0;
      let spaceHeld = false;
      const graphPanel = document.getElementById('graph-panel');

      document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat) {
          spaceHeld = true;
          graphPanel.style.cursor = 'grab';
          e.preventDefault();
        }
      });

      document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          spaceHeld = false;
          if (!isPanning) graphPanel.style.cursor = '';
        }
      });

      graphPanel.addEventListener('mousedown', (e) => {
        if (spaceHeld || e.button === 2) {
          isPanning = true;
          panStartX = e.clientX;
          panStartY = e.clientY;
          scrollStartX = graphPanel.scrollLeft;
          scrollStartY = graphPanel.scrollTop;
          graphPanel.style.cursor = 'grabbing';
          e.preventDefault();
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        graphPanel.scrollLeft = scrollStartX - (e.clientX - panStartX);
        graphPanel.scrollTop = scrollStartY - (e.clientY - panStartY);
      });

      document.addEventListener('mouseup', () => {
        if (isPanning) {
          isPanning = false;
          graphPanel.style.cursor = spaceHeld ? 'grab' : '';
        }
      });

      graphPanel.addEventListener('contextmenu', (e) => e.preventDefault());
    })();

    // ── Drag-and-drop section reordering ──
    (function() {
      var dragSrcId = null;

      function setupDragListeners() {
        var panel = document.getElementById('detail-panel');
        if (!panel) return;

        panel.addEventListener('dragstart', function(e) {
          var section = e.target.closest('.draggable-section');
          if (!section) return;
          dragSrcId = section.getAttribute('data-section-id');
          section.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', dragSrcId);
        });

        panel.addEventListener('dragover', function(e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          var target = e.target.closest('.draggable-section');
          if (!target || target.getAttribute('data-section-id') === dragSrcId) return;

          // Clear all indicators
          panel.querySelectorAll('.drag-above, .drag-below').forEach(function(el) {
            el.classList.remove('drag-above', 'drag-below');
          });

          var rect = target.getBoundingClientRect();
          var mid = rect.top + rect.height / 2;
          if (e.clientY < mid) {
            target.classList.add('drag-above');
          } else {
            target.classList.add('drag-below');
          }
        });

        panel.addEventListener('dragleave', function(e) {
          var target = e.target.closest('.draggable-section');
          if (target) {
            target.classList.remove('drag-above', 'drag-below');
          }
        });

        panel.addEventListener('drop', function(e) {
          e.preventDefault();
          var target = e.target.closest('.draggable-section');
          if (!target || !dragSrcId) return;

          var targetId = target.getAttribute('data-section-id');
          if (targetId === dragSrcId) return;

          var src = panel.querySelector('.draggable-section[data-section-id="' + dragSrcId + '"]');
          if (!src) return;

          var rect = target.getBoundingClientRect();
          var mid = rect.top + rect.height / 2;
          if (e.clientY < mid) {
            target.parentNode.insertBefore(src, target);
          } else {
            target.parentNode.insertBefore(src, target.nextSibling);
          }

          // Save new order
          var sections = panel.querySelectorAll('.draggable-section');
          var order = [];
          sections.forEach(function(s) { order.push(s.getAttribute('data-section-id')); });
          vscode.postMessage({ type: 'saveSectionOrder', order: order });
        });

        panel.addEventListener('dragend', function() {
          dragSrcId = null;
          panel.querySelectorAll('.dragging, .drag-above, .drag-below').forEach(function(el) {
            el.classList.remove('dragging', 'drag-above', 'drag-below');
          });
        });
      }

      // Re-attach listeners after each selectNode render
      var origSelectNode = selectNode;
      selectNode = function(nodeId) {
        origSelectNode(nodeId);
        setupDragListeners();
        applySavedOrder();
      };

      function applySavedOrder() {
        var savedOrder = data.sectionOrder;
        if (!savedOrder || savedOrder.length === 0) return;

        var panel = document.getElementById('detail-panel');
        if (!panel) return;

        var container = panel.querySelector('.detail-panel-content') || panel;
        var sections = container.querySelectorAll('.draggable-section');
        if (sections.length === 0) return;

        // Build a map of section elements
        var sectionMap = {};
        sections.forEach(function(s) { sectionMap[s.getAttribute('data-section-id')] = s; });

        // Reorder according to saved order
        var parent = sections[0].parentNode;
        for (var i = 0; i < savedOrder.length; i++) {
          var el = sectionMap[savedOrder[i]];
          if (el) parent.appendChild(el);
        }

        // Append any sections not in the saved order
        sections.forEach(function(s) {
          if (savedOrder.indexOf(s.getAttribute('data-section-id')) === -1) {
            parent.appendChild(s);
          }
        });

        // Force deps (Relations) to always be last
        var depsEl = sectionMap['deps'];
        if (depsEl) parent.appendChild(depsEl);
      }
    })();

    // ── Init ──
    renderGraph();

    // ── Launch Console button ──
    var launchBtn = document.getElementById('launchConsoleBtn');
    if (launchBtn) {
      launchBtn.addEventListener('click', function() {
        vscode.postMessage({ type: 'launchConsole' });
      });
    }

    // ── Zoom controls ──
    var zoomLevel = 1;
    var graphContainer = document.getElementById('graph-container');
    var graphPanel = document.getElementById('graph-panel');

    function setZoom(level) {
      zoomLevel = Math.min(2, Math.max(0.4, level));
      graphContainer.style.transform = 'scale(' + zoomLevel + ')';
      graphContainer.style.transformOrigin = 'top left';
      document.getElementById('zoom-level').textContent = Math.round(zoomLevel * 100) + '%';
    }

    function fitToView() {
      var pw = graphPanel.clientWidth;
      var ph = graphPanel.clientHeight;
      var cw = parseInt(graphContainer.style.width) || 600;
      var ch = parseInt(graphContainer.style.height) || 800;
      var sx = pw / cw;
      var sy = ph / ch;
      setZoom(Math.min(sx, sy, 1));
    }

    document.getElementById('zoom-in').addEventListener('click', function() { setZoom(zoomLevel + 0.1); });
    document.getElementById('zoom-out').addEventListener('click', function() { setZoom(zoomLevel - 0.1); });
    document.getElementById('zoom-fit').addEventListener('click', fitToView);

    // Ctrl+scroll to zoom
    graphPanel.addEventListener('wheel', function(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.05 : 0.05;
        setZoom(zoomLevel + delta);
      }
    }, { passive: false });

    // ── Toast notification system ──
    var previousGlobalReadiness = data.globalReadiness;

    window.addEventListener('message', function(event) {
      var msg = event.data;
      if (msg.type === 'readinessChanged') {
        var delta = msg.globalScore - previousGlobalReadiness;
        if (delta !== 0) {
          showToast(delta, msg.updatedBy || '');
          previousGlobalReadiness = msg.globalScore;
        }
      }
    });

    function showToast(delta, source) {
      var existing = document.querySelector('.toast');
      if (existing) existing.remove();

      var toast = document.createElement('div');
      toast.className = 'toast';
      var sign = delta > 0 ? '+' : '';
      var dcls = delta > 0 ? 'up' : 'down';
      var icon = delta > 0 ? '\\u2191' : '\\u2193';
      toast.innerHTML =
        '<span class="toast-icon">' + icon + '</span>' +
        '<span class="toast-delta ' + dcls + '">' + sign + delta + '%</span>' +
        '<span>Readiness ' + (source ? 'via ' + source : 'mise a jour') + '</span>';
      document.body.appendChild(toast);

      setTimeout(function() {
        toast.classList.add('hiding');
        setTimeout(function() { toast.remove(); }, 300);
      }, 3000);
    }
    // ══════════════════════════════════════════════
    // ── Header Tab Switching ──
    // ══════════════════════════════════════════════
    document.querySelectorAll('.header-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.header-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var target = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(function(tc) { tc.classList.remove('active'); });
        var el = document.getElementById(target + 'Tab');
        if (el) el.classList.add('active');
      });
    });

    // ══════════════════════════════════════════════
    // ── Prototyper Logic ──
    // ══════════════════════════════════════════════
    (function() {
      var protoFeed = document.getElementById('protoFeed');
      var protoList = document.getElementById('protoList');
      var protoPinned = document.getElementById('protoPinned');
      var protoPinnedList = document.getElementById('protoPinnedList');
      var protoEmpty = document.getElementById('protoEmpty');
      var protoCount = document.getElementById('protoCount');
      var protoPreview = document.getElementById('protoPreview');
      var protoPreviewBody = document.getElementById('protoPreviewBody');
      var protoPreviewBadge = document.getElementById('protoPreviewBadge');
      var protoPreviewTitle = document.getElementById('protoPreviewTitle');
      var protoZoom = document.getElementById('protoZoom');
      var protoZoomLevel = document.getElementById('protoZoomLevel');
      var protoToastContainer = document.getElementById('protoToastContainer');

      var protoArtifacts = [];
      var protoCurrentZoom = 100;
      var protoCurrentPreviewId = null;
      var protoCurrentMode = 'standard';
      var protoDeleteTargetId = null;
      var protoPromptTargetId = null;

      // Mode toggle
      document.querySelectorAll('.proto-mode-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.proto-mode-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          protoCurrentMode = btn.getAttribute('data-pmode');
          protoFeed.classList.toggle('proto-compact', protoCurrentMode === 'compact');
          protoUpdateUI();
        });
      });

      // Back button
      document.getElementById('protoBackBtn').addEventListener('click', protoClosePreview);

      // Escape key for prototyper
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if (protoPreview.classList.contains('active')) { protoClosePreview(); }
          protoCloseModals();
        }
      });

      // Zoom
      document.getElementById('protoZoomIn').addEventListener('click', function() {
        protoCurrentZoom = Math.min(protoCurrentZoom + 25, 300); protoApplyZoom();
      });
      document.getElementById('protoZoomOut').addEventListener('click', function() {
        protoCurrentZoom = Math.max(protoCurrentZoom - 25, 25); protoApplyZoom();
      });
      document.getElementById('protoZoomReset').addEventListener('click', function() {
        protoCurrentZoom = 100; protoApplyZoom();
      });

      function protoApplyZoom() {
        var svg = protoPreviewBody.querySelector('.art-render-svg');
        if (svg) svg.style.transform = 'scale(' + (protoCurrentZoom / 100) + ')';
        protoZoomLevel.textContent = protoCurrentZoom + '%';
      }

      // Delete modal
      document.getElementById('protoDeleteBackdrop').addEventListener('click', protoCloseModals);
      document.getElementById('protoDeleteCancel').addEventListener('click', protoCloseModals);
      document.getElementById('protoDeleteConfirm').addEventListener('click', function() {
        if (protoDeleteTargetId) vscode.postMessage({ type: 'deleteArtifact', id: protoDeleteTargetId });
        protoCloseModals();
      });

      // Prompt modal
      document.getElementById('protoPromptBackdrop').addEventListener('click', protoCloseModals);
      document.getElementById('protoPromptCancel').addEventListener('click', protoCloseModals);
      document.getElementById('protoPromptConfirm').addEventListener('click', function() {
        var prompt = document.getElementById('protoPromptTextarea').value.trim();
        if (protoPromptTargetId && prompt) {
          vscode.postMessage({ type: 'regenerateArtifact', id: protoPromptTargetId, mode: 'prompt', prompt: prompt });
        }
        protoCloseModals();
      });

      function protoCloseModals() {
        document.querySelectorAll('.proto-modal-backdrop, .proto-modal').forEach(function(el) { el.classList.remove('open'); });
        protoDeleteTargetId = null;
        protoPromptTargetId = null;
      }

      function protoShowDeleteModal(id, title) {
        protoDeleteTargetId = id;
        document.getElementById('protoDeleteName').textContent = title;
        document.getElementById('protoDeleteBackdrop').classList.add('open');
        document.getElementById('protoDeleteModal').classList.add('open');
      }

      function protoShowPromptModal(id) {
        protoPromptTargetId = id;
        document.getElementById('protoPromptTextarea').value = '';
        document.getElementById('protoPromptBackdrop').classList.add('open');
        document.getElementById('protoPromptModal').classList.add('open');
        document.getElementById('protoPromptTextarea').focus();
      }

      function protoShowToast(message, type) {
        type = type || 'success';
        var t = document.createElement('div');
        t.className = 'proto-toast ' + type;
        var icons = { success: '\\u2713', error: '\\u2717', warning: '\\u26A0' };
        t.innerHTML = '<span class="proto-toast-icon">' + (icons[type] || '') + '</span>' + protoEscapeHtml(message);
        protoToastContainer.appendChild(t);
        setTimeout(function() { t.remove(); }, 3000);
      }

      function protoUpdateUI() {
        var pinned = protoArtifacts.filter(function(a) { return a.isPinned; });
        var unpinned = protoArtifacts.filter(function(a) { return !a.isPinned; });

        protoPinned.classList.toggle('visible', pinned.length > 0);
        protoEmpty.style.display = protoArtifacts.length === 0 ? 'flex' : 'none';
        protoCount.textContent = protoArtifacts.length;

        if (protoCurrentMode === 'compact') {
          protoRenderCompact(pinned, unpinned);
        } else {
          protoPinnedList.innerHTML = pinned.map(function(a) { return protoRenderCard(a, false); }).join('');
          protoList.innerHTML = unpinned.map(function(a) { return protoRenderCard(a, false); }).join('');
        }
        protoBindCardEvents();
      }

      function protoRenderCompact(pinned, unpinned) {
        var all = pinned.concat(unpinned);
        var byPhase = { spec: [], design: [], prototype: [] };
        all.forEach(function(a) {
          var phase = a.phase || (a.type === 'doc' ? 'spec' : a.type === 'svg' ? 'design' : 'prototype');
          byPhase[phase].push(a);
        });
        var html = '';
        var phaseIcons = { spec: '\\uD83D\\uDCC4', design: '\\uD83C\\uDFA8', prototype: '\\uD83D\\uDE80' };
        for (var phase in byPhase) {
          if (byPhase[phase].length === 0) continue;
          html += '<div class="phase-group"><div class="phase-header">';
          html += '<div class="phase-icon ' + phase + '">' + (phaseIcons[phase] || '') + '</div>';
          html += '<span class="phase-label">' + phase + '</span>';
          html += '<span class="phase-count">' + byPhase[phase].length + '</span></div>';
          html += byPhase[phase].map(function(a) { return protoRenderCard(a, true); }).join('');
          html += '</div>';
        }
        protoPinnedList.innerHTML = '';
        protoList.innerHTML = html;
        protoPinned.classList.remove('visible');
      }

      function protoRenderCard(artifact, isCompact) {
        var pinIcon = artifact.isPinned ? '<span class="art-pin">\\uD83D\\uDCCC</span>' : '';
        var cls = ['art-card'];
        if (artifact.isPinned) cls.push('pinned');
        if (isCompact) cls.push('phase-grouped');

        var contentHtml = '';
        if (!isCompact) {
          if (artifact.type === 'doc') {
            contentHtml = '<div class="art-content"><div class="art-render-md">' + protoSimpleMarkdown(artifact.content) + '</div></div>';
          } else if (artifact.type === 'svg') {
            contentHtml = '<div class="art-content"><div class="art-render-svg">' + artifact.content + '</div></div>';
          } else if (artifact.type === 'html') {
            contentHtml = '<div class="art-content"><iframe class="art-render-html" srcdoc="' + protoEscapeAttr(artifact.content) + '"></iframe></div>';
          } else if (artifact.type === 'server') {
            contentHtml = '<div class="art-content"><div class="art-render-server"><div style="display:flex;align-items:center;gap:6px"><div class="art-server-dot"></div><span class="art-server-label">Running</span></div><a href="#" class="art-server-link">localhost:5173</a></div></div>';
          }
        }

        var skillBadge = artifact.skill && artifact.skill !== 'initial'
          ? '<span class="art-badge skill">' + protoEscapeHtml(artifact.skill) + '</span>'
          : '';

        return '<div class="' + cls.join(' ') + '" data-artid="' + artifact.id + '">' +
          '<div class="art-header"><div class="art-info">' + pinIcon +
          '<span class="art-badge ' + artifact.type + '">' + artifact.type.toUpperCase() + '</span>' +
          skillBadge +
          '<span class="art-title">' + protoEscapeHtml(artifact.title) + '</span></div>' +
          '<div class="art-actions">' +
          '<button class="art-btn art-open-btn">Open</button>' +
          '<button class="art-btn art-copy-btn">Copy</button>' +
          '<div class="art-dropdown art-regen-dd"><button class="art-btn">Regen \\u25BE</button>' +
          '<div class="art-dropdown-menu">' +
          '<button class="art-dd-item art-regen-same"><span class="art-dd-icon">\\uD83D\\uDD04</span>Regenerate</button>' +
          '<button class="art-dd-item art-regen-prompt"><span class="art-dd-icon">\\u270F</span>With prompt...</button>' +
          '<button class="art-dd-item art-regen-variant"><span class="art-dd-icon">\\uD83C\\uDFB2</span>Variant</button></div></div>' +
          '<button class="art-btn primary art-export-btn">Export</button>' +
          '<div class="art-dropdown art-menu-dd"><button class="art-btn art-menu-btn">\\u22EF</button>' +
          '<div class="art-dropdown-menu">' +
          '<button class="art-dd-item art-pin-btn"><span class="art-dd-icon">' + (artifact.isPinned ? '\\uD83D\\uDCCD' : '\\uD83D\\uDCCC') + '</span>' + (artifact.isPinned ? 'Unpin' : 'Pin') + '</button>' +
          '<div class="art-dd-divider"></div>' +
          '<button class="art-dd-item danger art-delete-btn"><span class="art-dd-icon">\\uD83D\\uDDD1</span>Supprimer</button></div></div>' +
          '</div></div>' + contentHtml + '</div>';
      }

      function protoBindCardEvents() {
        document.addEventListener('click', function(e) {
          if (!e.target.closest('.art-dropdown')) {
            document.querySelectorAll('.art-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
          }
        });
        document.querySelectorAll('.art-dropdown > .art-btn').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var dd = btn.closest('.art-dropdown');
            var wasOpen = dd.classList.contains('open');
            document.querySelectorAll('.art-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
            if (!wasOpen) dd.classList.add('open');
          });
        });
        document.querySelectorAll('.art-card').forEach(function(card) {
          var id = card.getAttribute('data-artid');
          var artifact = protoArtifacts.find(function(a) { return a.id === id; });
          if (!artifact) return;
          var openBtn = card.querySelector('.art-open-btn');
          if (openBtn) openBtn.addEventListener('click', function(e) { e.stopPropagation(); protoOpenPreview(id); });
          var copyBtn = card.querySelector('.art-copy-btn');
          if (copyBtn) copyBtn.addEventListener('click', function(e) { e.stopPropagation(); vscode.postMessage({ type: 'copyArtifact', id: id }); });
          var exportBtn = card.querySelector('.art-export-btn');
          if (exportBtn) exportBtn.addEventListener('click', function(e) { e.stopPropagation(); vscode.postMessage({ type: 'exportArtifact', id: id }); });
          var pinBtn = card.querySelector('.art-pin-btn');
          if (pinBtn) pinBtn.addEventListener('click', function(e) { e.stopPropagation(); vscode.postMessage({ type: 'pinArtifact', id: id }); });
          var deleteBtn = card.querySelector('.art-delete-btn');
          if (deleteBtn) deleteBtn.addEventListener('click', function(e) { e.stopPropagation(); protoShowDeleteModal(id, artifact.title); });
          var regenSame = card.querySelector('.art-regen-same');
          if (regenSame) regenSame.addEventListener('click', function(e) { e.stopPropagation(); vscode.postMessage({ type: 'regenerateArtifact', id: id, mode: 'same' }); });
          var regenPrompt = card.querySelector('.art-regen-prompt');
          if (regenPrompt) regenPrompt.addEventListener('click', function(e) { e.stopPropagation(); protoShowPromptModal(id); });
          var regenVariant = card.querySelector('.art-regen-variant');
          if (regenVariant) regenVariant.addEventListener('click', function(e) { e.stopPropagation(); vscode.postMessage({ type: 'regenerateArtifact', id: id, mode: 'variant' }); });
        });
      }

      function protoOpenPreview(id) {
        var artifact = protoArtifacts.find(function(a) { return a.id === id; });
        if (!artifact) return;
        protoCurrentPreviewId = id;
        protoCurrentZoom = 100;
        protoPreviewBadge.className = 'art-badge ' + artifact.type;
        protoPreviewBadge.textContent = artifact.type.toUpperCase();
        protoPreviewTitle.textContent = artifact.title;
        var html = '';
        if (artifact.type === 'doc') {
          html = '<div class="full-render art-render-md">' + protoSimpleMarkdown(artifact.content) + '</div>';
          protoZoom.classList.remove('visible');
        } else if (artifact.type === 'svg') {
          html = '<div class="full-render art-render-svg">' + artifact.content + '</div>';
          protoZoom.classList.add('visible');
          protoZoomLevel.textContent = '100%';
        } else if (artifact.type === 'html') {
          html = '<iframe class="full-render art-render-html" srcdoc="' + protoEscapeAttr(artifact.content) + '"></iframe>';
          protoZoom.classList.remove('visible');
        } else {
          html = '<div class="full-render art-render-server"><div style="display:flex;align-items:center;gap:6px"><div class="art-server-dot"></div><span class="art-server-label">Running</span></div><a href="#" class="art-server-link">localhost:5173</a></div>';
          protoZoom.classList.remove('visible');
        }
        protoPreviewBody.innerHTML = html;
        protoFeed.style.display = 'none';
        protoPreview.classList.add('active');
      }

      function protoClosePreview() {
        protoPreview.classList.remove('active');
        protoFeed.style.display = 'flex';
        protoCurrentPreviewId = null;
      }

      // Preview actions
      document.getElementById('protoPreviewCopyBtn').addEventListener('click', function() {
        if (protoCurrentPreviewId) vscode.postMessage({ type: 'copyArtifact', id: protoCurrentPreviewId });
      });
      document.getElementById('protoPreviewExportBtn').addEventListener('click', function() {
        if (protoCurrentPreviewId) vscode.postMessage({ type: 'exportArtifact', id: protoCurrentPreviewId });
      });

      function protoSimpleMarkdown(text) {
        if (!text) return '';
        var h = protoEscapeHtml(text);
        h = h.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        h = h.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        h = h.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
        h = h.replace(/^- (.+)$/gm, '<li>$1</li>');
        h = h.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
        h = h.replace(/\\n\\n/g, '</p><p>');
        return '<p>' + h + '</p>';
      }

      function protoEscapeHtml(text) {
        var d = document.createElement('div');
        d.textContent = text || '';
        return d.innerHTML;
      }

      function protoEscapeAttr(text) {
        return (text || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      // Messages from extension for prototyper
      window.addEventListener('message', function(event) {
        var msg = event.data;
        switch (msg.type) {
          case 'addArtifact':
            protoArtifacts.push(msg.artifact);
            protoUpdateUI();
            setTimeout(function() {
              var card = document.querySelector('.art-card[data-artid="' + msg.artifact.id + '"]');
              if (card) {
                card.classList.add('recent');
                setTimeout(function() { card.classList.remove('recent'); }, 2000);
              }
            }, 50);
            break;
          case 'setArtifacts':
            protoArtifacts = msg.artifacts;
            protoUpdateUI();
            break;
          case 'removeArtifact':
            protoArtifacts = protoArtifacts.filter(function(a) { return a.id !== msg.id; });
            if (protoCurrentPreviewId === msg.id) protoClosePreview();
            protoUpdateUI();
            break;
          case 'updateArtifact':
            var idx = protoArtifacts.findIndex(function(a) { return a.id === msg.artifact.id; });
            if (idx !== -1) protoArtifacts[idx] = msg.artifact;
            protoUpdateUI();
            break;
          case 'setLoading':
            var card = document.querySelector('.art-card[data-artid="' + msg.id + '"]');
            if (card) {
              card.classList.toggle('regenerating', msg.loading);
              if (msg.loading) {
                var content = card.querySelector('.art-content');
                if (content && !content.querySelector('.art-loading')) {
                  content.insertAdjacentHTML('beforeend', '<div class="art-loading"><div class="art-spinner"></div><div class="art-loading-text">Regeneration...</div></div>');
                }
              } else {
                var lo = card.querySelector('.art-loading');
                if (lo) lo.remove();
              }
            }
            break;
          case 'protoToast':
            protoShowToast(msg.message, msg.toastType);
            break;
        }
      });

      protoUpdateUI();

      // Signal extension that webview is ready to receive artifacts
      vscode.postMessage({ type: 'webviewReady' });
    })();

    } catch(__debugErr) { // DEBUG WRAPPER END
      document.body.innerHTML =
        '<div style="padding:20px;color:#f38ba8;background:#1e1e2e;font-family:monospace;white-space:pre-wrap;overflow:auto;max-height:100vh;">' +
        '<h2 style="color:#f38ba8;margin:0 0 12px 0;">\\u26A0 Debug Error</h2>' +
        '<p style="color:#cdd6f4;margin:0 0 8px 0;"><b>Message:</b> ' + __debugErr.message + '</p>' +
        '<pre style="color:#a6adc8;font-size:11px;margin:0 0 16px 0;">' + __debugErr.stack + '</pre>' +
        '<h3 style="color:#89b4fa;margin:0 0 8px 0;">Data summary:</h3>' +
        '<pre style="color:#a6adc8;font-size:11px;">' +
          JSON.stringify(data ? {nodesCount: data.nodes ? data.nodes.length : 0, edgesCount: data.edges ? data.edges.length : 0, context: data.context, globalReadiness: data.globalReadiness} : 'DATA IS NULL', null, 2) +
        '</pre></div>';
    }
  </script>
</body>
</html>`;
}
