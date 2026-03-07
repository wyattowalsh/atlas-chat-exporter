#!/usr/bin/env node
import fs from "node:fs/promises";

const copy = "javascript:(async()=>{await import('https://localhost/atlas/apps/snippets/copy-chat.js')})();\n";
const download = "javascript:(async()=>{await import('https://localhost/atlas/apps/snippets/download-chat.js')})();\n";
await fs.writeFile(new URL("../apps/bookmarklets/copy-chat.bookmarklet.txt", import.meta.url), copy, "utf8");
await fs.writeFile(new URL("../apps/bookmarklets/download-chat.bookmarklet.txt", import.meta.url), download, "utf8");
