import type { Block, CitationMode, Turn } from "../../shared/src/index.js";
import { containsMalformedCitation, isStatusParagraph } from "../../parser-dom/src/index.js";

const UI_NOISE = [/^copy code$/i, /^edit message$/i, /^chatgpt said:$/i, /^you said:$/i];

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function cleanParagraph(text: string, citationMode: CitationMode): string {
  let cleaned = normalizeWhitespace(text);

  if (citationMode === "strip") {
    cleaned = cleaned.replace(/\s*\[[0-9]+\]\s*/g, " ").trim();
  }

  if (citationMode === "normalize") {
    cleaned = cleaned.replace(/\[([0-9]+)\]/g, "[^$1]");
  }

  if (containsMalformedCitation(cleaned)) {
    cleaned = cleaned.replace(/\[\^[^\]]*$/g, "").trim();
  }

  return cleaned;
}

export function cleanupBlocks(blocks: Block[], citationMode: CitationMode, includeStatusUpdates: boolean): Block[] {
  const normalized = blocks
    .map((block) => {
      if (block.kind !== "paragraph") return block;
      return { ...block, text: cleanParagraph(block.text, citationMode) };
    })
    .filter((block) => {
      if (block.kind === "paragraph" && UI_NOISE.some((noise) => noise.test(block.text))) {
        return false;
      }
      if (!includeStatusUpdates && isStatusParagraph(block)) {
        return false;
      }
      return true;
    });

  return normalized;
}

export function collapseDuplicateTurns(turns: Turn[]): Turn[] {
  return turns.filter((turn, index) => {
    const prev = turns[index - 1];
    if (!prev) return true;
    return JSON.stringify(prev) !== JSON.stringify(turn);
  });
}
