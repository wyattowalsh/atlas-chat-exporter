import { readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { exportConversation } from "../../packages/core/src/index.js";

const FIXED_NOW = new Date("2024-01-01T00:00:00.000Z");
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

function buildContext(document: Document) {
  const sourceHint = document.querySelector("[data-source]")?.getAttribute("data-source")?.toLowerCase() ?? "";
  const locationHref = sourceHint === "chatgpt-atlas" ? "https://atlas.example/chat" : "https://chatgpt.com/c/fixture";
  return {
    now: FIXED_NOW,
    locationHref,
    documentTitle: document.title || undefined
  };
}

describe("golden fixtures", () => {
  for (const name of fixtureNames) {
    it(`${name} -> markdown`, () => {
      const html = readFileSync(join("fixtures/raw-dom", `${name}.html`), "utf8");
      const dom = new JSDOM(html);
      const context = buildContext(dom.window.document);
      const expected = readFileSync(join("fixtures/expected-md", `${name}.md`), "utf8").trim();
      const output = exportConversation({
        root: dom.window.document.body,
        context,
        options: { outputFormat: "markdown" }
      }).content.trim();
      expect(output).toBe(expected);
    });

    it(`${name} -> json`, () => {
      const html = readFileSync(join("fixtures/raw-dom", `${name}.html`), "utf8");
      const dom = new JSDOM(html);
      const context = buildContext(dom.window.document);
      const expected = readFileSync(join("fixtures/expected-json", `${name}.json`), "utf8").trim();
      const output = exportConversation({
        root: dom.window.document.body,
        context,
        options: { outputFormat: "json" }
      }).content.trim();
      expect(output).toBe(expected);
    });
  }
});
