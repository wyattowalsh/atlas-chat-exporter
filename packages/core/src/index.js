import { parseConversationFromDom } from "@atlas/parser-dom";
import { renderJson } from "@atlas/render-json";
import { renderMarkdown } from "@atlas/render-markdown";
import { DEFAULT_OPTIONS } from "@atlas/shared";
import { applyDeterministicTransforms } from "@atlas/transform";
export function buildExportOptions(options = {}) {
    return { ...DEFAULT_OPTIONS, ...options };
}
export function exportConversation(input) {
    const options = buildExportOptions(input.options);
    const parsed = parseConversationFromDom(input);
    const transformed = applyDeterministicTransforms(parsed, options);
    const content = options.outputFormat === "json"
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
