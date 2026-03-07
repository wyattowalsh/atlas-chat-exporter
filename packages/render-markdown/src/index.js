function renderListItems(items, ordered, depth = 0) {
    const lines = [];
    items.forEach((item, index) => {
        const marker = ordered ? `${index + 1}.` : "-";
        const prefix = `${"  ".repeat(depth)}${marker} `;
        lines.push(`${prefix}${item.text}`);
        if (item.children?.length) {
            lines.push(...renderListItems(item.children, ordered, depth + 1));
        }
    });
    return lines;
}
function renderBlock(block) {
    switch (block.kind) {
        case "heading":
            return `${"#".repeat(block.level)} ${block.text}`;
        case "paragraph":
            return block.text;
        case "blockquote":
            return block.text
                .split("\n")
                .map((line) => `> ${line}`)
                .join("\n");
        case "code": {
            const language = block.language ?? "";
            return `\`\`\`${language}\n${block.code}\n\`\`\``;
        }
        case "list":
            return renderListItems(block.items, block.ordered).join("\n");
        case "table": {
            if (!block.rows.length) {
                return "";
            }
            const [header, ...body] = block.rows;
            const divider = header.map(() => "---");
            const rows = [header, divider, ...body];
            return rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
        }
        case "rule":
            return "---";
        case "raw":
            return block.text;
    }
}
export function renderMarkdown(document, options) {
    const sections = [];
    document.turns.forEach((turn, turnIndex) => {
        if (options.includeRoleHeadings) {
            sections.push(`## ${turn.role}`);
        }
        sections.push(turn.blocks.map(renderBlock).filter(Boolean).join("\n\n"));
        if (options.includeHorizontalRules && turnIndex < document.turns.length - 1) {
            sections.push("---");
        }
    });
    return sections.filter(Boolean).join("\n\n").trim();
}
