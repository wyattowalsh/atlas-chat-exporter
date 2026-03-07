import { EXIT_CODES } from '../../../packages/core/src/index.js';

export async function getTargetDocument() {
  // Browser targeting layer placeholder for CDP/WebSocket integration.
  // In CI/local dry-runs, fall back to mock-like global document if available.
  if (typeof document !== 'undefined') return document;
  return null;
}

export const BROWSER_TARGET_UNAVAILABLE = EXIT_CODES.BROWSER_TARGET_UNAVAILABLE;
