import test from "node:test";
import assert from "node:assert/strict";
import { applyTransforms, collapseAdjacentDuplicates, stripStatusUpdates } from "../../packages/transform/src/index.ts";
import type { ConversationDoc } from "../../packages/shared/src/types.ts";

const baseDoc: ConversationDoc = {
  title: "x",
  source: "unknown",
  exportedAt: "2020-01-01T00:00:00.000Z",
  turns: [
    { role: "assistant", blocks: [{ kind: "paragraph", text: "Thinking..." }] },
    { role: "assistant", blocks: [{ kind: "paragraph", text: "Thinking..." }] },
    { role: "user", blocks: [{ kind: "paragraph", text: "You said: hi [1]" }] }
  ]
};

test("strips status updates when configured", () => {
  const doc = stripStatusUpdates(baseDoc);
  assert.equal(doc.turns[0]?.blocks.length, 0);
});

test("collapses adjacent duplicates", () => {
  const doc = collapseAdjacentDuplicates(baseDoc);
  assert.equal(doc.turns.length, 2);
});

test("normalizes citations and UI text", () => {
  const out = applyTransforms(baseDoc, {
    includeStatusUpdates: true,
    citationMode: "normalize",
    includeRoleHeadings: true,
    includeHorizontalRules: false,
    normalizeLinks: true,
    outputFormat: "markdown"
  });
  assert.equal((out.turns[1]?.blocks[0] as { text: string }).text, "hi (citation: 1)");
});
