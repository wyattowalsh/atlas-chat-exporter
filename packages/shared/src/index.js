export const DEFAULT_EXPORT_OPTIONS = Object.freeze({
  includeStatusUpdates: false,
  citationMode: "normalize",
  includeRoleHeadings: true,
  includeHorizontalRules: true,
  normalizeLinks: true,
  outputFormat: "markdown"
});

export const EXIT_CODES = Object.freeze({
  OK: 0,
  NO_TURNS: 10,
  TARGET_NOT_FOUND: 11,
  CLIPBOARD_FAILED: 12,
  DOWNLOAD_FAILED: 13,
  INVALID_ARGS: 64,
  RUNTIME_ERROR: 70
});

export function mergeOptions(base, override = {}) {
  return { ...base, ...override };
}

export function toIsoNow() {
  return new Date().toISOString();
}
