import type { ExportOptions } from "./types";

export const DEFAULT_EXPORT_OPTIONS: Readonly<ExportOptions> = Object.freeze({
  includeStatusUpdates: true,
  citationMode: "normalize",
  includeRoleHeadings: true,
  includeHorizontalRules: true,
  normalizeLinks: true,
  outputFormat: "markdown",
});

export function createExportOptions(
  overrides: Partial<ExportOptions> = {},
): ExportOptions {
  return {
    ...DEFAULT_EXPORT_OPTIONS,
    ...overrides,
  };
}
