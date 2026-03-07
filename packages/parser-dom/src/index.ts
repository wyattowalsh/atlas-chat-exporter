import { NoTurnsFoundError, type Block, type ConversationDoc, type ListItem, type Turn } from "../../shared/src/index.ts";
import { inferRole, normalizeText, parseAttrs } from "./utils.ts";

function extractSections(input: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  return Array.from(input.matchAll(regex)).map((m) => m[1]);
}

function parseList(listHtml: string): ListItem[] {
  const liRegex = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  return Array.from(listHtml.matchAll(liRegex)).map((m) => {
    const body = m[1];
    const nested = body.match(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/i);
    const text = normalizeText(body.replace(/<(ul|ol)\b[^>]*>[\s\S]*?<\/\1>/gi, ""));
    return {
      text,
      children: nested ? parseList(nested[2]) : undefined
    };
  });
}

function parseBlocks(contentHtml: string): Block[] {
  const blocks: Block[] = [];
  const tokenRegex = /<(h[1-6]|p|pre|blockquote|ul|ol|table|hr)\b([^>]*)>([\s\S]*?)<\/\1>|<hr\b[^>]*\/?\s*>/gi;
  for (const m of contentHtml.matchAll(tokenRegex)) {
    const tag = (m[1] ?? "hr").toLowerCase();
    const attrs = m[2] ?? "";
    const body = m[3] ?? "";

    if (tag.match(/^h[1-6]$/)) {
      blocks.push({ kind: "heading", level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6, text: normalizeText(body) });
    } else if (tag === "p") {
      const text = normalizeText(body.replace(/<span\b[^>]*citation-chip[^>]*>(.*?)<\/span>/gi, "[$1]").replace(/<a\b[^>]*data-citation[^>]*>(.*?)<\/a>/gi, "[$1]"));
      blocks.push({ kind: "paragraph", text });
    } else if (tag === "pre") {
      const lang = body.match(/<code\b[^>]*data-lang=(?:"([^"]+)"|'([^']+)')/i);
      const code = normalizeText(body).replace(/^code\s*/i, "");
      blocks.push({ kind: "code", language: lang?.[1] ?? lang?.[2], code });
    } else if (tag === "blockquote") {
      blocks.push({ kind: "blockquote", text: normalizeText(body) });
    } else if (tag === "ul" || tag === "ol") {
      blocks.push({ kind: "list", ordered: tag === "ol", items: parseList(body) });
    } else if (tag === "table") {
      const rows = extractSections(body, "tr").map((tr) => {
        const cols = [...tr.matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((c) => normalizeText(c[2]));
        return cols;
      });
      blocks.push({ kind: "table", rows });
    } else if (tag === "hr") {
      blocks.push({ kind: "rule" });
    }
  }
  return blocks;
}

export function parseConversationFromHtml(html: string): ConversationDoc {
  const turnRegex = /<article\b([^>]*)>([\s\S]*?)<\/article>/gi;
  const turns: Turn[] = [];

  for (const m of html.matchAll(turnRegex)) {
    const attrs = parseAttrs(m[1]);
    const classes = (attrs.class ?? "").split(/\s+/).filter(Boolean);
    if (!(attrs["data-turn"] || classes.includes("turn"))) continue;

    const contentMatch = m[2].match(/<div\b[^>]*class=(?:"[^"]*content[^"]*"|'[^']*content[^']*')[^>]*>([\s\S]*?)<\/div>/i);
    const content = contentMatch?.[1] ?? m[2];

    turns.push({ role: inferRole({ attrs, classes }), blocks: parseBlocks(content) });
  }

  if (turns.length === 0) throw new NoTurnsFoundError();

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  return { title, source: "unknown", exportedAt: new Date().toISOString(), turns };
}
