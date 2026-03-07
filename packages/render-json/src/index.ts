import type { ConversationDoc } from "../../shared/src/types.ts";

export function renderJson(doc: ConversationDoc): string {
  return JSON.stringify(doc, null, 2);
}
