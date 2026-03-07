import test from "node:test";
import assert from "node:assert/strict";
import { containsMalformedCitation, inferRole, parseConversationHtml } from "../../packages/parser-dom/src/index.js";
import { cleanParagraph, collapseDuplicateTurns, normalizeWhitespace } from "../../packages/transform/src/index.js";

test("infers roles from attributes", () => {
  const { turns } = parseConversationHtml('<div><article data-turn data-role="assistant"><p>x</p></article></div>');
  assert.equal(turns[0]?.role, "assistant");
});

test("detects malformed citations", () => {
  assert.equal(containsMalformedCitation("Broken [^12"), true);
  assert.equal(containsMalformedCitation("Ok [^1] note"), false);
});

test("falls back to unknown role", () => {
  assert.equal(inferRole("<article data-turn><p>x</p></article>"), "unknown");
});

test("normalizes whitespace", () => {
  assert.equal(normalizeWhitespace("a   b\n c"), "a b c");
});

test("normalizes citations", () => {
  assert.equal(cleanParagraph("Text [1]", "normalize"), "Text [^1]");
});

test("collapses adjacent duplicates", () => {
  const collapsed = collapseDuplicateTurns([
    { role: "assistant", blocks: [{ kind: "paragraph", text: "same" }] },
    { role: "assistant", blocks: [{ kind: "paragraph", text: "same" }] },
    { role: "assistant", blocks: [{ kind: "paragraph", text: "next" }] }
  ]);
  assert.equal(collapsed.length, 2);
});
