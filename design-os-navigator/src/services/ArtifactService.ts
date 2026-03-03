import * as fs from 'fs';
import * as path from 'path';
import { stateManager } from './StateManager';
import type { Artifact } from '../prototyper-webview';
import type { ExtensionMessage } from '../types/messages';

/**
 * Manages artifact CRUD operations and deduplication.
 */
export class ArtifactService {
  private static instance: ArtifactService;
  private postMessage: ((msg: ExtensionMessage) => void) | null = null;

  private constructor() {}

  static getInstance(): ArtifactService {
    if (!ArtifactService.instance) {
      ArtifactService.instance = new ArtifactService();
    }
    return ArtifactService.instance;
  }

  /**
   * Set the message posting function (called from PanelService).
   */
  setPostMessage(fn: (msg: ExtensionMessage) => void): void {
    this.postMessage = fn;
  }

  private post(msg: ExtensionMessage): void {
    this.postMessage?.(msg);
  }

  // ── Artifact Type Inference ──

  static typeFromExtension(ext: string): 'doc' | 'svg' | 'html' | null {
    if (ext === '.svg') return 'svg';
    if (ext === '.html' || ext === '.htm') return 'html';
    if (ext === '.md' || ext === '.txt') return 'doc';
    return null;
  }

  static phaseFromPath(filePath: string): 'spec' | 'design' | 'prototype' {
    const lower = filePath.toLowerCase();
    if (lower.includes('specs/') || lower.includes('spec') || lower.includes('discovery') || lower.includes('strategy')) {
      return 'spec';
    }
    if (lower.includes('screens/') || lower.includes('wireframes/') || lower.includes('design system') || lower.includes('journeys')) {
      return 'design';
    }
    return 'prototype';
  }

  static isRelevantPath(filePath: string): boolean {
    return filePath.includes('01_Product') || filePath.includes('02_Build') || filePath.includes('04_Lab');
  }

  // ── CRUD Operations ──

  add(artifact: Artifact): boolean {
    const added = stateManager.addArtifact(artifact);
    if (added) {
      this.post({ type: 'addArtifact', artifact });
    }
    return added;
  }

  update(id: string, updates: Partial<Artifact>): Artifact | null {
    const updated = stateManager.updateArtifact(id, updates);
    if (updated) {
      this.post({ type: 'updateArtifact', artifact: updated });
    }
    return updated;
  }

  remove(id: string): Artifact | null {
    const removed = stateManager.removeArtifact(id);
    if (removed) {
      this.post({ type: 'removeArtifact', id });
    }
    return removed;
  }

  get(id: string): Artifact | undefined {
    return stateManager.getArtifact(id);
  }

  getAll(): Artifact[] {
    return stateManager.getAllArtifacts();
  }

  // ── Batch Operations ──

  sendAll(): void {
    const artifacts = this.getAll();
    if (artifacts.length > 0) {
      this.post({ type: 'setArtifacts', artifacts });
    }
  }

  // ── File-based Artifact Creation ──

  createFromFile(filePath: string, skill: string = 'manual'): Artifact | null {
    const ext = path.extname(filePath).toLowerCase();
    const artType = ArtifactService.typeFromExtension(ext);
    if (!artType) return null;

    if (!ArtifactService.isRelevantPath(filePath)) return null;

    // Check for duplicates
    if (stateManager.hasKnownPath(filePath)) {
      // Update existing
      const existing = stateManager.getArtifact('file-' + filePath);
      if (existing) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          this.update(existing.id, { content, skill });
        } catch { /* file might be gone */ }
      }
      return null;
    }

    // Read file content
    let content = '';
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > 512 * 1024) return null; // Skip files > 512KB
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      return null;
    }

    const artifact: Artifact = {
      id: 'file-' + filePath,
      title: path.basename(filePath),
      type: artType,
      content,
      isPinned: false,
      createdAt: Date.now(),
      phase: ArtifactService.phaseFromPath(filePath),
      skill,
    };

    stateManager.addKnownPath(filePath);
    this.add(artifact);
    return artifact;
  }

  // ── Load Existing Artifacts ──

  loadFromDirectories(root: string, mod: string): void {
    if (!mod) return;

    const dirs = [
      path.join(root, '01_Product', '05 Specs', mod, 'screens'),
      path.join(root, '01_Product', '05 Specs', mod, 'wireframes'),
      path.join(root, '01_Product', '05 Specs', mod, 'specs'),
      path.join(root, '01_Product', '03 User Journeys'),
      path.join(root, '02_Build', mod, 'src'),
      path.join(root, '04_Lab', mod),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;

      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const entry of entries) {
        if (!entry.isFile() || entry.name.startsWith('_') || entry.name.startsWith('.')) {
          continue;
        }

        const filePath = path.join(dir, entry.name);
        const ext = path.extname(entry.name).toLowerCase();
        const artType = ArtifactService.typeFromExtension(ext);
        if (!artType) continue;
        if (stateManager.hasKnownPath(filePath)) continue;

        let content = '';
        try {
          const stats = fs.statSync(filePath);
          if (stats.size > 512 * 1024) continue;
          content = fs.readFileSync(filePath, 'utf-8');
        } catch {
          continue;
        }

        const artifact: Artifact = {
          id: 'file-' + filePath,
          title: entry.name,
          type: artType,
          content,
          isPinned: false,
          createdAt: fs.statSync(filePath).mtimeMs,
          phase: ArtifactService.phaseFromPath(filePath),
          skill: 'initial',
        };

        stateManager.addKnownPath(filePath);
        stateManager.addArtifact(artifact);
      }
    }
  }

  // ── Toast Notifications ──

  toast(message: string, toastType: 'success' | 'error' | 'warning'): void {
    this.post({ type: 'protoToast', message, toastType });
  }

  setLoading(id: string, loading: boolean): void {
    this.post({ type: 'setLoading', id, loading });
  }
}

// Export singleton instance
export const artifactService = ArtifactService.getInstance();
