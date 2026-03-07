const UI_NOISE = new Set(["Copy code", "Edit message", "ChatGPT said:", "You said:"]);

export function applyTransforms(doc, options) {
  const turns = [];
  let lastSignature = "";

  for (const turn of doc.turns) {
    const blocks = turn.blocks
      .map((block) => {
        if (block.kind !== "paragraph") return block;
        let text = block.text.replace(/\s+/g, " ").trim();
        if (!options.includeStatusUpdates && /^(thinking|working|searching)\b/i.test(text)) {
          return null;
        }
        if (UI_NOISE.has(text)) {
          return null;
        }
        if (options.citationMode === "strip") {
          text = text.replace(/\[(\d+)\]/g, "").trim();
        } else if (options.citationMode === "normalize") {
          text = text.replace(/\[(\d+)\]/g, "[cite:$1]");
        }
        return { ...block, text };
      })
      .filter(Boolean);

    if (!blocks.length) continue;
    const normalizedTurn = { ...turn, blocks };
    const signature = JSON.stringify(normalizedTurn);
    if (signature === lastSignature) continue;

    lastSignature = signature;
    turns.push(normalizedTurn);
  }

  return { ...doc, turns };
}
