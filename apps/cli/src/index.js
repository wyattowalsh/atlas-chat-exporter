import { exportConversation } from "@atlas/core";
export function runCliExport(root, asJson = false) {
    return exportConversation({
        root,
        source: "unknown",
        options: { outputFormat: asJson ? "json" : "markdown" }
    }).content;
}
