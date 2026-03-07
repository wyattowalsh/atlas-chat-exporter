import test from "node:test";
import assert from "node:assert/strict";
import { parseConversationFromHtml } from "../../packages/parser-dom/src/index.ts";
import { inferRole, isCitationText } from "../../packages/parser-dom/src/utils.ts";
import { NoTurnsFoundError } from "../../packages/shared/src/errors.ts";

test("infers role from data-role", () => {
  assert.equal(inferRole({ attrs: { "data-role": "assistant" }, classes: [] }), "assistant");
});

test("detects citation chips in raw html text", () => {
  assert.equal(isCitationText('<span class="citation-chip">1</span>'), true);
});

test("throws no-turns-found when selectors drift", () => {
  assert.throws(() => parseConversationFromHtml(`<div class=\"message\">orphan</div>`), NoTurnsFoundError);
});

test("handles malformed citation chip markup without throwing", () => {
  const html = `<article class=\"turn\" data-turn=\"1\" data-role=\"assistant\"><div class=\"content\"><p>Broken [<span class=\"citation-chip\"></span></p></div></article>`;
  const parsed = parseConversationFromHtml(html);
  assert.equal(parsed.turns[0]?.blocks[0]?.kind, "paragraph");
});

test("parses partially loaded DOM with incomplete turn content", () => {
  const html = `<article class=\"turn\" data-turn=\"1\" data-role=\"assistant\"><div class=\"content\"><p></p></div></article>`;
  const parsed = parseConversationFromHtml(html);
  assert.equal(parsed.turns.length, 1);
});
