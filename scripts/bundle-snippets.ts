import { mkdir, writeFile } from "node:fs/promises";
import { inspectSelectorsSnippet, snippetRuntime } from "../apps/snippets/src/templates.js";

const outDir = "apps/snippets/dist";

await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/copy-chat.js`, snippetRuntime("copy"));
await writeFile(`${outDir}/download-chat.js`, snippetRuntime("download"));
await writeFile(`${outDir}/inspect-chat-selectors.js`, inspectSelectorsSnippet());

console.log("Snippets bundled.");
