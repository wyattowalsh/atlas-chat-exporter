import type { ConversationDoc } from "../../shared/src";

export function renderJson(doc: ConversationDoc): string {
  return JSON.stringify(doc, null, 2) + "\n";
}
