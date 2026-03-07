import { type ConversationDoc } from "@atlas/shared";

export function renderJson(document: ConversationDoc): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}
