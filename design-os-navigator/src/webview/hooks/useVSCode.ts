import { useEffect, useCallback } from 'react';
import type { WebviewMessage } from '../../types/messages';

// VS Code API interface
interface VSCodeAPI {
  postMessage: (message: unknown) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
}

// Global VS Code API instance
let vscodeApi: VSCodeAPI | null = null;

/**
 * Get the VS Code API instance.
 * Must be called after acquireVsCodeApi() has been called.
 */
export function getVSCodeAPI(): VSCodeAPI {
  if (!vscodeApi) {
    // Try to acquire the API if not already done
    if (typeof acquireVsCodeApi !== 'undefined') {
      vscodeApi = acquireVsCodeApi();
    } else {
      // Fallback for development/testing
      vscodeApi = {
        postMessage: (msg) => console.log('[VS Code Mock] postMessage:', msg),
        getState: () => ({}),
        setState: () => {},
      };
    }
  }
  return vscodeApi;
}

// Declare global acquireVsCodeApi
declare const acquireVsCodeApi: () => VSCodeAPI;

/**
 * Hook to listen for messages from the extension.
 */
export function useVSCodeMessage<T = unknown>(handler: (message: T) => void): void {
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      handler(event.data);
    };

    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [handler]);
}

/**
 * Post a message to the extension.
 */
export function postMessage(message: WebviewMessage): void {
  getVSCodeAPI().postMessage(message);
}

/**
 * Hook to persist state across webview restores.
 */
export function useVSCodeState<T>(initialState: T): [T, (state: T) => void] {
  const api = getVSCodeAPI();

  // Get initial state from VS Code or use default
  const getInitialState = useCallback((): T => {
    const saved = api.getState() as T | undefined;
    return saved ?? initialState;
  }, [api, initialState]);

  const setState = useCallback((state: T) => {
    api.setState(state);
  }, [api]);

  return [getInitialState(), setState];
}

/**
 * Run a slash command in the terminal.
 */
export function runCommand(command: string): void {
  postMessage({ type: 'runCommand', command });
}

/**
 * Open a file in the editor.
 */
export function openFile(path: string): void {
  postMessage({ type: 'openFile', path });
}

/**
 * Preview a file (SVG/HTML) inline.
 */
export function previewFile(path: string): void {
  postMessage({ type: 'previewFile', path });
}

/**
 * Open the orchestrator console.
 */
export function launchConsole(): void {
  postMessage({ type: 'launchConsole' });
}
