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

export interface ParsedTurn {
  role: Role;
  blocks: Block[];
  rawText: string;
  isLikelyStatusUpdate: boolean;
}

export interface ParseResult {
  title?: string;
  source: ConversationDoc["source"];
  turns: ParsedTurn[];
}

export interface RenderedOutput {
  format: OutputFormat;
  content: string;
  extension: "md" | "json";
  mimeType: "text/markdown" | "application/json";
}

export interface ExportResult {
  doc: ConversationDoc;
  rendered: RenderedOutput;
  fileName: string;
  meta: {
    turnCount: number;
    exportedAt: string;
  };
}

export interface DomLikeNode {
  nodeType: number;
  nodeName: string;
  textContent: string | null;
  childNodes: ArrayLike<DomLikeNode>;
}

export interface DomLikeElement extends DomLikeNode {
  tagName: string;
  children: ArrayLike<DomLikeElement>;
  className?: string;
  id?: string;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  querySelectorAll(selectors: string): ArrayLike<DomLikeElement>;
  querySelector(selectors: string): DomLikeElement | null;
  closest(selectors: string): DomLikeElement | null;
}

export interface DomLikeDocument {
  title?: string;
  location?: { hostname?: string };
  body: DomLikeElement;
  querySelectorAll(selectors: string): ArrayLike<DomLikeElement>;
}

export interface ParserDomOptions {
  includeStatusUpdates?: boolean;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeStatusUpdates: true,
  citationMode: "normalize",
  includeRoleHeadings: true,
  includeHorizontalRules: true,
  normalizeLinks: true,
  outputFormat: "markdown"
};

export function mergeExportOptions(overrides: Partial<ExportOptions> = {}): ExportOptions {
  return { ...DEFAULT_EXPORT_OPTIONS, ...overrides };
}

export function slugifyFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "conversation";
}
