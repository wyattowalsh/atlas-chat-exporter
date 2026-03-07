import { defaultExportOptions, ExportOptions } from "../../../packages/shared/src/types.js";

const SETTINGS_KEY = "atlas-export-options";

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "copy-export") {
    await triggerInActiveTab("copy");
  }
  if (command === "download-export") {
    await triggerInActiveTab("download");
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "atlas:get-settings") {
    chrome.storage.local.get(SETTINGS_KEY).then((result) => {
      sendResponse(result[SETTINGS_KEY] ?? defaultExportOptions);
    });
    return true;
  }

  if (msg.type === "atlas:set-settings") {
    chrome.storage.local.set({ [SETTINGS_KEY]: msg.options }).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === "atlas:action") {
    triggerInActiveTab(msg.action, msg.options).then(() => sendResponse({ ok: true }));
    return true;
  }
});

async function triggerInActiveTab(action: "copy" | "download", options?: Partial<ExportOptions>) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id) return;

  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  const merged = { ...defaultExportOptions, ...(stored[SETTINGS_KEY] ?? {}), ...(options ?? {}) };

  await chrome.tabs.sendMessage(tab.id, {
    type: "atlas:export",
    action,
    options: merged
  });
}
