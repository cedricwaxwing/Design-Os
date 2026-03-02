import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parseProject, parseMermaidFlow, layoutFlowNodes, parseMemoryEntries } from './parser';
import { loadReadiness, saveReadinessSnapshot } from './readiness';
import { FlowNode, FlowEdge, ConsoleCard } from './types';
import { GraphData } from './types-legacy';
import { ConsoleViewProvider } from './console-webview';
import { Artifact } from './prototyper-webview';

let currentPanel: vscode.WebviewPanel | undefined;
let extensionContext: vscode.ExtensionContext;
let consoleProvider: ConsoleViewProvider;
let claudeTerminal: vscode.Terminal | undefined;
let prototyperArtifacts: Artifact[] = [];
let lastActiveSkill: string = '';
let lastMemoryIds: Set<string> = new Set();
let knownArtifactPaths: Set<string> = new Set();
let webviewReady = false;
let pendingMessages: Record<string, unknown>[] = [];
let currentGraphData: GraphData | null = null;

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  // Register the command to open the navigator
  const openCmd = vscode.commands.registerCommand('designOs.openNavigator', () => {
    openNavigator(context);
  });
  context.subscriptions.push(openCmd);

  // Register Console panel
  consoleProvider = new ConsoleViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('designOsConsole', consoleProvider)
  );

  // Handle Console commands (dispatched from resolveWebviewView)
  consoleProvider.onCommand((command) => runSlashCommand(command));

  // Handle permission responses from Console
  consoleProvider.onPermission((value) => {
    if (claudeTerminal) {
      claudeTerminal.sendText(value, false);
      setTimeout(() => claudeTerminal?.sendText('\r', false), 100);
    }
  });

  // Start hooks bridge to capture Claude activity
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (root) {
    const bridgeWatcher = setupHooksBridge(root);
    if (bridgeWatcher) {
      context.subscriptions.push({ dispose: () => bridgeWatcher.close() });
    }
  }

  // Clean up terminal reference when user closes it
  context.subscriptions.push(
    vscode.window.onDidCloseTerminal((terminal) => {
      if (terminal === claudeTerminal) {
        claudeTerminal = undefined;
      }
    })
  );

  // Auto-open hint in status bar
  const statusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusItem.text = '$(compass) Design OS';
  statusItem.tooltip = 'Open Design Os';
  statusItem.command = 'designOs.openNavigator';
  statusItem.show();
  context.subscriptions.push(statusItem);

  // Watch for file changes and refresh the panel
  const watcher = vscode.workspace.createFileSystemWatcher('{**/*.md,.claude/readiness.json}');
  let lastGlobalScore: number | null = null;

  const refresh = (uri: vscode.Uri) => {
    if (!currentPanel) { return; }
    // Activity Log: sync memory.md entries to Prototyper feed
    if (uri.fsPath.endsWith('memory.md')) {
      const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (root) { syncMemoryToFeed(root); }
    }
    // Snapshot readiness history + notify when readiness.json changes
    if (uri.fsPath.endsWith('readiness.json') && !uri.fsPath.endsWith('readiness-history.json')) {
      const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (root) {
        const rd = loadReadiness(root);
        if (rd) {
          saveReadinessSnapshot(root, rd);
          // Notify webview of readiness change
          if (lastGlobalScore !== null && rd.globalScore !== lastGlobalScore) {
            currentPanel.webview.postMessage({
              type: 'readinessChanged',
              globalScore: rd.globalScore,
              previousScore: lastGlobalScore,
              updatedBy: rd.updatedBy || '',
            });
          }
          lastGlobalScore = rd.globalScore;
        }
      }
    }
    updateGraphData();
  };
  watcher.onDidChange(refresh);
  watcher.onDidCreate(refresh);
  watcher.onDidDelete(refresh);
  context.subscriptions.push(watcher);

  // Auto-open on first activation for this workspace
  const workspaceId = vscode.workspace.workspaceFolders?.[0]?.uri.toString() || 'default';
  const stateKey = `designOs.autoOpened.${workspaceId}`;
  const alreadyOpened = context.globalState.get<boolean>(stateKey, false);

  if (!alreadyOpened) {
    // Small delay to let the editor finish loading
    setTimeout(() => {
      openNavigator(context);
      context.globalState.update(stateKey, true);
    }, 1500);
  }
}

