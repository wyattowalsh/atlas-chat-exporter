import { containsMalformedCitation, isStatusParagraph } from "../../parser-dom/src/index.js";

const UI_NOISE = [/^copy code$/i, /^edit message$/i, /^chatgpt said:$/i, /^you said:$/i];

export function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

export function cleanParagraph(text, citationMode) {
  let cleaned = normalizeWhitespace(text);
  if (citationMode === "strip") cleaned = cleaned.replace(/\s*\[[0-9]+\]\s*/g, " ").trim();
  if (citationMode === "normalize") cleaned = cleaned.replace(/\[([0-9]+)\]/g, "[^$1]");
  if (containsMalformedCitation(cleaned)) cleaned = cleaned.replace(/\[\^[^\]]*$/g, "").trim();
  return cleaned;
}

export function cleanupBlocks(blocks, citationMode, includeStatusUpdates) {
  return blocks
    .map((block) => (block.kind === "paragraph" ? { ...block, text: cleanParagraph(block.text, citationMode) } : block))
    .filter((block) => {
      if (block.kind === "paragraph" && UI_NOISE.some((noise) => noise.test(block.text))) return false;
      if (!includeStatusUpdates && isStatusParagraph(block)) return false;
      return true;
    });
}

export function collapseDuplicateTurns(turns) {
  return turns.filter((turn, index) => !turns[index - 1] || JSON.stringify(turns[index - 1]) !== JSON.stringify(turn));
}
