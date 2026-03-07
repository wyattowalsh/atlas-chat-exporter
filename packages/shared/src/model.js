/** @typedef {"user"|"assistant"|"system"|"unknown"} Role */
/** @typedef {"keep"|"normalize"|"strip"} CitationMode */
/** @typedef {"markdown"|"json"|"html"|"text"} OutputFormat */

/**
 * @typedef ExportOptions
 * @property {boolean} includeStatusUpdates
 * @property {CitationMode} citationMode
 * @property {boolean} includeRoleHeadings
 * @property {boolean} includeHorizontalRules
 * @property {boolean} normalizeLinks
 * @property {OutputFormat} outputFormat
 * @property {string=} filenameTemplate
 */

export const DEFAULT_OPTIONS = {
  includeStatusUpdates: true,
  citationMode: "normalize",
  includeRoleHeadings: true,
  includeHorizontalRules: false,
  normalizeLinks: true,
  outputFormat: "markdown"
};

export const EXIT_CODES = {
  OK: 0,
  NO_TURNS_FOUND: 10,
  CLIPBOARD_BLOCKED: 20,
  DOWNLOAD_BLOCKED: 21,
  SELECTOR_DRIFT: 30,
  INVALID_INPUT: 40,
  UNKNOWN: 50
};
