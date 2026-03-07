import type { ExportOptions } from "./types";

/**
 * Deterministic baseline options used by all adapters unless explicitly overridden.
 */
export const DEFAULT_EXPORT_OPTIONS: Readonly<ExportOptions> = Object.freeze({
  includeStatusUpdates: false,
  citationMode: "normalize",
  includeRoleHeadings: true,
  includeHorizontalRules: true,
  normalizeLinks: true,
  outputFormat: "markdown",
});
