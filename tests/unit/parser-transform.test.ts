import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { inferRole, parseTurn } from "../../packages/parser-dom/src/index.js";
import { transformConversation } from "../../packages/transform/src/index.js";
import type { ConversationDoc } from "../../packages/shared/src/index.js";

describe("parser helpers", () => {
  it("infers role from data-message-author-role", () => {
    const dom = new JSDOM('<article data-message-author-role="assistant"><p>x</p></article>');
    const turn = dom.window.document.querySelector("article");
    expect(turn).toBeTruthy();
    expect(inferRole(turn!)).toBe("assistant");
  });

  it("infers role from data-role fallback", () => {
    const dom = new JSDOM('<article data-role="user"><p>x</p></article>');
    const turn = dom.window.document.querySelector("article");
    expect(turn).toBeTruthy();
    expect(inferRole(turn!)).toBe("user");
  });

  it("parses structured blocks", () => {
    const dom = new JSDOM('<article data-role="assistant"><h2>Heading</h2><p>Body</p><ul><li>One</li></ul></article>');
    const turnEl = dom.window.document.querySelector("article");
    const turn = parseTurn(turnEl!);
    expect(turn.blocks[0]?.kind).toBe("heading");
    expect(turn.blocks[1]?.kind).toBe("paragraph");
    expect(turn.blocks[2]?.kind).toBe("list");
  });
});

describe("transform pipeline", () => {
  it("drops interim assistant status updates when disabled", () => {
    const doc: ConversationDoc = {
      source: "chatgpt-web",
      exportedAt: new Date().toISOString(),
      turns: [
        { role: "assistant", blocks: [{ kind: "paragraph", text: "thinking about this..." }] },
        { role: "assistant", blocks: [{ kind: "paragraph", text: "Final answer" }] }
      ]
    };

    const transformed = transformConversation(doc, {
      includeStatusUpdates: false,
      citationMode: "normalize",
      includeRoleHeadings: true,
      includeHorizontalRules: false,
      normalizeLinks: true,
      outputFormat: "markdown"
    });

    expect(transformed.turns).toHaveLength(1);
    expect((transformed.turns[0]?.blocks[0] as { text: string }).text).toContain("Final answer");
  });

  it("collapses adjacent duplicates", () => {
    const doc: ConversationDoc = {
      source: "chatgpt-web",
      exportedAt: new Date().toISOString(),
      turns: [
        { role: "assistant", blocks: [{ kind: "paragraph", text: "same" }] },
        { role: "assistant", blocks: [{ kind: "paragraph", text: "same" }] },
        { role: "assistant", blocks: [{ kind: "paragraph", text: "next" }] }
      ]
    };

    const transformed = transformConversation(doc, {
      includeStatusUpdates: true,
      citationMode: "normalize",
      includeRoleHeadings: true,
      includeHorizontalRules: false,
      normalizeLinks: true,
      outputFormat: "markdown"
    });

    expect(transformed.turns).toHaveLength(2);
  });
});
