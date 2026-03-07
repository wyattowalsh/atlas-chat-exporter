import { type ConversationDoc } from "@atlas/shared";
export interface MarkdownRenderOptions {
    includeRoleHeadings: boolean;
    includeHorizontalRules: boolean;
}
export declare function renderMarkdown(document: ConversationDoc, options: MarkdownRenderOptions): string;
