import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { JSDOM } from "jsdom";
import { exportConversation } from "../packages/core/src/index.js";

const update = process.argv.includes("--update");
const FIXED_NOW = new Date("2024-01-01T00:00:00.000Z");
const fixtureDir = "fixtures/raw-dom";
const names = readdirSync(fixtureDir)
  .filter((name) => name.endsWith(".html"))
  .map((name) => name.replace(/\.html$/, ""))
  .sort();

let driftFound = false;

function buildContext(document: Document) {
  const sourceHint = document.querySelector("[data-source]")?.getAttribute("data-source")?.toLowerCase() ?? "";
  const locationHref = sourceHint === "chatgpt-atlas" ? "https://atlas.example/chat" : "https://chatgpt.com/c/fixture";
  return {
    now: FIXED_NOW,
    locationHref,
    documentTitle: document.title || undefined
  };
}

for (const name of names) {
  const html = readFileSync(join(fixtureDir, `${name}.html`), "utf8");
  const dom = new JSDOM(html);
  const root = dom.window.document.body;
  const context = buildContext(dom.window.document);

  const mdPath = join("fixtures/expected-md", `${name}.md`);
  const jsonPath = join("fixtures/expected-json", `${name}.json`);

  const actualMd = exportConversation({ root, context, options: { outputFormat: "markdown" } }).content;
  const actualJson = exportConversation({ root, context, options: { outputFormat: "json" } }).content;

  const expectedMd = readFileSync(mdPath, "utf8");
  const expectedJson = readFileSync(jsonPath, "utf8");

  if (expectedMd !== actualMd || expectedJson !== actualJson) {
    if (update) {
      writeFileSync(mdPath, actualMd, "utf8");
      writeFileSync(jsonPath, actualJson, "utf8");
      console.log(`Updated fixture outputs: ${name}`);
    } else {
      driftFound = true;
      console.error(`Fixture drift detected: ${name}`);
    }
  }
}

if (driftFound) {
  console.error("Golden drift detected. Re-run with --update only when updates are intentional.");
  process.exit(1);
}

console.log(`Verified ${names.length} fixtures with no drift.`);
