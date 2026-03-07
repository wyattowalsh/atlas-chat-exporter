import { DEFAULT_OPTIONS } from '../../../packages/core/src/index.js';

async function withActiveTab(handler) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await handler(tab.id);
}

async function collect(tabId, options) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (opts) => {
      return window.__atlasExportHook(opts);
    },
    args: [options]
  });
  return result;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ atlasSettings: {} });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'RUN_EXPORT') return;
  withActiveTab(async (tabId) => {
    const result = await collect(tabId, { ...DEFAULT_OPTIONS, ...msg.options });
    if (msg.action === 'download') {
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      await chrome.downloads.download({ url, filename: `chat-export.${result.extension}`, saveAs: true });
    }
    if (msg.action === 'copy') {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (content) => navigator.clipboard.writeText(content),
        args: [result.content]
      });
    }
  });
});

chrome.commands.onCommand.addListener((command) => {
  const action = command === 'download-chat' ? 'download' : 'copy';
  chrome.storage.local.get(['atlasSettings']).then(({ atlasSettings }) => {
    withActiveTab(async (tabId) => {
      const result = await collect(tabId, { ...DEFAULT_OPTIONS, ...(atlasSettings || {}) });
      if (action === 'download') {
        const blob = new Blob([result.content], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        await chrome.downloads.download({ url, filename: `chat-export.${result.extension}` });
      } else {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: (content) => navigator.clipboard.writeText(content),
          args: [result.content]
        });
      }
    });
  });
});

