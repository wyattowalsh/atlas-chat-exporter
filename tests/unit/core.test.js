import test from "node:test";
import assert from "node:assert/strict";
import { exportFromHtml } from "../../packages/core/src/index.js";

test("exports markdown from html", () => {
  const result = exportFromHtml("<p>Hello</p>", { outputFormat: "markdown" });
  assert.match(result.output, /Hello/);
});

test("exports json from html", () => {
  const result = exportFromHtml("<p>Hello</p>", { outputFormat: "json" });
  const parsed = JSON.parse(result.output);
  assert.equal(parsed.turns[0].blocks[0].kind, "paragraph");
});
