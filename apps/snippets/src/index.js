import { exportConversation } from "../../../packages/core/src/index.js";

export function copyChat() {
  const { output } = exportConversation(document.body?.innerText ?? "", { outputFormat: "markdown" });
  return navigator.clipboard.writeText(output);
}

export function downloadChat() {
  const { output } = exportConversation(document.body?.innerText ?? "", { outputFormat: "markdown" });
  const a = document.createElement("a");
  a.href = `data:text/markdown;charset=utf-8,${encodeURIComponent(output)}`;
  a.download = "atlas-chat.md";
  a.click();
}

export function inspectChatSelectors() {
  return {
    article: document.querySelectorAll("article").length,
    assistantCandidates: document.querySelectorAll("[data-message-author-role='assistant']").length,
    userCandidates: document.querySelectorAll("[data-message-author-role='user']").length
  };
}
