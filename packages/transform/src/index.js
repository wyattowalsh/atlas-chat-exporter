const UI_NOISE = ["Copy code", "Edit message", "ChatGPT said:", "You said:"];

function cleanBlockText(text, options) {
  let next = text;
  for (const noise of UI_NOISE) next = next.replaceAll(noise, "");
  if (options.citationMode === "strip") next = next.replace(/\[\d+\]/g, "");
  if (options.citationMode === "normalize") next = next.replace(/\[(\d+)\]/g, "(citation $1)");
  return next.replace(/\s+/g, " ").trim();
}

function isStatusLike(text) {
  return /^(thinking|working|searching|analyzing)\b/i.test(text);
}

export function applyTransforms(turns, options) {
  const out = [];
  for (const turn of turns) {
    const blocks = turn.blocks
      .map((block) => {
        if (block.kind === "paragraph" || block.kind === "blockquote" || block.kind === "heading") {
          return { ...block, text: cleanBlockText(block.text, options) };
        }
        return block;
      })
      .filter((block) => block.kind !== "paragraph" || block.text);

    if (!options.includeStatusUpdates && blocks.length === 1 && blocks[0].kind === "paragraph" && isStatusLike(blocks[0].text)) {
      continue;
    }

    const prev = out[out.length - 1];
    if (prev && JSON.stringify(prev) === JSON.stringify({ ...turn, blocks })) continue;

    out.push({ ...turn, blocks });
  }

  return out;
}
