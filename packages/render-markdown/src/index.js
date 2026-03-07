function renderList(items, ordered, depth = 0) {
  return items
    .map((item, idx) => {
      const marker = ordered ? `${idx + 1}.` : "-";
      const line = `${"  ".repeat(depth)}${marker} ${item.text}`;
      return item.children?.length ? `${line}\n${renderList(item.children, ordered, depth + 1)}` : line;
    })
    .join("\n");
}

function renderBlock(block) {
  switch (block.kind) {
    case "heading":
      return `${"#".repeat(block.level)} ${block.text}`;
    case "paragraph":
      return block.text;
    case "blockquote":
      return `> ${block.text}`;
    case "rule":
      return "---";
    case "code":
      return `\`\`\`${block.language ?? ""}\n${block.code}\n\`\`\``;
    case "list":
      return renderList(block.items, block.ordered);
    case "table":
      return block.rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
    case "raw":
      return block.text;
    default:
      return "";
  }
}

export function renderMarkdown(doc, includeRoleHeadings, includeHorizontalRules) {
  return doc.turns
    .map((turn) => {
      const blocks = turn.blocks.map(renderBlock).filter(Boolean).join("\n\n");
      const heading = includeRoleHeadings ? `## ${turn.role}` : "";
      const sep = includeHorizontalRules ? "\n\n---" : "";
      return [heading, blocks, sep].filter(Boolean).join("\n\n").trim();
    })
    .filter(Boolean)
    .join("\n\n");
}
