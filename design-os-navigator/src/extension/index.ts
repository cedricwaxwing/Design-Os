/**
 * Design OS Navigator Extension - Main Entry Point
 *
 * This is the new modular entry point that delegates to services.
 * The extension is organized as:
 *
 * - services/StateManager.ts - Centralized state (replaces 11 globals)
 * - services/TerminalService.ts - Terminal management
 * - services/ArtifactService.ts - Artifact CRUD
 * - extension/commands.ts - Command registrations
 * - extension/watchers.ts - File system watchers
 */

import * as vscode from 'vscode';
import { stateManager } from '../services/StateManager';
import { terminalService } from '../services/TerminalService';
import { artifactService } from '../services/ArtifactService';

// Re-export activate and deactivate from the legacy extension for now
// This allows incremental migration while keeping the extension functional
export { activate, deactivate } from '../extension-legacy';

// Export services for use in other modules
export { stateManager, terminalService, artifactService };
