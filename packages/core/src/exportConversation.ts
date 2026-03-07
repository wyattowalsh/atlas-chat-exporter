import { parseConversationDom } from "../../parser-dom/src/index.js";
import { renderJson } from "../../render-json/src/index.js";
import { renderMarkdown } from "../../render-markdown/src/index.js";
import {
  mergeExportOptions,
  slugifyFileName,
  type DomLikeDocument,
  type ExportOptions,
  type ExportResult,
  type OutputFormat
} from "../../shared/src/index.js";
import { transformParseResult } from "../../transform/src/index.js";

export interface ExportConversationInput {
  /**
   * Adapters provide a DOM-like document only.
   * Parsing stays in shared packages and is intentionally not adapter-defined.
   */
  document: DomLikeDocument;
  options?: Partial<ExportOptions>;
  now?: Date;
}

export function exportConversation(input: ExportConversationInput): ExportResult {
  const options = mergeExportOptions(input.options);
  const exportedAt = (input.now ?? new Date()).toISOString();

  const parsed = parseConversationDom(input.document, {
    includeStatusUpdates: options.includeStatusUpdates
  });

  const doc = transformParseResult(parsed, options, exportedAt);
  const rendered = renderByFormat(doc, options.outputFormat, options);

  const fileName = createFileName(doc.title, options.outputFormat, options.filenameTemplate);

  return {
    doc,
    rendered,
    fileName,
    meta: {
      turnCount: doc.turns.length,
      exportedAt
    }
  };
}

function renderByFormat(
  doc: ExportResult["doc"],
  format: OutputFormat,
  options: ExportOptions
): ExportResult["rendered"] {
  if (format === "json") {
    return {
      format,
      content: renderJson(doc),
      extension: "json",
      mimeType: "application/json"
    };
  }

  return {
    format: "markdown",
    content: renderMarkdown(doc, {
      includeRoleHeadings: options.includeRoleHeadings,
      includeHorizontalRules: options.includeHorizontalRules
    }),
    extension: "md",
    mimeType: "text/markdown"
  };
}

function createFileName(
  title: string | undefined,
  outputFormat: OutputFormat,
  filenameTemplate?: string
): string {
  const extension = outputFormat === "json" ? "json" : "md";
  if (filenameTemplate?.trim()) {
    return filenameTemplate.replace(/\{ext\}/g, extension);
  }

  const base = title ? slugifyFileName(title) : "conversation-export";
  return `${base}.${extension}`;
}
