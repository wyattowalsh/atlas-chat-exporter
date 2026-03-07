import { exportConversation } from "@atlas/core";

export function runUserscriptExport(root: ParentNode): string {
  return exportConversation({
    root,
    source: "chatgpt-atlas",
    options: { outputFormat: "json" }
  }).content;
}
