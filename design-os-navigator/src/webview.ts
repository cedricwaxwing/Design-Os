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

    .edge-line {
      stroke: var(--border);
      stroke-width: 1.5;
      fill: none;
      transition: stroke-width 0.3s ease;
    }
    .edge-line.dependency {
      stroke-dasharray: 6 4;
      opacity: 0.5;
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
      padding: 4px 16px 16px;
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
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
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

    .command-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .command-label { font-weight: 600; font-size: 12px; }

    .command-name {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      padding: 1px 6px;
      border-radius: 4px;
    }

    .command-desc { font-size: 11px; color: var(--text-dim); }

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
      'strategy':       { x: 230, y: 20 },
      'discovery':      { x: 230, y: 120 },
      'ux':             { x: 230, y: 240 },
      'design-system':  { x: 20,  y: 240 },
      'spec':           { x: 160, y: 370 },
      'ui':             { x: 350, y: 370 },
      'build':          { x: 230, y: 490 },
      'review':         { x: 230, y: 600 },
      'lab':            { x: 430, y: 490 },
    };

    const nodeIcons = {
      'strategy': '\\u25C6', 'discovery': '\\u25CE', 'ux': '\\u25C7',
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

    // ── Collapsible section builder ──
    function collapsible(id, title, count, content, openByDefault) {
      if (!content) return '';
      const openCls = openByDefault ? ' open' : '';
      const countHtml = count !== null && count !== undefined
        ? '<span class="collapsible-count">' + count + '</span>'
        : '';
      return '<div class="collapsible' + openCls + '" data-section="' + id + '">' +
        '<div class="collapsible-header">' +
          '<span class="chevron">\\u25B8</span>' +
          '<span class="collapsible-title">' + title + '</span>' +
          countHtml +
        '</div>' +
        '<div class="collapsible-body">' + content + '</div>' +
      '</div>';
    }

    // ── Render graph ──
    function renderGraph() {
      const container = document.getElementById('graph-container');
      const svg = document.getElementById('edges-svg');

      document.getElementById('module-badge').textContent =
        data.context.module || 'aucun module actif';
      document.getElementById('global-readiness').textContent =
        'Readiness global : ' + data.globalReadiness + '%';

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
        const strokeWidth = edge.type === 'nogo' ? 2 : (1 + readiness / 100 * 1.5);

        let edgeCls = 'edge-line';
        if (edge.type === 'dependency') edgeCls += ' dependency';
        if (edge.type === 'nogo') edgeCls += ' nogo';

        edgesHtml += '<path class="' + edgeCls + '" style="stroke-width:' + strokeWidth + '" d="M' + x1 + ',' + y1 +
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

      html += '<div class="detail-readiness">' +
        '<div class="detail-readiness-bar"><div class="detail-readiness-fill ' + c + '" style="width:' + node.readiness + '%"></div></div>' +
        '<div class="detail-readiness-label"><span>' + v + deltaHtml + '</span><span>' + node.readiness + '%</span></div>' +
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

        html += collapsible('activity', 'Activite recente', node.files.length, filesHtml, true);
      } else {
        html += collapsible('activity', 'Activite recente', 0, '<div class="empty-state">Aucun fichier</div>', false);
      }

      // ─── 5. Confidence signals (collapsed by default) ───
      if (node.children && node.children.length > 0) {
        let confidenceHtml = '';
        for (const child of node.children) {
          const pct = Math.round(child.signals ? child.signals.completeness * 100 : 0);
          const c2 = cls(pct);
          let badge = '';
          if (child.fileCount === 0) {
            badge = '<span class="confidence-badge empty">vide</span>';
          } else if (child.signals && child.signals.hypothesisCount > 0) {
            badge = '<span class="confidence-badge warn">' + child.signals.hypothesisCount + ' hyp.</span>';
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

      // ─── 8. Commands (collapsed by default) ───
      if (node.commands.length > 0) {
        let commandsHtml = '';
        for (const cmd of node.commands) {
          commandsHtml += '<button class="command-btn" data-command="' + cmd.command + '">' +
            '<div>' +
              '<div class="command-header">' +
                '<span class="command-name">' + cmd.command + '</span>' +
                '<span class="command-label">' + cmd.label + '</span>' +
              '</div>' +
              '<div class="command-desc">' + cmd.description + '</div>' +
            '</div>' +
          '</button>';
        }
        html += collapsible('commands', 'Actions', node.commands.length, commandsHtml, false);
      }

      // ─── 9. Dependencies (collapsed by default) ───
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

      // Collapsible toggle
      panel.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
          const section = header.parentElement;
          section.classList.toggle('open');
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

      // File items
      panel.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
          const filePath = item.getAttribute('data-path');
          if (filePath) vscode.postMessage({ type: 'openFile', path: filePath });
        });
      });
    }

    // ── Message handler ──
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'update') {
        Object.assign(data, msg.data);
        renderGraph();
        if (selectedNodeId) selectNode(selectedNodeId);
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

    // ── Init ──
    renderGraph();
  </script>
</body>
</html>`;
}
