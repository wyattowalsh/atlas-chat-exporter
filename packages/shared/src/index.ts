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

export interface ParseInput {
  root: ParentNode;
  exportedAt?: string;
  title?: string;
  source?: ConversationDoc["source"];
}

export interface TurnNode {
  node: Element;
  roleHint?: string;
}

export interface ParsedTurn {
  role: Role;
  blocks: Block[];
}

export const DEFAULT_OPTIONS: ExportOptions = {
  includeStatusUpdates: true,
  citationMode: "normalize",
  includeRoleHeadings: true,
  includeHorizontalRules: false,
  normalizeLinks: true,
  outputFormat: "markdown"
};

export const UI_NOISE_PATTERNS = [
  /^copy code$/i,
  /^edit message$/i,
  /^chatgpt said:?$/i,
  /^you said:?$/i,
  /^regenerate$/i
] as const;

export function normalizeInlineWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeBlockWhitespace(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
