import { parseConversationFromDom } from "../../parser-dom/src";
import { renderJson } from "../../render-json/src";
import { renderMarkdown } from "../../render-markdown/src";
import { transformConversation } from "../../transform/src";
import { DEFAULT_EXPORT_OPTIONS, type ExportContext, type ExportOptions, type ExportResult, type OutputFormat } from "../../shared/src";

export interface ExportConversationInput {
  root: Document | Element;
  options?: Partial<ExportOptions>;
  context?: ExportContext;
}

/**
 * Canonical export entrypoint for all adapters.
 *
 * Adapters should only perform environment access (DOM/root acquisition + action wiring)
 * and must call this function instead of embedding parser semantics.
 */
export function exportConversation(input: ExportConversationInput): ExportResult {
  const options = { ...DEFAULT_EXPORT_OPTIONS, ...input.options };
  const now = input.context?.now ?? new Date();
  const source = detectSource(input.context?.locationHref);
  const title = input.context?.documentTitle;

  const parsed = parseConversationFromDom(input.root, now.toISOString(), source, title);
  const transformed = transformConversation(parsed, options);
  const content = renderByFormat(transformed, options.outputFormat, options);

  return {
    format: options.outputFormat,
    content,
    ...formatMetadata(options.outputFormat),
    suggestedFilename: buildFilename(options, now),
    conversation: transformed
  };
}

function renderByFormat(conversation: ExportResult["conversation"], format: OutputFormat, options: ExportOptions): string {
  if (format === "json") {
    return renderJson(conversation);
  }

  return renderMarkdown(conversation, {
    includeRoleHeadings: options.includeRoleHeadings,
    includeHorizontalRules: options.includeHorizontalRules
  });
}

function formatMetadata(format: OutputFormat): Pick<ExportResult, "mimeType" | "fileExtension"> {
  if (format === "json") {
    return {
      mimeType: "application/json",
      fileExtension: "json"
    };
  }

  return {
    mimeType: "text/markdown",
    fileExtension: "md"
  };
}

function buildFilename(options: ExportOptions, now: Date): string {
  const extension = options.outputFormat === "json" ? "json" : "md";
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  const template = options.filenameTemplate?.trim() || "atlas-chat-{timestamp}.{ext}";

  return template.replaceAll("{timestamp}", timestamp).replaceAll("{ext}", extension);
}

function detectSource(locationHref?: string): "chatgpt-atlas" | "chatgpt-web" | "unknown" {
  if (!locationHref) {
    return "unknown";
  }

  const lowerHref = locationHref.toLowerCase();
  if (lowerHref.includes("atlas")) {
    return "chatgpt-atlas";
  }

  if (lowerHref.includes("chatgpt.com") || lowerHref.includes("chat.openai.com")) {
    return "chatgpt-web";
  }

  return "unknown";
}
