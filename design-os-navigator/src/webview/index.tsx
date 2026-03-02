import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';

// Get initial data injected by the extension
const initialData = (window as unknown as { initialData?: unknown }).initialData;

// Render the app
// Note: acquireVsCodeApi() is called once inside useVSCode.ts — do NOT call it here
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App initialData={initialData} />
    </React.StrictMode>
  );
}
