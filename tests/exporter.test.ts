import { describe, expect, it } from "vitest";
import { exportConversation } from "../packages/core/src/index";
import type { ExportOptions, PageInput } from "../packages/shared/src/index";

const options: ExportOptions = {
  includeStatusUpdates: false,
  citationMode: "normalize",
  includeRoleHeadings: true,
  includeHorizontalRules: true,
  normalizeLinks: true,
  outputFormat: "markdown"
};

const sampleInput: PageInput = {
  title: "Demo Chat",
  source: "chatgpt-atlas",
  root: {
    tagName: "main",
    children: [
      {
        tagName: "article",
        attrs: { class: "message assistant", "data-role": "assistant" },
        children: [
          { tagName: "p", children: [{ text: "Thinking..." }] }
        ]
      },
      {
        tagName: "article",
        attrs: { class: "message user", "data-role": "user" },
        children: [{ tagName: "p", children: [{ text: "Summarize https://example.com:443/path#fragment" }] }]
      },
      {
        tagName: "article",
        attrs: { class: "message assistant", "data-role": "assistant" },
        children: [
          { tagName: "h2", children: [{ text: "Summary" }] },
          {
            tagName: "p",
            children: [
              { text: "Result" },
              { tagName: "span", attrs: { "data-citation": "true" }, children: [{ text: "1" }] }
            ]
          }
        ]
      },
      {
        tagName: "article",
        attrs: { class: "message assistant", "data-role": "assistant" },
        children: [
          { tagName: "h2", children: [{ text: "Summary" }] },
          {
            tagName: "p",
            children: [
              { text: "Result" },
              { tagName: "span", attrs: { "data-citation": "true" }, children: [{ text: "1" }] }
            ]
          }
        ]
      }
    ]
  }
};

describe("exportConversation", () => {
  it("parses, transforms, and renders markdown with deterministic cleanup", () => {
    const result = exportConversation(sampleInput, options);

    expect(result.content).toContain("# Demo Chat");
    expect(result.content).toContain("## user");
    expect(result.content).toContain("https://example.com/path");
    expect(result.content).toContain("Result");
    expect(result.content).toContain("[^1]");
    expect(result.content).not.toContain("Thinking");

    expect(result.metadata.removedInterimStatusTurns).toBe(1);
    expect(result.metadata.removedDuplicateTurns).toBe(1);
    expect(result.metadata.citationActions.normalized).toBe(1);
  });

  it("renders json", () => {
    const result = exportConversation(sampleInput, { ...options, outputFormat: "json", citationMode: "strip" });
    const parsed = JSON.parse(result.content);
    expect(parsed.turns.length).toBe(2);
  });
});
