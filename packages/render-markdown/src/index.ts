import type { Block, ConversationDoc, ExportOptions, ListItem } from "../../shared/src/index";

const escapePipes = (text: string): string => text.replace(/\|/g, "\\|");

const renderList = (items: ListItem[], ordered: boolean, depth = 0): string[] => {
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
};

const renderBlock = (block: Block): string => {
  switch (block.kind) {
    case "heading":
      return `${"#".repeat(block.level)} ${block.text}`;
    case "paragraph":
      return block.text;
    case "code": {
      const lang = block.language ?? "";
      return `\`\`\`${lang}\n${block.code}\n\`\`\``;
    }
    case "blockquote":
      return block.text
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "list":
      return renderList(block.items, block.ordered).join("\n");
    case "table": {
      if (!block.rows.length) return "";
      const [head, ...rest] = block.rows;
      const header = `| ${head.map(escapePipes).join(" | ")} |`;
      const divider = `| ${head.map(() => "---").join(" | ")} |`;
      const body = rest.map((row) => `| ${row.map(escapePipes).join(" | ")} |`).join("\n");
      return [header, divider, body].filter(Boolean).join("\n");
    }
    case "rule":
      return "---";
    case "raw":
      return block.text;
  }
};

export const renderMarkdown = (doc: ConversationDoc, options: ExportOptions): string => {
  const lines: string[] = [];

  if (doc.title) lines.push(`# ${doc.title}`, "");

  doc.turns.forEach((turn, index) => {
    if (options.includeRoleHeadings) {
      lines.push(`## ${turn.role}`);
    }

    turn.blocks.forEach((block) => {
      if (block.kind === "rule" && !options.includeHorizontalRules) return;
      const rendered = renderBlock(block);
      if (rendered) lines.push(rendered);
      lines.push("");
    });

    if (index !== doc.turns.length - 1 && options.includeHorizontalRules) {
      lines.push("---", "");
    }
  });

  return lines.join("\n").trimEnd();
};
