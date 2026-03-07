const STATUS_PATTERNS = [/working on it/i, /thinking/i, /searching/i, /drafting/i];

export function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

export function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

function normalizeLinkTokens(text) {
  return text.replace(/\[[^\]]+\]\(([^)]+)\)/g, (full, url) => full.replace(url, normalizeUrl(url)));
}

function transformCitations(text, mode) {
  if (mode === 'keep') return text;
  if (mode === 'strip') return text.replace(/\[[^\]]+\]\(([^)]+)\)/g, '').replace(/\[CITATION:[^\]]+\]/g, '');
  return text.replace(/\[CITATION:([^:]+):MALFORMED\]/g, '[$1]').replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => `[${label}](${normalizeUrl(url)})`);
}

function isStatusBlock(block) {
  return block.kind === 'status' || (block.kind === 'paragraph' && STATUS_PATTERNS.some((p) => p.test(block.text)));
}

function transformBlock(block, citationMode, normalizeLinks) {
  if (['paragraph', 'heading', 'blockquote', 'raw', 'status'].includes(block.kind)) {
    let text = normalizeWhitespace(transformCitations(block.text, citationMode));
    if (normalizeLinks) text = normalizeLinkTokens(text);
    return text ? { ...block, text } : null;
  }
  if (block.kind === 'list') {
    return { ...block, items: block.items.map((i) => ({ ...i, text: normalizeWhitespace(transformCitations(i.text, citationMode)) })) };
  }
  return block;
}

export function collapseDuplicateTurns(turns) {
  const out = [];
  for (const turn of turns) {
    if (out.length && JSON.stringify(out[out.length - 1]) === JSON.stringify(turn)) continue;
    out.push(turn);
  }
  return out;
}

export function applyTransforms(doc, citationMode, includeStatusUpdates, normalizeLinks) {
  const turns = collapseDuplicateTurns(
    doc.turns.map((turn) => ({
      ...turn,
      blocks: turn.blocks.filter((b) => includeStatusUpdates || !isStatusBlock(b)).map((b) => transformBlock(b, citationMode, normalizeLinks)).filter(Boolean)
    }))
  );
  return { ...doc, turns };
}
