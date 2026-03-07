import type { Block, ConversationDoc, ListItem, Role, Turn } from "../../shared/src";

const TURN_SELECTORS = [
  "[data-message-author-role]",
  "article[data-testid*='conversation-turn']",
  "article",
  ".conversation-turn"
].join(",");

const UI_NOISE_PATTERNS = [
  /^copy code$/i,
  /^edit message$/i,
  /^chatgpt said:?$/i,
  /^you said:?$/i,
  /^regenerate$/i
];

interface ParseContext {
  citationIndex: number;
}

export function parseConversationFromDom(root: Document | Element, exportedAt: string, source: ConversationDoc["source"], title?: string): ConversationDoc {
  const turns = discoverTurns(root).map((node) => parseTurn(node));

  return {
    title,
    source,
    exportedAt,
    turns: turns.filter((turn) => turn.blocks.length > 0)
  };
}

export function discoverTurns(root: Document | Element): Element[] {
  const matches = Array.from(root.querySelectorAll(TURN_SELECTORS));
  if (matches.length === 0) {
    return [root instanceof Document ? root.body : root].filter(Boolean) as Element[];
  }

  const unique = new Set<Element>();
  for (const node of matches) {
    if (![...unique].some((existing) => existing.contains(node) || node.contains(existing))) {
      unique.add(node);
    }
  }

  return [...unique];
}

export function inferRole(turnNode: Element): Role {
  const attrRole = turnNode.getAttribute("data-message-author-role")?.toLowerCase();
  if (attrRole === "user" || attrRole === "assistant" || attrRole === "system") {
    return attrRole;
  }

  const classRole = turnNode.className.toLowerCase();
  if (classRole.includes("assistant")) return "assistant";
  if (classRole.includes("user")) return "user";
  if (classRole.includes("system")) return "system";

  const labelText = firstText(turnNode, 80).toLowerCase();
  if (labelText.startsWith("you")) return "user";
  if (labelText.startsWith("chatgpt") || labelText.startsWith("assistant")) return "assistant";
  if (labelText.startsWith("system")) return "system";

  return "unknown";
}

export function parseTurn(turnNode: Element): Turn {
  const role = inferRole(turnNode);
  const context: ParseContext = { citationIndex: 1 };

  const blockNodes = collectBlockNodes(turnNode);
  const blocks = blockNodes.map((node) => parseBlock(node, context)).filter((block): block is Block => Boolean(block));

  return { role, blocks };
}

function collectBlockNodes(turnNode: Element): Element[] {
  const preferred = turnNode.matches("[data-message-author-role]")
    ? Array.from(turnNode.querySelectorAll(":scope > *"))
    : Array.from(turnNode.children);

  const candidates = preferred.length > 0 ? preferred : Array.from(turnNode.querySelectorAll("h1,h2,h3,h4,h5,h6,p,pre,blockquote,ul,ol,table,hr"));

  return candidates.filter((node) => !isUiChromeNode(node));
}

function parseBlock(node: Element, context: ParseContext): Block | null {
  const tag = node.tagName.toLowerCase();

  if (isUiChromeNode(node)) {
    return null;
  }

  if (/^h[1-6]$/.test(tag)) {
    return { kind: "heading", level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6, text: cleanText(serializeInline(node, context)) };
  }

  if (tag === "p") {
    return { kind: "paragraph", text: cleanText(serializeInline(node, context)) };
  }

  if (tag === "pre") {
    const code = node.querySelector("code");
    const className = code?.className ?? "";
    const language = className.match(/language-([\w-]+)/)?.[1];
    return { kind: "code", language, code: (code?.textContent || node.textContent || "").trimEnd() };
  }

  if (tag === "blockquote") {
    return { kind: "blockquote", text: cleanText(serializeInline(node, context)) };
  }

  if (tag === "ul" || tag === "ol") {
    return { kind: "list", ordered: tag === "ol", items: parseListItems(node, context) };
  }

  if (tag === "table") {
    const rows = Array.from(node.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.querySelectorAll("th,td")).map((cell) => cleanText(serializeInline(cell, context)))
    );
    return { kind: "table", rows };
  }

  if (tag === "hr") {
    return { kind: "rule" };
  }

  const text = cleanText(serializeInline(node, context));
  return text ? { kind: "raw", text } : null;
}

function parseListItems(list: Element, context: ParseContext): ListItem[] {
  return Array.from(list.children)
    .filter((child) => child.tagName.toLowerCase() === "li")
    .map((li) => {
      const nestedList = Array.from(li.children).find((child) => ["ul", "ol"].includes(child.tagName.toLowerCase()));
      const clone = li.cloneNode(true) as Element;
      if (nestedList) {
        const nestedInClone = Array.from(clone.children).find((child) => ["ul", "ol"].includes(child.tagName.toLowerCase()));
        nestedInClone?.remove();
      }

      const item: ListItem = { text: cleanText(serializeInline(clone, context)) };
      if (nestedList) {
        item.children = parseListItems(nestedList, context);
      }

      return item;
    })
    .filter((item) => item.text.length > 0 || (item.children?.length ?? 0) > 0);
}

function serializeInline(node: Element, context: ParseContext): string {
  const pieces: string[] = [];

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      pieces.push((child.textContent || "").replace(/\s+/g, " "));
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    const element = child as Element;
    if (isUiChromeNode(element)) {
      continue;
    }

    if (isCitationNode(element)) {
      pieces.push(serializeCitation(element, context));
      continue;
    }

    if (element.tagName.toLowerCase() === "a") {
      const href = element.getAttribute("href") || "";
      const label = cleanText(element.textContent || href || "link");
      pieces.push(href ? `[${label}](${href})` : label);
      continue;
    }

    pieces.push(serializeInline(element, context));
  }

  return pieces.join("");
}

function isCitationNode(node: Element): boolean {
  const testId = node.getAttribute("data-testid")?.toLowerCase() ?? "";
  const className = node.className.toLowerCase();
  const ariaLabel = node.getAttribute("aria-label")?.toLowerCase() ?? "";

  return (
    node.hasAttribute("data-citation") ||
    testId.includes("citation") ||
    className.includes("citation") ||
    ariaLabel.includes("citation") ||
    node.tagName.toLowerCase() === "sup"
  );
}

function serializeCitation(node: Element, context: ParseContext): string {
  const label = cleanText(node.textContent || `citation ${context.citationIndex}`) || `citation ${context.citationIndex}`;
  const href = node.getAttribute("href") || node.querySelector("a")?.getAttribute("href") || "";
  const serialized = `[[CITATION:${context.citationIndex}|${escapePipe(label)}|${escapePipe(href)}]]`;
  context.citationIndex += 1;
  return serialized;
}

function escapePipe(value: string): string {
  return value.replace(/\|/g, "%7C");
}

function isUiChromeNode(node: Element): boolean {
  const text = cleanText(node.textContent || "");
  if (UI_NOISE_PATTERNS.some((pattern) => pattern.test(text))) {
    return true;
  }

  const role = node.getAttribute("role")?.toLowerCase();
  const testId = node.getAttribute("data-testid")?.toLowerCase() ?? "";
  if (role === "button" || testId.includes("copy") || testId.includes("toolbar")) {
    return true;
  }

  return false;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function firstText(node: Element, maxLength: number): string {
  return cleanText(node.textContent || "").slice(0, maxLength);
}
