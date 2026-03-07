import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { exportConversation } from "../../packages/core/src/index.js";
import { NoTurnsFoundError, SelectorDriftError } from "../../packages/shared/src/index.js";

describe("failure paths", () => {
  it("errors when no turns are found", () => {
    const dom = new JSDOM("<div></div>");
    expect(() => exportConversation({ root: dom.window.document.body })).toThrowError(NoTurnsFoundError);
  });

  it("signals selector drift when conversation root exists but selectors changed", () => {
    const dom = new JSDOM('<div data-conversation-root><section class="msg">x</section></div>');
    expect(() => exportConversation({ root: dom.window.document.body })).toThrowError(SelectorDriftError);
  });

  it("handles malformed citations without crashing", () => {
    const dom = new JSDOM('<article data-role="assistant"><p>Broken [^99</p></article>');
    const result = exportConversation({ root: dom.window.document.body, options: { outputFormat: "markdown" } });
    expect(result.content).toContain("Broken");
  });

  it("parses partial DOM gracefully", () => {
    const dom = new JSDOM('<div><article data-role="assistant"><p>Visible</p></article><div class="placeholder">Loading</div></div>');
    const result = exportConversation({ root: dom.window.document.body, options: { outputFormat: "json" } });
    expect(JSON.parse(result.content).turns.length).toBeGreaterThan(0);
  });
});
