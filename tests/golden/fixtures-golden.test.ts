import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
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
] as const;

describe("golden fixtures", () => {
  for (const name of fixtureNames) {
    it(`${name} -> markdown`, () => {
      const html = readFileSync(join("fixtures/raw-dom", `${name}.html`), "utf8");
      const expected = readFileSync(join("fixtures/expected-md", `${name}.md`), "utf8").trim();
      const output = exportConversation(html, { outputFormat: "markdown" }).output.trim();
      expect(output).toBe(expected);
    });

    it(`${name} -> json`, () => {
      const html = readFileSync(join("fixtures/raw-dom", `${name}.html`), "utf8");
      const expected = readFileSync(join("fixtures/expected-json", `${name}.json`), "utf8").trim();
      const output = exportConversation(html, { outputFormat: "json" }).output.trim();
      expect(output).toBe(expected);
    });
  }
});
