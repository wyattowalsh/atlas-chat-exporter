function renderBlock(block) {
  switch (block.kind) {
    case "heading":
      return `${"#".repeat(block.level)} ${block.text}`;
    case "paragraph":
      return block.text;
    case "code":
      return `\`\`\`${block.language ?? ""}\n${block.code}\n\`\`\``;
    case "blockquote":
      return `> ${block.text}`;
    case "list":
      return block.items
        .map((item, index) => `${block.ordered ? `${index + 1}.` : "-"} ${item.text}`)
        .join("\n");
    case "table": {
      const [head, ...rows] = block.rows;
      const headLine = `| ${head.join(" | ")} |`;
      const sep = `| ${head.map(() => "---").join(" | ")} |`;
      const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
      return [headLine, sep, body].filter(Boolean).join("\n");
    }
    case "rule":
      return "---";
    case "raw":
      return block.text;
    default:
      return "";
  }
}

export function renderMarkdown(doc, options = {}) {
  const includeRoleHeadings = options.includeRoleHeadings ?? true;
  const includeHorizontalRules = options.includeHorizontalRules ?? true;

  const segments = [];
  for (const [i, turn] of doc.turns.entries()) {
    if (includeRoleHeadings) {
      segments.push(`## ${turn.role}`);
    }
    segments.push(turn.blocks.map(renderBlock).join("\n\n"));
    if (includeHorizontalRules && i !== doc.turns.length - 1) {
      segments.push("---");
    }
  }

  return segments.filter(Boolean).join("\n\n").trim() + "\n";
}
