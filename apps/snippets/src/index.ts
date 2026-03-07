import { exportConversation } from "@atlas/core";

export function runSnippetExport(root: ParentNode): string {
  return exportConversation({
    root,
    source: "chatgpt-atlas",
    options: { outputFormat: "markdown", includeHorizontalRules: true }
  }).content;
}
