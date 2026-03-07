import type { CitationMode, ExportOptions, OutputFormat } from "./types.js";

const CITATION_MODES: ReadonlySet<CitationMode> = new Set(["keep", "normalize", "strip"]);
const OUTPUT_FORMATS: ReadonlySet<OutputFormat> = new Set(["markdown", "json", "html", "text"]);

export const DEFAULT_EXPORT_OPTIONS: Readonly<ExportOptions> = Object.freeze({
  includeStatusUpdates: false,
  citationMode: "normalize",
  includeRoleHeadings: true,
  includeHorizontalRules: false,
  normalizeLinks: true,
  outputFormat: "markdown"
});

export type ExportOptionsInput = Partial<ExportOptions> | undefined;

export function resolveExportOptions(input?: ExportOptionsInput): ExportOptions {
  if (!input) {
    return { ...DEFAULT_EXPORT_OPTIONS };
  }

  const filenameTemplate = coerceOptionalString(input.filenameTemplate);

  return {
    includeStatusUpdates: coerceBoolean(input.includeStatusUpdates, DEFAULT_EXPORT_OPTIONS.includeStatusUpdates),
    citationMode: coerceCitationMode(input.citationMode),
    includeRoleHeadings: coerceBoolean(input.includeRoleHeadings, DEFAULT_EXPORT_OPTIONS.includeRoleHeadings),
    includeHorizontalRules: coerceBoolean(input.includeHorizontalRules, DEFAULT_EXPORT_OPTIONS.includeHorizontalRules),
    normalizeLinks: coerceBoolean(input.normalizeLinks, DEFAULT_EXPORT_OPTIONS.normalizeLinks),
    outputFormat: coerceOutputFormat(input.outputFormat),
    ...(filenameTemplate ? { filenameTemplate } : {})
  };
}

function coerceBoolean(value: boolean | undefined, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function coerceCitationMode(value: CitationMode | undefined): CitationMode {
  return value && CITATION_MODES.has(value) ? value : DEFAULT_EXPORT_OPTIONS.citationMode;
}

function coerceOutputFormat(value: OutputFormat | undefined): OutputFormat {
  return value && OUTPUT_FORMATS.has(value) ? value : DEFAULT_EXPORT_OPTIONS.outputFormat;
}

function coerceOptionalString(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
