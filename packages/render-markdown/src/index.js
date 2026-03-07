function renderList(items, ordered, depth = 0) {
  return items
    .map((item, idx) => {
      const bullet = ordered ? `${idx + 1}.` : '-';
      const line = `${'  '.repeat(depth)}${bullet} ${item.text}`;
      return item.children?.length ? `${line}\n${renderList(item.children, false, depth + 1)}` : line;
    })
    .join('\n');
}

function renderBlock(block) {
  switch (block.kind) {
    case 'heading': return `${'#'.repeat(block.level)} ${block.text}`;
    case 'paragraph':
    case 'raw':
    case 'status': return block.text;
    case 'blockquote': return `> ${block.text}`;
    case 'code': return `\`\`\`${block.language || ''}\n${block.code}\n\`\`\``;
    case 'list': return renderList(block.items, block.ordered);
    case 'table': {
      if (!block.rows.length) return '';
      const [header, ...rows] = block.rows;
      return [header, header.map(() => '---'), ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n');
    }
    case 'rule': return '---';
    default: return '';
  }
}

export function renderMarkdown(doc, includeRoleHeadings, includeHorizontalRules) {
  const out = [];
  doc.turns.forEach((turn, idx) => {
    if (includeRoleHeadings) out.push(`## ${turn.role}`);
    turn.blocks.forEach((b) => out.push(renderBlock(b)));
    if (includeHorizontalRules && idx < doc.turns.length - 1) out.push('---');
  });
  return out.filter(Boolean).join('\n\n').trim();
}
