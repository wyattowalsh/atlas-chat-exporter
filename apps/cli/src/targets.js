import { readFile } from "node:fs/promises";

export async function resolveTargetHtml(args, stdinText) {
  const fromFile = args.find((a) => a.startsWith("--html-file="));
  if (fromFile) return readFile(fromFile.split("=")[1], "utf8");

  const raw = args.find((a) => a.startsWith("--html="));
  if (raw) return raw.slice("--html=".length);

  if (stdinText.trim()) return stdinText;

  throw new Error("No target HTML provided. Use --html, --html-file, or stdin.");
}
