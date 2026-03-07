import { exportConversation } from "../../../packages/core/src/index.js";

export function runCli(html, format = "markdown") {
  return exportConversation(html, { outputFormat: format }).output;
}
