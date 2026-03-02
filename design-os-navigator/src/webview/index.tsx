import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';

// Get VS Code API
declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
};

const vscode = acquireVsCodeApi();

// Get initial data from the extension
const initialData = (window as unknown as { initialData?: unknown }).initialData;

// Render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App vscode={vscode} initialData={initialData} />
    </React.StrictMode>
  );
}

// Signal to extension that webview is ready
vscode.postMessage({ type: 'webviewReady' });
