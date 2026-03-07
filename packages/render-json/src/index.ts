import type { ConversationDoc } from "../../shared/src/index";

export const renderJson = (doc: ConversationDoc): string => JSON.stringify(doc, null, 2);
