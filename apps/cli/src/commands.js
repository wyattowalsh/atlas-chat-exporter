import { writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

function runClipboardCommand(bin, args, text) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args);
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${bin} exited ${code}`))));
    child.stdin.end(text);
  });
}

export async function commandStdout(output) {
  process.stdout.write(`${output}\n`);
}

export async function commandCopy(output) {
  const candidates = [
    ["pbcopy", []],
    ["xclip", ["-selection", "clipboard"]],
    ["wl-copy", []]
  ];
  for (const [bin, args] of candidates) {
    try {
      await runClipboardCommand(bin, args, output);
      return;
    } catch {
      // continue
    }
  }
  throw new Error("No clipboard command available (pbcopy/xclip/wl-copy)");
}

export async function commandDownload(output, format, explicitFile) {
  const filename = explicitFile || `atlas-export.${format === "json" ? "json" : "md"}`;
  await writeFile(filename, output, "utf8");
}
