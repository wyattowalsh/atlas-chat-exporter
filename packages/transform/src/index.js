import { MalformedCitationError } from "../../shared/src/errors.js";

const citationPattern = /\[cite:([^\]]+)\]\(([^)]*)\)/g;

function transformText(text, citationMode) {
  const compact = text.replace(/\s+/g, " ").trim();

  if (citationMode === "keep") {
    return compact;
  }

  return compact.replace(citationPattern, (token, label, url) => {
    if (!label || !url) {
      throw new MalformedCitationError(token);
    }

    if (citationMode === "strip") {
      return "";
    }

    return `[${label}](${url})`;
  }).replace(/\s{2,}/g, " ").trim();
}

function isInterimStatusTurn(turn) {
  if (turn.role !== "assistant" || turn.blocks.length !== 1) {
    return false;
  }

  const block = turn.blocks[0];
  if (block.kind !== "paragraph") {
    return false;
  }

  return /^Status:/i.test(block.text);
}

function collapseAdjacentDuplicates(turns) {
  const out = [];
  for (const turn of turns) {
    const prev = out[out.length - 1];
    if (prev && JSON.stringify(prev) === JSON.stringify(turn)) {
      continue;
    }
    out.push(turn);
  }
  return out;
}

export function applyTransforms(doc, options = {}) {
  const settings = {
    citationMode: options.citationMode ?? "normalize",
    includeStatusUpdates: options.includeStatusUpdates ?? true,
  };

  const turns = doc.turns
    .filter((turn) => settings.includeStatusUpdates || !isInterimStatusTurn(turn))
    .map((turn) => ({
      ...turn,
      blocks: turn.blocks.map((block) => {
        if ("text" in block) {
          return {
            ...block,
            text: transformText(block.text, settings.citationMode),
          };
        }

        if (block.kind === "code") {
          return {
            ...block,
            code: block.code.replace(/\t/g, "  "),
          };
        }

        return block;
      }),
    }));

  return {
    ...doc,
    turns: collapseAdjacentDuplicates(turns),
  };
}
