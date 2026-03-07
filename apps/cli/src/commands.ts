import { writeFile } from "node:fs/promises";
import clipboard from "clipboardy";
import { extractConversationFromHtml, renderJson, renderMarkdown } from "../../../packages/core/src/index.js";
import { defaultExportOptions, ExportOptions } from "../../../packages/shared/src/types.js";
import { BrowserTargetOptions, fetchOuterHtml } from "./cdp.js";

export const EXIT_CODES = {
  OK: 0,
  BAD_ARGS: 2,
  TARGET_ERROR: 3,
  EXPORT_ERROR: 4
} as const;

export async function run(command: string, argv: string[]) {
  const target = parseTarget(argv);
  const options = parseOptions(argv);

  let html = "";
  try {
    html = await fetchOuterHtml(target);
  } catch (error) {
    console.error("Failed to connect to browser target:", error);
    process.exit(EXIT_CODES.TARGET_ERROR);
  }

  try {
    const doc = extractConversationFromHtml(html, options);
    const output = options.outputFormat === "json" ? renderJson(doc) : renderMarkdown(doc, options);

    if (command === "export") {
      process.stdout.write(output + "\n");
      process.exit(EXIT_CODES.OK);
    }

    if (command === "copy") {
      await clipboard.write(output);
      process.exit(EXIT_CODES.OK);
    }

    if (command === "download") {
      const file = readFlag(argv, "--file") ?? `chat-export.${options.outputFormat === "json" ? "json" : "md"}`;
      await writeFile(file, output, "utf8");
      process.exit(EXIT_CODES.OK);
    }

    process.exit(EXIT_CODES.BAD_ARGS);
  } catch (error) {
    console.error("Export failed:", error);
    process.exit(EXIT_CODES.EXPORT_ERROR);
  }
}

function parseTarget(argv: string[]): BrowserTargetOptions {
  return {
    host: readFlag(argv, "--host") ?? "127.0.0.1",
    port: Number(readFlag(argv, "--port") ?? "9222"),
    target: readFlag(argv, "--target")
  };
}

function parseOptions(argv: string[]): Partial<ExportOptions> {
  const format = readFlag(argv, "--format");
  return {
    ...defaultExportOptions,
    outputFormat: format === "json" ? "json" : "markdown",
    citationMode: (readFlag(argv, "--citation-mode") as ExportOptions["citationMode"]) ?? defaultExportOptions.citationMode
  };
}

function readFlag(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}
