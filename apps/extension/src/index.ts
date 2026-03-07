import { exportConversation } from "../../../packages/core/src/index.js";

export async function copyExport(html: string, writeText: (text: string) => Promise<void>): Promise<string> {
  const { output } = exportConversation(html, { outputFormat: "markdown" });
  await writeText(output);
  return output;
}

export function downloadExport(html: string, save: (name: string, content: string) => void): string {
  const { output } = exportConversation(html, { outputFormat: "markdown" });
  save("chat-export.md", output);
  return output;
}
