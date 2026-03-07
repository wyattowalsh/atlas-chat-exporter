import { mkdir, readFile, writeFile } from "node:fs/promises";

const snippetsDir = "apps/snippets/dist";
const outDir = "apps/bookmarklets/dist";

await mkdir(outDir, { recursive: true });

for (const name of ["copy-chat", "download-chat"]) {
  const source = (await readFile(`${snippetsDir}/${name}.js`, "utf-8")).replace(/\s+/g, " ").trim();
  const bookmarklet = `javascript:${encodeURIComponent(source)}`;
  await writeFile(`${outDir}/${name}.bookmarklet.txt`, bookmarklet);
}

console.log("Bookmarklets bundled.");
