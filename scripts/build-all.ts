import { execSync } from "node:child_process";

const steps = [
  "npm run bundle:snippets",
  "npm run bundle:bookmarklets",
  "npm run build:extension",
  "npm run build:userscript",
  "npm run build:cli"
];

for (const step of steps) {
  console.log(`\n> ${step}`);
  execSync(step, { stdio: "inherit" });
}

console.log("\nBuild complete.");
