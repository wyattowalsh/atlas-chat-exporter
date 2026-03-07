import fs from "node:fs/promises";

/**
 * Browser-targeting layer intentionally separate from extraction semantics.
 * For now, supports file-path input and stdin for deterministic local testing.
 */
export async function resolveConversationInput({ target }) {
  if (!target || target === "stdin") {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf8");
  }
  return fs.readFile(target, "utf8");
}
