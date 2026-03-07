import { exportConversation } from "../../../packages/core/src/index.js";

export async function copyExport(html, writeText) {
  const { output } = exportConversation(html, { outputFormat: "markdown" });
  await writeText(output);
  return output;
}

export function downloadExport(html, save) {
  const { output } = exportConversation(html, { outputFormat: "markdown" });
  save("chat-export.md", output);
  return output;
}
