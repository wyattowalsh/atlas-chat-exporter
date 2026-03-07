import {
  type Block,
  type CitationMode,
  type ConversationDoc,
  type ExportOptions,
  type ListItem,
  normalizeBlockWhitespace,
  normalizeInlineWhitespace
} from "@atlas/shared";

const STATUS_LINE_PATTERN = /^(thinking|searching|analyzing|working|processing)(\.|\.{3})?$/i;
const URL_PATTERN = /\bhttps?:\/\/[^\s)\]]+/gi;

function normalizeListItems(items: ListItem[]): ListItem[] {
  return items.map((item) => ({
    text: normalizeBlockWhitespace(item.text),
    ...(item.children ? { children: normalizeListItems(item.children) } : {})
  }));
}

function applyCitationMode(text: string, mode: CitationMode): string {
  if (mode === "keep") {
    return text;
  }

  if (mode === "strip") {
    return normalizeInlineWhitespace(text.replace(/\[\[citation:.*?\]\]/gi, ""));
  }

  return text.replace(/\[\[citation:(.*?)\]\]/gi, (_full, label: string) => {
    const cleaned = normalizeInlineWhitespace(label);
    return cleaned ? `[${cleaned}]` : "";
  });
}

function normalizeUrls(text: string): string {
  return text.replace(URL_PATTERN, (url) => {
    try {
      const parsed = new URL(url);
      parsed.hash = "";
      if (parsed.pathname.endsWith("/")) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
      return parsed.toString();
    } catch {
      return url;
    }
  });
}

function cleanBlock(block: Block, options: ExportOptions): Block | null {
  if (block.kind === "rule") {
    return block;
  }

  if (block.kind === "list") {
    return { ...block, items: normalizeListItems(block.items) };
  }

  if (block.kind === "table") {
    return {
      ...block,
      rows: block.rows.map((row) => row.map((cell) => normalizeBlockWhitespace(cell)))
    };
  }

  if (block.kind === "code") {
    return {
      ...block,
      code: normalizeBlockWhitespace(block.code)
    };
  }

  const field = block.kind === "raw" ? "text" : "text";
  let text = normalizeBlockWhitespace(block[field]);

  text = applyCitationMode(text, options.citationMode);
  if (options.normalizeLinks) {
    text = normalizeUrls(text);
  }

  if (!options.includeStatusUpdates && STATUS_LINE_PATTERN.test(text)) {
    return null;
  }

  if (!text) {
    return null;
  }

  return { ...block, [field]: text } as Block;
}

function turnSignature(turn: ConversationDoc["turns"][number]): string {
  return JSON.stringify(turn);
}

export function applyDeterministicTransforms(
  document: ConversationDoc,
  options: ExportOptions
): ConversationDoc {
  const normalizedTurns = document.turns
    .map((turn) => ({
      ...turn,
      blocks: turn.blocks.map((block) => cleanBlock(block, options)).filter((block): block is Block => Boolean(block))
    }))
    .filter((turn) => turn.blocks.length > 0);

  const dedupedTurns = normalizedTurns.filter((turn, index, turns) => {
    if (index === 0) {
      return true;
    }
    return turnSignature(turn) !== turnSignature(turns[index - 1]);
  });

  return {
    ...document,
    turns: dedupedTurns
  };
}
