import { DEFAULT_OPTIONS } from "../../shared/src/model.js";
import { parseConversation } from "../../parser-dom/src/index.js";
import { applyTransforms } from "../../transform/src/index.js";
import { renderMarkdown } from "../../render-markdown/src/index.js";
import { renderJson } from "../../render-json/src/index.js";

export function exportConversation(input, overrides = {}) {
  const options = { ...DEFAULT_OPTIONS, ...overrides };
  const parsed = parseConversation(input);
  const transformed = applyTransforms(parsed, options);

  if (options.outputFormat === "json") {
    return { doc: transformed, output: renderJson(transformed), options };
  }

  return { doc: transformed, output: renderMarkdown(transformed, options), options };
}
