function decode(html) {
  return html.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
}

function stripTags(html) {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractTurnHtml(html) {
  return [...html.matchAll(/<div[^>]*(?:data-turn|class="turn")[^>]*>[\s\S]*?<\/div>\s*<\/div>/g)].map((m) => m[0]);
}

export function textWithCitations(html) {
  const replaced = html.replace(/<span[^>]*class="citation"[^>]*>([\s\S]*?)<\/span>/g, (full, label) => {
    const hrefMatch = full.match(/data-href="([^"]+)"|href="([^"]+)"/);
    const href = hrefMatch ? hrefMatch[1] || hrefMatch[2] : '';
    const cleanLabel = stripTags(label) || 'citation';
    return href ? `[${cleanLabel}](${href})` : `[CITATION:${cleanLabel}:MALFORMED]`;
  });
  return stripTags(replaced);
}

function parseListItems(listHtml) {
  const items = [];
  const re = /<li>([\s\S]*?)<\/li>/g;
  let match;
  while ((match = re.exec(listHtml))) {
    const li = match[1];
    const nested = li.match(/<(ul|ol)>([\s\S]*?)<\/\1>/);
    const textPart = nested ? li.replace(nested[0], '') : li;
    const item = { text: textWithCitations(textPart) };
    if (nested) item.children = parseListItems(nested[2]);
    items.push(item);
  }
  return items;
}

export function parseBlocks(contentHtml) {
  const blocks = [];
  const blockRe = /<(h[1-6]|p|blockquote|pre|ul|ol|table|hr|div)([^>]*)>([\s\S]*?)<\/\1>|<hr\s*\/?\s*>/g;
  let match;
  while ((match = blockRe.exec(contentHtml))) {
    const tag = (match[1] || 'hr').toLowerCase();
    const attrs = match[2] || '';
    const inner = match[3] || '';
    if (/^h[1-6]$/.test(tag)) blocks.push({ kind: 'heading', level: Number(tag[1]), text: textWithCitations(inner) });
    else if (tag === 'p') blocks.push({ kind: 'paragraph', text: textWithCitations(inner) });
    else if (tag === 'blockquote') blocks.push({ kind: 'blockquote', text: textWithCitations(inner) });
    else if (tag === 'pre') {
      const code = (inner.match(/<code[^>]*>([\s\S]*?)<\/code>/) || [])[1] || inner;
      const language = (inner.match(/language-([a-z0-9]+)/i) || [])[1];
      blocks.push({ kind: 'code', language, code: decode(code) });
    } else if (tag === 'ul' || tag === 'ol') blocks.push({ kind: 'list', ordered: tag === 'ol', items: parseListItems(inner) });
    else if (tag === 'table') {
      const rows = [...inner.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((tr) => [...tr[1].matchAll(/<(th|td)>([\s\S]*?)<\/\1>/g)].map((c) => textWithCitations(c[2])));
      blocks.push({ kind: 'table', rows });
    } else if (tag === 'hr') blocks.push({ kind: 'rule' });
    else if (tag === 'div' && /class="status"/.test(attrs)) blocks.push({ kind: 'status', text: textWithCitations(inner) });
    else {
      const raw = textWithCitations(inner);
      if (raw) blocks.push({ kind: 'raw', text: raw });
    }
  }
  return blocks;
}

export function discoverTurns(html) {
  return extractTurnHtml(html).map((turnHtml) => {
    const role = ((turnHtml.match(/data-role="([^"]+)"/) || [])[1] || 'unknown').toLowerCase();
    const content = (turnHtml.match(/<div class="content">([\s\S]*?)<\/div>/) || [])[1] || turnHtml;
    return { role: ['user', 'assistant', 'system'].includes(role) ? role : 'unknown', blocks: parseBlocks(content) };
  });
}
