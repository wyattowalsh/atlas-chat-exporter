import { JSDOM } from "jsdom";
import {
  ConversationDoc,
  defaultExportOptions,
  ExportOptions,
  ListItem,
  Role,
  Turn
} from "../../shared/src/types.js";

const TURN_SELECTORS = ["article", "[data-message-author-role]", "[role='article']"];
const STATUS_PATTERNS = [/thinking/i, /searching/i, /working/i, /^\.{3,}$/];
const NOISE_LINES = ["Copy code", "Edit message", "ChatGPT said:", "You said:"];

export function extractConversationFromDocument(
  doc: Document,
  options: Partial<ExportOptions> = {}
): ConversationDoc {
  const opts = { ...defaultExportOptions, ...options };
  const turns = findTurns(doc)
    .map((el) => parseTurn(el, opts))
    .filter((turn): turn is Turn => Boolean(turn));

  return {
    title: doc.title,
    source: detectSource(doc.location.hostname),
    exportedAt: new Date().toISOString(),
    turns: collapseDuplicates(turns)
  };
}

export function extractConversationFromHtml(html: string, options: Partial<ExportOptions> = {}): ConversationDoc {
  const dom = new JSDOM(html, { url: "https://chatgpt.com" });
  return extractConversationFromDocument(dom.window.document, options);
}

