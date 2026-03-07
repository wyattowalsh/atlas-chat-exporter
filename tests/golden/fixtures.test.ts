import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { exportFromHtml } from "../../packages/core/src/index.ts";

for (const file of readdirSync("fixtures/raw-dom").filter((f) => f.endsWith(".html"))) {
  const name = file.replace(/\.html$/, "");

  test(`${name} -> markdown`, () => {
    const html = readFileSync(join("fixtures/raw-dom", file), "utf8");
    const expected = readFileSync(join("fixtures/expected-md", `${name}.md`), "utf8").trim();
    const actual = exportFromHtml(html, { outputFormat: "markdown", includeStatusUpdates: false, citationMode: "normalize" }).trim();
    assert.equal(actual, expected);
  });

  test(`${name} -> json`, () => {
    const html = readFileSync(join("fixtures/raw-dom", file), "utf8");
    const expected = JSON.parse(readFileSync(join("fixtures/expected-json", `${name}.json`), "utf8"));
    const actual = JSON.parse(exportFromHtml(html, { outputFormat: "json", includeStatusUpdates: false, citationMode: "normalize" }));
    delete expected.exportedAt;
    delete actual.exportedAt;
    assert.deepEqual(actual, expected);
  });
}
