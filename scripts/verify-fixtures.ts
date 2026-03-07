import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { exportFromHtml } from "../packages/core/src/index.ts";

const rawDir = "fixtures/raw-dom";
const mdDir = "fixtures/expected-md";
const jsonDir = "fixtures/expected-json";

const rawFiles = readdirSync(rawDir).filter((f) => f.endsWith(".html"));
const failures: string[] = [];

for (const rawFile of rawFiles) {
  const name = rawFile.replace(/\.html$/, "");
  const html = readFileSync(join(rawDir, rawFile), "utf8");

  const mdActual = exportFromHtml(html, { outputFormat: "markdown", includeStatusUpdates: false, citationMode: "normalize" }).trim();
  const mdExpected = readFileSync(join(mdDir, `${name}.md`), "utf8").trim();
  if (mdActual !== mdExpected) {
    failures.push(`${name}: markdown output drift detected`);
  }

  const jsonActualObj = JSON.parse(exportFromHtml(html, { outputFormat: "json", includeStatusUpdates: false, citationMode: "normalize" }));
  const jsonExpectedObj = JSON.parse(readFileSync(join(jsonDir, `${name}.json`), "utf8"));
  delete jsonActualObj.exportedAt;
  delete jsonExpectedObj.exportedAt;
  if (JSON.stringify(jsonActualObj) !== JSON.stringify(jsonExpectedObj)) {
    failures.push(`${name}: json output drift detected`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Verified ${rawFiles.length} fixture(s) with no drift.`);
