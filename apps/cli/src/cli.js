#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { exportFromHtml } from "@atlas/core";
import { EXIT_CODES } from "@atlas/shared";
import { commandCopy, commandDownload, commandStdout } from "./commands.js";
import { resolveTargetHtml } from "./targets.js";

const args = process.argv.slice(2);
const command = args[0] || "export";
const format = args.includes("--json") ? "json" : "markdown";

async function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

try {
  const html = await resolveTargetHtml(args.slice(1), await readStdin());
  const result = exportFromHtml(html, { outputFormat: format }, "unknown");

  if (!result.conversation.turns.length) process.exit(EXIT_CODES.NO_TURNS);

  if (command === "export") await commandStdout(result.output);
  else if (command === "copy") await commandCopy(result.output);
  else if (command === "download") await commandDownload(result.output, format);
  else process.exit(EXIT_CODES.INVALID_ARGS);

  process.exit(EXIT_CODES.OK);
} catch (error) {
  console.error(error.message);
  process.exit(EXIT_CODES.RUNTIME_ERROR);
}
