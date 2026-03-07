import { exportConversation } from "@atlas/core";

export function runExtensionExport(root: ParentNode): string {
  return exportConversation({
    root,
    source: "chatgpt-web",
    options: { outputFormat: "markdown", includeRoleHeadings: true }
  }).content;
}
