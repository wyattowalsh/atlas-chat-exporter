import type {
  Block,
  DomLikeDocument,
  DomLikeElement,
  ListItem,
  ParseResult,
  ParsedTurn,
  ParserDomOptions,
  Role
} from "../../shared/src/index.js";

const TURN_SELECTORS = [
  "article[data-testid^='conversation-turn']",
  "[data-message-author-role]",
  "article",
  ".conversation-turn",
  "main article"
];

const UI_NOISE_PATTERNS = [
  /^copy code$/i,
  /^edit message$/i,
  /^chatgpt said:?$/i,
  /^you said:?$/i,
  /^regenerate$/i
];

const STATUS_PATTERNS = [
  /^thinking/i,
  /^searching the web/i,
  /^working on it/i,
  /^analyzing/i
];

const BLOCK_SELECTORS = "h1,h2,h3,h4,h5,h6,p,pre,blockquote,ul,ol,table,hr,code";

export function parseConversationDom(document: DomLikeDocument, _options: ParserDomOptions = {}): ParseResult {
  const turnElements = discoverTurnElements(document);
  const turns = turnElements
    .map((node) => parseTurn(node))
    .filter((turn): turn is ParsedTurn => turn.blocks.length > 0 || turn.rawText.length > 0);

  return {
    title: document.title,
    source: inferSource(document),
    turns
  };
}

export function discoverTurnElements(document: DomLikeDocument): DomLikeElement[] {
  for (const selector of TURN_SELECTORS) {
    const nodes = Array.from(document.querySelectorAll(selector));
    if (nodes.length > 1) {
      return dedupeNested(nodes);
    }
  }
  return [];
}

export function inferRole(element: DomLikeElement): Role {
  const explicit = element.getAttribute("data-message-author-role") ?? element.getAttribute("data-role");
  if (explicit === "user" || explicit === "assistant" || explicit === "system") {
    return explicit;
  }

  const ariaLabel = element.getAttribute("aria-label")?.toLowerCase() ?? "";
  if (ariaLabel.includes("user")) return "user";
  if (ariaLabel.includes("assistant") || ariaLabel.includes("chatgpt")) return "assistant";

  const className = (element.className ?? "").toLowerCase();
  if (className.includes("user")) return "user";
  if (className.includes("assistant") || className.includes("bot")) return "assistant";

  return "unknown";
}

function parseTurn(element: DomLikeElement): ParsedTurn {
  const role = inferRole(element);
  const blockNodes = Array.from(element.querySelectorAll(BLOCK_SELECTORS));
  const blocks: Block[] = [];

  for (const blockNode of blockNodes) {
    if (isUiChromeElement(blockNode) || isNestedBlock(blockNode, blockNodes)) {
      continue;
    }
    const parsed = parseBlock(blockNode);
    if (parsed) blocks.push(parsed);
  }

  const rawText = normalizeInlineText(element.textContent ?? "");

  return {
    role,
    blocks,
    rawText,
    isLikelyStatusUpdate: STATUS_PATTERNS.some((pattern) => pattern.test(rawText))
  };
}

function parseBlock(element: DomLikeElement): Block | undefined {
  const tag = element.tagName.toLowerCase();

  if (tag.match(/^h[1-6]$/)) {
    return {
      kind: "heading",
      level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6,
      text: parseTextWithCitations(element)
    };
  }

  if (tag === "p") {
    return { kind: "paragraph", text: parseTextWithCitations(element) };
  }

  if (tag === "pre") {
    const codeElement = element.querySelector("code");
    const languageClass = codeElement?.getAttribute("class") ?? "";
    const language = languageClass.match(/language-([\w-]+)/)?.[1];
    return {
      kind: "code",
      language,
      code: normalizeInlineText(codeElement?.textContent ?? element.textContent ?? "")
    };
  }

  if (tag === "blockquote") {
    return { kind: "blockquote", text: parseTextWithCitations(element) };
  }

  if (tag === "ul" || tag === "ol") {
    return {
      kind: "list",
      ordered: tag === "ol",
      items: parseListItems(element)
    };
  }

  if (tag === "table") {
    const rows = Array.from(element.querySelectorAll("tr")).map((row) =>
      Array.from(row.querySelectorAll("th,td")).map((cell) => normalizeInlineText(cell.textContent ?? ""))
    );
    return { kind: "table", rows };
  }

  if (tag === "hr") return { kind: "rule" };

  if (tag === "code") {
    return { kind: "raw", text: normalizeInlineText(element.textContent ?? "") };
  }

  return undefined;
}

function parseListItems(list: DomLikeElement): ListItem[] {
  return Array.from(list.children)
    .filter((child) => child.tagName.toLowerCase() === "li")
    .map((li) => {
      const nested = Array.from(li.children).find((c) => {
        const tag = c.tagName.toLowerCase();
        return tag === "ul" || tag === "ol";
      });
      return {
        text: parseTextWithCitations(li),
        children: nested ? parseListItems(nested) : undefined
      };
    });
}

export function parseTextWithCitations(element: DomLikeElement): string {
  return flattenText(element)
    .map((piece) => (piece.citation ? `[${piece.text}]` : piece.text))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function flattenText(element: DomLikeElement): Array<{ text: string; citation: boolean }> {
  const result: Array<{ text: string; citation: boolean }> = [];
  const childNodes = Array.from(element.childNodes);

  for (const node of childNodes) {
    if (node.nodeType === 3 && node.textContent) {
      const text = normalizeInlineText(node.textContent);
      if (text) result.push({ text, citation: false });
      continue;
    }

    if (node.nodeType !== 1) continue;
    const child = node as unknown as DomLikeElement;
    if (isUiChromeElement(child)) continue;

    if (isCitationElement(child)) {
      const citationText = normalizeInlineText(child.textContent ?? "");
      if (citationText) result.push({ text: citationText, citation: true });
      continue;
    }

    result.push(...flattenText(child));
  }

  return result;
}

export function isCitationElement(element: DomLikeElement): boolean {
  return (
    element.hasAttribute("data-citation") ||
    element.getAttribute("data-testid") === "citation" ||
    element.getAttribute("role") === "doc-noteref" ||
    /citation|footnote/i.test(element.className ?? "")
  );
}

export function isUiChromeElement(element: DomLikeElement): boolean {
  const text = normalizeInlineText(element.textContent ?? "");
  if (UI_NOISE_PATTERNS.some((pattern) => pattern.test(text))) return true;

  const testId = element.getAttribute("data-testid") ?? "";
  if (/toolbar|controls|composer/i.test(testId)) return true;

  const className = element.className ?? "";
  return /toolbar|controls|composer|button-row/i.test(className);
}

function isNestedBlock(element: DomLikeElement, allBlocks: DomLikeElement[]): boolean {
  return allBlocks.some((candidate) => candidate !== element && element.closest(candidate.tagName.toLowerCase()) === candidate);
}

function normalizeInlineText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function dedupeNested(nodes: DomLikeElement[]): DomLikeElement[] {
  return nodes.filter((node) => !nodes.some((other) => other !== node && node.closest(other.tagName.toLowerCase()) === other));
}

function inferSource(document: DomLikeDocument): ParseResult["source"] {
  const host = document.location?.hostname?.toLowerCase() ?? "";
  if (host.includes("atlas")) return "chatgpt-atlas";
  if (host.includes("chatgpt") || host.includes("openai")) return "chatgpt-web";
  return "unknown";
}
