import { UI_NOISE_PATTERNS, normalizeInlineWhitespace } from "@atlas/shared";
const TURN_SELECTORS = [
    '[data-message-author-role]',
    '[data-testid="conversation-turn"]',
    'article[data-turn-role]',
    'article'
].join(",");
export function discoverTurnNodes(root) {
    const nodes = Array.from(root.querySelectorAll(TURN_SELECTORS));
    return nodes.map((node) => ({
        node,
        roleHint: node.getAttribute("data-message-author-role") ??
            node.getAttribute("data-turn-role") ??
            node.getAttribute("data-role") ??
            undefined
    }));
}
export function inferRole(turnNode) {
    const hint = turnNode.roleHint?.toLowerCase();
    if (hint === "user" || hint === "assistant" || hint === "system") {
        return hint;
    }
    const labels = [
        turnNode.node.getAttribute("aria-label"),
        turnNode.node.textContent?.slice(0, 64)
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    if (labels.includes("you said") || labels.includes("user")) {
        return "user";
    }
    if (labels.includes("assistant") || labels.includes("chatgpt")) {
        return "assistant";
    }
    if (labels.includes("system")) {
        return "system";
    }
    return "unknown";
}
export function isCitationNode(node) {
    const className = node.className.toString().toLowerCase();
    const aria = (node.getAttribute("aria-label") ?? "").toLowerCase();
    const role = (node.getAttribute("role") ?? "").toLowerCase();
    const text = normalizeInlineWhitespace(node.textContent ?? "");
    return (className.includes("citation") ||
        aria.includes("citation") ||
        aria.includes("source") ||
        role === "doc-noteref" ||
        /^\[(\d+|source)\]$/i.test(text));
}
export function isUiNoiseText(text) {
    return UI_NOISE_PATTERNS.some((pattern) => pattern.test(text.trim()));
}
function parseList(element) {
    const ordered = element.tagName.toLowerCase() === "ol";
    const items = Array.from(element.children)
        .filter((child) => child.tagName.toLowerCase() === "li")
        .map((li) => {
        const nestedList = Array.from(li.children).find((child) => child.tagName.toLowerCase() === "ul" || child.tagName.toLowerCase() === "ol");
        const childItems = nestedList
            ? parseList(nestedList).items
            : undefined;
        const ownText = normalizeInlineWhitespace(Array.from(li.childNodes)
            .filter((child) => child !== nestedList)
            .map((child) => child.textContent ?? "")
            .join(" "));
        return {
            text: ownText,
            ...(childItems && childItems.length > 0 ? { children: childItems } : {})
        };
    });
    return { kind: "list", ordered, items };
}
function parseTable(element) {
    const rows = Array.from(element.querySelectorAll("tr")).map((tr) => Array.from(tr.querySelectorAll("th,td")).map((cell) => normalizeInlineWhitespace(cell.textContent ?? "")));
    return { kind: "table", rows };
}
function parseNodeToBlock(element) {
    if (isCitationNode(element)) {
        return { kind: "raw", text: `[[citation:${normalizeInlineWhitespace(element.textContent ?? "")}]]` };
    }
    const tag = element.tagName.toLowerCase();
    const text = normalizeInlineWhitespace(element.textContent ?? "");
    if (!text && tag !== "hr" && tag !== "pre" && tag !== "table") {
        return null;
    }
    if (isUiNoiseText(text)) {
        return null;
    }
    if (/^h[1-6]$/.test(tag)) {
        return { kind: "heading", level: Number(tag[1]), text };
    }
    if (tag === "p") {
        return { kind: "paragraph", text };
    }
    if (tag === "blockquote") {
        return { kind: "blockquote", text };
    }
    if (tag === "pre") {
        const codeNode = element.querySelector("code");
        const languageClass = codeNode?.className.match(/language-([\w-]+)/)?.[1];
        return { kind: "code", language: languageClass, code: (codeNode?.textContent ?? element.textContent ?? "").trim() };
    }
    if (tag === "ul" || tag === "ol") {
        return parseList(element);
    }
    if (tag === "table") {
        return parseTable(element);
    }
    if (tag === "hr") {
        return { kind: "rule" };
    }
    if (["div", "section", "article"].includes(tag)) {
        return null;
    }
    return { kind: "raw", text };
}
export function parseTurnBlocks(turnElement) {
    const contentRoot = turnElement.querySelector('[data-message-content], .markdown, [data-testid="message-content"]') ??
        turnElement;
    const candidates = Array.from(contentRoot.children);
    const blocks = [];
    for (const child of candidates) {
        const block = parseNodeToBlock(child);
        if (block) {
            blocks.push(block);
        }
    }
    if (blocks.length === 0) {
        const fallbackText = normalizeInlineWhitespace(contentRoot.textContent ?? "");
        if (fallbackText) {
            blocks.push({ kind: "paragraph", text: fallbackText });
        }
    }
    return blocks;
}
export function parseConversationFromDom(input) {
    const turnNodes = discoverTurnNodes(input.root);
    const turns = turnNodes.map((turnNode) => ({
        role: inferRole(turnNode),
        blocks: parseTurnBlocks(turnNode.node)
    }));
    return {
        title: input.title,
        source: input.source ?? "unknown",
        exportedAt: input.exportedAt ?? new Date().toISOString(),
        turns
    };
}
