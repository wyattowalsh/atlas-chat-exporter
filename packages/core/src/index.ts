import { parseDomConversation } from "../../parser-dom/src/index";
import { renderJson } from "../../render-json/src/index";
import { renderMarkdown } from "../../render-markdown/src/index";
import type { ConversationDoc, ExportMetadata, ExportOptions, OutputFormat, PageInput } from "../../shared/src/index";
import { applyDeterministicTransforms } from "../../transform/src/index";

export class ExporterError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_INPUT"
      | "NO_TURNS_FOUND"
      | "UNSUPPORTED_OUTPUT_FORMAT"
      | "RENDER_FAILURE"
  ) {
    super(message);
    this.name = "ExporterError";
  }
}

export interface ExportResult {
  content: string;
  format: OutputFormat;
  metadata: ExportMetadata;
  doc: ConversationDoc;
}

const ensureInput = (input: PageInput): void => {
  if (!input?.root) {
    throw new ExporterError("Input must include a root node.", "INVALID_INPUT");
  }
};

export const exportConversation = (input: PageInput, options: ExportOptions): ExportResult => {
  ensureInput(input);

  const parsed = parseDomConversation(input);
  if (!parsed.turns.length) {
    throw new ExporterError("No conversation turns could be discovered.", "NO_TURNS_FOUND");
  }

  const baseDoc: ConversationDoc = {
    title: parsed.title,
    source: parsed.source,
    exportedAt: new Date().toISOString(),
    turns: parsed.turns
  };

  const { doc, metadata } = applyDeterministicTransforms(baseDoc, options);

  let content: string;
  switch (options.outputFormat) {
    case "markdown":
      content = renderMarkdown(doc, options);
      break;
    case "json":
      content = renderJson(doc);
      break;
    default:
      throw new ExporterError(`Unsupported output format: ${options.outputFormat satisfies never}`, "UNSUPPORTED_OUTPUT_FORMAT");
  }

  return {
    content,
    format: options.outputFormat,
    metadata,
    doc
  };
};
