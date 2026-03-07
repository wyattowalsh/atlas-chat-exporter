import { DEFAULT_EXPORT_OPTIONS } from "@atlas/shared";

const SETTINGS_KEY = "atlas-export-settings";

async function getSettings() {
  const result = await chrome.storage.sync.get(SETTINGS_KEY);
  return { ...DEFAULT_EXPORT_OPTIONS, ...(result[SETTINGS_KEY] || {}) };
}

async function sendExportRequest(type) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  const settings = await getSettings();
  return chrome.tabs.sendMessage(tab.id, { type, settings });
}

chrome.runtime.onInstalled.addListener(async () => {
  const items = await chrome.storage.sync.get(SETTINGS_KEY);
  if (!items[SETTINGS_KEY]) await chrome.storage.sync.set({ [SETTINGS_KEY]: DEFAULT_EXPORT_OPTIONS });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type === "saveSettings") {
      await chrome.storage.sync.set({ [SETTINGS_KEY]: { ...DEFAULT_EXPORT_OPTIONS, ...msg.settings } });
      return sendResponse({ ok: true });
    }
    if (msg.type === "copy" || msg.type === "download") {
      const response = await sendExportRequest(msg.type);
      return sendResponse(response);
    }
    return sendResponse({ ok: false, error: "Unknown message" });
  })().catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "copy_chat") await sendExportRequest("copy");
});
