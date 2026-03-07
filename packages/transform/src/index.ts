import type { ConversationDoc, ExportOptions, Turn } from "../../shared/src/types.ts";

const STATUS_PATTERNS = [/thinking/i, /working on it/i, /one moment/i, /^status:/i];
const UI_NOISE = ["Copy code", "Edit message", "ChatGPT said:", "You said:"];

export function normalizeWhitespace(doc: ConversationDoc): ConversationDoc {
  return {
    ...doc,
    turns: doc.turns.map((turn) => ({
      ...turn,
      blocks: turn.blocks.map((block) => {
        if ("text" in block) {
          return { ...block, text: block.text.replace(/\s+/g, " ").trim() };
        }
        return block;
      })
    }))
  };
}

export function cleanupUiNoise(doc: ConversationDoc): ConversationDoc {
  return {
    ...doc,
    turns: doc.turns.map((turn) => ({
      ...turn,
      blocks: turn.blocks
        .map((block) => {
          if (block.kind !== "paragraph" && block.kind !== "raw") return block;
          let text = block.text;
          for (const token of UI_NOISE) {
            text = text.replaceAll(token, "").trim();
          }
          return { ...block, text };
        })
        .filter((block) => !("text" in block && !block.text))
    }))
  };
}

export function processCitations(doc: ConversationDoc, mode: ExportOptions["citationMode"]): ConversationDoc {
  return {
    ...doc,
    turns: doc.turns.map((turn) => ({
      ...turn,
      blocks: turn.blocks.map((block) => {
        if (!("text" in block)) return block;
        if (mode === "keep") return block;
        if (mode === "strip") return { ...block, text: block.text.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim() };
        return { ...block, text: block.text.replace(/\[([^\]]+)\]/g, "(citation: $1)") };
      })
    }))
  };
}

export function stripStatusUpdates(doc: ConversationDoc): ConversationDoc {
  return {
    ...doc,
    turns: doc.turns.map((turn) => ({
      ...turn,
      blocks: turn.blocks.filter((block) => !("text" in block && STATUS_PATTERNS.some((p) => p.test(block.text))))
    }))
  };
}

export function collapseAdjacentDuplicates(doc: ConversationDoc): ConversationDoc {
  const turns: Turn[] = [];
  for (const turn of doc.turns) {
    const prev = turns.at(-1);
    if (prev && prev.role === turn.role && JSON.stringify(prev.blocks) === JSON.stringify(turn.blocks)) {
      continue;
    }
    turns.push(turn);
  }
  return { ...doc, turns };
}

export function applyTransforms(doc: ConversationDoc, options: ExportOptions): ConversationDoc {
  let transformed = normalizeWhitespace(doc);
  transformed = cleanupUiNoise(transformed);
  transformed = processCitations(transformed, options.citationMode);
  if (!options.includeStatusUpdates) {
    transformed = stripStatusUpdates(transformed);
  }
  transformed = collapseAdjacentDuplicates(transformed);
  return transformed;
}