function openNavigator(context: vscode.ExtensionContext) {
  // If panel exists, reveal it and send updated data (no HTML reset)
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Beside);
    updateGraphData();
    return;
  }

  // Create webview panel
  currentPanel = vscode.window.createWebviewPanel(
    'designOsNavigator',
    'Design Os',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, 'webview', 'dist')),
      ],
    }
  );

  // Set initial HTML content (only once)
  initializePanel();

  // Activity Log: load existing artifacts and memory entries at startup
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot) {
    const contextPath = path.join(workspaceRoot, '.claude', 'context.md');
    let mod = '';
    if (fs.existsSync(contextPath)) {
      const ctxContent = fs.readFileSync(contextPath, 'utf-8');
      const modMatch = ctxContent.match(/^module:\s*(.+)$/m);
      if (modMatch) { mod = modMatch[1].trim(); }
    }
    loadExistingArtifacts(workspaceRoot, mod);
    syncMemoryToFeed(workspaceRoot);
  }

  // Handle messages from the webview
  currentPanel.webview.onDidReceiveMessage(
    (message) => {
      switch (message.type) {
        case 'runCommand':
          runSlashCommand(message.command);
          // Route to Console: show as user card
          consoleProvider.addCard({
            id: 'nav-' + Date.now(),
            type: 'user',
            timestamp: Date.now(),
            title: message.command,
            detail: 'via Navigator',
          });
          break;
        case 'launchConsole': {
          const cli = message.cli || 'claude';
          const { terminal } = getOrCreateClaudeTerminal(cli);
          terminal.show(false); // false = take focus so the terminal panel becomes visible
          break;
        }
        case 'openFile':
          openFile(message.path);
          break;
        case 'previewFile':
          previewFile(message.path);
          break;
        case 'openFlowPreview':
          openFlowPreview(message.path);
          break;
        case 'saveSectionOrder':
          context.globalState.update('designOs.sectionOrder', message.order);
          break;
        // ── Prototyper messages ──
        case 'copyArtifact':
          handleCopyArtifact(message.id);
          break;
        case 'exportArtifact':
          handleExportArtifact(message.id, message.format);
          break;
        case 'deleteArtifact':
          handleDeleteArtifact(message.id);
          break;
        case 'pinArtifact':
          handlePinArtifact(message.id);
          break;
        case 'regenerateArtifact':
          handleRegenerateArtifact(message.id, message.mode, message.prompt);
          break;
        case 'editArtifact':
          handleEditArtifact(message.id, message.content);
          break;
        case 'webviewReady':
          webviewReady = true;
          // Send graph data to React app
          if (currentGraphData) {
            currentPanel?.webview.postMessage({ type: 'graphData', data: currentGraphData });
          }
          // Flush non-artifact buffered messages
          for (const msg of pendingMessages) {
            if (msg.type !== 'addArtifact') {
              currentPanel?.webview.postMessage(msg);
            }
          }
          pendingMessages = [];
          // Send full artifact list as a single batch
          if (prototyperArtifacts.length > 0) {
            currentPanel?.webview.postMessage({
              type: 'setArtifacts',
              artifacts: prototyperArtifacts
            });
          }
          break;
      }
    },
    undefined,
    context.subscriptions
  );

  // Clean up on close
  currentPanel.onDidDispose(
    () => {
      currentPanel = undefined;
      webviewReady = false;
      pendingMessages = [];
    },
    undefined,
    context.subscriptions
  );
}

