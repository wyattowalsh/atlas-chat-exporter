import { parseConversationFixture } from "../../parser-dom/src/index.js";
import { applyTransforms } from "../../transform/src/index.js";
import { renderMarkdown } from "../../render-markdown/src/index.js";
import { renderJson } from "../../render-json/src/index.js";

export function buildConversationDoc(rawDomText, options = {}) {
  const parsed = parseConversationFixture(rawDomText);
  return applyTransforms(parsed, options);
}

export function exportConversation(rawDomText, options = {}) {
  const doc = buildConversationDoc(rawDomText, options);
  const outputFormat = options.outputFormat ?? "markdown";

  if (outputFormat === "json") {
    return renderJson(doc);
  }

  return renderMarkdown(doc, options);
}
