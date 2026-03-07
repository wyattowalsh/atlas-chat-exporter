import { writeFileSync } from "node:fs";
import { snippetTemplates } from "../apps/snippets/src/templates.js";
import { bookmarkletTemplates } from "../apps/bookmarklets/src/templates.js";

for (const [name, code] of Object.entries(snippetTemplates)) {
  writeFileSync(new URL(`../apps/snippets/generated/${name}.js`, import.meta.url), `${code}\n`);
}

for (const [name, code] of Object.entries(bookmarkletTemplates)) {
  writeFileSync(new URL(`../apps/bookmarklets/generated/${name}.txt`, import.meta.url), `javascript:${encodeURIComponent(code)}\n`);
}

console.log("Generated snippets and bookmarklets");
