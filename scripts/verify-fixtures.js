import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { exportConversation } from "../packages/core/src/index.js";

const names = readdirSync("fixtures/raw-dom")
  .filter((name) => name.endsWith(".html"))
  .map((name) => name.replace(/\.html$/, ""))
  .sort();

let driftFound = false;

for (const name of names) {
  const html = readFileSync(join("fixtures/raw-dom", `${name}.html`), "utf8");
  const mdPath = join("fixtures/expected-md", `${name}.md`);
  const jsonPath = join("fixtures/expected-json", `${name}.json`);

  const actualMd = `${exportConversation(html, { outputFormat: "markdown" }).output.trim()}\n`;
  const actualJson = `${exportConversation(html, { outputFormat: "json" }).output.trim()}\n`;
  const expectedMd = readFileSync(mdPath, "utf8");
  const expectedJson = readFileSync(jsonPath, "utf8");

  if (actualMd !== expectedMd || actualJson !== expectedJson) {
    driftFound = true;
    console.error(`Fixture drift detected: ${name}`);
  }
}

if (driftFound) {
  console.error("Golden drift detected. Update expected outputs intentionally and commit them.");
  process.exit(1);
}

console.log(`Verified ${names.length} fixtures with no drift.`);
