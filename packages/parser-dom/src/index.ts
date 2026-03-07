import type { Block, DomNode, ListItem, PageInput, Role, Turn } from "../../shared/src/index";

const TURN_HINT_TAGS = new Set(["article", "section", "div"]);

const isTextNode = (node: DomNode): boolean => !node.tagName;

const nodeText = (node: DomNode): string => {
  if (isTextNode(node)) {
    return node.text ?? "";
  }
  return (node.children ?? []).map(nodeText).join("") || node.text || "";
};

const normalize = (value: string): string => value.replace(/\s+/g, " ").trim();

const hasClassHint = (node: DomNode, hint: string): boolean =>
  (node.attrs?.class ?? "").toLowerCase().includes(hint);

const hasAttrHint = (node: DomNode, attr: string, hint: string): boolean =>
  (node.attrs?.[attr] ?? "").toLowerCase().includes(hint);

export const isCitationNode = (node: DomNode): boolean => {
  const tag = (node.tagName ?? "").toLowerCase();
  if (node.attrs?.["data-citation"] === "true") return true;
  if (hasClassHint(node, "citation") || hasClassHint(node, "footnote")) return true;
  if (tag === "sup" && (node.children ?? []).some((child) => (child.tagName ?? "").toLowerCase() === "a")) {
    return true;
  }
  return tag === "a" && hasAttrHint(node, "rel", "citation");
};

const inferRole = (node: DomNode): Role => {
  const joined = [
    node.attrs?.["data-role"],
    node.attrs?.["aria-label"],
    node.attrs?.class,
    nodeText(node).slice(0, 120)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (joined.includes("assistant") || joined.includes("chatgpt") || joined.includes("atlas")) return "assistant";
  if (joined.includes("user") || joined.includes("you said")) return "user";
  if (joined.includes("system")) return "system";
  return "unknown";
};

const parseListItems = (node: DomNode): ListItem[] => {
  const items = (node.children ?? []).filter((child) => (child.tagName ?? "").toLowerCase() === "li");
  return items.map((item) => {
    const nested = (item.children ?? []).find((child) => ["ul", "ol"].includes((child.tagName ?? "").toLowerCase()));
    const textOnlyChildren = (item.children ?? []).filter((child) => child !== nested);
    return {
      text: normalize(textOnlyChildren.map(nodeText).join(" ")),
      children: nested ? parseListItems(nested) : undefined
    };
  });
};

const parseBlock = (node: DomNode): Block | null => {
  const tag = (node.tagName ?? "").toLowerCase();

  if (isCitationNode(node)) {
    return { kind: "raw", text: `[citation:${normalize(nodeText(node))}]` };
  }

  if (/^h[1-6]$/.test(tag)) {
    return { kind: "heading", level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6, text: normalize(nodeText(node)) };
  }

  if (tag === "p") return { kind: "paragraph", text: normalize(nodeText(node)) };

  if (tag === "pre") {
    const codeNode = (node.children ?? []).find((child) => (child.tagName ?? "").toLowerCase() === "code");
    return {
      kind: "code",
      language: codeNode?.attrs?.["data-language"] ?? codeNode?.attrs?.class?.replace("language-", ""),
      code: (codeNode ? nodeText(codeNode) : nodeText(node)).replace(/\n$/, "")
    };
  }

  if (tag === "blockquote") return { kind: "blockquote", text: normalize(nodeText(node)) };

  if (tag === "ul" || tag === "ol") {
    return { kind: "list", ordered: tag === "ol", items: parseListItems(node) };
  }

  if (tag === "table") {
    const rows = (node.children ?? [])
      .filter((child) => ["thead", "tbody", "tr"].includes((child.tagName ?? "").toLowerCase()))
      .flatMap((section) => {
        const sTag = (section.tagName ?? "").toLowerCase();
        if (sTag === "tr") return [section];
        return (section.children ?? []).filter((row) => (row.tagName ?? "").toLowerCase() === "tr");
      })
      .map((row) =>
        (row.children ?? [])
          .filter((cell) => ["th", "td"].includes((cell.tagName ?? "").toLowerCase()))
          .map((cell) => normalize(nodeText(cell)))
      )
      .filter((row) => row.length > 0);

    return { kind: "table", rows };
  }

  if (tag === "hr") return { kind: "rule" };

  if (!tag && normalize(node.text ?? "")) return { kind: "paragraph", text: normalize(node.text ?? "") };

  if (["div", "span", "article", "section"].includes(tag)) {
    const collected = normalize(nodeText(node));
    if (collected) return { kind: "raw", text: collected };
  }

  return null;
};

const discoverTurnNodes = (root: DomNode): DomNode[] => {
  const queue: DomNode[] = [root];
  const candidates: DomNode[] = [];

  while (queue.length) {
    const current = queue.shift()!;
    const tag = (current.tagName ?? "").toLowerCase();

    if (
      TURN_HINT_TAGS.has(tag) &&
      (current.attrs?.["data-role"] || hasClassHint(current, "message") || hasClassHint(current, "turn") || hasAttrHint(current, "aria-label", "message"))
    ) {
      candidates.push(current);
      continue;
    }

    queue.push(...(current.children ?? []));
  }

  if (candidates.length > 0) return candidates;

  return (root.children ?? []).filter((node) => normalize(nodeText(node)).length > 0);
};

const parseBlocks = (turnNode: DomNode): Block[] => {
  const directChildren = turnNode.children ?? [];
  const fromChildren = directChildren.map(parseBlock).filter((block): block is Block => Boolean(block));
  if (fromChildren.length > 0) return fromChildren;

  const fallback = parseBlock(turnNode);
  return fallback ? [fallback] : [];
};

export interface ParseResult {
  title?: string;
  source: "chatgpt-atlas" | "chatgpt-web" | "unknown";
  turns: Turn[];
}

export const parseDomConversation = (input: PageInput): ParseResult => {
  const turnNodes = discoverTurnNodes(input.root);

  const turns = turnNodes
    .map((turnNode) => ({ role: inferRole(turnNode), blocks: parseBlocks(turnNode) }))
    .filter((turn) => turn.blocks.length > 0);

  return {
    title: input.title,
    source: input.source ?? "unknown",
    turns
  };
};
