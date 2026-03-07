import type { Block, CitationMode, ConversationDoc, ExportOptions, ParseResult, ParsedTurn, Turn } from "../../shared/src/index.js";

const UI_NOISE_EXACT = new Set(["copy code", "edit message", "chatgpt said:", "you said:"]);
const STATUS_PATTERNS = [/^thinking/i, /^searching/i, /^working/i, /^analyzing/i];

export function transformParseResult(parsed: ParseResult, options: ExportOptions, exportedAt: string): ConversationDoc {
  const turns = parsed.turns
    .filter((turn) => options.includeStatusUpdates || !isStatusTurn(turn))
    .map((turn) => transformTurn(turn, options))
    .filter((turn) => turn.blocks.length > 0)
    .filter((turn, index, all) => !isExactDuplicateTurn(turn, all[index - 1]));

  return {
    title: parsed.title,
    source: parsed.source,
    exportedAt,
    turns
  };
}

function transformTurn(turn: ParsedTurn, options: ExportOptions): Turn {
  return {
    role: turn.role,
    blocks: turn.blocks
      .map((block) => cleanBlock(block, options.citationMode, options.normalizeLinks))
      .filter((block): block is Block => Boolean(block))
  };
}

function cleanBlock(block: Block, citationMode: CitationMode, normalizeLinks: boolean): Block | undefined {
  switch (block.kind) {
    case "heading":
      return withText(block, cleanText(block.text, citationMode, normalizeLinks));
    case "paragraph":
      return withText(block, cleanText(block.text, citationMode, normalizeLinks));
    case "blockquote":
      return withText(block, cleanText(block.text, citationMode, normalizeLinks));
    case "raw":
      return withText(block, cleanText(block.text, citationMode, normalizeLinks));
    case "code":
      return {
        ...block,
        code: block.code.replace(/\t/g, "  ").replace(/\s+$/gm, "")
      };
    case "list":
      return {
        ...block,
        items: block.items
          .map((item) => ({
            ...item,
            text: cleanText(item.text, citationMode, normalizeLinks),
            children: item.children
              ?.map((child) => ({
                ...child,
                text: cleanText(child.text, citationMode, normalizeLinks)
              }))
              .filter((child) => child.text)
          }))
          .filter((item) => item.text)
      };
    case "table":
      return {
        ...block,
        rows: block.rows.map((row) => row.map((cell) => cleanText(cell, citationMode, normalizeLinks)))
      };
    case "rule":
      return block;
    default:
      return block;
  }
}

function withText<T extends { text: string }>(block: T, text: string): T | undefined {
  return text ? { ...block, text } : undefined;
}

function cleanText(input: string, citationMode: CitationMode, normalizeLinks: boolean): string {
  let value = normalizeWhitespace(stripUiNoise(input));
  value = applyCitationMode(value, citationMode);
  if (normalizeLinks) value = normalizeUrls(value);
  return value;
}

function stripUiNoise(input: string): string {
  return input
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => !UI_NOISE_EXACT.has(line.toLowerCase()))
    .join(" ");
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function applyCitationMode(input: string, mode: CitationMode): string {
  if (mode === "keep") return input;
  if (mode === "strip") return input.replace(/\[[^\]]+\]/g, "").replace(/\s{2,}/g, " ").trim();
  return input.replace(/\[([^\]]+)\]/g, (_, value: string) => `(${value.trim()})`);
}

function normalizeUrls(input: string): string {
  return input.replace(/https?:\/\/[\w.-]+[^\s)\]]*/g, (url) => {
    try {
      const parsed = new URL(url);
      parsed.hash = "";
      return parsed.toString();
    } catch {
      return url;
    }
  });
}

function isStatusTurn(turn: ParsedTurn): boolean {
  if (turn.isLikelyStatusUpdate) return true;
  return turn.blocks.length > 0 && turn.blocks.every((block) => {
    if (block.kind !== "paragraph") return false;
    return STATUS_PATTERNS.some((pattern) => pattern.test(block.text));
  });
}

function isExactDuplicateTurn(current: Turn, previous?: Turn): boolean {
  if (!previous) return false;
  return current.role === previous.role && JSON.stringify(current.blocks) === JSON.stringify(previous.blocks);
}
