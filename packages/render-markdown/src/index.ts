import type { Block, ConversationDoc, ListItem } from "../../shared/src/types.ts";

function renderList(items: ListItem[], ordered: boolean, depth = 0): string {
  return items
    .map((item, i) => {
      const marker = ordered ? `${i + 1}.` : "-";
      const pad = "  ".repeat(depth);
      const child = item.children?.length ? `\n${renderList(item.children, ordered, depth + 1)}` : "";
      return `${pad}${marker} ${item.text}${child}`;
    })
    .join("\n");
}

function renderBlock(block: Block): string {
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
      return renderList(block.items, block.ordered);
    case "table": {
      if (block.rows.length === 0) return "";
      const [head, ...rest] = block.rows;
      const header = `| ${head.join(" | ")} |`;
      const divider = `| ${head.map(() => "---").join(" | ")} |`;
      const body = rest.map((row) => `| ${row.join(" | ")} |`).join("\n");
      return [header, divider, body].filter(Boolean).join("\n");
    }
    case "rule":
      return "---";
    case "raw":
      return block.text;
  }
}

export function renderMarkdown(doc: ConversationDoc): string {
  return doc.turns
    .map((turn) => {
      const header = `## ${turn.role}`;
      const body = turn.blocks.map(renderBlock).filter(Boolean).join("\n\n");
      return `${header}\n\n${body}`.trim();
    })
    .join("\n\n");
}
