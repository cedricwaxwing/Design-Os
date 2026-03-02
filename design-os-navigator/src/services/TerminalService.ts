import * as vscode from 'vscode';
import { stateManager } from './StateManager';

/**
 * Manages the Design OS terminal lifecycle and command execution.
 */
export class TerminalService {
  private static instance: TerminalService;

  private constructor() {
    // Listen for terminal close events
    vscode.window.onDidCloseTerminal((terminal) => {
      if (terminal === stateManager.terminal) {
        stateManager.setTerminal(null);
      }
    });
  }

  static getInstance(): TerminalService {
    if (!TerminalService.instance) {
      TerminalService.instance = new TerminalService();
    }
    return TerminalService.instance;
  }

  /**
   * Get or create the Design OS terminal.
   * Returns the terminal and whether it was newly created.
   */
  getOrCreate(): { terminal: vscode.Terminal; isNew: boolean } {
    // Check if cached terminal is still alive
    const existing = stateManager.terminal;
    if (existing) {
      return { terminal: existing, isNew: false };
    }

    // Search for existing terminal by name
    const found = stateManager.findTerminalByName();
    if (found) {
      stateManager.setTerminal(found);
      return { terminal: found, isNew: false };
    }

    // Create new terminal
    const newTerminal = vscode.window.createTerminal(stateManager.terminalName);
    newTerminal.sendText('claude', true);
    stateManager.setTerminal(newTerminal);
    return { terminal: newTerminal, isNew: true };
  }

  /**
   * Send a command to the terminal with proper PTY handling.
   * Splits text and CR into separate calls for Claude Code compatibility.
   */
  sendCommand(command: string): void {
    const { terminal, isNew } = this.getOrCreate();

    const sendWithSubmit = () => {
      terminal.sendText(command, false);
      // PTY flush delay before pressing Enter
      setTimeout(() => {
        terminal.sendText('\r', false);
      }, 100);
    };

    if (isNew) {
      // Wait for Claude CLI to boot
      setTimeout(sendWithSubmit, 3000);
    } else {
      sendWithSubmit();
    }
  }

  /**
   * Send a slash command (convenience wrapper).
   */
  runSlashCommand(command: string): void {
    this.sendCommand(command);
  }

  /**
   * Show the terminal and optionally send the /o command.
   */
  showWithOrchestrator(): void {
    const { terminal, isNew } = this.getOrCreate();
    terminal.show();

    const sendO = () => {
      terminal.sendText('/o', false);
      setTimeout(() => terminal.sendText('\r', false), 100);
    };

    if (isNew) {
      setTimeout(sendO, 3000);
    } else {
      sendO();
    }
  }

  /**
   * Send a permission response to the terminal.
   */
  sendPermissionResponse(value: string): void {
    const terminal = stateManager.terminal;
    if (terminal) {
      terminal.sendText(value, false);
      setTimeout(() => terminal.sendText('\r', false), 100);
    }
  }
}

// Export singleton instance
export const terminalService = TerminalService.getInstance();
