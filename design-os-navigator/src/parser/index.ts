/**
 * Parser Module - Entry Point
 *
 * Modular parser system with clean separation of concerns.
 * Re-exports from specialized modules.
 */

// Re-export core parsing functions from legacy (will migrate incrementally)
export {
  parseProject,
  parseMermaidFlow,
  layoutFlowNodes,
} from '../parser-legacy';

// Re-export from new modular structure
export { scanContentSignals, emptySignals } from './signals';
export { listFiles, listFilesRecursive, countRealFiles, hasRealFiles, detectScaffold, inferFileType, safeRead } from './files';
export { parseContext, parseHistory, parseMemoryEntries, extractYamlField, extractFrontmatter } from './context';

// Export the new gate evaluation system
export { evaluateGates, calculateReadiness, getRecommendedAction } from '../gates';
