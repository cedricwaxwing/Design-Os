import { GraphData } from './types';

/**
 * Generates the full HTML for the webview panel.
 * V3 — Dynamic detail panel: toggle/close, collapsible sections, recent activity, visual hierarchy.
 */
export function getWebviewContent(data: GraphData): string {
  const dataJson = JSON.stringify(data).replace(/</g, '\\u003c');

  return /*html*/ `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design OS Navigator</title>
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

    /* ── Readiness Bar ── */
    .readiness-bar {
      flex: 1;
      height: 4px;
      background: color-mix(in srgb, var(--text) 10%, transparent);
      border-radius: 2px;
      overflow: hidden;
    }

    .readiness-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.4s ease;
      background: linear-gradient(90deg, var(--error), var(--warning), var(--success));
      background-size: 300% 100%;
    }
    .readiness-fill.low { background-position: 0% 0; }
    .readiness-fill.medium { background-position: 50% 0; }
    .readiness-fill.high { background-position: 100% 0; }

    .readiness-pct {
      font-size: 10px;
      font-weight: 600;
      min-width: 28px;
      text-align: right;
    }
    .readiness-pct.low { color: var(--error); }
    .readiness-pct.medium { color: var(--warning); }
    .readiness-pct.high { color: var(--success); }

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

    /* ── Detail Readiness ── */
    .detail-readiness {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }

    .detail-readiness-bar {
      height: 6px;
      background: color-mix(in srgb, var(--text) 10%, transparent);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .detail-readiness-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.4s ease;
      background: linear-gradient(90deg, var(--error), var(--warning), var(--success));
      background-size: 300% 100%;
    }
    .detail-readiness-fill.low { background-position: 0% 0; }
    .detail-readiness-fill.medium { background-position: 50% 0; }
    .detail-readiness-fill.high { background-position: 100% 0; }

    .detail-readiness-label {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-dim);
    }

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
          <h1>Design OS Navigator</h1>
          <span class="module-badge" id="module-badge"></span>
        </div>
        <span class="readiness-global" id="global-readiness"></span>
      </div>
      <div class="graph-panel" id="graph-panel">
        <div class="graph-container" id="graph-container">
          <svg class="edges-svg" id="edges-svg"></svg>
        </div>
      </div>
    </div>
    <div class="drag-handle hidden" id="drag-handle"></div>
    <div class="detail-panel hidden" id="detail-panel"></div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const data = ${dataJson};

    // ── Node positions ──
    const positions = {
      'material':       { x: 230, y: 20 },
      'strategy':       { x: 230, y: 120 },
      'discovery':      { x: 230, y: 220 },
      'ux':             { x: 230, y: 340 },
      'design-system':  { x: 20,  y: 340 },
      'spec':           { x: 160, y: 470 },
      'ui':             { x: 350, y: 470 },
      'build':          { x: 230, y: 590 },
      'review':         { x: 230, y: 700 },
      'lab':            { x: 440, y: 340 },
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

    function verdict(pct) {
      if (pct >= 80) return 'Pret';
      if (pct >= 50) return 'Pousser';
      if (pct >= 25) return 'Possible';
      if (pct >= 10) return 'Premature';
      return 'Pas pret';
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
        container.innerHTML = '<span class="file-preview-placeholder-text">Aucun aper\\u00E7u</span>';
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

      var html = '<div class="whats-next">';
      html += '<div class="whats-next-title">Prochaines etapes</div>';
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
      html += '</div>';
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
          var stageLabels = { DRAFT: 'Draft', 'EN COURS': 'En cours', VALIDEE: 'Validee', BUILT: 'Code', REVIEWED: 'Review' };

          html += '<div class="ctx-section">' +
            '<div class="ctx-label">Pipeline specs</div>' +
            '<div class="ctx-counters">' +
              '<span class="ctx-counter"><span class="count">' + pipeline.length + '</span> spec' + (pipeline.length > 1 ? 's' : '') + '</span>' +
              '<span class="ctx-counter"><span class="count">' + screenCount + '</span> ecran' + (screenCount > 1 ? 's' : '') + '</span>';
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
          html += '<div class="ctx-section"><div class="ctx-label">Parcours utilisateur</div><div class="ctx-counters">';
          html += '<span class="ctx-counter"><span class="count">' + jCount + '</span> journey' + (jCount > 1 ? 's' : '') + ' SVG</span>';
          html += '<span class="ctx-counter"><span class="count">' + fCount + '</span> flow' + (fCount > 1 ? 's' : '') + '</span>';
          html += '</div></div>';
        }

        if (flows.length > 0) {
          html += '<div class="ctx-section"><div class="ctx-label">Flows detectes</div>';
          html += '<div class="flow-list">';
          for (var fi = 0; fi < flows.length; fi++) {
            var flow = flows[fi];
            html += '<div class="flow-item" data-flow-path="' + flow.path + '">' +
              '<span class="flow-name">' + flow.name + '</span>' +
              '<span class="flow-badge">' + flow.nodeCount + ' ecrans</span>' +
              '<span class="flow-open" title="Ouvrir le flow interactif">\\u2197</span>' +
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
      var globalSparkHtml = sparkline(getSparklineValues('global'), 60, 18);
      document.getElementById('global-readiness').innerHTML =
        'Readiness global : ' + data.globalReadiness + '%' + globalSparkHtml;

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

        edgesHtml += '<path class="' + edgeCls + '" style="stroke:' + edgeColor +
          ';stroke-width:' + strokeWidth + ';opacity:' + edgeOpacity + '" d="M' + x1 + ',' + y1 +
          ' C' + x1 + ',' + midY + ' ' + x2 + ',' + midY + ' ' + x2 + ',' + y2 + '" />';
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

        const c = cls(node.readiness);
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
            '<span class="node-files">' + node.fileCount + ' fichier' + (node.fileCount !== 1 ? 's' : '') + '</span>' +
            '<div class="readiness-bar"><div class="readiness-fill ' + c + '" style="width:' + node.readiness + '%"></div></div>' +
            '<span class="readiness-pct ' + c + '">' + node.readiness + '%</span>' +
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

      const panel = document.getElementById('detail-panel');
      panel.classList.remove('hidden');
      document.getElementById('drag-handle').classList.remove('hidden');

      const c = cls(node.readiness);
      const v = verdict(node.readiness);

      let html = '';

      // ─── 1. Header with close button ───
      html += '<div class="detail-header">' +
        '<div class="detail-header-content">' +
          '<span class="phase-tag">' + node.phase + '</span>' +
          '<h2>' + (nodeIcons[node.id] || '') + ' ' + node.label + '</h2>' +
        '</div>' +
        '<button class="close-btn" id="close-panel-btn" title="Fermer (Echap)">\\u2715</button>' +
      '</div>';

      // ─── 2. Readiness (always visible, compact) ───
      let deltaHtml = '';
      if (node.previousReadiness !== undefined && node.previousReadiness !== null) {
        const diff = node.readiness - node.previousReadiness;
        if (diff !== 0) {
          const sign = diff > 0 ? '\\u2191 +' : '\\u2193 ';
          const dcls = diff > 0 ? 'up' : 'down';
          deltaHtml = '<span class="delta ' + dcls + '">' + sign + diff + '%</span>';
        }
      }

      var nodeSparkHtml = sparkline(getSparklineValues(node.id), 80, 22);

      html += '<div class="detail-readiness">' +
        '<div class="detail-readiness-bar"><div class="detail-readiness-fill ' + c + '" style="width:' + node.readiness + '%"></div></div>' +
        '<div class="detail-readiness-label"><span>' + v + deltaHtml + '</span><span>' + node.readiness + '%' + nodeSparkHtml + '</span></div>' +
      '</div>';

      // ─── 2b. File Preview (right below readiness) ───
      html += '<div class="file-preview">' +
        '<div id="preview-content" class="file-preview-body placeholder">' +
          '<span class="file-preview-placeholder-text">Aucun aper\u00E7u</span>' +
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

      // ─── 3.3b. What's Next? Lookahead ───
      html += renderWhatsNext(node);

      // ─── 3.4. Contextual section (node-specific) ───
      html += renderContextSection(node);

      // ─── 3.5. Commands ───
      if (node.commands.length > 0) {
        let commandsHtml = '';
        for (const cmd of node.commands) {
          commandsHtml += '<button class="command-btn" data-command="' + cmd.command + '">' +
            '<span class="command-name">' + cmd.command + '</span>' +
            '<span class="command-desc">' + cmd.description + '</span>' +
          '</button>';
        }
        const strategyNode = data.nodes.find(n => n.id === 'strategy');
        const onboardingDone = strategyNode && strategyNode.readiness > 0;
        html += collapsible('commands', 'Commandes', node.commands.length, commandsHtml, false);
      }

      // ─── 4. Activite recente (open by default) ───
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
          filesHtml += '<div class="empty-state">+ ' + (node.files.length - maxShow) + ' autres fichiers</div>';
        }

        html += collapsible('activity', 'Activite recente', node.files.length, filesHtml, false);
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
      }
    })();

    // ── Init ──
    renderGraph();
  </script>
</body>
</html>`;
}
