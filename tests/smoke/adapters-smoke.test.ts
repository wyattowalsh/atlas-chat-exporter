import { describe, expect, it, vi } from "vitest";
import { runCli } from "../../apps/cli/src/index.js";
import { copyExport, downloadExport } from "../../apps/extension/src/index.js";

const html = '<div data-conversation-root><article data-turn data-role="assistant"><p>Smoke</p></article></div>';

describe("adapter smoke tests", () => {
  it("cli emits markdown", () => {
    expect(runCli(html, "markdown")).toContain("Smoke");
  });

  it("copy action writes to clipboard callback", async () => {
    const write = vi.fn(async (_text: string) => undefined);
    await copyExport(html, write);
    expect(write).toHaveBeenCalledOnce();
  });

  it("download action delegates save callback", () => {
    const save = vi.fn();
    downloadExport(html, save);
    expect(save).toHaveBeenCalledWith("chat-export.md", expect.stringContaining("Smoke"));
  });
});
