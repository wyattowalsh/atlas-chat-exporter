import { exportConversation } from "@atlas/core";

export function runCliExport(root: ParentNode, asJson = false): string {
  return exportConversation({
    root,
    source: "unknown",
    options: { outputFormat: asJson ? "json" : "markdown" }
  }).content;
}
