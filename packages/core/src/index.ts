import { parseConversationFromHtml } from "../../parser-dom/src/index.ts";
import { renderJson } from "../../render-json/src/index.ts";
import { renderMarkdown } from "../../render-markdown/src/index.ts";
import { defaultExportOptions, type ExportOptions } from "../../shared/src/types.ts";
import { applyTransforms } from "../../transform/src/index.ts";

export function exportFromHtml(html: string, options: Partial<ExportOptions> = {}): string {
  const resolved = { ...defaultExportOptions, ...options };
  const parsed = parseConversationFromHtml(html);
  const transformed = applyTransforms(parsed, resolved);
  return resolved.outputFormat === "json" ? renderJson(transformed) : renderMarkdown(transformed);
}
