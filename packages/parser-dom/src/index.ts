import { JSDOM } from "jsdom";
import type { Block, FixtureParseResult, ListItem, Role, Turn } from "../../shared/src/index.js";

const STATUS_RE = /^(thinking|searching|working|drafting|status:)\b/i;

export class SelectorDriftError extends Error {}

export function discoverTurnNodes(document: Document): Element[] {
  const turns = Array.from(document.querySelectorAll("[data-turn]"));
  if (turns.length > 0) return turns;

  const fallback = Array.from(document.querySelectorAll(".turn"));
  if (fallback.length > 0) return fallback;

  const hasConversationRoot = Boolean(document.querySelector("[data-conversation-root], #conversation"));
  if (hasConversationRoot) {
    throw new SelectorDriftError("Conversation root found but no turn selectors matched.");
  }

  return [];
}

export function inferRole(el: Element): Role {
  const raw = (el.getAttribute("data-role") ?? el.className ?? "").toLowerCase();
  if (raw.includes("assistant")) return "assistant";
  if (raw.includes("user")) return "user";
  if (raw.includes("system")) return "system";
  return "unknown";
}

function textOf(node: Element): string {
  return (node.textContent ?? "").replace(/\s+/g, " ").trim();
}

function parseList(listEl: Element): ListItem[] {
  return Array.from(listEl.children)
    .filter((n) => n.tagName.toLowerCase() === "li")
    .map((li) => {
      const childList = li.querySelector(":scope > ul, :scope > ol");
      const cloned = li.cloneNode(true) as Element;
      const nested = cloned.querySelector("ul, ol");
      if (nested) nested.remove();
      const base: ListItem = { text: textOf(cloned) };
      if (childList) {
        base.children = parseList(childList);
      }
      return base;
    });
}

function parseBlock(el: Element): Block | null {
  const tag = el.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) {
    return { kind: "heading", level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6, text: textOf(el) };
  }
  if (tag === "p") return { kind: "paragraph", text: textOf(el) };
  if (tag === "blockquote") return { kind: "blockquote", text: textOf(el) };
  if (tag === "hr") return { kind: "rule" };
  if (tag === "pre") {
    const code = el.querySelector("code");
    const langClass = code?.className.match(/language-([a-z0-9]+)/i)?.[1];
    return { kind: "code", language: langClass, code: (code?.textContent ?? el.textContent ?? "").trimEnd() };
  }
  if (tag === "ul" || tag === "ol") {
    return { kind: "list", ordered: tag === "ol", items: parseList(el) };
  }
  if (tag === "table") {
    const rows = Array.from(el.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.querySelectorAll("th, td")).map((cell) => textOf(cell))
    );
    return { kind: "table", rows };
  }
  return null;
}

export function containsMalformedCitation(text: string): boolean {
  const opens = (text.match(/\[\^/g) ?? []).length;
  const closes = (text.match(/\]/g) ?? []).length;
  return opens > closes;
}

export function isStatusParagraph(block: Block): boolean {
  return block.kind === "paragraph" && STATUS_RE.test(block.text);
}

export function parseConversationHtml(html: string): FixtureParseResult {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const source = (document.querySelector("[data-source]")?.getAttribute("data-source") as FixtureParseResult["source"]) ??
    "unknown";

  const turnNodes = discoverTurnNodes(document);
  const turns: Turn[] = turnNodes.map((turn) => {
    const role = inferRole(turn);
    const blocks = Array.from(turn.children)
      .map((child) => parseBlock(child))
      .filter((block): block is Block => Boolean(block));
    return { role, blocks };
  });

  return { source, turns };
}
