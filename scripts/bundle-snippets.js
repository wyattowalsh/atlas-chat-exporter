#!/usr/bin/env node
import fs from "node:fs/promises";

const mapping = [
  ["copy-chat.js", "(() => import('./src/index.js').then((m) => m.copyChat()))();\n"],
  ["download-chat.js", "(() => import('./src/index.js').then((m) => m.downloadChat()))();\n"],
  ["inspect-chat-selectors.js", "(() => import('./src/index.js').then((m) => console.log(m.inspectChatSelectors())))();\n"]
];

for (const [name, content] of mapping) {
  await fs.writeFile(new URL(`../apps/snippets/${name}`, import.meta.url), content, "utf8");
}