/** Set the webview HTML once (called only on panel creation). */
function initializePanel() {
  if (!currentPanel) { return; }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    currentPanel.webview.html = getErrorHtml('No workspace folder open');
    return;
  }

  const root = workspaceFolders[0].uri.fsPath;

  try {
    const data = parseProject(root);
    data.sectionOrder = extensionContext.globalState.get<string[]>('designOs.sectionOrder');
    currentGraphData = data;

    // Load Vite-built React webview
    const distPath = path.join(extensionContext.extensionPath, 'webview', 'dist');
    const htmlPath = path.join(distPath, 'index.html');

    if (!fs.existsSync(htmlPath)) {
      currentPanel.webview.html = getErrorHtml(
        'Webview not built. Run: npm run compile:webview'
      );
      return;
    }

    let html = fs.readFileSync(htmlPath, 'utf-8');

    // Convert asset paths to webview URIs
    const distUri = currentPanel.webview.asWebviewUri(
      vscode.Uri.file(distPath)
    );
    html = html.replace(/src="\/assets\//g, `src="${distUri}/assets/`);
    html = html.replace(/href="\/assets\//g, `href="${distUri}/assets/`);

    // Remove crossorigin attributes (incompatible with webview URIs)
    html = html.replace(/ crossorigin/g, '');

    // Update CSP to allow loading from webview URI
    const cspSource = currentPanel.webview.cspSource;
    html = html.replace(
      /content="default-src 'none';[^"]*"/,
      `content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src ${cspSource} 'unsafe-inline'; img-src ${cspSource} data: https:; font-src ${cspSource}; frame-src blob: data: 'self';"`
    );

    // Inject initialData before </head>
    const dataJson = JSON.stringify(data).replace(/</g, '\\u003c');
    html = html.replace(
      '</head>',
      `<script>window.initialData = ${dataJson};</script>\n</head>`
    );

    webviewReady = false;
    pendingMessages = [];
    currentPanel.webview.html = html;
  } catch (err) {
    currentPanel.webview.html = getErrorHtml(
      `Error loading webview: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/** Send updated graph data via postMessage (no HTML reset, preserves React state). */
function updateGraphData() {
  if (!currentPanel) { return; }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) { return; }

  const root = workspaceFolders[0].uri.fsPath;

  try {
    const data = parseProject(root);
    data.sectionOrder = extensionContext.globalState.get<string[]>('designOs.sectionOrder');
    currentGraphData = data;

    if (webviewReady) {
      currentPanel.webview.postMessage({ type: 'graphData', data });
    }
  } catch (err) {
    console.error('Failed to update graph data:', err);
  }
}

function getOrCreateClaudeTerminal(cli: string = 'claude'): { terminal: vscode.Terminal; isNew: boolean } {
  const termName = `Design OS (${cli})`;
  // Reuse existing terminal with same name if still alive
  if (claudeTerminal && claudeTerminal.name === termName && vscode.window.terminals.includes(claudeTerminal)) {
    return { terminal: claudeTerminal, isNew: false };
  }
  // Look for any terminal with this name
  const found = vscode.window.terminals.find(t => t.name === termName);
  if (found) {
    claudeTerminal = found;
    return { terminal: found, isNew: false };
  }
  // Create a new terminal, show it immediately, and start the chosen CLI
  claudeTerminal = vscode.window.createTerminal({ name: termName, isTransient: false });
  claudeTerminal.show(false); // false = take focus, so user sees the terminal
  claudeTerminal.sendText(cli, true);
  return { terminal: claudeTerminal, isNew: true };
}

// ── Prototyper Handlers ──

function postToPanel(message: Record<string, unknown>) {
  if (!currentPanel) { return; }
  if (webviewReady) {
    currentPanel.webview.postMessage(message);
  } else {
    pendingMessages.push(message);
  }
}

function handleCopyArtifact(id: string) {
  const artifact = prototyperArtifacts.find(a => a.id === id);
  if (artifact) {
    vscode.env.clipboard.writeText(artifact.content);
    postToPanel({ type: 'protoToast', message: `"${artifact.title}" copié !`, toastType: 'success' });
  }
}

function handleExportArtifact(id: string, format?: string) {
  const artifact = prototyperArtifacts.find(a => a.id === id);
  if (!artifact) { return; }

  const ext = format || (artifact.type === 'doc' ? 'md' : artifact.type);
  const filename = artifact.title.toLowerCase().replace(/[^a-z0-9]/g, '-');

  vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(`${filename}.${ext}`),
    filters: { [ext.toUpperCase()]: [ext] }
  }).then(uri => {
    if (uri) {
      const fs = require('fs');
      fs.writeFileSync(uri.fsPath, artifact.content);
      postToPanel({ type: 'protoToast', message: `Exporté : ${uri.fsPath}`, toastType: 'success' });
    }
  });
}

function handleDeleteArtifact(id: string) {
  const artifact = prototyperArtifacts.find(a => a.id === id);
  prototyperArtifacts = prototyperArtifacts.filter(a => a.id !== id);
  postToPanel({ type: 'removeArtifact', id });
  if (artifact) {
    postToPanel({ type: 'protoToast', message: `"${artifact.title}" supprimé`, toastType: 'error' });
  }
}

function handlePinArtifact(id: string) {
  const artifact = prototyperArtifacts.find(a => a.id === id);
  if (artifact) {
    artifact.isPinned = !artifact.isPinned;
    postToPanel({ type: 'updateArtifact', artifact });
    postToPanel({
      type: 'protoToast',
      message: artifact.isPinned ? `"${artifact.title}" épinglé !` : `"${artifact.title}" désépinglé`,
      toastType: artifact.isPinned ? 'success' : 'warning'
    });
  }
}

function handleRegenerateArtifact(id: string, mode: 'same' | 'prompt' | 'variant', _prompt?: string) {
  const artifact = prototyperArtifacts.find(a => a.id === id);
  if (!artifact) { return; }

  postToPanel({ type: 'setLoading', id, loading: true });

  // TODO: Use _prompt when integrating Claude API for actual regeneration
  setTimeout(() => {
    postToPanel({ type: 'setLoading', id, loading: false });
    postToPanel({
      type: 'protoToast',
      message: mode === 'variant'
        ? `Variante de "${artifact.title}" générée !`
        : `"${artifact.title}" régénéré !`,
      toastType: 'success'
    });
  }, 2000);
}

function handleEditArtifact(id: string, newContent: string) {
  const artifact = prototyperArtifacts.find(a => a.id === id);
  if (artifact) {
    artifact.content = newContent;
    postToPanel({ type: 'updateArtifact', artifact });
    postToPanel({ type: 'protoToast', message: `"${artifact.title}" sauvegardé !`, toastType: 'success' });
  }
}

/** Public helper: add an artifact from outside (e.g., from Console command) */
export function addPrototyperArtifact(artifact: Artifact) {
  prototyperArtifacts.push(artifact);
  postToPanel({ type: 'addArtifact', artifact });
}

// ── Activity Log: hooks bridge → artifacts ──

/** Derive artifact type from file extension. */
function artifactTypeFromExt(ext: string): 'doc' | 'svg' | 'html' | null {
  if (ext === '.svg') { return 'svg'; }
  if (ext === '.html' || ext === '.htm') { return 'html'; }
  if (ext === '.md' || ext === '.txt') { return 'doc'; }
  return null;
}

/** Derive phase from file path. */
function phaseFromPath(filePath: string): 'spec' | 'design' | 'prototype' {
  const lower = filePath.toLowerCase();
  if (lower.includes('specs/') || lower.includes('spec') || lower.includes('discovery') || lower.includes('strategy')) { return 'spec'; }
  if (lower.includes('screens/') || lower.includes('wireframes/') || lower.includes('design system') || lower.includes('journeys')) { return 'design'; }
  return 'prototype';
}

/** Check if a file path is relevant for the activity log. */
function isRelevantPath(filePath: string): boolean {
  return filePath.includes('01_Product') || filePath.includes('02_Build') || filePath.includes('04_Lab');
}

/** Convert a Write/Edit hook event into a Prototyper artifact. */
function hookEventToArtifact(data: Record<string, unknown>): void {
  const event = data.hook_event_name as string;
  if (event !== 'PostToolUse') { return; }

  const tool = (data.tool_name as string) || '';
  const input = (data.tool_input as Record<string, unknown>) || {};

  // Track active skill
  if (tool === 'Skill') {
    lastActiveSkill = '/' + ((input.skill as string) || 'unknown');
    return;
  }

  // Only process Write and Edit tools
  if (tool !== 'Write' && tool !== 'Edit') { return; }

  const filePath = (input.file_path as string) || '';
  if (!filePath) { return; }

  // Filter by extension
  const ext = path.extname(filePath).toLowerCase();
  const artType = artifactTypeFromExt(ext);
  if (!artType) { return; }

  // Filter by relevant directories
  if (!isRelevantPath(filePath)) { return; }

  // Deduplicate: don't re-add if already tracked
  if (knownArtifactPaths.has(filePath)) {
    // Update existing artifact content
    const existing = prototyperArtifacts.find(a => a.id === 'file-' + filePath);
    if (existing) {
      try {
        existing.content = fs.readFileSync(filePath, 'utf-8');
        existing.skill = lastActiveSkill || existing.skill;
        postToPanel({ type: 'updateArtifact', artifact: existing });
      } catch { /* file might be gone */ }
    }
    return;
  }

  // Read file content
  let content = '';
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > 512 * 1024) { return; } // skip files > 512KB
    content = fs.readFileSync(filePath, 'utf-8');
  } catch { return; }

  const artifact: Artifact = {
    id: 'file-' + filePath,
    title: path.basename(filePath),
    type: artType,
    content,
    isPinned: false,
    createdAt: Date.now(),
    phase: phaseFromPath(filePath),
    skill: lastActiveSkill || 'manual',
  };

  knownArtifactPaths.add(filePath);
  addPrototyperArtifact(artifact);
}

/** Sync memory.md entries into the Prototyper feed. */
function syncMemoryToFeed(root: string): void {
  const entries = parseMemoryEntries(root);
  for (const entry of entries) {
    if (lastMemoryIds.has(entry.id)) { continue; }
    lastMemoryIds.add(entry.id);

    const artifact: Artifact = {
      id: 'memory-' + entry.id,
      title: entry.title,
      type: 'doc',
      content: entry.content,
      isPinned: false,
      createdAt: Date.parse(entry.date.replace(' ', 'T') + ':00Z') || Date.now(),
      phase: 'spec',
      skill: entry.agent,
    };

    addPrototyperArtifact(artifact);
  }
}

/** Load existing project files as artifacts at startup. */
function loadExistingArtifacts(root: string, mod: string): void {
  if (!mod) { return; }

  const dirs = [
    path.join(root, '01_Product', '04 Specs', mod, 'screens'),
    path.join(root, '01_Product', '04 Specs', mod, 'wireframes'),
    path.join(root, '01_Product', '04 Specs', mod, 'specs'),
    path.join(root, '01_Product', '03 User Journeys'),
    path.join(root, '02_Build', mod, 'src'),
    path.join(root, '04_Lab', mod),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) { continue; }
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { continue; }

    for (const entry of entries) {
      if (!entry.isFile() || entry.name.startsWith('_') || entry.name.startsWith('.')) { continue; }

      const filePath = path.join(dir, entry.name);
      const ext = path.extname(entry.name).toLowerCase();
      const artType = artifactTypeFromExt(ext);
      if (!artType) { continue; }
      if (knownArtifactPaths.has(filePath)) { continue; }

      let content = '';
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 512 * 1024) { continue; }
        content = fs.readFileSync(filePath, 'utf-8');
      } catch { continue; }

      // Skip empty files — they render as invisible border lines in the feed
      if (!content.trim()) { continue; }

      const artifact: Artifact = {
        id: 'file-' + filePath,
        title: entry.name,
        type: artType,
        content,
        isPinned: false,
        createdAt: fs.statSync(filePath).mtimeMs,
        phase: phaseFromPath(filePath),
        skill: 'initial',
      };

      knownArtifactPaths.add(filePath);
      addPrototyperArtifact(artifact);
    }
  }
}

function runSlashCommand(command: string) {
  const { terminal, isNew } = getOrCreateClaudeTerminal();

  // Claude Code uses Ink in raw mode — PTY buffering means we must
  // split the text and the CR into two separate sendText() calls
  // with a delay to force PTY flush between them.
  const sendWithSubmit = () => {
    terminal.sendText(command, false);          // Step 1: type the text
    setTimeout(() => {
      terminal.sendText('\r', false);           // Step 2: press Enter (after PTY flush)
    }, 100);
  };

  if (isNew) {
    setTimeout(sendWithSubmit, 3000);           // Wait for Claude CLI to boot
  } else {
    sendWithSubmit();
  }
}

function openFile(filePath: string) {
  const uri = vscode.Uri.file(filePath);
  vscode.window.showTextDocument(uri, { preview: true });
}

function previewFile(filePath: string) {
  if (!currentPanel) { return; }

  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  const previewable = ext === '.svg' || ext === '.html' || ext === '.htm';

  let content: string | null = null;
  if (previewable) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > 512 * 1024) {
        // Too large, skip preview
        currentPanel.webview.postMessage({
          type: 'filePreview', path: filePath, fileName,
          fileType: ext.replace('.', ''), content: null, previewable: false,
        });
        return;
      }
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      content = null;
    }
  }

  currentPanel.webview.postMessage({
    type: 'filePreview',
    path: filePath,
    fileName,
    fileType: ext.replace('.', ''),
    content,
    previewable: previewable && content !== null,
  });
}

function openFlowPreview(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)```/);
  if (!mermaidMatch) {
    vscode.window.showWarningMessage('Aucun diagramme Mermaid trouvé dans ce fichier.');
    return;
  }

  const parsed = parseMermaidFlow(mermaidMatch[1]);
  layoutFlowNodes(parsed.nodes, parsed.edges, parsed.direction);

  const flowName = path.basename(filePath, '.md').replace(/^flow-/, '');
  const panel = vscode.window.createWebviewPanel(
    'designOsFlow',
    `Flow — ${flowName}`,
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: false }
  );

  panel.webview.html = getFlowWebviewContent(parsed.nodes, parsed.edges, flowName, parsed.direction);
}

