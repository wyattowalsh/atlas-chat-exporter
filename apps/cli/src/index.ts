import { exportConversation } from "../../../packages/core/src/index.js";

export function runCli(html: string, format: "markdown" | "json" = "markdown"): string {
  return exportConversation(html, { outputFormat: format }).output;
}
