function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function parseBlocksFromElement(root) {
  const blocks = [];
  const blockNodes = root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,pre,blockquote,ul,ol,table,hr");
  for (const node of blockNodes) {
    const tag = node.tagName.toLowerCase();
    if (tag.startsWith("h")) {
      blocks.push({ kind: "heading", level: Number(tag.slice(1)), text: cleanText(node.textContent || "") });
    } else if (tag === "p") {
      blocks.push({ kind: "paragraph", text: cleanText(node.textContent || "") });
    } else if (tag === "pre") {
      const codeNode = node.querySelector("code");
      const language = codeNode?.className?.match(/language-([\w-]+)/)?.[1];
      blocks.push({ kind: "code", language, code: (codeNode?.textContent || node.textContent || "").replace(/\n+$/, "") });
    } else if (tag === "blockquote") {
      blocks.push({ kind: "blockquote", text: cleanText(node.textContent || "") });
    } else if (tag === "ul" || tag === "ol") {
      blocks.push({
        kind: "list",
        ordered: tag === "ol",
        items: [...node.querySelectorAll(":scope > li")].map((li) => ({ text: cleanText(li.textContent || "") }))
      });
    } else if (tag === "table") {
      blocks.push({
        kind: "table",
        rows: [...node.querySelectorAll("tr")].map((tr) => [...tr.querySelectorAll("th,td")].map((cell) => cleanText(cell.textContent || "")))
      });
    } else if (tag === "hr") {
      blocks.push({ kind: "rule" });
    }
  }

  if (!blocks.length) {
    const text = cleanText(root.textContent || "");
    if (text) blocks.push({ kind: "paragraph", text });
  }

  return blocks;
}

function inferRole(turnEl) {
  const roleAttr = turnEl.getAttribute("data-message-author-role") || turnEl.getAttribute("data-role") || "";
  if (["user", "assistant", "system"].includes(roleAttr)) return roleAttr;
  const label = (turnEl.getAttribute("aria-label") || "").toLowerCase();
  if (label.includes("assistant")) return "assistant";
  if (label.includes("user") || label.includes("you")) return "user";
  return "unknown";
}

export function discoverTurnsFromDocument(doc) {
  const turnEls = doc.querySelectorAll("[data-message-author-role],[data-testid*='conversation-turn'],article[data-role],.conversation-turn");
  const turns = [...turnEls].map((turnEl) => ({
    role: inferRole(turnEl),
    blocks: parseBlocksFromElement(turnEl)
  })).filter((t) => t.blocks.length > 0);

  return turns;
}

export function discoverTurnsFromHtml(html) {
  const normalized = html
    .replace(/<\/(p|h\d|li|tr|blockquote|pre)>/gi, "$&\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return [];
  return [{ role: "unknown", blocks: [{ kind: "paragraph", text: normalized }] }];
}
