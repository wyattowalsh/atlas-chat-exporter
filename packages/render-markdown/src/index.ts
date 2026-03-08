import type { Block, ConversationDoc, ListItem, Role } from "../../shared/src/index.js";

export function renderMarkdown(
  doc: ConversationDoc,
  options: { includeRoleHeadings: boolean; includeHorizontalRules: boolean }
): string {
  const parts: string[] = [];

  if (doc.title) {
    parts.push(`# ${doc.title}`);
  }

  doc.turns.forEach((turn, index) => {
    if (options.includeRoleHeadings) {
      parts.push(`## ${humanizeRole(turn.role)}`);
    }

    for (const block of turn.blocks) {
      parts.push(renderBlock(block));
    }

    if (options.includeHorizontalRules && index < doc.turns.length - 1) {
      parts.push("---");
    }
  });

  return `${parts.filter(Boolean).join("\n\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

function renderBlock(block: Block): string {
  switch (block.kind) {
    case "heading":
      return `${"#".repeat(block.level)} ${block.text}`;
    case "paragraph":
      return block.text;
    case "code": {
      const info = block.language ?? "";
      return `\`\`\`${info}\n${block.code}\n\`\`\``;
    }
    case "blockquote":
      return block.text
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "list":
      return renderList(block.items, block.ordered);
    case "table":
      return renderTable(block.rows);
    case "rule":
      return "---";
    case "raw":
      return block.text;
  }
}

function renderList(items: ListItem[], ordered: boolean, depth = 0): string {
  return items
    .map((item, index) => {
      const marker = ordered ? `${index + 1}.` : "-";
      const pad = "  ".repeat(depth);
      const line = `${pad}${marker} ${item.text}`;
      if (!item.children || item.children.length === 0) {
        return line;
      }
      return `${line}\n${renderList(item.children, ordered, depth + 1)}`;
    })
    .join("\n");
}

function renderTable(rows: string[][]): string {
  if (rows.length === 0) {
    return "";
  }

  const header = rows[0];
  if (!header) {
    return "";
  }
  const body = rows.slice(1);
  const sep = header.map(() => "---");

  return [`| ${header.join(" | ")} |`, `| ${sep.join(" | ")} |`, ...body.map((row) => `| ${row.join(" | ")} |`)].join("\n");
}

function humanizeRole(role: Role): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
