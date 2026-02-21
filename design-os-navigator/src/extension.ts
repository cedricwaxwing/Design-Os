import * as vscode from 'vscode';
import { parseProject } from './parser';
import { getWebviewContent } from './webview';

let currentPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Register the command to open the navigator
  const openCmd = vscode.commands.registerCommand('designOs.openNavigator', () => {
    openNavigator(context);
  });
  context.subscriptions.push(openCmd);

  // Auto-open hint in status bar
  const statusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusItem.text = '$(compass) Design OS';
  statusItem.tooltip = 'Open Design OS Navigator';
  statusItem.command = 'designOs.openNavigator';
  statusItem.show();
  context.subscriptions.push(statusItem);

  // Watch for file changes and refresh the panel
  const watcher = vscode.workspace.createFileSystemWatcher('{**/*.md,.claude/readiness.json}');
  const refresh = () => {
    if (currentPanel) {
      refreshPanel();
    }
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
  // If panel exists, reveal it
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Beside);
    refreshPanel();
    return;
  }

  // Create webview panel
  currentPanel = vscode.window.createWebviewPanel(
    'designOsNavigator',
    'Design OS Navigator',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [],
    }
  );

  // Set initial content
  refreshPanel();

  // Handle messages from the webview
  currentPanel.webview.onDidReceiveMessage(
    (message) => {
      switch (message.type) {
        case 'runCommand':
          runSlashCommand(message.command);
          break;
        case 'openFile':
          openFile(message.path);
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
    },
    undefined,
    context.subscriptions
  );
}

function refreshPanel() {
  if (!currentPanel) { return; }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    currentPanel.webview.html = getErrorHtml('No workspace folder open');
    return;
  }

  const root = workspaceFolders[0].uri.fsPath;

  try {
    const data = parseProject(root);
    currentPanel.webview.html = getWebviewContent(data);
  } catch (err) {
    currentPanel.webview.html = getErrorHtml(
      `Error parsing project: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

function runSlashCommand(command: string) {
  // Send the slash command to the integrated terminal
  const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Design OS');
  terminal.show(true);
  terminal.sendText(command, true);
}

function openFile(filePath: string) {
  const uri = vscode.Uri.file(filePath);
  vscode.window.showTextDocument(uri, { preview: true });
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
    <h2>Design OS Navigator</h2>
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
