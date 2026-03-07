import { exportConversation } from "@atlas/core";
export function runExtensionExport(root) {
    return exportConversation({
        root,
        source: "chatgpt-web",
        options: { outputFormat: "markdown", includeRoleHeadings: true }
    }).content;
}
