export type Role = "user" | "assistant" | "system" | "unknown";

export type CitationMode = "keep" | "normalize" | "strip";
export type OutputFormat = "markdown" | "json";

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

export interface CitationRef {
  label: string;
  href?: string;
}

export interface ExportMetadata {
  discoveredTurns: number;
  removedInterimStatusTurns: number;
  removedDuplicateTurns: number;
  normalizedUrls: number;
  citationActions: {
    kept: number;
    normalized: number;
    stripped: number;
  };
}

export interface DomNode {
  tagName?: string;
  text?: string;
  attrs?: Record<string, string>;
  children?: DomNode[];
}

export interface PageInput {
  title?: string;
  source?: ConversationDoc["source"];
  root: DomNode;
}
