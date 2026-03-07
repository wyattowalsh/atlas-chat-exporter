import test from "node:test";
import assert from "node:assert/strict";
import { NoTurnsFoundError, exportConversation } from "../../packages/core/src/index.js";
import { SelectorDriftError, parseConversationHtml } from "../../packages/parser-dom/src/index.js";
import { copyExport, downloadExport } from "../../apps/extension/src/index.js";

test("errors when no turns are found", () => {
  assert.throws(() => exportConversation("<div></div>"), NoTurnsFoundError);
});

test("signals selector drift when conversation root exists but selectors changed", () => {
  assert.throws(() => parseConversationHtml('<div data-conversation-root><section class="msg">x</section></div>'), SelectorDriftError);
});

test("sanitizes malformed citations instead of crashing", () => {
  const html = '<div data-conversation-root><article data-turn data-role="assistant"><p>Broken [^99</p></article></div>';
  const output = exportConversation(html).output;
  assert.equal(output.includes("Broken"), true);
  assert.equal(output.includes("[^99"), false);
});

test("surfaces blocked clipboard copy failures", async () => {
  const html = '<div data-conversation-root><article data-turn data-role="assistant"><p>x</p></article></div>';
  await assert.rejects(() => copyExport(html, async () => Promise.reject(new Error("clipboard blocked"))), /clipboard blocked/);
});

test("surfaces blocked download failures", () => {
  const html = '<div data-conversation-root><article data-turn data-role="assistant"><p>x</p></article></div>';
  assert.throws(() => downloadExport(html, () => {
    throw new Error("download blocked");
  }), /download blocked/);
});

test("parses partial dom without requiring placeholders", () => {
  const html = '<div data-conversation-root><article data-turn data-role="assistant"><p>Visible</p></article><article class="placeholder">Loading</article></div>';
  const result = exportConversation(html, { outputFormat: "json" }).doc;
  assert.equal(result.turns.length, 1);
});