function getFlowWebviewContent(nodes: FlowNode[], edges: FlowEdge[], title: string, direction: string): string {
  const nodesJson = JSON.stringify(nodes).replace(/</g, '\\u003c');
  const edgesJson = JSON.stringify(edges).replace(/</g, '\\u003c');

  // Calculate canvas bounds
  let maxX = 0, maxY = 0;
  for (const n of nodes) {
    if ((n.x || 0) + 180 > maxX) maxX = (n.x || 0) + 180;
    if ((n.y || 0) + 70 > maxY) maxY = (n.y || 0) + 70;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Flow — ${title}</title>
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
      --node-radius: 10px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family, 'Segoe UI', system-ui, sans-serif);
      font-size: 13px; background: var(--bg); color: var(--text);
      overflow: hidden; height: 100vh;
    }
    .flow-header {
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 12px;
      background: var(--surface);
    }
    .flow-title { font-size: 14px; font-weight: 600; }
    .flow-direction {
      font-size: 10px; color: var(--text-dim);
      background: color-mix(in srgb, var(--text) 8%, transparent);
      padding: 2px 8px; border-radius: 4px;
    }
    .flow-legend {
      margin-left: auto; display: flex; gap: 12px; font-size: 10px;
    }
    .flow-legend-item { display: flex; align-items: center; gap: 4px; color: var(--text-dim); }
    .flow-legend-dot { width: 10px; height: 10px; border-radius: 3px; }
    .flow-canvas {
      width: 100%; height: calc(100vh - 42px);
      overflow: auto; position: relative; cursor: grab;
    }
    .flow-canvas.panning { cursor: grabbing; }
    .flow-container {
      position: relative;
      width: ${maxX + 80}px; height: ${maxY + 80}px;
      min-width: 100%; min-height: 100%;
    }
    .flow-edges { position: absolute; top: 0; left: 0; pointer-events: none; }
    .flow-node {
      position: absolute; width: 160px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--node-radius); padding: 12px 14px;
      cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
      z-index: 1;
    }
    .flow-node:hover { border-color: var(--accent); box-shadow: 0 0 12px rgba(137,180,250,0.15); }
    .flow-node.selected { border-color: var(--accent); box-shadow: 0 0 16px rgba(137,180,250,0.25); }
    .flow-node.type-screen { border-left: 3px solid var(--accent); }
    .flow-node.type-decision {
      border-left: 3px solid var(--warning);
      border-radius: 4px; transform: rotate(0deg);
    }
    .flow-node.type-terminal { border-left: 3px solid var(--success); border-radius: 20px; }
    .flow-node.type-error { border-left: 3px solid var(--error); }
    .flow-node-id { font-size: 10px; color: var(--text-dim); font-weight: 600; margin-bottom: 2px; }
    .flow-node-label { font-size: 12px; font-weight: 500; }
    .flow-edge-label {
      position: absolute; z-index: 2;
      font-size: 9px; color: var(--text-dim);
      background: var(--bg); padding: 1px 5px;
      border-radius: 3px; pointer-events: none; white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="flow-header">
    <span class="flow-title">\\u25C6 ${title}</span>
    <span class="flow-direction">${direction}</span>
    <div class="flow-legend">
      <span class="flow-legend-item"><span class="flow-legend-dot" style="background:var(--accent)"></span>Ecran</span>
      <span class="flow-legend-item"><span class="flow-legend-dot" style="background:var(--warning)"></span>Decision</span>
      <span class="flow-legend-item"><span class="flow-legend-dot" style="background:var(--success)"></span>Terminal</span>
      <span class="flow-legend-item"><span class="flow-legend-dot" style="background:var(--error)"></span>Erreur</span>
    </div>
  </div>
  <div class="flow-canvas" id="canvas">
    <div class="flow-container" id="container">
      <svg class="flow-edges" id="edges" width="${maxX + 80}" height="${maxY + 80}"></svg>
    </div>
  </div>
  <script>
    var nodes = ${nodesJson};
    var edges = ${edgesJson};

    var container = document.getElementById('container');
    var svg = document.getElementById('edges');
    var selectedId = null;

    // Render nodes
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var div = document.createElement('div');
      div.className = 'flow-node type-' + n.type;
      div.style.left = (n.x || 0) + 'px';
      div.style.top = (n.y || 0) + 'px';
      if (n.color) div.style.borderLeftColor = n.color;
      div.setAttribute('data-id', n.id);
      div.innerHTML = '<div class="flow-node-id">' + n.id + '</div>' +
        '<div class="flow-node-label">' + n.label + '</div>';
      div.addEventListener('click', (function(nodeId) {
        return function() {
          document.querySelectorAll('.flow-node.selected').forEach(function(el) { el.classList.remove('selected'); });
          if (selectedId === nodeId) { selectedId = null; }
          else { this.classList.add('selected'); selectedId = nodeId; }
        };
      })(n.id));
      container.appendChild(div);
    }

    // Render edges (bezier curves)
    var nodeW = 160, nodeH = 50;
    for (var j = 0; j < edges.length; j++) {
      var e = edges[j];
      var fromNode = nodes.find(function(n) { return n.id === e.from; });
      var toNode = nodes.find(function(n) { return n.id === e.to; });
      if (!fromNode || !toNode) continue;

      var fx = (fromNode.x || 0) + nodeW;
      var fy = (fromNode.y || 0) + nodeH / 2 + 10;
      var tx = (toNode.x || 0);
      var ty = (toNode.y || 0) + nodeH / 2 + 10;

      var dx = Math.abs(tx - fx);
      var cpx = Math.max(dx * 0.4, 40);

      var pathD = 'M ' + fx + ' ' + fy +
        ' C ' + (fx + cpx) + ' ' + fy + ', ' + (tx - cpx) + ' ' + ty + ', ' + tx + ' ' + ty;

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'var(--border)');
      path.setAttribute('stroke-width', '1.5');

      // Arrow
      var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      var ax = tx - 1, ay = ty;
      arrow.setAttribute('points',
        (ax - 6) + ',' + (ay - 4) + ' ' + ax + ',' + ay + ' ' + (ax - 6) + ',' + (ay + 4));
      arrow.setAttribute('fill', 'var(--border)');

      svg.appendChild(path);
      svg.appendChild(arrow);

      // Edge label
      if (e.label) {
        var labelDiv = document.createElement('div');
        labelDiv.className = 'flow-edge-label';
        labelDiv.textContent = e.label;
        labelDiv.style.left = ((fx + tx) / 2 - 20) + 'px';
        labelDiv.style.top = ((fy + ty) / 2 - 10) + 'px';
        container.appendChild(labelDiv);
      }
    }

    // Pan navigation (Space + drag or middle-click drag)
    var canvas = document.getElementById('canvas');
    var isPanning = false, panStartX = 0, panStartY = 0, scrollStartX = 0, scrollStartY = 0;
    var spaceDown = false;

    document.addEventListener('keydown', function(e) { if (e.code === 'Space') { spaceDown = true; canvas.style.cursor = 'grab'; } });
    document.addEventListener('keyup', function(e) { if (e.code === 'Space') { spaceDown = false; if (!isPanning) canvas.style.cursor = ''; } });

    canvas.addEventListener('mousedown', function(e) {
      if (spaceDown || e.button === 1 || e.button === 2) {
        isPanning = true;
        panStartX = e.clientX; panStartY = e.clientY;
        scrollStartX = canvas.scrollLeft; scrollStartY = canvas.scrollTop;
        canvas.classList.add('panning');
        e.preventDefault();
      }
    });
    document.addEventListener('mousemove', function(e) {
      if (isPanning) {
        canvas.scrollLeft = scrollStartX - (e.clientX - panStartX);
        canvas.scrollTop = scrollStartY - (e.clientY - panStartY);
      }
    });
    document.addEventListener('mouseup', function() {
      isPanning = false;
      canvas.classList.remove('panning');
      if (!spaceDown) canvas.style.cursor = '';
    });
    canvas.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  </script>
