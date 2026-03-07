export type Role = "user" | "assistant" | "system" | "unknown";

export type CitationMode = "keep" | "normalize" | "strip";

export type OutputFormat = "markdown" | "json" | "html" | "text";

export interface ExportOptions {
  includeStatusUpdates: boolean;
  citationMode: CitationMode;
  includeRoleHeadings: boolean;
  includeHorizontalRules: boolean;
  normalizeLinks: boolean;
  outputFormat: OutputFormat;
  filenameTemplate?: string;
}

export interface ConversationDoc {
  title?: string;
  source: "chatgpt-atlas" | "chatgpt-web" | "unknown";
  exportedAt: string;
  turns: Turn[];
}

export interface ExportContext {
  now?: Date;
  locationHref?: string;
  documentTitle?: string;
}

export interface ExportResult {
  format: OutputFormat;
  content: string;
  mimeType: string;
  fileExtension: string;
  suggestedFilename: string;
  conversation: ConversationDoc;
}

export interface Turn {
  role: Role;
  blocks: Block[];
}

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "code"; language?: string; code: string }
  | { kind: "blockquote"; text: string }
  | { kind: "list"; ordered: boolean; items: ListItem[] }
  | { kind: "table"; rows: string[][] }
  | { kind: "rule" }
  | { kind: "raw"; text: string };

export interface ListItem {
  text: string;
  children?: ListItem[];
}
