import * as vscode from 'vscode';
import { ConsoleCard } from './types';

export class ConsoleViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _onCommand?: (command: string) => void;
  private _onPermission?: (value: string) => void;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  /** Register a handler for commands sent from the Console input */
  onCommand(handler: (command: string) => void) {
    this._onCommand = handler;
  }

  /** Register a handler for permission responses */
  onPermission(handler: (value: string) => void) {
    this._onPermission = handler;
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = getConsoleHtml();

    // Handle messages from Console webview
    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.type === 'consoleCommand' && this._onCommand) {
        this._onCommand(message.command);
      }
      if (message.type === 'permissionResponse' && this._onPermission) {
        this._onPermission(message.value);
      }
    });
  }

  /** Push an activity card into the Console stream */
  addCard(card: ConsoleCard) {
    this._view?.webview.postMessage({ type: 'addCard', card });
  }

  /** Access to the underlying webview for message handling */
  get view(): vscode.WebviewView | undefined {
    return this._view;
  }
}

function getConsoleHtml(): string {
  return /*html*/ `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    --mauve: #cba6f7;
    --peach: #fab387;
    --surface1: #45475a;
    --overlay0: #6c7086;
    --transition: 0.2s ease;
  }

  :root {
    --container-paddding: 0px !important;
    --container-padding: 0px !important;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: var(--vscode-font-family, 'Segoe UI', system-ui, sans-serif);
    font-size: 13px;
    background: var(--bg);
    color: var(--text);
    height: 100vh;
    display: flex;
    flex-direction: column;
    box-shadow: inset 1px 0 0 var(--border), inset -1px 0 0 var(--border);
  }

  /* ── Header ── */
  .header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .header-title {
    font-size: 14px;
    font-weight: 600;
  }

  .node-badge {
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    color: var(--accent);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .node-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
  }

  /* ── Mode row ── */
  .mode-row {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--text-dim);
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .mode-pills {
    display: flex;
    gap: 4px;
  }

  .mode-pill {
    padding: 4px 16px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    background: color-mix(in srgb, var(--text) 8%, transparent);
    color: var(--text-dim);
    transition: all var(--transition);
  }

  .mode-pill:hover {
    background: color-mix(in srgb, var(--text) 12%, transparent);
  }

  .mode-pill.active {
    font-weight: 600;
  }

  .mode-pill.active[data-mode="plan"] {
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .mode-pill.active[data-mode="ask"] {
    background: color-mix(in srgb, var(--peach) 15%, transparent);
    color: var(--peach);
    border-color: color-mix(in srgb, var(--peach) 40%, transparent);
  }

  .mode-pill.active[data-mode="auto"] {
    background: transparent;
    color: var(--text);
    border-color: var(--surface1);
  }

  .model-badge {
    margin-left: auto;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    color: var(--accent);
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
  }

  /* ── Activity stream ── */
  .stream-header {
    padding: 10px 12px 6px;
    flex-shrink: 0;
  }

  .stream {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stream::-webkit-scrollbar { width: 3px; }
  .stream::-webkit-scrollbar-track { background: transparent; }
  .stream::-webkit-scrollbar-thumb { background: var(--surface1); border-radius: 2px; }

  .empty-state {
    font-size: 12px;
    color: var(--text-dim);
    font-style: italic;
    text-align: center;
    padding: 32px 0;
    opacity: 0.6;
  }

  /* ── Activity cards ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 12px;
    position: relative;
    padding-left: 16px;
  }

  .card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 2px;
    bottom: 2px;
    width: 3px;
    border-radius: 2px;
    background: var(--border);
  }

  .card.agent-start::before { background: var(--accent); }
  .card.write::before { background: var(--success); }
  .card.response::before { background: var(--mauve); }
  .card.checkpoint::before { background: var(--warning); }
  .card.transition::before { background: var(--peach); }

  .card.user {
    background: var(--bg);
    border-color: var(--surface1);
  }
  .card.user::before { display: none; }

  .card.checkpoint {
    background: color-mix(in srgb, var(--warning) 5%, var(--bg));
    border-color: color-mix(in srgb, var(--warning) 20%, transparent);
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .card-badge {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .card-badge.claude {
    background: color-mix(in srgb, var(--mauve) 15%, transparent);
    color: var(--mauve);
  }

  .card-badge.vous {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    color: var(--accent);
  }

  .card-badge.ckpt {
    background: color-mix(in srgb, var(--warning) 15%, transparent);
    color: var(--warning);
  }

  .card-time {
    font-size: 10px;
    color: var(--overlay0);
    flex-shrink: 0;
  }

  .card-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text);
    margin-top: 4px;
  }

  .card-detail {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 2px;
  }

  .card-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .action-btn {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    transition: all var(--transition);
  }

  .action-btn:hover {
    filter: brightness(1.2);
  }

  .action-btn.action-yes {
    border-color: color-mix(in srgb, var(--success) 50%, transparent);
    color: var(--success);
  }

  .action-btn.action-always {
    border-color: color-mix(in srgb, var(--accent) 50%, transparent);
    color: var(--accent);
  }

  .action-btn.action-no {
    border-color: color-mix(in srgb, var(--error) 50%, transparent);
    color: var(--error);
  }

  .card-actions.responded {
    opacity: 0.4;
    pointer-events: none;
  }

  /* ── Input bar ── */
  .input-bar {
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 10px 12px;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
    position: relative;
  }

  .slash-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    color: var(--accent);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background var(--transition);
  }

  .slash-btn:hover {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .input-field {
    flex: 1;
    min-height: 28px;
    max-height: 120px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-family: inherit;
    font-size: 12px;
    padding: 6px 10px;
    outline: none;
    resize: none;
    overflow-y: auto;
    line-height: 1.4;
    transition: border-color var(--transition);
  }

  .input-field::placeholder {
    color: var(--overlay0);
  }

  .input-field:focus {
    border-color: var(--accent);
  }

  .attach-btn, .send-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background var(--transition);
  }

  .attach-btn {
    background: color-mix(in srgb, var(--text) 4%, transparent);
    color: var(--overlay0);
  }

  .attach-btn:hover {
    background: color-mix(in srgb, var(--text) 10%, transparent);
  }

  .send-btn {
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    color: var(--accent);
    width: 36px;
  }

  .send-btn:hover {
    background: color-mix(in srgb, var(--accent) 25%, transparent);
  }

  .send-btn svg, .attach-btn svg {
    width: 14px;
    height: 14px;
  }

  /* ── Slash menu overlay ── */
  .slash-menu {
    display: none;
    position: absolute;
    bottom: 52px;
    left: 8px;
    width: 200px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 0;
    z-index: 100;
  }

  .slash-menu.open { display: block; }

  .slash-menu-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--text-dim);
    text-transform: uppercase;
    padding: 4px 12px 8px;
  }

  .slash-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    cursor: pointer;
    transition: background var(--transition);
  }

  .slash-item:hover {
    background: color-mix(in srgb, var(--text) 4%, transparent);
  }

  .slash-item-cmd {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-dim);
    min-width: 72px;
  }

  .slash-item-desc {
    font-size: 10px;
    color: var(--overlay0);
  }
</style>
</head>
<body>

  <div class="header">
    <span class="header-title">Console</span>
    <span class="node-badge" id="nodeBadge">
      <span class="node-dot"></span>
      <span id="nodeName">—</span>
    </span>
  </div>

  <div class="mode-row">
    <span class="section-label">MODE</span>
    <div class="mode-pills">
      <span class="mode-pill" data-mode="plan">Plan</span>
      <span class="mode-pill active" data-mode="ask">Ask</span>
      <span class="mode-pill" data-mode="auto">Auto</span>
    </div>
    <span class="model-badge">Opus 4</span>
  </div>

  <div class="stream-header">
    <span class="section-label">ACTIVITE</span>
  </div>

  <div class="stream" id="stream">
    <div class="empty-state" id="emptyState">En attente...</div>
  </div>

  <div class="input-bar">
    <div class="slash-menu" id="slashMenu">
      <div class="slash-menu-label">CLAUDE</div>
      <div class="slash-item" data-cmd="/config">
        <span class="slash-item-cmd">/config</span>
        <span class="slash-item-desc">Configuration</span>
      </div>
      <div class="slash-item" data-cmd="/model">
        <span class="slash-item-cmd">/model</span>
        <span class="slash-item-desc">Changer modele</span>
      </div>
      <div class="slash-item" data-cmd="/cost">
        <span class="slash-item-cmd">/cost</span>
        <span class="slash-item-desc">Usage session</span>
      </div>
      <div class="slash-item" data-cmd="/compact">
        <span class="slash-item-cmd">/compact</span>
        <span class="slash-item-desc">Compresser</span>
      </div>
      <div class="slash-item" data-cmd="/clear">
        <span class="slash-item-cmd">/clear</span>
        <span class="slash-item-desc">Nouvelle session</span>
      </div>
      <div class="slash-item" data-cmd="/help">
        <span class="slash-item-cmd">/help</span>
        <span class="slash-item-desc">Aide</span>
      </div>
    </div>

    <button class="slash-btn" id="slashBtn">/</button>

    <textarea class="input-field" id="inputField" rows="1" placeholder="Ecrivez un message..."></textarea>

    <button class="attach-btn" title="Joindre un fichier">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M12 7L7.5 11.5a2.12 2.12 0 01-3-3L9 4a1.41 1.41 0 012 2L6.5 10.5"/>
      </svg>
    </button>

    <button class="send-btn" id="sendBtn" title="Envoyer">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <line x1="8" y1="13" x2="8" y2="3"/>
        <polyline points="4,6 8,2 12,6"/>
      </svg>
    </button>
  </div>

<script>
  const vscode = acquireVsCodeApi();
  const stream = document.getElementById('stream');
  const emptyState = document.getElementById('emptyState');
  const inputField = document.getElementById('inputField');
  const sendBtn = document.getElementById('sendBtn');
  const slashBtn = document.getElementById('slashBtn');
  const slashMenu = document.getElementById('slashMenu');

  const CARD_COLORS = {
    'agent-start': 'var(--accent)',
    'read': 'var(--border)',
    'write': 'var(--success)',
    'response': 'var(--mauve)',
    'user': 'transparent',
    'checkpoint': 'var(--warning)',
    'transition': 'var(--peach)',
  };

  const CARD_BADGES = {
    'response': '<span class="card-badge claude">CLAUDE</span>',
    'user': '<span class="card-badge vous">VOUS</span>',
    'checkpoint': '<span class="card-badge ckpt">CHECKPOINT</span>',
  };

  let cardCount = 0;
  const MAX_CARDS = 50;

  function formatTime(ts) {
    const d = new Date(ts);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function addCard(card) {
    if (emptyState) { emptyState.remove(); }

    const el = document.createElement('div');
    el.className = 'card ' + card.type;

    const badge = CARD_BADGES[card.type] || '';
    const time = formatTime(card.timestamp);
    const detail = card.detail ? '<div class="card-detail">' + escapeHtml(card.detail) + '</div>' : '';

    // Build actions HTML if present
    let actionsHtml = '';
    if (card.actions && card.actions.length > 0) {
      const btnClass = { 'Oui': 'action-yes', 'Toujours': 'action-always', 'Non': 'action-no' };
      actionsHtml = '<div class="card-actions">' +
        card.actions.map(function(a) {
          const cls = btnClass[a.label] || '';
          return '<button class="action-btn ' + cls + '" data-value="' + escapeHtml(a.value) + '">' + escapeHtml(a.label) + '</button>';
        }).join('') +
        '</div>';
    }

    el.innerHTML =
      '<div class="card-top">' + badge + '<span class="card-time">' + time + '</span></div>' +
      '<div class="card-title">' + escapeHtml(card.title) + '</div>' +
      detail + actionsHtml;

    // Bind action buttons
    el.querySelectorAll('.action-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        vscode.postMessage({ type: 'permissionResponse', value: btn.getAttribute('data-value') });
        const actionsDiv = btn.closest('.card-actions');
        if (actionsDiv) { actionsDiv.classList.add('responded'); }
      });
    });

    stream.appendChild(el);
    cardCount++;

    // FIFO: remove oldest if over limit
    while (cardCount > MAX_CARDS) {
      const first = stream.querySelector('.card');
      if (first) { first.remove(); cardCount--; }
      else { break; }
    }

    // Auto-scroll
    stream.scrollTop = stream.scrollHeight;
  }

  function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function sendCommand(text) {
    if (!text || !text.trim()) { return; }
    const cmd = text.trim();
    // Add user card locally
    addCard({
      id: 'user-' + Date.now(),
      type: 'user',
      timestamp: Date.now(),
      title: cmd,
    });
    // Send to extension
    vscode.postMessage({ type: 'consoleCommand', command: cmd });
    // Force-clear the input field
    resetTextarea();
    requestAnimationFrame(() => {
      inputField.focus();
    });
  }

  // ── Textarea auto-resize ──
  inputField.addEventListener('input', () => {
    inputField.style.height = 'auto';
    inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
  });

  function resetTextarea() {
    inputField.value = '';
    inputField.style.height = 'auto';
  }

  // ── Input handlers ──
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      const text = inputField.value;
      resetTextarea();
      sendCommand(text);
    }
  });

  sendBtn.addEventListener('click', () => {
    const text = inputField.value;
    resetTextarea();
    sendCommand(text);
  });

  // ── Slash menu ──
  slashBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    slashMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!slashMenu.contains(e.target) && e.target !== slashBtn) {
      slashMenu.classList.remove('open');
    }
  });

  document.querySelectorAll('.slash-item').forEach((item) => {
    item.addEventListener('click', () => {
      const cmd = item.getAttribute('data-cmd');
      sendCommand(cmd);
      slashMenu.classList.remove('open');
    });
  });

  // ── Mode pills ──
  document.querySelectorAll('.mode-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.mode-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // ── Messages from extension ──
  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg.type === 'addCard') {
      addCard(msg.card);
    }
    if (msg.type === 'setActiveNode') {
      document.getElementById('nodeName').textContent = msg.label || '—';
    }
    if (msg.type === 'setMode') {
      document.querySelectorAll('.mode-pill').forEach(p => p.classList.remove('active'));
      const target = document.querySelector('.mode-pill[data-mode="' + msg.mode + '"]');
      if (target) { target.classList.add('active'); }
    }
  });
</script>
</body>
</html>`;
}
