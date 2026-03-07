import test from "node:test";
import assert from "node:assert/strict";
import { runCli } from "../../apps/cli/src/index.js";
import { copyExport, downloadExport } from "../../apps/extension/src/index.js";

const html = '<div data-conversation-root><article data-turn data-role="assistant"><p>Smoke</p></article></div>';

test("cli emits markdown", () => {
  assert.equal(runCli(html, "markdown").includes("Smoke"), true);
});

test("copy action writes to clipboard callback", async () => {
  let called = false;
  await copyExport(html, async () => {
    called = true;
  });
  assert.equal(called, true);
});

test("download action delegates save callback", () => {
  let filename = "";
  let content = "";
  downloadExport(html, (name, text) => {
    filename = name;
    content = text;
  });
  assert.equal(filename, "chat-export.md");
  assert.equal(content.includes("Smoke"), true);
});
