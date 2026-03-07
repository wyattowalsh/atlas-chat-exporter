import type { Block, CitationMode, ConversationDoc, ExportOptions, ListItem, Turn } from "../../shared/src/index.js";

const UI_NOISE_LINE_PATTERNS = [/^copy code$/i, /^edit message$/i, /^chatgpt said:?$/i, /^you said:?$/i];
const STATUS_UPDATE_PATTERNS = [/\bthinking\b/i, /\bsearching\b/i, /\bworking\b/i, /\banalyz(ing|e)\b/i, /^updating/i];
const CITATION_TOKEN = /\[\[CITATION:(\d+)\|([^|]*)\|([^\]]*)\]\]/g;

export function transformConversation(doc: ConversationDoc, options: ExportOptions): ConversationDoc {
  const turns = doc.turns
    .map((turn) => transformTurn(turn, options))
    .filter((turn) => turn.blocks.length > 0)
    .filter((turn) => options.includeStatusUpdates || !isInterimStatusTurn(turn));

  return {
    ...doc,
    turns: collapseAdjacentDuplicates(turns)
  };
}

function transformTurn(turn: Turn, options: ExportOptions): Turn {
  const blocks = turn.blocks.map((block) => transformBlock(block, options)).filter((block): block is Block => Boolean(block));
  return { ...turn, blocks };
}

function transformBlock(block: Block, options: ExportOptions): Block | null {
  if (block.kind === "rule") {
    return block;
  }

  if (block.kind === "list") {
    const items = block.items.map((item) => transformListItem(item, options)).filter((item): item is ListItem => Boolean(item));
    return items.length > 0 ? { ...block, items } : null;
  }

  if (block.kind === "table") {
    return {
      ...block,
      rows: block.rows.map((row) => row.map((cell) => cleanupText(cell, options.citationMode, options.normalizeLinks)))
    };
  }

  if (block.kind === "code") {
    return { ...block, code: block.code.trimEnd() };
  }

  const text = cleanupText(block.text, options.citationMode, options.normalizeLinks);
  return text ? { ...block, text } : null;
}

function transformListItem(item: ListItem, options: ExportOptions): ListItem | null {
  const text = cleanupText(item.text, options.citationMode, options.normalizeLinks);
  const children = item.children
    ?.map((child) => transformListItem(child, options))
    .filter((child): child is ListItem => Boolean(child));

  if (!text && (!children || children.length === 0)) {
    return null;
  }

  return {
    text,
    ...(children && children.length > 0 ? { children } : {})
  };
}

function cleanupText(value: string, citationMode: CitationMode, normalizeLinks: boolean): string {
  const lineCleaned = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !UI_NOISE_LINE_PATTERNS.some((pattern) => pattern.test(line)))
    .join("\n");

  const withCitations = applyCitationMode(lineCleaned, citationMode);
  const withNormalizedLinks = normalizeLinks ? normalizeMarkdownLinks(withCitations) : withCitations;

  return withNormalizedLinks
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function applyCitationMode(value: string, mode: CitationMode): string {
  if (mode === "strip") {
    return value.replace(CITATION_TOKEN, "").replace(/\s{2,}/g, " ").trim();
  }

  if (mode === "normalize") {
    return value.replace(CITATION_TOKEN, (_all, index, _label, href) => {
      const safeHref = decodePipes(href);
      return safeHref ? `[citation ${index}](${safeHref})` : `[citation ${index}]`;
    });
  }

  return value.replace(CITATION_TOKEN, (_all, _index, label, href) => {
    const decodedLabel = decodePipes(label);
    const decodedHref = decodePipes(href);
    return decodedHref ? `[${decodedLabel}](${decodedHref})` : `[${decodedLabel}]`;
  });
}

function normalizeMarkdownLinks(value: string): string {
  return value.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_full, label, rawUrl) => {
    const normalized = normalizeUrl(rawUrl);
    return `[${label}](${normalized})`;
  });
}

function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    if ((parsed.protocol === "https:" && parsed.port === "443") || (parsed.protocol === "http:" && parsed.port === "80")) {
      parsed.port = "";
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function collapseAdjacentDuplicates(turns: Turn[]): Turn[] {
  const deduped: Turn[] = [];

  for (const turn of turns) {
    const previous = deduped[deduped.length - 1];
    if (!previous || previous.role !== turn.role || JSON.stringify(previous.blocks) !== JSON.stringify(turn.blocks)) {
      deduped.push(turn);
    }
  }

  return deduped;
}

function isInterimStatusTurn(turn: Turn): boolean {
  if (turn.role !== "assistant" || turn.blocks.length !== 1) {
    return false;
  }

  const onlyBlock = turn.blocks[0]!;
  if (onlyBlock.kind !== "paragraph" && onlyBlock.kind !== "raw") {
    return false;
  }

  const content = onlyBlock.text.trim();
  return content.length > 0 && content.length <= 140 && STATUS_UPDATE_PATTERNS.some((pattern) => pattern.test(content));
}

function decodePipes(value: string): string {
  return value.replace(/%7C/g, "|");
}
