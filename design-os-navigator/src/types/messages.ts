import type { Artifact } from '../prototyper-webview';
import type { GraphData } from '../types-legacy';

// ── Extension → Webview Messages ──

export type ExtensionMessage =
  | { type: 'graphData'; data: GraphData }
  | { type: 'readinessChanged'; globalScore: number; previousScore: number; updatedBy: string }
  | { type: 'addArtifact'; artifact: Artifact }
  | { type: 'updateArtifact'; artifact: Artifact }
  | { type: 'removeArtifact'; id: string }
  | { type: 'setArtifacts'; artifacts: Artifact[] }
  | { type: 'setLoading'; id: string; loading: boolean }
  | { type: 'protoToast'; message: string; toastType: 'success' | 'error' | 'warning' }
  | { type: 'filePreview'; path: string; fileName: string; fileType: string; content: string | null; previewable: boolean };

// ── Webview → Extension Messages ──

export type WebviewMessage =
  | { type: 'webviewReady' }
  | { type: 'runCommand'; command: string }
  | { type: 'launchConsole'; cli: string }
  | { type: 'openFile'; path: string }
  | { type: 'previewFile'; path: string }
  | { type: 'openFlowPreview'; path: string }
  | { type: 'saveSectionOrder'; order: string[] }
  | { type: 'copyArtifact'; id: string }
  | { type: 'exportArtifact'; id: string; format?: string }
  | { type: 'deleteArtifact'; id: string }
  | { type: 'pinArtifact'; id: string }
  | { type: 'regenerateArtifact'; id: string; mode: 'same' | 'prompt' | 'variant'; prompt?: string }
  | { type: 'editArtifact'; id: string; content: string };

// ── Console Messages ──

export type ConsoleExtensionMessage =
  | { type: 'setMode'; mode: 'plan' | 'ask' | 'auto' }
  | { type: 'addCard'; card: import('../types-legacy').ConsoleCard }
  | { type: 'setActiveNode'; label: string };

export type ConsoleWebviewMessage =
  | { type: 'consoleCommand'; command: string }
  | { type: 'permissionResponse'; value: string };

// ── Type Guards ──

export function isExtensionMessage(msg: unknown): msg is ExtensionMessage {
  return typeof msg === 'object' && msg !== null && 'type' in msg;
}

export function isWebviewMessage(msg: unknown): msg is WebviewMessage {
  return typeof msg === 'object' && msg !== null && 'type' in msg;
}
