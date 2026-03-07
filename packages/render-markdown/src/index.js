function renderBlock(block) {
  switch (block.kind) {
    case "heading": return `${"#".repeat(block.level)} ${block.text}`;
    case "paragraph": return block.text;
    case "code": return `\`\`\`${block.language || ""}\n${block.code}\n\`\`\``;
    case "blockquote": return `> ${block.text}`;
    case "list": return block.items.map((item, i) => `${block.ordered ? `${i + 1}.` : "-"} ${item.text}`).join("\n");
    case "table": {
      if (!block.rows.length) return "";
      const [header, ...rows] = block.rows;
      const divider = header.map(() => "---");
      return [header, divider, ...rows].map((r) => `| ${r.join(" | ")} |`).join("\n");
    }
    case "rule": return "---";
    case "raw": return block.text;
    default: return "";
  }
}

export function renderMarkdown(doc, options) {
  const parts = [];
  for (const turn of doc.turns) {
    if (options.includeRoleHeadings) parts.push(`## ${turn.role}`);
    parts.push(...turn.blocks.map(renderBlock).filter(Boolean));
    if (options.includeHorizontalRules) parts.push("---");
  }
  return parts.join("\n\n").replace(/\n\n---\s*$/, "");
}
