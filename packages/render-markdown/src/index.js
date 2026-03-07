export function renderMarkdown(doc, options) {
  const chunks = [];
  for (const turn of doc.turns) {
    if (options.includeRoleHeadings) {
      chunks.push(`## ${turn.role}`);
    }
    for (const block of turn.blocks) {
      if (block.kind === "paragraph") chunks.push(block.text);
      else if (block.kind === "code") chunks.push(`\n\`\`\`${block.language ?? ""}\n${block.code}\n\`\`\``);
      else if (block.kind === "list") chunks.push(block.items.map((item) => `- ${item.text}`).join("\n"));
      else chunks.push(block.text ?? "");
    }
    if (options.includeHorizontalRules) chunks.push("---");
    chunks.push("");
  }
  return chunks.join("\n").trim() + "\n";
}
