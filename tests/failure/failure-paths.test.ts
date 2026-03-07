import { describe, expect, it } from "vitest";
import { NoTurnsFoundError, exportConversation } from "../../packages/core/src/index.js";
import { SelectorDriftError, parseConversationHtml } from "../../packages/parser-dom/src/index.js";
import { copyExport, downloadExport } from "../../apps/extension/src/index.js";

describe("failure paths", () => {
  it("errors when no turns are found", () => {
    expect(() => exportConversation("<div></div>")).toThrowError(NoTurnsFoundError);
  });

  it("signals selector drift when conversation root exists but selectors changed", () => {
    expect(() => parseConversationHtml('<div data-conversation-root><section class="msg">x</section></div>')).toThrowError(
      SelectorDriftError
    );
  });

  it("sanitizes malformed citations instead of crashing", () => {
    const html = '<div data-conversation-root><article data-turn data-role="assistant"><p>Broken [^99</p></article></div>';
    expect(exportConversation(html).output).toContain("Broken");
    expect(exportConversation(html).output).not.toContain("[^99");
  });

  it("surfaces blocked clipboard copy failures", async () => {
    const html = '<div data-conversation-root><article data-turn data-role="assistant"><p>x</p></article></div>';
    await expect(copyExport(html, async () => Promise.reject(new Error("clipboard blocked")))).rejects.toThrow(
      "clipboard blocked"
    );
  });

  it("surfaces blocked download failures", () => {
    const html = '<div data-conversation-root><article data-turn data-role="assistant"><p>x</p></article></div>';
    expect(() => downloadExport(html, () => {
      throw new Error("download blocked");
    })).toThrow("download blocked");
  });

  it("parses partial dom without requiring placeholders", () => {
    const html =
      '<div data-conversation-root><article data-turn data-role="assistant"><p>Visible</p></article><article class="placeholder">Loading</article></div>';
    const result = exportConversation(html, { outputFormat: "json" }).doc;
    expect(result.turns).toHaveLength(1);
  });
});
