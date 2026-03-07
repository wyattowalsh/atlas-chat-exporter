import { describe, expect, it } from "vitest";
import { containsMalformedCitation, inferRole, parseConversationHtml } from "../../packages/parser-dom/src/index.js";
import { cleanParagraph, collapseDuplicateTurns, normalizeWhitespace } from "../../packages/transform/src/index.js";

describe("parser helpers", () => {
  it("infers roles from attributes", () => {
    const { turns } = parseConversationHtml('<div><article data-turn data-role="assistant"><p>x</p></article></div>');
    expect(turns[0]?.role).toBe("assistant");
  });

  it("detects malformed citations", () => {
    expect(containsMalformedCitation("Broken [^12")).toBe(true);
    expect(containsMalformedCitation("Ok [^1] note")).toBe(false);
  });

  it("falls back to unknown role", () => {
    const el = { getAttribute: () => null, className: "" } as unknown as Element;
    expect(inferRole(el)).toBe("unknown");
  });
});

describe("transform helpers", () => {
  it("normalizes whitespace", () => {
    expect(normalizeWhitespace("a   b\n c")).toBe("a b c");
  });

  it("normalizes citations", () => {
    expect(cleanParagraph("Text [1]", "normalize")).toBe("Text [^1]");
  });

  it("collapses adjacent duplicates", () => {
    const collapsed = collapseDuplicateTurns([
      { role: "assistant", blocks: [{ kind: "paragraph", text: "same" }] },
      { role: "assistant", blocks: [{ kind: "paragraph", text: "same" }] },
      { role: "assistant", blocks: [{ kind: "paragraph", text: "next" }] }
    ]);
    expect(collapsed).toHaveLength(2);
  });
});
