import type { ConversationDoc } from "../../shared/src/index.js";

export function renderJson(doc: ConversationDoc): string {
  return `${JSON.stringify(doc, null, 2)}\n`;
}
