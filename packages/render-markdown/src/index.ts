import type { Block, ConversationDoc, ListItem } from "../../shared/src/index.js";

export interface MarkdownRenderOptions {
  includeRoleHeadings: boolean;
  includeHorizontalRules: boolean;
}

export function renderMarkdown(doc: ConversationDoc, options: MarkdownRenderOptions): string {
  const lines: string[] = [];

  if (doc.title) {
    lines.push(`# ${doc.title}`, "");
  }

  doc.turns.forEach((turn, index) => {
    if (options.includeRoleHeadings) {
      lines.push(`## ${turn.role}`);
    }

    turn.blocks.forEach((block) => lines.push(...renderBlock(block), ""));

    if (options.includeHorizontalRules && index < doc.turns.length - 1) {
      lines.push("---", "");
    }
  });

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function renderBlock(block: Block): string[] {
  switch (block.kind) {
    case "heading":
      return [`${"#".repeat(block.level)} ${block.text}`];
    case "paragraph":
      return [block.text];
    case "code":
      return [`\`\`\`${block.language ?? ""}`, block.code, "\`\`\`"];
    case "blockquote":
      return block.text.split("\n").map((line) => `> ${line}`);
    case "list":
      return renderList(block.items, block.ordered);
    case "table": {
      const [header, ...rows] = block.rows;
      if (!header) return [];
      const divider = header.map(() => "---");
      const out = [toTableRow(header), toTableRow(divider)];
      rows.forEach((row) => out.push(toTableRow(row)));
      return out;
    }
    case "rule":
      return ["---"];
    case "raw":
      return [block.text];
    default:
      return [];
  }
}

function renderList(items: ListItem[], ordered: boolean, depth = 0): string[] {
  const lines: string[] = [];

  items.forEach((item, index) => {
    const marker = ordered ? `${index + 1}.` : "-";
    const indent = "  ".repeat(depth);
    lines.push(`${indent}${marker} ${item.text}`);
    if (item.children?.length) {
      lines.push(...renderList(item.children, ordered, depth + 1));
    }
  });

  return lines;
}

function toTableRow(cells: string[]): string {
  return `| ${cells.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`;
}
