/**
 * Parse a chat DOM-ish text blob into turns.
 * Adapters should pass page HTML/text to this parser instead of implementing their own extraction semantics.
 */
export function parseConversation(input) {
  const raw = String(input ?? "");
  const lines = raw.split(/\r?\n/).map((line) => line.trim());
  const turns = [];
  let current = null;

  for (const line of lines) {
    if (!line) continue;
    const roleMatch = line.match(/^(User|Assistant|System)\s*:\s*(.*)$/i);
    if (roleMatch) {
      if (current) turns.push(current);
      current = {
        role: roleMatch[1].toLowerCase(),
        blocks: [{ kind: "paragraph", text: roleMatch[2] ?? "" }]
      };
      continue;
    }

    if (!current) {
      current = { role: "unknown", blocks: [] };
    }

    if (/^```/.test(line)) {
      current.blocks.push({ kind: "code", language: "", code: line.replace(/^```/, "") });
    } else if (/^[-*]\s+/.test(line)) {
      current.blocks.push({ kind: "list", ordered: false, items: [{ text: line.replace(/^[-*]\s+/, "") }] });
    } else {
      current.blocks.push({ kind: "paragraph", text: line });
    }
  }

  if (current) turns.push(current);
  return {
    title: undefined,
    source: "unknown",
    exportedAt: new Date().toISOString(),
    turns
  };
}
