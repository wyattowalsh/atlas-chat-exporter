// ==UserScript==
// @name         Atlas Chat Exporter
// @namespace    atlas-chat-exporter
// @version      0.1.0
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

import { exportConversation, DEFAULT_OPTIONS } from '../../../packages/core/src/index.js';

const KEY = 'atlas-export-settings';
const settings = { ...DEFAULT_OPTIONS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };

const panel = document.createElement('div');
panel.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:99999;background:#111;color:#fff;padding:8px;border-radius:8px;font:12px sans-serif;opacity:.9';
panel.innerHTML = `
  <button id="atlas-copy">Copy</button>
  <button id="atlas-download">Download</button>
  <select id="atlas-format"><option value="markdown">MD</option><option value="json">JSON</option></select>
`;
document.body.appendChild(panel);

const formatEl = panel.querySelector('#atlas-format');
formatEl.value = settings.outputFormat;

function persist() {
  settings.outputFormat = formatEl.value;
  localStorage.setItem(KEY, JSON.stringify(settings));
}

panel.querySelector('#atlas-copy').addEventListener('click', async () => {
  persist();
  const result = exportConversation(document, settings);
  await navigator.clipboard.writeText(result.content);
});

panel.querySelector('#atlas-download').addEventListener('click', () => {
  persist();
  const result = exportConversation(document, settings);
  const blob = new Blob([result.content], { type: result.mimeType });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `chat-export.${result.extension}`;
  a.click();
});
