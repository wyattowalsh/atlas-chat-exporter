import test from "node:test";
import assert from "node:assert/strict";
import { copyChat, downloadChat } from "../../apps/snippets/src/index.ts";
import { ClipboardBlockedError, DownloadBlockedError } from "../../packages/shared/src/errors.ts";

test("copies chat content", async () => {
  let received = "";
  const clipboard = { writeText: async (text: string) => { received = text; } };
  await copyChat("hello", clipboard);
  assert.equal(received, "hello");
});

test("fails when clipboard is blocked", async () => {
  const clipboard = { writeText: async () => { throw new Error("blocked"); } };
  await assert.rejects(() => copyChat("hello", clipboard), ClipboardBlockedError);
});

test("downloads chat content", async () => {
  let file = "";
  let content = "";
  const downloader = { download: async (f: string, c: string) => { file = f; content = c; } };
  await downloadChat("chat.md", "hello", downloader);
  assert.equal(file, "chat.md");
  assert.equal(content, "hello");
});

test("fails when download is blocked", async () => {
  const downloader = { download: async () => { throw new Error("blocked"); } };
  await assert.rejects(() => downloadChat("chat.md", "hello", downloader), DownloadBlockedError);
});
