import type { Block, ConversationDoc, ListItem } from "../../shared/src/index.js";

function renderList(items: ListItem[], ordered: boolean, depth = 0): string {
  return items
    .map((item, idx) => {
      const marker = ordered ? `${idx + 1}.` : "-";
      const prefix = "  ".repeat(depth);
      const line = `${prefix}${marker} ${item.text}`;
      if (!item.children?.length) return line;
      return `${line}\n${renderList(item.children, ordered, depth + 1)}`;
    })
    .join("\n");
}

function renderBlock(block: Block): string {
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
      if (!block.rows.length) return "";
      return block.rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
    case "raw":
      return block.text;
  }
}

export function renderMarkdown(doc: ConversationDoc, includeRoleHeadings: boolean, includeHorizontalRules: boolean): string {
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
