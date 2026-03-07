import { exportConversation } from "@atlas/core";

export function runBookmarkletExport(root: ParentNode): string {
  return exportConversation({
    root,
    source: "chatgpt-web",
    options: { outputFormat: "markdown", citationMode: "strip" }
  }).content;
}
