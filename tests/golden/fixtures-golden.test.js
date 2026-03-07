import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { exportConversation } from "../../packages/core/src/index.js";

const fixtureNames = [
  "short-simple",
  "long-research",
  "code-heavy",
  "citation-heavy",
  "nested-list",
  "table-heavy",
  "status-update",
  "partial-lazy",
  "duplicate-turn"
];

for (const name of fixtureNames) {
  test(`${name} -> markdown`, () => {
    const html = readFileSync(join("fixtures/raw-dom", `${name}.html`), "utf8");
    const expected = readFileSync(join("fixtures/expected-md", `${name}.md`), "utf8").trim();
    const output = exportConversation(html, { outputFormat: "markdown" }).output.trim();
    assert.equal(output, expected);
  });

  test(`${name} -> json`, () => {
    const html = readFileSync(join("fixtures/raw-dom", `${name}.html`), "utf8");
    const expected = readFileSync(join("fixtures/expected-json", `${name}.json`), "utf8").trim();
    const output = exportConversation(html, { outputFormat: "json" }).output.trim();
    assert.equal(output, expected);
  });
}
