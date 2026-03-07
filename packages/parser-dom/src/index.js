const STATUS_RE = /^(thinking|searching|working|drafting|status:)\b/i;

export class SelectorDriftError extends Error {}

export function discoverTurnNodes(html) {
  const turnMatches = [...html.matchAll(/<article[^>]*data-turn[^>]*>([\s\S]*?)<\/article>/g)];
  if (turnMatches.length > 0) return turnMatches.map((m) => m[0]);

  const fallback = [...html.matchAll(/<article[^>]*class="[^"]*turn[^"]*"[^>]*>([\s\S]*?)<\/article>/g)];
  if (fallback.length > 0) return fallback.map((m) => m[0]);

  if (/data-conversation-root|id="conversation"/.test(html)) {
    throw new SelectorDriftError("Conversation root found but no turn selectors matched.");
  }

  return [];
}

export function inferRole(turnHtml) {
  const roleMatch = turnHtml.match(/data-role="([^"]+)"/i)?.[1]?.toLowerCase() ?? "";
  if (roleMatch.includes("assistant")) return "assistant";
  if (roleMatch.includes("user")) return "user";
  if (roleMatch.includes("system")) return "system";
  if (/class="[^"]*assistant[^"]*"/.test(turnHtml)) return "assistant";
  if (/class="[^"]*user[^"]*"/.test(turnHtml)) return "user";
  return "unknown";
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTopLevelLi(listHtml) {
  const results = [];
  let depth = 0;
  let start = -1;
  const tokenRe = /<\/?li>/g;
  for (const match of listHtml.matchAll(tokenRe)) {
    if (match[0] === "<li>") {
      if (depth === 0) start = match.index + 4;
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        results.push(listHtml.slice(start, match.index));
        start = -1;
      }
    }
  }
  return results;
}

function parseList(listHtml) {
  const items = extractTopLevelLi(listHtml);
  return items.map((liBody) => {
    const nested = liBody.match(/<(ul|ol)>([\s\S]*)<\/\1>/);
    const text = stripTags(nested ? liBody.replace(nested[0], "") : liBody);
    const item = { text };
    if (nested) item.children = parseList(nested[2]);
    return item;
  });
}

function parseBlock(tag, body, full) {
  if (/^h[1-6]$/.test(tag)) return { kind: "heading", level: Number(tag[1]), text: stripTags(body) };
  if (tag === "p") return { kind: "paragraph", text: stripTags(body) };
  if (tag === "blockquote") return { kind: "blockquote", text: stripTags(body) };
  if (tag === "hr") return { kind: "rule" };
  if (tag === "pre") {
    const codeMatch = full.match(/<code(?: class="language-([a-z0-9]+)")?>([\s\S]*?)<\/code>/i);
    const code = (codeMatch?.[2] ?? body).replace(/<[^>]+>/g, "").trimEnd();
    return { kind: "code", language: codeMatch?.[1], code };
  }
  if (tag === "ul" || tag === "ol") return { kind: "list", ordered: tag === "ol", items: parseList(body) };
  if (tag === "table") {
    const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) =>
      [...r[1].matchAll(/<(?:th|td)>([\s\S]*?)<\/(?:th|td)>/g)].map((c) => stripTags(c[1]))
    );
    return { kind: "table", rows };
  }
  return null;
}

export function containsMalformedCitation(text) {
  const opens = (text.match(/\[\^/g) ?? []).length;
  const closes = (text.match(/\]/g) ?? []).length;
  return opens > closes;
}

export function isStatusParagraph(block) {
  return block.kind === "paragraph" && STATUS_RE.test(block.text);
}

export function parseConversationHtml(html) {
  const source = html.match(/data-source="([^"]+)"/)?.[1] ?? "unknown";
  const turnNodes = discoverTurnNodes(html);
  const turns = turnNodes.map((turnHtml) => {
    const role = inferRole(turnHtml);
    const blocks = [...turnHtml.matchAll(/<(h[1-6]|p|blockquote|pre|ul|ol|table|hr)(?: [^>]*)?>([\s\S]*?)<\/\1>|<hr\s*\/>/g)]
      .map((match) => parseBlock(match[1] ?? "hr", match[2] ?? "", match[0]))
      .filter(Boolean);
    return { role, blocks };
  });
  return { source, turns };
}
