// Artifact type — single source of truth for extension and webview

export interface Artifact {
  id: string;
  title: string;
  type: 'doc' | 'svg' | 'html' | 'server';
  content: string;
  isPinned: boolean;
  createdAt: number;
  phase: 'spec' | 'design' | 'prototype';
  skill: string;
}
