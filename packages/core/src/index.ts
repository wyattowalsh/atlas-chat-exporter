import { parseConversationFromDom } from "@atlas/parser-dom";
import { renderJson } from "@atlas/render-json";
import { renderMarkdown } from "@atlas/render-markdown";
import {
  DEFAULT_OPTIONS,
  type ConversationDoc,
  type ExportOptions,
  type OutputFormat,
  type ParseInput
} from "@atlas/shared";
import { applyDeterministicTransforms } from "@atlas/transform";

export interface ExportConversationInput extends ParseInput {
  options?: Partial<ExportOptions>;
}

export interface ExportConversationResult {
  format: OutputFormat;
  content: string;
  document: ConversationDoc;
}

export function buildExportOptions(options: Partial<ExportOptions> = {}): ExportOptions {
  return { ...DEFAULT_OPTIONS, ...options };
}

export function exportConversation(input: ExportConversationInput): ExportConversationResult {
  const options = buildExportOptions(input.options);
  const parsed = parseConversationFromDom(input);
  const transformed = applyDeterministicTransforms(parsed, options);

  const content =
    options.outputFormat === "json"
      ? renderJson(transformed)
      : renderMarkdown(transformed, {
          includeRoleHeadings: options.includeRoleHeadings,
          includeHorizontalRules: options.includeHorizontalRules
        });

  return {
    format: options.outputFormat,
    content,
    document: transformed
  };
}
