import { exportConversation } from "../../../packages/core/src/index.js";

async function withActiveTab(fn) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  return fn(tab.id);
}

async function collectPageText(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => document.body?.innerText ?? ""
  });
  return result;
}

async function runAction(action, format = "markdown") {
  await withActiveTab(async (tabId) => {
    const pageText = await collectPageText(tabId);
    const { output } = exportConversation(pageText, { outputFormat: format });
    if (action === "copy") {
      await chrome.scripting.executeScript({
        target: { tabId },
        args: [output],
        func: async (text) => navigator.clipboard.writeText(text)
      });
      return;
    }

    const blobUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(output)}`;
    await chrome.downloads.download({ url: blobUrl, filename: `atlas-chat.${format === "json" ? "json" : "md"}` });
  });
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "copy-chat") await runAction("copy");
  if (command === "download-chat") await runAction("download");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  runAction(message.action, message.format)
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({ ok: false, error: String(error) }));
  return true;
});