</body>
</html>`;
}

function getErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: var(--vscode-font-family, system-ui);
      color: var(--vscode-editor-foreground, #cdd6f4);
      background: var(--vscode-editor-background, #1e1e2e);
    }
    .error {
      text-align: center;
      padding: 40px;
    }
    .error h2 { margin-bottom: 8px; font-size: 16px; }
    .error p { color: var(--vscode-descriptionForeground, #a6adc8); font-size: 13px; }
  </style>
</head>
<body>
  <div class="error">
    <h2>Design Os</h2>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

export function deactivate() {
  if (currentPanel) {
    currentPanel.dispose();
  }
}

// ── Hooks Bridge: watch .claude/console-bridge.jsonl for Claude activity ──

function setupHooksBridge(root: string): fs.FSWatcher | null {
  const bridgePath = path.join(root, '.claude', 'console-bridge.jsonl');

  // Ensure dir + file exist, truncate on fresh start
  const bridgeDir = path.join(root, '.claude');
  if (!fs.existsSync(bridgeDir)) { fs.mkdirSync(bridgeDir, { recursive: true }); }
  fs.writeFileSync(bridgePath, '');

  let lastSize = 0;

  const watcher = fs.watch(bridgePath, (event) => {
    if (event !== 'change') { return; }
    let stats: fs.Stats;
    try { stats = fs.statSync(bridgePath); } catch { return; }
    if (stats.size <= lastSize) { lastSize = stats.size; return; }

    // Read only the new bytes
    const buf = Buffer.alloc(stats.size - lastSize);
    const fd = fs.openSync(bridgePath, 'r');
    fs.readSync(fd, buf, 0, buf.length, lastSize);
    fs.closeSync(fd);
    lastSize = stats.size;

    const raw = buf.toString('utf-8');
    // Try newline-separated first, fallback to concatenated JSON `}{`
    let lines = raw.split('\n').filter(l => l.trim());
    if (lines.length <= 1 && raw.includes('}{')) {
      lines = raw.split(/\}\s*\{/).map((s, i, arr) => {
        if (i > 0) { s = '{' + s; }
        if (i < arr.length - 1) { s = s + '}'; }
        return s;
      }).filter(l => l.trim());
    }
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        const card = hookEventToCard(data);
        if (card) { consoleProvider.addCard(card); }
        // Activity Log: convert file writes to Prototyper artifacts
        hookEventToArtifact(data);
        // Sync mode pill from hook event
        const mode = data.permission_mode as string | undefined;
        if (mode && consoleProvider.view) {
          consoleProvider.view.webview.postMessage({ type: 'setMode', mode });
        }
      } catch { /* malformed line, skip */ }
    }
  });

  return watcher;
}

function hookEventToCard(data: Record<string, unknown>): ConsoleCard | null {
  const ts = Date.now();
  const event = data.hook_event_name as string;

  if (event === 'PostToolUse') {
    const tool = (data.tool_name as string) || 'unknown';
    const input = (data.tool_input as Record<string, unknown>) || {};

    if (tool === 'Read' || tool === 'Glob' || tool === 'Grep') {
      const target = (input.file_path || input.pattern || input.path || '') as string;
      return { id: 'h-' + ts, type: 'read', timestamp: ts, title: path.basename(target) || tool, detail: target };
    }
    if (tool === 'Write' || tool === 'Edit') {
      const fp = (input.file_path || '') as string;
      return { id: 'h-' + ts, type: 'write', timestamp: ts, title: `${tool}: ${path.basename(fp)}`, detail: fp };
    }
    if (tool === 'Bash') {
      const cmd = (input.command || '') as string;
      const response = data.tool_response as Record<string, unknown> | undefined;
      const stderr = (response?.stderr || '') as string;
      const hasError = stderr.length > 0;
      return {
        id: 'h-' + ts,
        type: hasError ? 'checkpoint' as const : 'agent-start' as const,
        timestamp: ts,
        title: `$ ${cmd.substring(0, 80)}${cmd.length > 80 ? '...' : ''}`,
        detail: hasError ? `Erreur: ${stderr.substring(0, 100)}` : undefined,
      };
    }
    // Skills — show skill name
    if (tool === 'Skill') {
      const skillName = (input.skill || 'unknown') as string;
      return { id: 'h-' + ts, type: 'agent-start', timestamp: ts, title: `/${skillName}` };
    }
    // Other tools (Task, WebSearch, etc.)
    return { id: 'h-' + ts, type: 'agent-start', timestamp: ts, title: tool };
  }

  if (event === 'Stop') {
    // The Stop event doesn't include response text — read from transcript file
    const transcriptPath = data.transcript_path as string;
    if (!transcriptPath) { return null; }

    try {
      const content = fs.readFileSync(transcriptPath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());

      // Walk backwards to find the last assistant message with text content
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const entry = JSON.parse(lines[i]);
          if (entry.type === 'assistant' && Array.isArray(entry.message?.content)) {
            const textBlock = entry.message.content.find(
              (c: { type: string; text?: string }) => c.type === 'text' && c.text
            );
            if (textBlock) {
              const msg = textBlock.text as string;
              return {
                id: 'h-' + ts,
                type: 'response' as const,
                timestamp: ts,
                title: msg.substring(0, 150) + (msg.length > 150 ? '...' : ''),
              };
            }
          }
        } catch { /* malformed line */ }
      }
    } catch { /* can't read transcript */ }

    return null;
  }

  if (event === 'Notification') {
    const msg = (data.message || 'Notification') as string;
    const isPermission = msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('proceed');
    return {
      id: 'h-' + ts,
      type: 'checkpoint' as const,
      timestamp: ts,
      title: msg,
      actions: isPermission ? [
        { label: 'Oui', value: '1' },
        { label: 'Toujours', value: '2' },
        { label: 'Non', value: '\x1b' },
      ] : undefined,
    };
  }

  return null;
}
