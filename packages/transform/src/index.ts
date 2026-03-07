import type { Block, CitationMode, ConversationDoc, ExportMetadata, ExportOptions, Turn } from "../../shared/src/index";

const UI_NOISE_PATTERNS = [/^copy code$/i, /^edit message$/i, /^chatgpt said:?$/i, /^you said:?$/i];
const INTERIM_STATUS_PATTERNS = [/^thinking/i, /^working on it/i, /^analyzing/i, /^searching/i, /^drafting/i];

const cleanText = (value: string): string => value.replace(/\s+/g, " ").trim();

const normalizeUrl = (text: string): string =>
  text.replace(/https?:\/\/[^\s)]+/g, (url) => {
    try {
      const parsed = new URL(url);
      parsed.hash = "";
      if ((parsed.protocol === "https:" && parsed.port === "443") || (parsed.protocol === "http:" && parsed.port === "80")) {
        parsed.port = "";
      }
      return parsed.toString();
    } catch {
      return url;
    }
  });

const cleanseBlock = (block: Block, metadata: ExportMetadata, options: ExportOptions): Block | null => {
  const processText = (text: string): string => {
    let next = cleanText(text);
    if (options.normalizeLinks) {
      const normalized = normalizeUrl(next);
      if (normalized !== next) metadata.normalizedUrls += 1;
      next = normalized;
    }

    if (options.citationMode !== "keep") {
      next = next.replace(/\[citation:([^\]]+)\]/g, (_, raw) => {
        if (options.citationMode === "strip") {
          metadata.citationActions.stripped += 1;
          return "";
        }
        metadata.citationActions.normalized += 1;
        return `[^${cleanText(raw)}]`;
      });
    } else {
      const matches = next.match(/\[citation:[^\]]+\]/g);
      if (matches) metadata.citationActions.kept += matches.length;
    }

    return cleanText(next);
  };

  switch (block.kind) {
    case "heading": {
      const text = processText(block.text);
      if (!text) return null;
      return { ...block, text };
    }
    case "paragraph": {
      const text = processText(block.text);
      if (!text || UI_NOISE_PATTERNS.some((pattern) => pattern.test(text))) return null;
      return { ...block, text };
    }
    case "blockquote": {
      const text = processText(block.text);
      return text ? { ...block, text } : null;
    }
    case "code": {
      const code = block.code.replace(/\s+$/g, "");
      return { ...block, code };
    }
    case "raw": {
      const text = processText(block.text);
      if (!text || UI_NOISE_PATTERNS.some((pattern) => pattern.test(text))) return null;
      return { ...block, text };
    }
    case "list": {
      const items = block.items
        .map((item) => ({ ...item, text: processText(item.text) }))
        .filter((item) => item.text.length > 0);
      return items.length ? { ...block, items } : null;
    }
    case "table": {
      const rows = block.rows.map((row) => row.map(processText));
      return rows.some((row) => row.some(Boolean)) ? { ...block, rows } : null;
    }
    case "rule":
      return block;
  }
};

const isInterimTurn = (turn: Turn): boolean => {
  if (turn.role !== "assistant") return false;
  if (turn.blocks.length !== 1) return false;
  const block = turn.blocks[0];
  if (block.kind !== "paragraph" && block.kind !== "raw") return false;
  return INTERIM_STATUS_PATTERNS.some((pattern) => pattern.test(block.text));
};

const canonicalTurnSignature = (turn: Turn): string => JSON.stringify(turn);

export const applyDeterministicTransforms = (
  doc: ConversationDoc,
  options: ExportOptions
): { doc: ConversationDoc; metadata: ExportMetadata } => {
  const metadata: ExportMetadata = {
    discoveredTurns: doc.turns.length,
    removedInterimStatusTurns: 0,
    removedDuplicateTurns: 0,
    normalizedUrls: 0,
    citationActions: { kept: 0, normalized: 0, stripped: 0 }
  };

  const transformedTurns: Turn[] = [];

  for (const turn of doc.turns) {
    const blocks = turn.blocks
      .map((block) => cleanseBlock(block, metadata, options))
      .filter((block): block is Block => Boolean(block));

    if (!blocks.length) continue;

    const candidate: Turn = { ...turn, blocks };

    if (!options.includeStatusUpdates && isInterimTurn(candidate)) {
      metadata.removedInterimStatusTurns += 1;
      continue;
    }

    const previous = transformedTurns[transformedTurns.length - 1];
    if (previous && canonicalTurnSignature(previous) === canonicalTurnSignature(candidate)) {
      metadata.removedDuplicateTurns += 1;
      continue;
    }

    transformedTurns.push(candidate);
  }

  return {
    doc: { ...doc, turns: transformedTurns },
    metadata
  };
};
