import * as vscode from 'vscode';
import type { Artifact } from '../prototyper-webview';
import type { ExtensionMessage } from '../types/messages';

/**
 * Centralized state management for the Design OS Navigator extension.
 * Replaces the 11 module-level mutable variables with a typed singleton.
 */
export class StateManager {
  private static instance: StateManager;

  // Panel state
  private _panel: vscode.WebviewPanel | null = null;
  private _panelReady = false;
  private _pendingMessages: ExtensionMessage[] = [];

  // Terminal state
  private _terminal: vscode.Terminal | null = null;
  private readonly _terminalName = 'Design OS';

  // Artifact state
  private _artifacts = new Map<string, Artifact>();
  private _knownPaths = new Set<string>();

  // Memory state
  private _memoryIds = new Set<string>();

  // Tracking state
  private _lastActiveSkill = '';
  private _lastGlobalScore: number | null = null;

  // Extension context
  private _context: vscode.ExtensionContext | null = null;

  private constructor() {}

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  // ── Context ──

  setContext(context: vscode.ExtensionContext): void {
    this._context = context;
  }

  get context(): vscode.ExtensionContext {
    if (!this._context) {
      throw new Error('Extension context not initialized');
    }
    return this._context;
  }

  // ── Panel ──

  get panel(): vscode.WebviewPanel | null {
    return this._panel;
  }

  setPanel(panel: vscode.WebviewPanel | null): void {
    this._panel = panel;
    if (!panel) {
      this._panelReady = false;
      this._pendingMessages = [];
    }
  }

  get panelReady(): boolean {
    return this._panelReady;
  }

  setPanelReady(ready: boolean): void {
    this._panelReady = ready;
    if (!ready) {
      this._pendingMessages = [];
    }
  }

  // ── Message Queue ──

  queueMessage(message: ExtensionMessage): void {
    this._pendingMessages.push(message);
  }

  flushMessages(): ExtensionMessage[] {
    const messages = [...this._pendingMessages];
    this._pendingMessages = [];
    return messages;
  }

  get pendingMessages(): ExtensionMessage[] {
    return this._pendingMessages;
  }

  // ── Terminal ──

  get terminal(): vscode.Terminal | null {
    // Validate terminal is still alive
    if (this._terminal && !vscode.window.terminals.includes(this._terminal)) {
      this._terminal = null;
    }
    return this._terminal;
  }

  setTerminal(terminal: vscode.Terminal | null): void {
    this._terminal = terminal;
  }

  get terminalName(): string {
    return this._terminalName;
  }

  findTerminalByName(): vscode.Terminal | undefined {
    return vscode.window.terminals.find(t => t.name === this._terminalName);
  }

  // ── Artifacts ──

  getArtifact(id: string): Artifact | undefined {
    return this._artifacts.get(id);
  }

  getAllArtifacts(): Artifact[] {
    return Array.from(this._artifacts.values());
  }

  addArtifact(artifact: Artifact): boolean {
    if (this._artifacts.has(artifact.id)) {
      return false; // Already exists
    }
    this._artifacts.set(artifact.id, artifact);
    return true;
  }

  updateArtifact(id: string, updates: Partial<Artifact>): Artifact | null {
    const existing = this._artifacts.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this._artifacts.set(id, updated);
    return updated;
  }

  removeArtifact(id: string): Artifact | null {
    const artifact = this._artifacts.get(id);
    this._artifacts.delete(id);
    return artifact || null;
  }

  // ── Known Paths (deduplication) ──

  hasKnownPath(path: string): boolean {
    return this._knownPaths.has(path);
  }

  addKnownPath(path: string): void {
    this._knownPaths.add(path);
  }

  removeKnownPath(path: string): void {
    this._knownPaths.delete(path);
  }

  // ── Memory IDs (deduplication) ──

  hasMemoryId(id: string): boolean {
    return this._memoryIds.has(id);
  }

  addMemoryId(id: string): void {
    this._memoryIds.add(id);
  }

  // ── Tracking ──

  get lastActiveSkill(): string {
    return this._lastActiveSkill;
  }

  setLastActiveSkill(skill: string): void {
    this._lastActiveSkill = skill;
  }

  get lastGlobalScore(): number | null {
    return this._lastGlobalScore;
  }

  setLastGlobalScore(score: number | null): void {
    this._lastGlobalScore = score;
  }

  // ── Reset ──

  reset(): void {
    this._panel = null;
    this._panelReady = false;
    this._pendingMessages = [];
    this._terminal = null;
    this._artifacts.clear();
    this._knownPaths.clear();
    this._memoryIds.clear();
    this._lastActiveSkill = '';
    this._lastGlobalScore = null;
  }
}

// Export singleton instance
export const stateManager = StateManager.getInstance();
