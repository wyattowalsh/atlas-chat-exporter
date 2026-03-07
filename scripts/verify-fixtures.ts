import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { exportConversation } from "../packages/core/src/index.js";

const update = process.argv.includes("--update");
const fixtureDir = "fixtures/raw-dom";
const names = readdirSync(fixtureDir)
  .filter((name) => name.endsWith(".html"))
  .map((name) => name.replace(/\.html$/, ""))
  .sort();

let driftFound = false;

for (const name of names) {
  const html = readFileSync(join(fixtureDir, `${name}.html`), "utf8");
  const mdPath = join("fixtures/expected-md", `${name}.md`);
  const jsonPath = join("fixtures/expected-json", `${name}.json`);

  const actualMd = `${exportConversation(html, { outputFormat: "markdown" }).output.trim()}\n`;
  const actualJson = `${exportConversation(html, { outputFormat: "json" }).output.trim()}\n`;

  const expectedMd = readFileSync(mdPath, "utf8");
  const expectedJson = readFileSync(jsonPath, "utf8");

  if (expectedMd !== actualMd || expectedJson !== actualJson) {
    driftFound = true;
    console.error(`Fixture drift detected: ${name}`);
  }
}

if (driftFound) {
  console.error("Golden drift detected. Re-generate expected outputs deliberately (e.g. local tooling) and commit updates.");
  process.exit(1);
}

console.log(`Verified ${names.length} fixtures with no drift.`);
