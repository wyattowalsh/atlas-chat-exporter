#!/usr/bin/env node
import fs from "node:fs/promises";
import { exportConversation } from "../../../packages/core/src/index.js";
import { EXIT_CODES } from "../../../packages/shared/src/model.js";
import { resolveConversationInput } from "./browser-targeting.js";

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const args = { command, target: "stdin", format: "markdown", out: "" };
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === "--target") args.target = rest[++i];
    else if (token === "--format") args.format = rest[++i];
    else if (token === "--out") args.out = rest[++i];
  }
  return args;
}

function help() {
  console.log(`atlas-export <command>\n\nCommands:\n  export --target <file|stdin> [--format markdown|json] [--out file]\n  copy --target <file|stdin> [--format markdown|json]\n  download --target <file|stdin> [--format markdown|json] --out <file>`);
}

async function copyToClipboard(text) {
  if (process.platform === "darwin") {
    const { spawn } = await import("node:child_process");
    return new Promise((resolve, reject) => {
      const p = spawn("pbcopy");
      p.on("close", (code) => (code === 0 ? resolve() : reject(new Error("pbcopy failed"))));
      p.stdin.end(text);
    });
  }
  throw new Error("Clipboard unsupported in this environment");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "help" || args.command === "--help") {
    help();
    process.exit(EXIT_CODES.OK);
  }

  if (!["export", "copy", "download"].includes(args.command)) {
    help();
    process.exit(EXIT_CODES.INVALID_INPUT);
  }

  const input = await resolveConversationInput({ target: args.target });
  const result = exportConversation(input, { outputFormat: args.format });
  if (!result.doc.turns.length) process.exit(EXIT_CODES.NO_TURNS_FOUND);

  if (args.command === "export") {
    if (args.out) await fs.writeFile(args.out, result.output, "utf8");
    else process.stdout.write(result.output);
    process.exit(EXIT_CODES.OK);
  }

  if (args.command === "copy") {
    try {
      await copyToClipboard(result.output);
      process.exit(EXIT_CODES.OK);
    } catch {
      process.exit(EXIT_CODES.CLIPBOARD_BLOCKED);
    }
  }

  if (!args.out) process.exit(EXIT_CODES.INVALID_INPUT);
  try {
    await fs.writeFile(args.out, result.output, "utf8");
    process.exit(EXIT_CODES.OK);
  } catch {
    process.exit(EXIT_CODES.DOWNLOAD_BLOCKED);
  }
}

main().catch(() => process.exit(EXIT_CODES.UNKNOWN));