export function renderMarkdown(doc: ConversationDoc, options: Partial<ExportOptions> = {}): string {
  const opts = { ...defaultExportOptions, ...options };
  const output: string[] = [];

  for (const [index, turn] of doc.turns.entries()) {
    if (opts.includeRoleHeadings) output.push(`## ${turn.role}`);
    for (const block of turn.blocks) {
      switch (block.kind) {
        case "heading":
          output.push(`${"#".repeat(block.level)} ${block.text}`);
          break;
        case "paragraph":
          output.push(block.text);
          break;
        case "blockquote":
          output.push(`> ${block.text}`);
          break;
        case "code":
          output.push(`\`\`\`${block.language ?? ""}\n${block.code}\n\`\`\``);
          break;
        case "list":
          output.push(renderList(block.items, block.ordered));
          break;
        case "table":
          if (block.rows.length > 0) {
            output.push(`| ${block.rows[0].join(" | ")} |`);
            output.push(`| ${block.rows[0].map(() => "---").join(" | ")} |`);
            for (const row of block.rows.slice(1)) {
              output.push(`| ${row.join(" | ")} |`);
            }
          }
          break;
        case "rule":
          output.push("---");
          break;
        case "raw":
          output.push(block.text);
          break;
      }
    }

    if (opts.includeHorizontalRules && index < doc.turns.length - 1) {
      output.push("\n---\n");
    }
  }

  return output.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function renderJson(doc: ConversationDoc): string {
  return JSON.stringify(doc, null, 2);
}

function findTurns(doc: Document): Element[] {
  for (const selector of TURN_SELECTORS) {
    const found = Array.from(doc.querySelectorAll(selector));
    if (found.length > 1) return found;
  }
  return [];
}

function parseTurn(el: Element, options: ExportOptions): Turn | null {
  const role = inferRole(el);
  const blocks = parseBlocks(el, options);
  if (!blocks.length) return null;
  return { role, blocks };
}

function inferRole(el: Element): Role {
  const roleAttr = el.getAttribute("data-message-author-role")?.toLowerCase();
  if (roleAttr === "user" || roleAttr === "assistant" || roleAttr === "system") return roleAttr;

  const text = cleanText(el.textContent ?? "").toLowerCase();
  if (text.startsWith("you said")) return "user";
  if (text.startsWith("chatgpt said") || text.startsWith("assistant")) return "assistant";
  return "unknown";
}

function parseBlocks(container: Element, options: ExportOptions) {
  const blocks: Turn["blocks"] = [];

  for (const node of Array.from(container.children)) {
    const tag = node.tagName.toLowerCase();

    if (tag.match(/^h[1-6]$/)) {
      blocks.push({ kind: "heading", level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6, text: cleanInline(node, options) });
      continue;
    }

    if (tag === "p") {
      const text = normalizeCitations(cleanInline(node, options), options.citationMode);
      if (!isNoise(text) && includeStatus(text, options)) blocks.push({ kind: "paragraph", text });
      continue;
    }

    if (tag === "pre") {
      const code = node.textContent ?? "";
      const language = node.querySelector("code")?.className.replace("language-", "") || undefined;
      blocks.push({ kind: "code", language, code: cleanText(code) });
      continue;
    }

    if (tag === "blockquote") {
      blocks.push({ kind: "blockquote", text: cleanInline(node, options) });
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      blocks.push({ kind: "list", ordered: tag === "ol", items: parseList(node, options) });
      continue;
    }

    if (tag === "table") {
      const rows = Array.from(node.querySelectorAll("tr")).map((row) =>
        Array.from(row.querySelectorAll("th,td")).map((cell) => cleanText(cell.textContent ?? ""))
      );
      blocks.push({ kind: "table", rows });
      continue;
    }
  }

  if (!blocks.length) {
    const text = cleanText(container.textContent ?? "");
    if (text) blocks.push({ kind: "raw", text });
  }

  return blocks;
}

function parseList(list: Element, options: ExportOptions): ListItem[] {
  return Array.from(list.children)
    .filter((child) => child.tagName.toLowerCase() === "li")
    .map((li) => {
      const nested = li.querySelector("ul,ol");
      if (nested) nested.remove();
      const item: ListItem = { text: cleanInline(li, options) };
      if (nested) item.children = parseList(nested, options);
      return item;
    });
}

function collapseDuplicates(turns: Turn[]): Turn[] {
  const deduped: Turn[] = [];
  for (const turn of turns) {
    const previous = deduped[deduped.length - 1];
    if (previous && JSON.stringify(previous) === JSON.stringify(turn)) continue;
    deduped.push(turn);
  }
  return deduped;
}

function renderList(items: ListItem[], ordered: boolean, depth = 0): string {
  return items
    .map((item, index) => {
      const prefix = ordered ? `${index + 1}.` : "-";
      const indent = "  ".repeat(depth);
      const children = item.children?.length ? `\n${renderList(item.children, ordered, depth + 1)}` : "";
      return `${indent}${prefix} ${item.text}${children}`;
    })
    .join("\n");
}

function cleanInline(el: Element, options: ExportOptions): string {
  const cloned = el.cloneNode(true) as Element;

  if (options.citationMode === "strip") {
    cloned.querySelectorAll("sup,.citation,[data-citation]").forEach((n) => n.remove());
  }

  if (options.normalizeLinks) {
    cloned.querySelectorAll("a[href]").forEach((a) => {
      const href = (a as HTMLAnchorElement).href;
      const label = cleanText(a.textContent ?? href);
      a.textContent = `[${label}](${href})`;
    });
  }

  return cleanText(cloned.textContent ?? "");
}

function normalizeCitations(text: string, mode: ExportOptions["citationMode"]): string {
  if (mode === "keep") return text;
  if (mode === "strip") return text.replace(/\[(\d+)\]/g, "").trim();
  return text.replace(/\[(\d+)\]/g, "(citation $1)");
}

function includeStatus(text: string, options: ExportOptions): boolean {
  if (options.includeStatusUpdates) return true;
  return !STATUS_PATTERNS.some((pattern) => pattern.test(text));
}

function isNoise(text: string): boolean {
  return NOISE_LINES.includes(text);
}

function cleanText(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function detectSource(hostname: string): ConversationDoc["source"] {
  if (hostname.includes("atlas")) return "chatgpt-atlas";
  if (hostname.includes("chatgpt") || hostname.includes("openai")) return "chatgpt-web";
  return "unknown";
}
