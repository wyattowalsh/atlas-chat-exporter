import { type ConversationDoc, type ExportOptions, type OutputFormat, type ParseInput } from "@atlas/shared";
export interface ExportConversationInput extends ParseInput {
    options?: Partial<ExportOptions>;
}
export interface ExportConversationResult {
    format: OutputFormat;
    content: string;
    document: ConversationDoc;
}
export declare function buildExportOptions(options?: Partial<ExportOptions>): ExportOptions;
export declare function exportConversation(input: ExportConversationInput): ExportConversationResult;
